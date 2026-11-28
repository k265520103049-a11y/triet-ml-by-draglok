(function () {
  'use strict';

  // 1. CẤU HÌNH FIREBASE CỦA DỰ ÁN TRIET-ML
  const firebaseConfig = {
    apiKey: "AIzaSyCX_UWsSB55e5XclLXNjAti6GvJkaZON9A",
    authDomain: "triet-ml.firebaseapp.com",
    projectId: "triet-ml",
    storageBucket: "triet-ml.firebasestorage.app",
    messagingSenderId: "476763080297",
    appId: "1:476763080297:web:2d454733d850be643e44f8",
    measurementId: "G-FFD6CNZY1Q"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  auth.languageCode = 'vi';

  // 2. KHÓA LƯU TRỮ & KIỂM TRA TOÀN VẸN DỮ LIỆU (ANTI-TAMPER)
  const APP_STORE_KEY = 'mln-ontap-v1';
  const RANK_STORE_KEY = 'triet_rank_data';
  const ACTIVE_UID_KEY = 'mln-active-uid';
  const RESET_ACK_PREFIX = 'mln-admin-reset-ack__';
  const ADMIN_UID = 'np7u77LPOxel3f1A4CLDn70WSX22';
  const CHALLENGER_MIN_RP = 15000;
  const CHALLENGER_TOP_N = 3;

  function isAdminUser(user) {
    const u = user || currentUser;
    return !!(u && u.uid === ADMIN_UID);
  }

  function userAppKey(uid) {
    return APP_STORE_KEY + '__uid_' + uid;
  }

  function userRankKey(uid) {
    return RANK_STORE_KEY + '__uid_' + uid;
  }

  function defaultRankData() {
    return {
      rp: 0,
      correctCount: 0,
      streak: 0,
      studyMinutes: 0
    };
  }

  function computeRankSig(d) {
    const payload = [
      'TRIET_AC_V4_RANK',
      Math.max(0, Math.floor(Number(d.rp) || 0)),
      Math.max(0, Math.floor(Number(d.correctCount) || 0)),
      Math.max(0, Math.floor(Number(d.streak) || 0)),
      Math.max(0, Math.floor(Number(d.studyMinutes) || 0))
    ].join('|');
    let h1 = 0x811c9dc5;
    let h2 = 0x01000193;
    for (let i = 0; i < payload.length; i++) {
      const c = payload.charCodeAt(i);
      h1 ^= c;
      h1 = Math.imul(h1, 0x01000193);
      h2 ^= (c + i);
      h2 = Math.imul(h2, 0x85ebca6b);
    }
    return ((h1 >>> 0).toString(16) + (h2 >>> 0).toString(16));
  }

  function maxLegitRp(d) {
    const c = Math.max(0, Math.floor(Number(d.correctCount) || 0));
    const m = Math.max(0, Math.floor(Number(d.studyMinutes) || 0));
    return c * 13 + m * 2;
  }

  function sanitizeRankObject(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const d = {
      rp: Math.max(0, Math.floor(Number(raw.rp) || 0)),
      correctCount: Math.max(0, Math.floor(Number(raw.correctCount) || 0)),
      streak: Math.max(0, Math.floor(Number(raw.streak) || 0)),
      studyMinutes: Math.max(0, Math.floor(Number(raw.studyMinutes) || 0))
    };
    if (d.rp > maxLegitRp(d)) return null;
    if (raw._sig) {
      if (raw._sig !== computeRankSig(d)) return null;
    } else {
      // Dữ liệu cũ từ bản v3 chưa có _sig: chỉ nhận nếu chỉ số hợp lý
      if (d.rp > 2500 || d.correctCount > 200 || d.studyMinutes > 300) return null;
    }
    return d;
  }

  function enforceBounds(d) {
    d.rp = Math.max(0, Math.floor(Number(d.rp) || 0));
    d.correctCount = Math.max(0, Math.floor(Number(d.correctCount) || 0));
    d.streak = Math.max(0, Math.floor(Number(d.streak) || 0));
    d.studyMinutes = Math.max(0, Math.floor(Number(d.studyMinutes) || 0));
    const cap = maxLegitRp(d);
    if (d.rp > cap) d.rp = cap;
    d._sig = computeRankSig(d);
    return d;
  }

  let rankData = defaultRankData();
  try {
    const savedRank = JSON.parse(localStorage.getItem(RANK_STORE_KEY) || 'null');
    const verified = sanitizeRankObject(savedRank);
    if (verified) {
      rankData = enforceBounds(verified);
    } else if (savedRank) {
      console.warn('[Anti-Cheat] Dữ liệu rank cục bộ không hợp lệ, đã khôi phục về mặc định.');
    }
  } catch (e) {}

  let currentUser = null;
  let isCurrentUserChallenger = false;
  let isCurrentUserBanned = false;
  let currentBanReason = '';
  let lastChallengerCheckAt = 0;
  let needSync = false;
  let isSyncing = false;
  let debounceSyncTimer = null;

  // 3. BỘ LỌC CHỐNG SPAM CLICK, AUTO-CLICK & FARM CÂU HỎI
  const MIN_ANSWER_INTERVAL_MS = 1500;   // Tối thiểu 1.5s giữa 2 câu đơn
  const QID_COOLDOWN_MS = 180000;        // Không cộng RP lặp lại cùng 1 câu trong 3 phút
  const BURST_WINDOW_COUNT = 10;         // Kiểm tra 10 câu gần nhất
  const BURST_MIN_TOTAL_MS = 22000;      // 10 câu liên tiếp phải mất ít nhất 22s

  let lastScoredAnswerAt = 0;
  let rapidSpamStrikes = 0;
  let recentAnswerTimestamps = [];
  let scoredQuestionTimes = {};
  let lastStudyActionTime = Date.now();
  let lastMinuteRewardAt = Date.now();

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function setSyncStatus(text, color) {
    const el = document.getElementById('sync-status');
    if (!el) return;
    el.textContent = text || '';
    el.style.color = color || '#94a3b8';
  }

  function getBaseRankTier(rp) {
    if (rp >= 7000) return "👑 Cao Thủ Triết Học";
    if (rp >= 3500) return "💎 Kim Cương";
    if (rp >= 1500) return "💠 Bạch Kim";
    if (rp >= 600)  return "🥇 Vàng";
    if (rp >= 200)  return "🥈 Bạc";
    return "🥉 Đồng";
  }

  // Thách Đấu: Top 3 người điểm cao nhất từ 15.000 RP đổ lên
  function getRankTier(rp, rankPosition) {
    if (rp >= CHALLENGER_MIN_RP) {
      if (typeof rankPosition === 'number') {
        if (rankPosition >= 1 && rankPosition <= CHALLENGER_TOP_N) {
          return "🔥 Thách Đấu";
        }
      } else if (isCurrentUserChallenger) {
        return "🔥 Thách Đấu";
      }
    }
    return getBaseRankTier(rp);
  }

  async function refreshChallengerStatus(forceCheck) {
    if (!currentUser || isAdminUser() || isCurrentUserBanned || rankData.rp < CHALLENGER_MIN_RP) {
      if (isCurrentUserChallenger) {
        isCurrentUserChallenger = false;
        updateRankUI();
      }
      return false;
    }
    const now = Date.now();
    if (!forceCheck && (now - lastChallengerCheckAt) < 30000) {
      return isCurrentUserChallenger;
    }
    lastChallengerCheckAt = now;
    try {
      const higherSnap = await db.collection('leaderboard')
        .where('rp', '>', rankData.rp)
        .limit(CHALLENGER_TOP_N + 1)
        .get();
      let higherCount = 0;
      higherSnap.forEach(function (d) {
        if (d.id !== ADMIN_UID) higherCount += 1;
      });
      const qualified = higherCount < CHALLENGER_TOP_N;
      if (qualified !== isCurrentUserChallenger) {
        isCurrentUserChallenger = qualified;
        updateRankUI();
      }
      return qualified;
    } catch (e) {
      return isCurrentUserChallenger;
    }
  }

  function updateRankUI() {
    const tier = getRankTier(rankData.rp);
    const userInfo = document.getElementById('user-info');
    const btnLogin = document.getElementById('btn-google-login');
    const btnLogout = document.getElementById('btn-logout');
    const btnAdmin = document.getElementById('btn-open-admin');
    if (!userInfo) return;

    if (currentUser) {
      const avatar = currentUser.photoURL
        ? '<img src="' + escapeHtml(currentUser.photoURL) + '" style="width:22px;height:22px;border-radius:50%;vertical-align:middle;margin-right:6px;">'
        : '🎓 ';
      const name = escapeHtml(currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Học viên'));
      if (isAdminUser()) {
        userInfo.innerHTML = avatar + '<strong>' + name + '</strong> <span class="admin-badge">👑 Quản trị viên (Ẩn BXH)</span>';
        if (btnAdmin) btnAdmin.style.display = 'inline-block';
      } else if (isCurrentUserBanned) {
        userInfo.innerHTML = avatar + '<strong>' + name + '</strong> <span class="ban-badge" title="' + escapeHtml(currentBanReason) + '">🚫 Bị khóa BXH</span>';
        if (btnAdmin) btnAdmin.style.display = 'none';
      } else {
        userInfo.innerHTML = avatar + '<strong>' + name + '</strong> • <span id="rank-badge">' + tier + ' (' + rankData.rp + ' RP)</span>';
        if (btnAdmin) btnAdmin.style.display = 'none';
      }
      if (btnLogin) btnLogin.style.display = 'none';
      if (btnLogout) btnLogout.style.display = 'inline-block';
    } else {
      userInfo.innerHTML = 'Khách • <strong id="rank-badge">' + tier + ' (' + rankData.rp + ' RP)</strong>';
      setSyncStatus('');
      if (btnAdmin) btnAdmin.style.display = 'none';
      if (btnLogin) {
        btnLogin.textContent = "Đăng nhập / Leo Rank";
        btnLogin.style.display = 'inline-block';
      }
      if (btnLogout) btnLogout.style.display = 'none';
    }
  }

  function saveLocalRank() {
    enforceBounds(rankData);
    if (rankData.rp < CHALLENGER_MIN_RP) {
      isCurrentUserChallenger = false;
    }
    try {
      const raw = JSON.stringify(rankData);
      localStorage.setItem(RANK_STORE_KEY, raw);
      if (currentUser) {
        localStorage.setItem(userRankKey(currentUser.uid), raw);
      }
    } catch (e) {}
    needSync = true;
    updateRankUI();
    scheduleCloudSync();
  }

  function scheduleCloudSync() {
    if (!currentUser) return;
    if (isAdminUser()) {
      needSync = false;
      setSyncStatus('👑 Chế độ Admin (Ẩn BXH)', '#fbbf24');
      return;
    }
    if (isCurrentUserBanned) {
      needSync = false;
      setSyncStatus('🚫 Tài khoản bị khóa BXH', '#f87171');
      return;
    }
    setSyncStatus('• Chờ đồng bộ...', '#fbbf24');
    if (debounceSyncTimer) clearTimeout(debounceSyncTimer);
    debounceSyncTimer = setTimeout(function () {
      syncToCloud(false);
    }, 2500);
  }

  function cleanupScoredQids(now) {
    const keys = Object.keys(scoredQuestionTimes);
    if (keys.length < 150) return;
    for (let i = 0; i < keys.length; i++) {
      if (now - scoredQuestionTimes[keys[i]] > QID_COOLDOWN_MS) {
        delete scoredQuestionTimes[keys[i]];
      }
    }
  }

  function processSingleAnswer(evt, appBridge) {
    if (!evt || evt.trusted !== true || (Number(evt.gestureAge) || 0) > 4500) {
      return;
    }
    const now = Date.now();
    lastStudyActionTime = now;

    if (!evt.ok) {
      rankData.streak = 0;
      saveLocalRank();
      return;
    }

    // 1) Chặn bấm quá nhanh (< 1.5s)
    if (now - lastScoredAnswerAt < MIN_ANSWER_INTERVAL_MS) {
      rapidSpamStrikes += 1;
      if (rapidSpamStrikes === 3 && appBridge && typeof appBridge.notifyToast === 'function') {
        appBridge.notifyToast('⚠️ Bạn thao tác quá nhanh, hệ thống tạm dừng cộng RP để chống spam.', 'info');
      }
      return;
    }

    // 2) Chặn farm tốc độ bất thường trên chuỗi 10 câu liên tiếp
    recentAnswerTimestamps.push(now);
    if (recentAnswerTimestamps.length > BURST_WINDOW_COUNT) {
      recentAnswerTimestamps.shift();
    }
    if (recentAnswerTimestamps.length === BURST_WINDOW_COUNT) {
      const span = now - recentAnswerTimestamps[0];
      if (span < BURST_MIN_TOTAL_MS) {
        rapidSpamStrikes += 1;
        return;
      }
    }

    // 3) Chặn lặp lại cùng 1 ID câu hỏi trong 3 phút
    const qid = evt.qid ? String(evt.qid) : '';
    if (qid) {
      if (scoredQuestionTimes[qid] && (now - scoredQuestionTimes[qid]) < QID_COOLDOWN_MS) {
        return;
      }
      scoredQuestionTimes[qid] = now;
      cleanupScoredQids(now);
    }

    rapidSpamStrikes = 0;
    lastScoredAnswerAt = now;
    rankData.correctCount += 1;
    rankData.streak += 1;
    const bonus = (rankData.streak % 5 === 0) ? 15 : 0;
    rankData.rp += (10 + bonus);
    saveLocalRank();
  }

  function processBatchAnswers(evt) {
    if (!evt || evt.trusted !== true) return;
    const okCount = Math.max(0, Math.floor(Number(evt.okCount) || 0));
    const elapsedMs = Math.max(0, Number(evt.elapsedMs) || 0);
    if (okCount === 0) {
      rankData.streak = 0;
      saveLocalRank();
      return;
    }
    // Bắt buộc thời gian làm bài đề thi tối thiểu 2 giây cho mỗi câu đúng
    if (elapsedMs < okCount * 2000) {
      return;
    }
    const now = Date.now();
    lastStudyActionTime = now;
    const qids = Array.isArray(evt.qids) ? evt.qids : [];
    let accepted = 0;
    for (let i = 0; i < okCount; i++) {
      const qid = qids[i] ? String(qids[i]) : '';
      if (qid && scoredQuestionTimes[qid] && (now - scoredQuestionTimes[qid]) < QID_COOLDOWN_MS) {
        continue;
      }
      if (qid) scoredQuestionTimes[qid] = now;
      accepted += 1;
    }
    cleanupScoredQids(now);
    if (accepted <= 0) return;

    for (let j = 0; j < accepted; j++) {
      rankData.correctCount += 1;
      rankData.streak += 1;
      const bonus = (rankData.streak % 5 === 0) ? 15 : 0;
      rankData.rp += (10 + bonus);
    }
    lastScoredAnswerAt = now;
    saveLocalRank();
  }

  // Liên kết bảo mật 1 lần với app.js
  const appBridge = typeof window.__trietSecureBind === 'function'
    ? window.__trietSecureBind(function (evt) {
        if (!evt || typeof evt !== 'object') return;
        if (evt.type === 'answer') {
          processSingleAnswer(evt, appBridge);
        } else if (evt.type === 'batch_answers') {
          processBatchAnswers(evt);
        } else if (evt.type === 'study_activity') {
          lastStudyActionTime = Date.now();
        } else if (evt.type === 'progress_changed') {
          if (!currentUser) return;
          try {
            const raw = localStorage.getItem(APP_STORE_KEY);
            if (raw) localStorage.setItem(userAppKey(currentUser.uid), raw);
          } catch (e) {}
          needSync = true;
          scheduleCloudSync();
        }
      })
    : null;

  window.getCloudAccountInfo = function () {
    if (!currentUser) return null;
    return {
      uid: currentUser.uid,
      email: currentUser.email || '',
      name: currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Học viên')
    };
  };

  window.forceCloudSync = async function () {
    if (!currentUser) return false;
    needSync = true;
    return await syncToCloud(true);
  };

  window.getCurrentRankInfo = function () {
    return {
      rp: rankData.rp,
      tier: getRankTier(rankData.rp),
      correctCount: rankData.correctCount,
      studyMinutes: rankData.studyMinutes
    };
  };

  window.submitQuestionReport = async function (report) {
    if (!report || typeof report !== 'object') {
      throw new Error('Dữ liệu báo lỗi không hợp lệ.');
    }
    const payload = {
      qid: String(report.qid || '').slice(0, 40),
      ch: Math.max(0, Math.floor(Number(report.ch) || 0)),
      n: Math.max(0, Math.floor(Number(report.n) || 0)),
      questionText: String(report.questionText || '').slice(0, 600),
      currentAnswer: String(report.currentAnswer || '').slice(0, 240),
      reason: String(report.reason || 'Sai đáp án đúng').slice(0, 80),
      note: String(report.note || '').slice(0, 350),
      reporterUid: currentUser ? currentUser.uid : 'guest',
      reporterName: (currentUser
        ? (currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Học viên'))
        : 'Khách').slice(0, 40),
      appVersion: 'v5.0',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      const localList = JSON.parse(localStorage.getItem('mln-question-reports') || '[]');
      localList.unshift(Object.assign({}, payload, { createdAt: Date.now() }));
      localStorage.setItem('mln-question-reports', JSON.stringify(localList.slice(0, 30)));
    } catch (e) {}

    await db.collection('reports').add(payload);
    return true;
  };

  // 4. BỘ ĐẾM THỜI GIAN HỌC THỰC TẾ (Chỉ cộng khi có thao tác học thật & đủ 58s thực)
  setInterval(function () {
    const now = Date.now();
    const isTabActive = !document.hidden;
    const isRecentlyStudying = (now - lastStudyActionTime) < 60000;
    const realElapsedOk = (now - lastMinuteRewardAt) >= 58000;
    if (isTabActive && isRecentlyStudying && realElapsedOk) {
      lastMinuteRewardAt = now;
      rankData.studyMinutes += 1;
      rankData.rp += 2;
      saveLocalRank();
    }
  }, 15000);

  // 5. CỬA SỔ ĐĂNG NHẬP, ĐĂNG KÝ & LẤY LẠI MẬT KHẨU
  function translateAuthError(err) {
    const code = (err && err.code) || '';
    if (code === 'auth/invalid-email') return 'Địa chỉ Email không hợp lệ.';
    if (code === 'auth/user-not-found') return 'Không tìm thấy tài khoản nào dùng Email này.';
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') return 'Email hoặc mật khẩu chưa chính xác.';
    if (code === 'auth/email-already-in-use') return 'Email này đã được đăng ký. Hãy bấm Đăng nhập hoặc Quên mật khẩu.';
    if (code === 'auth/weak-password') return 'Mật khẩu quá yếu, vui lòng nhập tối thiểu 6 ký tự.';
    if (code === 'auth/too-many-requests') return 'Thao tác quá nhiều lần. Vui lòng đợi ít phút rồi thử lại.';
    if (code === 'auth/network-request-failed') return 'Lỗi kết nối mạng. Vui lòng kiểm tra Wi-Fi / 4G.';
    if (code === 'auth/popup-closed-by-user') return 'Bạn đã đóng cửa sổ đăng nhập Google.';
    if (code === 'auth/popup-blocked') return 'Trình duyệt chặn cửa sổ đăng nhập. Hãy cho phép popup hoặc đăng nhập bằng Email.';
    return (err && err.message) ? err.message : 'Đã xảy ra lỗi không xác định.';
  }

  function showAuthStatus(msg, type) {
    const box = document.getElementById('auth-status');
    if (!box) {
      if (msg) alert(msg);
      return;
    }
    if (!msg) {
      box.style.display = 'none';
      box.textContent = '';
      return;
    }
    box.style.display = 'block';
    box.textContent = msg;
    if (type === 'ok') {
      box.style.background = 'rgba(16, 185, 129, 0.16)';
      box.style.border = '1px solid rgba(16, 185, 129, 0.45)';
      box.style.color = '#6ee7b7';
    } else if (type === 'info') {
      box.style.background = 'rgba(59, 130, 246, 0.16)';
      box.style.border = '1px solid rgba(59, 130, 246, 0.45)';
      box.style.color = '#93c5fd';
    } else {
      box.style.background = 'rgba(239, 68, 68, 0.16)';
      box.style.border = '1px solid rgba(239, 68, 68, 0.45)';
      box.style.color = '#fca5a5';
    }
  }

  function ensureAuthModal() {
    if (document.getElementById('auth-modal')) return;
    const modalHTML = [
      '<div id="auth-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:10000; align-items:center; justify-content:center; padding:14px;">',
      '  <div style="background:#1e293b; color:#fff; width:100%; max-width:390px; border-radius:14px; padding:20px; box-shadow:0 10px 25px rgba(0,0,0,0.5);">',
      '    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">',
      '      <h3 style="margin:0; font-size:18px;">🔐 Tài khoản & Đồng bộ tiến độ</h3>',
      '      <button onclick="document.getElementById(\'auth-modal\').style.display=\'none\'" style="background:none; border:none; color:#94a3b8; font-size:20px; cursor:pointer;">✕</button>',
      '    </div>',
      '    <button onclick="signInGoogleNow()" style="width:100%; padding:10px; border:none; border-radius:8px; background:#4285F4; color:#fff; font-weight:bold; cursor:pointer; margin-bottom:12px;">G • Tiếp tục với Google</button>',
      '    <div style="text-align:center; color:#94a3b8; font-size:12px; margin-bottom:12px;">— Hoặc dùng Email & Mật khẩu —</div>',
      '    <input id="auth-name" type="text" placeholder="Tên hiển thị trên BXH (khi đăng ký)" style="width:100%; box-sizing:border-box; padding:9px; margin-bottom:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#fff;">',
      '    <input id="auth-email" type="email" placeholder="Email của bạn" style="width:100%; box-sizing:border-box; padding:9px; margin-bottom:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#fff;">',
      '    <input id="auth-pass" type="password" placeholder="Mật khẩu (từ 6 ký tự)" style="width:100%; box-sizing:border-box; padding:9px; margin-bottom:6px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#fff;">',
      '    <div style="text-align:right; margin-bottom:10px;">',
      '      <button type="button" onclick="resetPasswordNow()" style="background:none; border:none; color:#38bdf8; font-size:12.5px; cursor:pointer; text-decoration:underline; padding:2px 0;">Quên mật khẩu?</button>',
      '    </div>',
      '    <div id="auth-status" style="display:none; font-size:13px; line-height:1.45; padding:9px 10px; border-radius:8px; margin-bottom:10px;"></div>',
      '    <div style="display:flex; gap:8px;">',
      '      <button onclick="signInEmailNow()" style="flex:1; padding:9px; border:none; border-radius:6px; background:#10b981; color:#fff; font-weight:bold; cursor:pointer;">Đăng nhập</button>',
      '      <button onclick="registerEmailNow()" style="flex:1; padding:9px; border:none; border-radius:6px; background:#6366f1; color:#fff; font-weight:bold; cursor:pointer;">Đăng ký mới</button>',
      '    </div>',
      '    <p style="margin:10px 0 0; font-size:11.5px; color:#94a3b8; line-height:1.4;">Tiến độ câu đã làm, Xu Triết, Level, vật phẩm và giao diện sẽ tự động đồng bộ theo tài khoản của bạn.</p>',
      '  </div>',
      '</div>'
    ].join('\n');
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  window.loginWithGoogle = function () {
    ensureAuthModal();
    showAuthStatus('');
    document.getElementById('auth-modal').style.display = 'flex';
  };

  window.signInGoogleNow = function () {
    showAuthStatus('Đang kết nối Google...', 'info');
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(function () {
        showAuthStatus('');
        document.getElementById('auth-modal').style.display = 'none';
      })
      .catch(function (err) {
        showAuthStatus('Lỗi đăng nhập Google: ' + translateAuthError(err), 'bad');
      });
  };

  window.signInEmailNow = function () {
    const email = document.getElementById('auth-email').value.trim();
    const pass = document.getElementById('auth-pass').value;
    if (!email || !pass) {
      return showAuthStatus('Vui lòng nhập đầy đủ Email và Mật khẩu!', 'bad');
    }
    showAuthStatus('Đang đăng nhập...', 'info');
    auth.signInWithEmailAndPassword(email, pass)
      .then(function () {
        showAuthStatus('');
        document.getElementById('auth-modal').style.display = 'none';
      })
      .catch(function (err) {
        showAuthStatus(translateAuthError(err), 'bad');
      });
  };

  window.registerEmailNow = async function () {
    const name = document.getElementById('auth-name').value.trim();
    const email = document.getElementById('auth-email').value.trim();
    const pass = document.getElementById('auth-pass').value;
    if (!email || pass.length < 6) {
      return showAuthStatus('Nhập Email hợp lệ và Mật khẩu tối thiểu 6 ký tự!', 'bad');
    }
    showAuthStatus('Đang tạo tài khoản...', 'info');
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, pass);
      if (name) await cred.user.updateProfile({ displayName: name });
      showAuthStatus('');
      document.getElementById('auth-modal').style.display = 'none';
      updateRankUI();
      needSync = true;
      await syncToCloud(true);
    } catch (err) {
      showAuthStatus(translateAuthError(err), 'bad');
    }
  };

  window.resetPasswordNow = async function () {
    const emailEl = document.getElementById('auth-email');
    const email = emailEl ? emailEl.value.trim() : '';
    if (!email || email.indexOf('@') === -1) {
      if (emailEl) emailEl.focus();
      return showAuthStatus('Hãy nhập địa chỉ Email tài khoản của bạn vào ô phía trên rồi bấm "Quên mật khẩu?".', 'bad');
    }
    showAuthStatus('Đang gửi email khôi phục mật khẩu...', 'info');
    try {
      await auth.sendPasswordResetEmail(email);
      showAuthStatus('✔ Đã gửi liên kết đặt lại mật khẩu tới ' + email + '. Hãy kiểm tra Hộp thư đến (và mục Thư rác/Spam) nhé!', 'ok');
    } catch (err) {
      showAuthStatus('Không gửi được email: ' + translateAuthError(err), 'bad');
    }
  };

  window.logoutUser = async function () {
    if (debounceSyncTimer) {
      clearTimeout(debounceSyncTimer);
      debounceSyncTimer = null;
    }
    if (currentUser && !isAdminUser() && !isCurrentUserBanned) {
      needSync = true;
      await syncToCloud(true);
    }
    await auth.signOut();
    try {
      localStorage.removeItem(APP_STORE_KEY);
      localStorage.removeItem(RANK_STORE_KEY);
      localStorage.removeItem(ACTIVE_UID_KEY);
    } catch (e) {}
    rankData = defaultRankData();
    currentUser = null;
    isCurrentUserChallenger = false;
    isCurrentUserBanned = false;
    currentBanReason = '';
    needSync = false;
    const adminModal = document.getElementById('admin-modal');
    if (adminModal) adminModal.style.display = 'none';
    updateRankUI();
    if (appBridge && typeof appBridge.resetLocalAppProgress === 'function') {
      appBridge.resetLocalAppProgress();
    }
  };

  // 6. ĐỒNG BỘ LÊN CLOUD FIRESTORE
  function parseJsonSafe(str) {
    if (!str) return null;
    try {
      const obj = JSON.parse(str);
      return obj && typeof obj === 'object' ? obj : null;
    } catch (e) {
      return null;
    }
  }

  function parseVerifiedRankSafe(str) {
    const raw = parseJsonSafe(str);
    return sanitizeRankObject(raw);
  }

  function hasMeaningfulProgress(p) {
    if (!p || typeof p !== 'object') return false;
    if ((Number(p.lastModified) || 0) > 0) return true;
    if (p.seen && Object.keys(p.seen).length > 0) return true;
    if (p.wrong && Object.keys(p.wrong).length > 0) return true;
    if (p.economy && (Number(p.economy.totalXuEarned) || 0) > 100) return true;
    if (Array.isArray(p.customQuestions) && p.customQuestions.length > 0) return true;
    return false;
  }

  function unionUniqueArray(arrA, arrB) {
    const out = [];
    const seen = {};
    (Array.isArray(arrA) ? arrA : []).concat(Array.isArray(arrB) ? arrB : []).forEach(function (item) {
      const key = String(item);
      if (!seen[key]) {
        seen[key] = true;
        out.push(item);
      }
    });
    return out;
  }

  function mergeAppProgress(localObj, cloudObj) {
    if (!cloudObj) return localObj;
    if (!localObj) return cloudObj;

    const localTs = Number(localObj.lastModified) || 0;
    const cloudTs = Number(cloudObj.lastModified) || 0;
    const primary = localTs > cloudTs ? localObj : cloudObj;
    const secondary = localTs > cloudTs ? cloudObj : localObj;

    const merged = JSON.parse(JSON.stringify(primary));
    merged.seen = Object.assign({}, secondary.seen || {}, primary.seen || {});
    merged.marks = Object.assign({}, secondary.marks || {}, primary.marks || {});
    merged.activity = Object.assign({}, secondary.activity || {}, primary.activity || {});

    const stats = Object.assign({}, secondary.stats || {});
    Object.keys(primary.stats || {}).forEach(function (ch) {
      const a = stats[ch] || { ok: 0, total: 0 };
      const b = primary.stats[ch] || { ok: 0, total: 0 };
      stats[ch] = {
        ok: Math.max(Number(a.ok) || 0, Number(b.ok) || 0),
        total: Math.max(Number(a.total) || 0, Number(b.total) || 0)
      };
    });
    merged.stats = stats;

    const pInv = primary.inventory || {};
    const sInv = secondary.inventory || {};
    merged.inventory = {
      uiThemes: unionUniqueArray(sInv.uiThemes, pInv.uiThemes),
      bgs: unionUniqueArray(sInv.bgs, pInv.bgs),
      palettes: unionUniqueArray(sInv.palettes, pInv.palettes),
      frames: unionUniqueArray(sInv.frames, pInv.frames),
      titles: unionUniqueArray(sInv.titles, pInv.titles),
      customBgUnlocked: !!(sInv.customBgUnlocked || pInv.customBgUnlocked),
      items: Object.assign({ f50: 0, hint: 0, x2: 0, shield: 0 }, pInv.items || {})
    };

    const pEq = primary.equipped || {};
    const sEq = secondary.equipped || {};
    merged.equipped = Object.assign({
      uiTheme: 'default',
      bg: 'default',
      palette: 'default',
      frame: 'default',
      title: 'Tập sự Tư duy',
      customBgData: '',
      customBgDim: 38,
      customBgBlur: 0
    }, pEq);
    if (!merged.equipped.customBgData && sEq.customBgData) {
      merged.equipped.customBgData = sEq.customBgData;
    }

    const qMap = {};
    (Array.isArray(secondary.customQuestions) ? secondary.customQuestions : []).forEach(function (q) {
      if (q && q.id) qMap[q.id] = q;
    });
    (Array.isArray(primary.customQuestions) ? primary.customQuestions : []).forEach(function (q) {
      if (q && q.id) qMap[q.id] = q;
    });
    merged.customQuestions = Object.keys(qMap).map(function (id) { return qMap[id]; });
    merged.lastModified = Math.max(localTs, cloudTs, Date.now());
    return merged;
  }

  async function syncToCloud(force) {
    if (!currentUser) return false;
    if (isAdminUser()) {
      needSync = false;
      setSyncStatus('👑 Chế độ Admin (Ẩn BXH)', '#fbbf24');
      return true;
    }
    if (isCurrentUserBanned) {
      needSync = false;
      setSyncStatus('🚫 Tài khoản bị khóa BXH', '#f87171');
      return false;
    }
    if (!force && !needSync) return true;
    if (isSyncing && !force) return false;

    enforceBounds(rankData);
    if (rankData.rp >= CHALLENGER_MIN_RP) {
      await refreshChallengerStatus(false);
    }
    isSyncing = true;
    setSyncStatus('🔄 Đang đồng bộ...', '#38bdf8');
    try {
      const displayName = (currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Học viên')).slice(0, 40);
      const appJson = localStorage.getItem(APP_STORE_KEY) || '';
      if (appJson) {
        try { localStorage.setItem(userAppKey(currentUser.uid), appJson); } catch (e) {}
      }
      const payload = {
        name: displayName,
        photo: currentUser.photoURL || "",
        rp: rankData.rp,
        correctCount: rankData.correctCount,
        studyMinutes: rankData.studyMinutes,
        tier: getRankTier(rankData.rp),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      if (appJson && appJson.length <= 350000) {
        payload.appProgressJson = appJson;
        payload.appProgressUpdatedAt = Date.now();
      }
      await db.collection('leaderboard').doc(currentUser.uid).set(payload, { merge: true });
      needSync = false;
      setSyncStatus('☁️ Đã đồng bộ', '#4ade80');
      return true;
    } catch (e) {
      console.error("Lỗi đồng bộ dữ liệu:", e);
      setSyncStatus('⚠️ Chưa đồng bộ', '#f87171');
      return false;
    } finally {
      isSyncing = false;
    }
  }

  setInterval(function () {
    if (needSync && !isAdminUser() && !isCurrentUserBanned) syncToCloud(false);
  }, 45000);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && needSync && !isAdminUser() && !isCurrentUserBanned) syncToCloud(true);
  });

  window.addEventListener('pagehide', function () {
    if (needSync && !isAdminUser() && !isCurrentUserBanned) syncToCloud(true);
  });

  auth.onAuthStateChanged(async function (user) {
    currentUser = user;
    isCurrentUserChallenger = false;
    isCurrentUserBanned = false;
    currentBanReason = '';

    if (!user) {
      updateRankUI();
      return;
    }

    // Nếu là Admin: ẩn popup ủng hộ, giữ tiến độ học cục bộ trên máy, tuyệt đối không ghi lên BXH
    if (isAdminUser(user)) {
      window.__trietSkipSupportAuto = true;
      const supOverlay = document.getElementById('supportOverlay');
      if (supOverlay && !supOverlay.hidden) {
        supOverlay.hidden = true;
        document.documentElement.classList.remove('support-open');
      }
      const localAdminApp = parseJsonSafe(localStorage.getItem(APP_STORE_KEY)) || parseJsonSafe(localStorage.getItem(userAppKey(user.uid)));
      localStorage.setItem(ACTIVE_UID_KEY, user.uid);
      if (localAdminApp && appBridge && typeof appBridge.applySyncedAppProgress === 'function') {
        appBridge.applySyncedAppProgress(localAdminApp);
      }
      needSync = false;
      updateRankUI();
      setSyncStatus('👑 Chế độ Admin (Ẩn BXH)', '#fbbf24');
      return;
    }

    setSyncStatus('🔄 Đang tải dữ liệu...', '#38bdf8');
    const prevUid = localStorage.getItem(ACTIVE_UID_KEY) || '';

    let localAppCandidate = null;
    let localRankCandidate = null;

    if (prevUid === user.uid) {
      localAppCandidate = parseJsonSafe(localStorage.getItem(APP_STORE_KEY)) || parseJsonSafe(localStorage.getItem(userAppKey(user.uid)));
      localRankCandidate = parseVerifiedRankSafe(localStorage.getItem(RANK_STORE_KEY)) || parseVerifiedRankSafe(localStorage.getItem(userRankKey(user.uid)));
    } else if (prevUid && prevUid !== user.uid) {
      localAppCandidate = parseJsonSafe(localStorage.getItem(userAppKey(user.uid)));
      localRankCandidate = parseVerifiedRankSafe(localStorage.getItem(userRankKey(user.uid)));
    } else {
      const savedUserApp = parseJsonSafe(localStorage.getItem(userAppKey(user.uid)));
      const guestApp = parseJsonSafe(localStorage.getItem(APP_STORE_KEY));
      if (savedUserApp && hasMeaningfulProgress(guestApp)) {
        localAppCandidate = mergeAppProgress(guestApp, savedUserApp);
      } else {
        localAppCandidate = savedUserApp || (hasMeaningfulProgress(guestApp) ? guestApp : null);
      }

      const savedUserRank = parseVerifiedRankSafe(localStorage.getItem(userRankKey(user.uid)));
      const guestRank = parseVerifiedRankSafe(localStorage.getItem(RANK_STORE_KEY));
      if (savedUserRank || (guestRank && (guestRank.rp > 0 || guestRank.correctCount > 0))) {
        localRankCandidate = {
          rp: Math.max((savedUserRank && savedUserRank.rp) || 0, (guestRank && guestRank.rp) || 0),
          correctCount: Math.max((savedUserRank && savedUserRank.correctCount) || 0, (guestRank && guestRank.correctCount) || 0),
          streak: Math.max((savedUserRank && savedUserRank.streak) || 0, (guestRank && guestRank.streak) || 0),
          studyMinutes: Math.max((savedUserRank && savedUserRank.studyMinutes) || 0, (guestRank && guestRank.studyMinutes) || 0)
        };
      }
    }

    rankData = enforceBounds(Object.assign(defaultRankData(), localRankCandidate || {}));

    try {
      // Kiểm tra danh sách Ban trước
      const banDoc = await db.collection('banned').doc(user.uid).get();
      if (banDoc.exists) {
        const bData = banDoc.data() || {};
        isCurrentUserBanned = true;
        currentBanReason = bData.reason || 'Vi phạm quy tắc xếp hạng';
        rankData = defaultRankData();
        const zeroRankJson = JSON.stringify(rankData);
        localStorage.setItem(ACTIVE_UID_KEY, user.uid);
        localStorage.setItem(RANK_STORE_KEY, zeroRankJson);
        localStorage.setItem(userRankKey(user.uid), zeroRankJson);
        updateRankUI();
        setSyncStatus('🚫 Tài khoản bị khóa BXH: ' + currentBanReason, '#f87171');
        if (appBridge && typeof appBridge.notifyToast === 'function') {
          appBridge.notifyToast('🚫 Tài khoản của bạn đã bị quản trị viên khóa quyền BXH (' + currentBanReason + ').', 'bad');
        }
        return;
      }

      const doc = await db.collection('leaderboard').doc(user.uid).get();
      let cloudApp = null;
      let wasResetByAdmin = false;

      if (doc.exists) {
        const cloud = doc.data();
        const cloudResetAt = Number(cloud.adminResetAt) || 0;
        const ackResetAt = Number(localStorage.getItem(RESET_ACK_PREFIX + user.uid) || 0);

        if (cloudResetAt > ackResetAt) {
          // Admin vừa đặt lại điểm của tài khoản này -> xóa sạch điểm cục bộ về 0 RP
          wasResetByAdmin = true;
          localStorage.setItem(RESET_ACK_PREFIX + user.uid, String(cloudResetAt));
          rankData = defaultRankData();
        } else {
          const cloudRp = Math.max(0, Math.floor(Number(cloud.rp) || 0));
          const cloudCorrect = Math.max(0, Math.floor(Number(cloud.correctCount) || 0));
          const cloudMins = Math.max(0, Math.floor(Number(cloud.studyMinutes) || 0));
          rankData.rp = Math.max(rankData.rp, cloudRp);
          rankData.correctCount = Math.max(rankData.correctCount, cloudCorrect);
          rankData.studyMinutes = Math.max(rankData.studyMinutes, cloudMins);
        }
        cloudApp = parseJsonSafe(cloud.appProgressJson);
      }

      enforceBounds(rankData);
      if (rankData.rp >= CHALLENGER_MIN_RP) {
        await refreshChallengerStatus(true);
      }

      const resolvedApp = mergeAppProgress(localAppCandidate, cloudApp) || {};
      const resolvedJson = JSON.stringify(resolvedApp);
      const resolvedRankJson = JSON.stringify(rankData);

      localStorage.setItem(ACTIVE_UID_KEY, user.uid);
      localStorage.setItem(APP_STORE_KEY, resolvedJson);
      localStorage.setItem(userAppKey(user.uid), resolvedJson);
      localStorage.setItem(RANK_STORE_KEY, resolvedRankJson);
      localStorage.setItem(userRankKey(user.uid), resolvedRankJson);

      if (appBridge && typeof appBridge.applySyncedAppProgress === 'function') {
        appBridge.applySyncedAppProgress(resolvedApp);
      }

      updateRankUI();
      if (wasResetByAdmin && appBridge && typeof appBridge.notifyToast === 'function') {
        appBridge.notifyToast('⚠️ Điểm xếp hạng của bạn đã được quản trị viên đặt lại về 0 RP.', 'info');
      }
      needSync = true;
      await syncToCloud(true);
    } catch (err) {
      console.error("Lỗi tải dữ liệu tài khoản:", err);
      localStorage.setItem(ACTIVE_UID_KEY, user.uid);
      if (localAppCandidate) {
        const fallbackJson = JSON.stringify(localAppCandidate);
        localStorage.setItem(APP_STORE_KEY, fallbackJson);
        localStorage.setItem(userAppKey(user.uid), fallbackJson);
        if (appBridge && typeof appBridge.applySyncedAppProgress === 'function') {
          appBridge.applySyncedAppProgress(localAppCandidate);
        }
      }
      updateRankUI();
      setSyncStatus('⚠️ Offline (dùng bản lưu máy)', '#fbbf24');
    }
  });

  // 7. HIỂN THỊ BẢNG XẾP HẠNG TOP 20 (TỰ ĐỘNG LỌC BỎ ADMIN + THÁCH ĐẤU TOP 3 >= 15.000 RP)
  window.openLeaderboard = async function () {
    const modal = document.getElementById('leaderboard-modal');
    const listEl = document.getElementById('leaderboard-list');
    modal.style.display = 'flex';
    listEl.innerHTML = 'Đang tải bảng xếp hạng...';

    if (needSync && !isAdminUser() && !isCurrentUserBanned) await syncToCloud(false);

    const snapshot = await db.collection('leaderboard')
      .orderBy('rp', 'desc')
      .limit(25)
      .get();

    let html = '<div style="font-size:12px; color:#94a3b8; margin-bottom:10px; padding:6px 10px; border-radius:8px; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25);">' +
      '🔥 <strong style="color:#fbbf24;">Thách Đấu</strong>: Dành riêng cho <strong>Top 3</strong> người có điểm cao nhất đạt từ <strong>15.000 RP</strong> trở lên.</div>';
    let index = 1;
    let foundMe = false;

    snapshot.forEach(function (doc) {
      if (doc.id === ADMIN_UID) return; // Ẩn hoàn toàn Admin khỏi BXH
      if (index > 20) return;
      const d = doc.data();
      const rpVal = Math.max(0, Math.floor(Number(d.rp) || 0));
      const isMe = currentUser && doc.id === currentUser.uid;
      const isChallenger = (index <= CHALLENGER_TOP_N && rpVal >= CHALLENGER_MIN_RP);
      const displayTier = getRankTier(rpVal, index);

      if (isMe) {
        foundMe = true;
        isCurrentUserChallenger = isChallenger;
        lastChallengerCheckAt = Date.now();
        updateRankUI();
      }

      const rowBg = isChallenger
        ? 'linear-gradient(90deg, rgba(239,68,68,0.18), rgba(245,158,11,0.16))'
        : (isMe ? '#334155' : '#0f172a');
      const rowBorder = isMe
        ? '1px solid #f59e0b'
        : (isChallenger ? '1px solid rgba(239,68,68,0.45)' : 'none');

      html += '<div style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; margin-bottom:6px; border-radius:8px; background:' + rowBg + '; border:' + rowBorder + ';">' +
        '<div><strong>#' + index + '</strong> ' + escapeHtml(d.name) + '<br><small style="color:' + (isChallenger ? '#fca5a5' : '#94a3b8') + ';">' + escapeHtml(displayTier) + ' • Đúng ' + (Number(d.correctCount) || 0) + ' câu • ' + (Number(d.studyMinutes) || 0) + ' phút</small></div>' +
        '<strong style="color:' + (isChallenger ? '#f87171' : '#fbbf24') + ';">' + rpVal + ' RP</strong></div>';
      index++;
    });

    if (currentUser && !foundMe && isCurrentUserChallenger) {
      isCurrentUserChallenger = false;
      updateRankUI();
    }

    listEl.innerHTML = index === 1
      ? 'Chưa có ai trên bảng xếp hạng. Hãy đăng nhập để mở bát!'
      : html;
  };

  // 8. BẢNG ĐIỀU KHIỂN QUẢN TRỊ VIÊN (ADMIN PANEL: XÓA ĐIỂM, BAN/GỠ BAN, BÁO LỖI CÂU HỎI)
  let activeAdminTab = 'lb';
  let adminLbCache = [];
  let adminBanCache = [];
  let adminReportsCache = [];

  function adminNotify(msg, type) {
    if (appBridge && typeof appBridge.notifyToast === 'function') {
      appBridge.notifyToast(msg, type || 'info');
    } else {
      alert(msg);
    }
  }

  function fmtAdminDate(ts) {
    if (!ts) return 'Không rõ';
    try {
      const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
      return d.toLocaleString('vi-VN');
    } catch (e) {
      return 'Không rõ';
    }
  }

  window.openAdminPanel = async function () {
    if (!isAdminUser()) {
      adminNotify('Chỉ tài khoản quản trị viên mới có quyền truy cập.', 'bad');
      return;
    }
    const modal = document.getElementById('admin-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    await switchAdminTab(activeAdminTab || 'lb');
  };

  window.closeAdminPanel = function () {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.style.display = 'none';
  };

  window.switchAdminTab = async function (tab) {
    if (!isAdminUser()) return;
    activeAdminTab = tab;
    ['lb', 'banned', 'reports'].forEach(function (t) {
      const btn = document.getElementById('admin-tab-' + t);
      if (btn) btn.classList.toggle('active', t === tab);
    });
    const body = document.getElementById('admin-panel-body');
    if (!body) return;
    body.innerHTML = '<div style="padding:16px; text-align:center; color:#94a3b8;">🔄 Đang tải dữ liệu từ Firestore...</div>';

    try {
      if (tab === 'lb') {
        const snap = await db.collection('leaderboard').orderBy('rp', 'desc').limit(100).get();
        adminLbCache = [];
        snap.forEach(function (doc) {
          adminLbCache.push(Object.assign({ uid: doc.id }, doc.data()));
        });
        renderAdminLeaderboard('');
      } else if (tab === 'banned') {
        const snap = await db.collection('banned').limit(100).get();
        adminBanCache = [];
        snap.forEach(function (doc) {
          adminBanCache.push(Object.assign({ uid: doc.id }, doc.data()));
        });
        renderAdminBanned();
      } else if (tab === 'reports') {
        const snap = await db.collection('reports').limit(100).get();
        adminReportsCache = [];
        snap.forEach(function (doc) {
          adminReportsCache.push(Object.assign({ id: doc.id }, doc.data()));
        });
        adminReportsCache.sort(function (a, b) {
          const ta = a.createdAt && typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : 0;
          const tb = b.createdAt && typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : 0;
          return tb - ta;
        });
        renderAdminReports();
      }
    } catch (err) {
      console.error('Lỗi tải Admin Panel:', err);
      body.innerHTML = '<div style="padding:14px; border-radius:10px; background:rgba(239,68,68,0.16); color:#fca5a5;">⚠️ Không tải được dữ liệu: ' + escapeHtml(err.message || err) + '<br><small>Hãy kiểm tra bạn đã Publish file <code>firestore.rules</code> mới trên Firebase Console chưa.</small></div>';
    }
  };

  window.filterAdminLeaderboard = function (val) {
    renderAdminLeaderboard(val || '');
  };

  function renderAdminLeaderboard(query) {
    const body = document.getElementById('admin-panel-body');
    if (!body) return;
    const q = String(query || '').trim().toLowerCase();
    const list = adminLbCache.filter(function (u) {
      if (!q) return true;
      return String(u.name || '').toLowerCase().indexOf(q) !== -1 || String(u.uid || '').toLowerCase().indexOf(q) !== -1;
    });

    let html = '<div class="admin-toolbar">' +
      '<input class="admin-search" type="text" value="' + escapeHtml(query || '') + '" oninput="filterAdminLeaderboard(this.value)" placeholder="Tìm theo tên hoặc UID người chơi...">' +
      '<button type="button" class="admin-btn" onclick="switchAdminTab(\'lb\')">🔄 Tải lại (' + adminLbCache.length + ')</button>' +
      '</div>';

    if (!list.length) {
      html += '<div style="padding:14px; color:#94a3b8; text-align:center;">Không có người chơi nào phù hợp.</div>';
      body.innerHTML = html;
      return;
    }

    list.forEach(function (u, idx) {
      const isSelfAdmin = u.uid === ADMIN_UID;
      const safeUid = escapeHtml(u.uid);
      const safeName = escapeHtml(u.name || 'Không tên');
      const rpVal = Math.max(0, Math.floor(Number(u.rp) || 0));
      html += '<div class="admin-card">' +
        '<div class="admin-card-top">' +
          '<div>' +
            '<strong>#' + (idx + 1) + ' ' + safeName + '</strong> ' +
            (isSelfAdmin ? '<span class="admin-badge">👑 Bản ghi cũ của Admin (nên xóa dòng)</span>' : '') +
            '<div style="font-size:12px; color:#cbd5e1; margin-top:2px;">' + escapeHtml(u.tier || '🥉 Đồng') + ' • Đúng ' + (Number(u.correctCount) || 0) + ' câu • ' + (Number(u.studyMinutes) || 0) + ' phút</div>' +
            '<div class="admin-uid">UID: ' + safeUid + '</div>' +
          '</div>' +
          '<strong style="color:#fbbf24; font-size:15px;">' + rpVal + ' RP</strong>' +
        '</div>' +
        '<div class="admin-actions">' +
          (!isSelfAdmin ? '<button type="button" class="admin-btn warn" data-uid="' + safeUid + '" data-name="' + safeName + '" onclick="adminResetUserScore(this.dataset.uid, this.dataset.name)">🧹 Xóa điểm về 0 RP</button>' : '') +
          '<button type="button" class="admin-btn" data-uid="' + safeUid + '" data-name="' + safeName + '" onclick="adminDeleteLeaderboardRow(this.dataset.uid, this.dataset.name)">🗑️ Xóa khỏi BXH</button>' +
          (!isSelfAdmin ? '<button type="button" class="admin-btn danger" data-uid="' + safeUid + '" data-name="' + safeName + '" onclick="adminBanUserPrompt(this.dataset.uid, this.dataset.name)">🔨 Ban tài khoản</button>' : '') +
        '</div>' +
      '</div>';
    });

    body.innerHTML = html;
  }

  function renderAdminBanned() {
    const body = document.getElementById('admin-panel-body');
    if (!body) return;
    let html = '<div class="admin-toolbar">' +
      '<div style="flex:1; font-size:13px; color:#cbd5e1; align-self:center;">Tổng số tài khoản đang bị khóa BXH: <strong>' + adminBanCache.length + '</strong></div>' +
      '<button type="button" class="admin-btn" onclick="switchAdminTab(\'banned\')">🔄 Tải lại</button>' +
      '</div>';

    if (!adminBanCache.length) {
      html += '<div style="padding:16px; color:#94a3b8; text-align:center;">Hiện chưa có tài khoản nào bị Ban.</div>';
      body.innerHTML = html;
      return;
    }

    adminBanCache.forEach(function (b) {
      const safeUid = escapeHtml(b.uid);
      const safeName = escapeHtml(b.name || 'Không rõ tên');
      html += '<div class="admin-card">' +
        '<div class="admin-card-top">' +
          '<div>' +
            '<strong>🚫 ' + safeName + '</strong>' +
            '<div style="font-size:12.5px; color:#fca5a5; margin-top:3px;">Lý do: ' + escapeHtml(b.reason || 'Vi phạm quy tắc') + '</div>' +
            '<div class="admin-uid">UID: ' + safeUid + ' • Ngày khóa: ' + escapeHtml(fmtAdminDate(b.bannedAt || b.bannedAtMs)) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="admin-actions">' +
          '<button type="button" class="admin-btn ok" data-uid="' + safeUid + '" data-name="' + safeName + '" onclick="adminUnbanUser(this.dataset.uid, this.dataset.name)">🔓 Gỡ Ban</button>' +
        '</div>' +
      '</div>';
    });

    body.innerHTML = html;
  }

  function renderAdminReports() {
    const body = document.getElementById('admin-panel-body');
    if (!body) return;
    let html = '<div class="admin-toolbar">' +
      '<div style="flex:1; font-size:13px; color:#cbd5e1; align-self:center;">Báo lỗi câu hỏi chưa xử lý: <strong>' + adminReportsCache.length + '</strong></div>' +
      '<button type="button" class="admin-btn" onclick="switchAdminTab(\'reports\')">🔄 Tải lại</button>' +
      '</div>';

    if (!adminReportsCache.length) {
      html += '<div style="padding:16px; color:#94a3b8; text-align:center;">🎉 Tuyệt vời! Không có báo lỗi câu hỏi nào tồn đọng.</div>';
      body.innerHTML = html;
      return;
    }

    adminReportsCache.forEach(function (r) {
      const safeId = escapeHtml(r.id);
      html += '<div class="admin-card">' +
        '<div class="admin-card-top">' +
          '<div>' +
            '<strong style="color:#fbbf24;">Chương ' + (Number(r.ch) || 0) + ' • Câu ' + (Number(r.n) || 0) + ' (' + escapeHtml(r.qid || '') + ')</strong> ' +
            '<span class="ban-badge">' + escapeHtml(r.reason || 'Báo lỗi') + '</span>' +
          '</div>' +
          '<small style="color:#94a3b8;">' + escapeHtml(fmtAdminDate(r.createdAt)) + '</small>' +
        '</div>' +
        '<div style="font-size:13px; color:#f8fafc; margin-top:6px; line-height:1.45;">' + escapeHtml(r.questionText || '') + '</div>' +
        (r.currentAnswer ? '<div style="font-size:12px; color:#93c5fd; margin-top:4px;">Đáp án web hiện tại: ' + escapeHtml(r.currentAnswer) + '</div>' : '') +
        (r.note ? '<div style="font-size:12px; color:#fde68a; margin-top:4px; background:rgba(245,158,11,0.1); padding:5px 8px; border-radius:6px;">Ghi chú người gửi: ' + escapeHtml(r.note) + '</div>' : '') +
        '<div class="admin-uid" style="margin-top:5px;">Người báo: ' + escapeHtml(r.reporterName || 'Khách') + ' (' + escapeHtml(r.reporterUid || 'guest') + ')</div>' +
        '<div class="admin-actions">' +
          '<button type="button" class="admin-btn ok" data-id="' + safeId + '" onclick="adminDeleteReport(this.dataset.id)">✔ Đã xử lý & Xóa báo cáo</button>' +
        '</div>' +
      '</div>';
    });

    body.innerHTML = html;
  }

  window.adminResetUserScore = async function (uid, name) {
    if (!isAdminUser() || !uid) return;
    if (!window.confirm('Đặt lại toàn bộ điểm RP, số câu đúng và thời gian học của "' + name + '" về 0?\n(Lần sau người này mở web, điểm lưu trên máy họ cũng sẽ tự reset về 0 RP)')) return;
    try {
      await db.collection('leaderboard').doc(uid).set({
        rp: 0,
        correctCount: 0,
        studyMinutes: 0,
        tier: '🥉 Đồng',
        adminResetAt: Date.now(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      adminNotify('✔ Đã đặt lại điểm của ' + name + ' về 0 RP.', 'ok');
      await switchAdminTab('lb');
    } catch (err) {
      adminNotify('Lỗi xóa điểm: ' + (err.message || err), 'bad');
    }
  };

  window.adminDeleteLeaderboardRow = async function (uid, name) {
    if (!isAdminUser() || !uid) return;
    if (!window.confirm('Xóa hẳn dòng xếp hạng của "' + name + '" khỏi BXH?')) return;
    try {
      await db.collection('leaderboard').doc(uid).delete();
      adminNotify('✔ Đã xóa ' + name + ' khỏi BXH.', 'ok');
      await switchAdminTab('lb');
    } catch (err) {
      adminNotify('Lỗi xóa dòng BXH: ' + (err.message || err), 'bad');
    }
  };

  window.adminBanUserPrompt = async function (uid, name) {
    if (!isAdminUser() || !uid) return;
    const reason = window.prompt('Nhập lý do Ban tài khoản "' + name + '" khỏi BXH:', 'Gian lận điểm / Tên hiển thị vi phạm');
    if (reason === null) return;
    try {
      await db.collection('banned').doc(uid).set({
        uid: uid,
        name: String(name || 'Không tên').slice(0, 40),
        reason: String(reason || 'Vi phạm quy tắc xếp hạng').slice(0, 140),
        bannedBy: ADMIN_UID,
        bannedAtMs: Date.now(),
        bannedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      await db.collection('leaderboard').doc(uid).delete();
      adminNotify('🔨 Đã Ban và xóa ' + name + ' khỏi BXH.', 'ok');
      await switchAdminTab('lb');
    } catch (err) {
      adminNotify('Lỗi Ban tài khoản: ' + (err.message || err), 'bad');
    }
  };

  window.adminUnbanUser = async function (uid, name) {
    if (!isAdminUser() || !uid) return;
    if (!window.confirm('Gỡ Ban cho tài khoản "' + name + '" để họ có thể tham gia lại BXH?')) return;
    try {
      await db.collection('banned').doc(uid).delete();
      adminNotify('🔓 Đã gỡ Ban cho ' + name + '.', 'ok');
      await switchAdminTab('banned');
    } catch (err) {
      adminNotify('Lỗi gỡ Ban: ' + (err.message || err), 'bad');
    }
  };

  window.adminDeleteReport = async function (reportId) {
    if (!isAdminUser() || !reportId) return;
    try {
      await db.collection('reports').doc(reportId).delete();
      adminNotify('✔ Đã xóa báo lỗi câu hỏi.', 'ok');
      await switchAdminTab('reports');
    } catch (err) {
      adminNotify('Lỗi xóa báo cáo: ' + (err.message || err), 'bad');
    }
  };

  updateRankUI();
})();
