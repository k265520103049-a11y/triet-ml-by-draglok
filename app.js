/* Ôn tập Triết học Mác - Lênin (BAS 123) - Pro Edition v2
 * Đầy đủ: Luyện tập, Đề 40 câu, 4 Gameshow thưởng Xu Triết, EXP & Level,
 * Nhiệm vụ ngày, Cửa hàng Background/Khung thẻ/Vật phẩm & Trình quản lý câu hỏi.
 */
(function () {
  'use strict';

  var BASE_Q = (window.QUESTIONS || []).slice();
  var Q = [];
  var LETTERS = ['A', 'B', 'C', 'D'];
  var MIX_SIZE = 40;
  var STORE_KEY = 'mln-ontap-v1';

  /* ---------- Cấu trúc chương / mục ---------- */
  var CHAPTERS = {
    1: {
      title: 'Khái luận về triết học và triết học Mác – Lênin',
      sections: [
        { name: '1.1. Triết học và vấn đề cơ bản của triết học', from: 1, to: 49 },
        { name: '1.2. Triết học Mác - Lênin và vai trò trong đời sống xã hội', from: 50, to: 95 }
      ]
    },
    2: {
      title: 'Chủ nghĩa duy vật biện chứng',
      sections: [
        { name: '2.1. Vật chất, ý thức và mối quan hệ giữa vật chất và ý thức', from: 1, to: 79 },
        { name: '2.2. Phép biện chứng duy vật (2 nguyên lý, 6 cặp phạm trù, 3 quy luật)', from: 80, to: 199 },
        { name: '2.3. Lý luận nhận thức (nhận thức, thực tiễn, chân lý)', from: 200, to: 240 }
      ]
    },
    3: {
      title: 'Chủ nghĩa duy vật lịch sử',
      sections: [
        { name: '3.1. Học thuyết hình thái kinh tế - xã hội', from: 1, to: 74 },
        { name: '3.2. Giai cấp và dân tộc', from: 75, to: 139 },
        { name: '3.3. Nhà nước và cách mạng xã hội', from: 140, to: 188 },
        { name: '3.4. Ý thức xã hội', from: 189, to: 226 },
        { name: '3.5. Triết học Mác - Lênin về vấn đề con người', from: 227, to: 265 }
      ]
    }
  };

  /* ---------- Danh mục Cửa hàng Xu Triết ---------- */
  var SHOP_BACKGROUNDS = [
    { id: 'default', name: 'Mặc định thanh lịch', desc: 'Nền tiêu chuẩn sáng/tối dịu mắt.', price: 0, icon: '🏛️', preview: 'linear-gradient(135deg,#f5f7fb,#e2e8f0)' },
    { id: 'sunrise', name: 'Bình minh Cách mạng', desc: 'Sắc đỏ cam ấm áp đầy khí thế.', price: 150, icon: '🌅', preview: 'linear-gradient(135deg,#fee2e2,#fef3c7)' },
    { id: 'emerald', name: 'Thảo nguyên Biện chứng', desc: 'Tông xanh ngọc bích nhẹ nhàng, tập trung cao.', price: 220, icon: '🌿', preview: 'linear-gradient(135deg,#d1fae5,#ecfdf5)' },
    { id: 'sakura', name: 'Hoa anh đào Mùa xuân', desc: 'Ánh hồng phấn tinh tế và thư thái.', price: 280, icon: '🌸', preview: 'linear-gradient(135deg,#fce7f3,#ffe4e6)' },
    { id: 'cosmos', name: 'Vũ trụ Vật chất', desc: 'Tinh vân đa sắc biểu tượng cho thế giới khách quan.', price: 360, icon: '🌌', preview: 'linear-gradient(135deg,#e0e7ff,#fae8ff)' },
    { id: 'royal', name: 'Hào quang Hoàng kim', desc: 'Ánh vàng kim sang trọng dành cho học giả.', price: 450, icon: '👑', preview: 'linear-gradient(135deg,#fef3c7,#fde68a)' },
    { id: 'cyber', name: 'Lưới Cyber Duy vật', desc: 'Lưới tọa độ chuyển động hiện đại.', price: 550, icon: '💠', preview: 'linear-gradient(135deg,#dbeafe,#ede9fe)' }
  ];

  var SHOP_FRAMES = [
    { id: 'default', name: 'Khung tiêu chuẩn', desc: 'Bo góc mềm mại mặc định.', price: 0, icon: '🃏' },
    { id: 'gold', name: 'Khung Viền Vàng Gold', desc: 'Viền vàng ánh kim nổi bật quanh thẻ câu hỏi.', price: 200, icon: '✨' },
    { id: 'neon', name: 'Khung Hào Quang Chủ Đạo', desc: 'Phát sáng nhẹ theo màu chủ đạo đang dùng.', price: 320, icon: '💫' },
    { id: 'crimson', name: 'Khung Đỏ Thắm Sao Vàng', desc: 'Viền đỏ cờ kết hợp thanh vàng đỉnh thẻ.', price: 420, icon: '🚩' }
  ];

  var SHOP_PALETTES = [
    { id: 'default', name: 'Đỏ Cờ Truyền thống', desc: 'Màu đỏ biểu tượng của Triết học Mác - Lênin.', price: 0, color: '#b3261e' },
    { id: 'blue', name: 'Xanh Tri thức', desc: 'Tông xanh dương học thuật điềm tĩnh.', price: 120, color: '#1d4ed8' },
    { id: 'emerald', name: 'Xanh Lục Bảo', desc: 'Tông xanh lá tươi mới, dễ chịu khi cày đêm.', price: 120, color: '#047857' },
    { id: 'violet', name: 'Tím Hàn Lâm', desc: 'Tông tím tư duy sâu sắc và khác biệt.', price: 150, color: '#6d28d9' }
  ];

  var SHOP_TITLES = [
    { id: 'auto', name: 'Danh hiệu theo Cấp độ', desc: 'Tự động nâng cấp danh hiệu mỗi khi lên Level.', price: 0, icon: '🎖️' },
    { id: 'Nhà Biện Chứng Trẻ', name: 'Nhà Biện Chứng Trẻ', desc: 'Danh hiệu độc quyền hiển thị trên thanh trạng thái.', price: 180, icon: '⚡' },
    { id: 'Chiến Thần Duy Vật', name: 'Chiến Thần Duy Vật', desc: 'Khẳng định bản lĩnh chinh phục 600 câu hỏi.', price: 300, icon: '🔥' },
    { id: 'Học Giả Triết Mác - Lênin', name: 'Học Giả Triết Mác - Lênin', desc: 'Danh hiệu cao quý bậc nhất của cửa hàng.', price: 500, icon: '👑' }
  ];

  var SHOP_ITEMS = [
    { id: 'hint50', name: 'Thẻ Gợi ý 50/50', desc: 'Loại bỏ ngay 2 đáp án sai khi đang luyện tập theo chương.', price: 40, icon: '✂️' },
    { id: 'shield', name: 'Khiên Bảo Toàn Chuỗi', desc: 'Tự động đỡ 1 lần trả lời sai để không mất chuỗi đúng liên tiếp.', price: 60, icon: '🛡️' },
    { id: 'boost2x', name: 'Thẻ x2 Xu & EXP (15 phút)', desc: 'Nhân đôi toàn bộ Xu Triết và EXP nhận được trong 15 phút.', price: 90, icon: '⚡' }
  ];

  var DAILY_QUEST_DEFS = [
    { id: 'ans10', title: 'Khởi động tư duy', desc: 'Trả lời đúng 10 câu hỏi bất kỳ trong ngày.', target: 10, coins: 60, xp: 50, icon: '🎯' },
    { id: 'game1', title: 'Đấu trường trí tuệ', desc: 'Hoàn thành 1 ván Gameshow truyền hình bất kỳ.', target: 1, coins: 100, xp: 80, icon: '📺' },
    { id: 'streak5', title: 'Phong độ ổn định', desc: 'Đạt chuỗi 5 câu trả lời đúng liên tiếp trong ngày.', target: 5, coins: 90, xp: 70, icon: '🔥' },
    { id: 'explore3', title: 'Đào sâu kiến thức', desc: 'Đọc Ôn lý thuyết hoặc sửa đúng 3 câu từng làm sai.', target: 3, coins: 80, xp: 60, icon: '📚' }
  ];

  var EXPLAIN = window.EXPLAIN || {};
  function explainBox(q) {
    var txt = (q && q.exp) || EXPLAIN[q.id];
    return txt ? h('div', { class: 'explain' }, h('b', null, 'Giải thích: '), txt) : null;
  }

  var byId = {};
  function rebuildQuestionBank() {
    var hidden = (store && store.hiddenQuestions) || {};
    var custom = (store && store.customQuestions) || [];
    Q = BASE_Q.filter(function (q) { return !hidden[q.id]; }).concat(custom);
    byId = {};
    Q.forEach(function (q) { byId[q.id] = q; });
    normCache = null;
  }
  function chapterQs(ch) { return Q.filter(function (q) { return q.ch === ch; }); }

  /* ---------- Ngày tháng & Streak ---------- */
  function dateKey(offsetDays) {
    var d = new Date();
    if (offsetDays) d.setDate(d.getDate() + offsetDays);
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return y + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  function formatDateVN(key) {
    var p = key.split('-');
    return p.length === 3 ? (p[2] + '/' + p[1] + '/' + p[0]) : key;
  }

  /* ---------- Lưu trữ (localStorage) ---------- */
  function defaults() {
    return {
      wrong: {},
      seen: {},
      marks: {},
      stats: {},
      activity: {},
      streak: { current: 0, best: 0, lastDate: null },
      sessions: { practice: {}, mix: null },
      settings: { shuffleOpts: true, theme: 'auto', mixLimit: 0, sound: true },
      customQuestions: [],
      hiddenQuestions: {},
      player: {
        coins: 100,
        xp: 0,
        level: 1,
        boost2xUntil: 0,
        inventory: {
          bgs: ['default'],
          frames: ['default'],
          palettes: ['default'],
          titles: ['auto'],
          items: { hint50: 1, shield: 1, boost2x: 0 }
        },
        equipped: {
          bg: 'default',
          frame: 'default',
          palette: 'default',
          title: 'auto'
        }
      },
      daily: {
        date: dateKey(0),
        progress: { ans10: 0, game1: 0, streak5: 0, explore3: 0 },
        claimed: {}
      }
    };
  }

  function norm(raw) {
    var d = defaults();
    raw = raw && typeof raw === 'object' ? raw : {};
    d.wrong = raw.wrong && typeof raw.wrong === 'object' ? raw.wrong : {};
    d.seen = raw.seen && typeof raw.seen === 'object' ? raw.seen : {};
    d.marks = raw.marks && typeof raw.marks === 'object' ? raw.marks : {};
    d.stats = raw.stats && typeof raw.stats === 'object' ? raw.stats : {};
    d.activity = raw.activity && typeof raw.activity === 'object' ? raw.activity : {};
    if (raw.streak && typeof raw.streak === 'object') {
      d.streak = {
        current: Number(raw.streak.current) || 0,
        best: Number(raw.streak.best) || 0,
        lastDate: raw.streak.lastDate || null
      };
    }
    if (raw.sessions && typeof raw.sessions === 'object') {
      d.sessions.practice = raw.sessions.practice || {};
      d.sessions.mix = raw.sessions.mix || null;
    }
    d.settings = Object.assign(d.settings, raw.settings || {});
    d.customQuestions = Array.isArray(raw.customQuestions) ? raw.customQuestions : [];
    d.hiddenQuestions = raw.hiddenQuestions && typeof raw.hiddenQuestions === 'object' ? raw.hiddenQuestions : {};

    if (raw.player && typeof raw.player === 'object') {
      d.player.coins = typeof raw.player.coins === 'number' ? raw.player.coins : 100;
      d.player.xp = Number(raw.player.xp) || 0;
      d.player.level = Math.max(1, Number(raw.player.level) || 1);
      d.player.boost2xUntil = Number(raw.player.boost2xUntil) || 0;
      if (raw.player.inventory && typeof raw.player.inventory === 'object') {
        var inv = raw.player.inventory;
        d.player.inventory.bgs = Array.isArray(inv.bgs) && inv.bgs.length ? inv.bgs : ['default'];
        d.player.inventory.frames = Array.isArray(inv.frames) && inv.frames.length ? inv.frames : ['default'];
        d.player.inventory.palettes = Array.isArray(inv.palettes) && inv.palettes.length ? inv.palettes : ['default'];
        d.player.inventory.titles = Array.isArray(inv.titles) && inv.titles.length ? inv.titles : ['auto'];
        d.player.inventory.items = Object.assign({ hint50: 1, shield: 1, boost2x: 0 }, inv.items || {});
      }
      if (raw.player.equipped && typeof raw.player.equipped === 'object') {
        d.player.equipped = Object.assign(d.player.equipped, raw.player.equipped);
      }
    }

    var today = dateKey(0);
    if (raw.daily && raw.daily.date === today) {
      d.daily.date = today;
      d.daily.progress = Object.assign({ ans10: 0, game1: 0, streak5: 0, explore3: 0 }, raw.daily.progress || {});
      d.daily.claimed = raw.daily.claimed && typeof raw.daily.claimed === 'object' ? raw.daily.claimed : {};
    }
    return d;
  }

  function load() {
    try {
      return norm(JSON.parse(localStorage.getItem(STORE_KEY) || '{}'));
    } catch (e) {
      return defaults();
    }
  }

  var store = load();
  var normCache = null;
  rebuildQuestionBank();

  function ensureDaily() {
    var today = dateKey(0);
    if (!store.daily || store.daily.date !== today) {
      store.daily = {
        date: today,
        progress: { ans10: 0, game1: 0, streak5: 0, explore3: 0 },
        claimed: {}
      };
    }
  }

  function save() {
    ensureDaily();
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {}
    updateWrongBadge();
    renderPlayerHud();
  }

  /* ---------- Hệ thống EXP, Level, Xu Triết & Nhiệm vụ ngày ---------- */
  function xpForNextLevel(lvl) {
    return lvl * 100;
  }

  function rankTitleForLevel(lvl) {
    if (lvl >= 17) return '👑 Bậc thầy Mác - Lênin';
    if (lvl >= 12) return '🏛️ Nhà Lý luận thực tiễn';
    if (lvl >= 8) return '🔥 Chiến sĩ Duy vật';
    if (lvl >= 5) return '⚙️ Biện chứng tập sự';
    if (lvl >= 3) return '📖 Người tìm chân lý';
    return '🌱 Tân binh Triết học';
  }

  function activeTitle() {
    var eq = store.player.equipped.title;
    if (eq && eq !== 'auto') return '🎖️ ' + eq;
    return rankTitleForLevel(store.player.level);
  }

  function isBoost2xActive() {
    return (store.player.boost2xUntil || 0) > Date.now();
  }

  function fireConfetti() {
    var layer = document.getElementById('confettiLayer');
    if (!layer) return;
    var colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    for (var i = 0; i < 36; i++) {
      var p = document.createElement('span');
      p.className = 'confetti-piece';
      p.style.left = Math.round(Math.random() * 100) + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.35).toFixed(2) + 's';
      layer.appendChild(p);
      (function (el) {
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 2000);
      })(p);
    }
  }

  function grantRewards(coins, xp, reason) {
    var mult = isBoost2xActive() ? 2 : 1;
    var gotCoins = Math.round((coins || 0) * mult);
    var gotXp = Math.round((xp || 0) * mult);
    store.player.coins = (store.player.coins || 0) + gotCoins;
    store.player.xp = (store.player.xp || 0) + gotXp;

    var leveledUp = false;
    while (store.player.xp >= xpForNextLevel(store.player.level)) {
      store.player.xp -= xpForNextLevel(store.player.level);
      store.player.level++;
      store.player.coins += 50;
      leveledUp = true;
    }
    save();

    if (reason) {
      var parts = [];
      if (gotCoins > 0) parts.push('+' + gotCoins + ' Xu Triết');
      if (gotXp > 0) parts.push('+' + gotXp + ' EXP');
      if (parts.length) toast(reason + ': ' + parts.join(' · ') + (mult > 1 ? ' (x2!)' : ''), 'ok');
    }
    if (leveledUp) {
      fireConfetti();
      sfx.win();
      toast('🎉 Chúc mừng! Bạn đã lên Cấp ' + store.player.level + ' (+50 Xu Triết)!', 'ok');
    }
    return { coins: gotCoins, xp: gotXp, leveledUp: leveledUp };
  }

  function bumpQuest(id, amount, isMax) {
    ensureDaily();
    var cur = store.daily.progress[id] || 0;
    store.daily.progress[id] = isMax ? Math.max(cur, amount) : (cur + amount);
  }

  function readyQuestsCount() {
    ensureDaily();
    var cnt = 0;
    DAILY_QUEST_DEFS.forEach(function (q) {
      var prog = store.daily.progress[q.id] || 0;
      if (prog >= q.target && !store.daily.claimed[q.id]) cnt++;
    });
    return cnt;
  }

  function claimQuest(qId) {
    ensureDaily();
    var def = DAILY_QUEST_DEFS.filter(function (x) { return x.id === qId; })[0];
    if (!def) return;
    var prog = store.daily.progress[qId] || 0;
    if (prog < def.target || store.daily.claimed[qId]) return;
    store.daily.claimed[qId] = true;
    fireConfetti();
    sfx.win();
    grantRewards(def.coins, def.xp, 'Hoàn thành nhiệm vụ "' + def.title + '"');
  }

  function renderPlayerHud() {
    var hud = document.getElementById('playerHud');
    if (!hud) return;
    ensureDaily();
    var lvl = store.player.level;
    var xp = store.player.xp;
    var need = xpForNextLevel(lvl);
    var pct = Math.min(100, Math.round((xp / need) * 100));
    var readyQ = readyQuestsCount();
    var shieldCnt = (store.player.inventory.items && store.player.inventory.items.shield) || 0;
    var boostLeftMin = isBoost2xActive() ? Math.ceil((store.player.boost2xUntil - Date.now()) / 60000) : 0;

    hud.replaceChildren(
      h('div', { class: 'player-left' },
        h('span', { class: 'lvl-badge' }, 'Lv.' + lvl),
        h('span', { class: 'title-badge' }, activeTitle()),
        h('span', { class: 'xp-box', title: 'Kinh nghiệm lên cấp tiếp theo' },
          h('span', { class: 'xp-track' }, h('span', { class: 'xp-fill', style: 'width:' + pct + '%' })),
          h('span', null, xp + '/' + need + ' EXP'))),
      h('div', { class: 'player-right' },
        boostLeftMin > 0 ? h('span', { class: 'buff-pill' }, '⚡ x2 Xu/EXP (' + boostLeftMin + 'p)') : null,
        shieldCnt > 0 ? h('span', { class: 'chip', title: 'Khiên giữ chuỗi sẵn sàng' }, '🛡️ ×' + shieldCnt) : null,
        h('button', {
          class: 'btn small' + (readyQ ? ' gold' : ''),
          type: 'button',
          onclick: function () { shopPage('quests'); }
        }, readyQ ? ('🎁 Nhận thưởng (' + readyQ + ')') : '📋 Nhiệm vụ ngày'),
        h('button', {
          class: 'xu-pill',
          type: 'button',
          title: 'Mở Cửa hàng Xu Triết',
          onclick: function () { shopPage('bgs'); }
        }, '🪙 ' + (store.player.coins || 0).toLocaleString() + ' Xu Triết'))
    );
  }

  function bumpActivity() {
    var today = dateKey(0);
    var yesterday = dateKey(-1);
    store.activity[today] = (store.activity[today] || 0) + 1;
    if (store.streak.lastDate !== today) {
      if (store.streak.lastDate === yesterday) {
        store.streak.current = (store.streak.current || 0) + 1;
      } else {
        store.streak.current = 1;
      }
      store.streak.lastDate = today;
      if (store.streak.current > (store.streak.best || 0)) {
        store.streak.best = store.streak.current;
      }
    }
  }

  function effectiveStreak() {
    var today = dateKey(0);
    var yesterday = dateKey(-1);
    if (store.streak.lastDate === today || store.streak.lastDate === yesterday) {
      return store.streak.current || 0;
    }
    return 0;
  }

  function record(q, ok, silent) {
    if (ok) {
      var wasWrong = !!store.wrong[q.id];
      store.seen[q.id] = 1;
      delete store.wrong[q.id];
      bumpQuest('ans10', 1, false);
      if (wasWrong) bumpQuest('explore3', 1, false);
      if (!silent) {
        sfx.ok();
        grantRewards(5, 10, null);
      }
    } else {
      store.wrong[q.id] = (store.wrong[q.id] || 0) + 1;
      if (!silent) sfx.bad();
    }
    bumpActivity();
  }

  function stat(key) {
    if (!store.stats[key]) store.stats[key] = { runs: 0, completed: 0, bestStreak: 0, best: 0 };
    return store.stats[key];
  }

  /* ---------- Âm thanh phản hồi (Web Audio API) ---------- */
  var audioCtx = null;
  function playTone(freq, dur, type, delay, vol) {
    if (!store.settings.sound) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var now = audioCtx.currentTime + (delay || 0);
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(vol || 0.08, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    } catch (e) {}
  }

  var sfx = {
    ok: function () {
      playTone(523.25, 0.14, 'triangle', 0, 0.08);
      playTone(659.25, 0.22, 'triangle', 0.08, 0.09);
    },
    bad: function () {
      playTone(220, 0.16, 'sine', 0, 0.08);
      playTone(185, 0.24, 'sine', 0.09, 0.08);
    },
    win: function () {
      playTone(523.25, 0.14, 'triangle', 0, 0.08);
      playTone(659.25, 0.14, 'triangle', 0.09, 0.08);
      playTone(783.99, 0.26, 'triangle', 0.18, 0.09);
    }
  };

  /* ---------- Tiện ích DOM, Toast & Custom Confirm Modal ---------- */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function h(tag, attrs) {
    var e = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') e.className = v;
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) append(e, arguments[i]);
    return e;
  }

  function append(parent, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(parent, x); }); return; }
    parent.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
  }

  var app = document.getElementById('app');
  function mount(node, scroll) {
    app.replaceChildren(node);
    if (scroll !== false) window.scrollTo(0, 0);
  }

  function setNav(activeId) {
    var ids = ['navHome', 'navBrowse', 'navTheory', 'navGame', 'navShop', 'navStats', 'navWrong', 'navGuide', 'navSettings'];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var on = id === activeId;
      el.classList.toggle('active', on);
      if (on) el.setAttribute('aria-current', 'page');
      else el.removeAttribute('aria-current');
    });
  }

  function toast(msg, type) {
    var stack = document.getElementById('toastStack');
    if (!stack) return;
    if (!type) {
      if (/chính xác|đã lưu|đã sao chép|thành công|hoàn tất|khôi phục|xuất|nhận|mua|trang bị|thêm/i.test(msg)) type = 'ok';
      else if (/lỗi|hết giờ|không hợp lệ|chưa chính xác|mất lượt|không đủ/i.test(msg)) type = 'bad';
      else type = 'info';
    }
    var icon = type === 'ok' ? '✔' : (type === 'bad' ? '⚠' : 'ℹ');
    var t = h('div', { class: 'toast ' + type, role: 'status' },
      h('span', { 'aria-hidden': 'true' }, icon),
      h('span', null, msg));
    while (stack.children.length >= 3) {
      stack.removeChild(stack.firstChild);
    }
    stack.appendChild(t);
    setTimeout(function () {
      t.classList.add('out');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 210);
    }, 2600);
  }

  /* Custom Confirm Modal */
  var confirmState = null;
  function askConfirm(opts, onConfirm) {
    var overlay = document.getElementById('confirmOverlay');
    var titleEl = document.getElementById('confirmTitle');
    var descEl = document.getElementById('confirmDesc');
    var iconEl = document.getElementById('confirmIcon');
    var okBtn = document.getElementById('confirmOk');
    var cancelBtn = document.getElementById('confirmCancel');
    if (!overlay || !okBtn || !cancelBtn) {
      if (window.confirm(opts.message || 'Xác nhận?')) onConfirm();
      return;
    }
    var prevFocus = document.activeElement;
    iconEl.textContent = opts.icon || (opts.danger ? '🗑️' : '⚠️');
    titleEl.textContent = opts.title || 'Xác nhận thao tác';
    descEl.textContent = opts.message || '';
    okBtn.textContent = opts.okText || 'Xác nhận';
    cancelBtn.textContent = opts.cancelText || 'Huỷ bỏ';
    okBtn.className = 'btn ' + (opts.danger ? 'danger' : 'primary');

    function close(accepted) {
      overlay.hidden = true;
      confirmState = null;
      if (prevFocus && typeof prevFocus.focus === 'function') {
        try { prevFocus.focus({ preventScroll: true }); } catch (e) { prevFocus.focus(); }
      }
      if (accepted && typeof onConfirm === 'function') onConfirm();
    }

    confirmState = { close: close, okBtn: okBtn, cancelBtn: cancelBtn };
    overlay.hidden = false;
    try { okBtn.focus({ preventScroll: true }); } catch (e) { okBtn.focus(); }
  }

  (function initConfirmModal() {
    var overlay = document.getElementById('confirmOverlay');
    var okBtn = document.getElementById('confirmOk');
    var cancelBtn = document.getElementById('confirmCancel');
    if (!overlay) return;
    okBtn.addEventListener('click', function () { if (confirmState) confirmState.close(true); });
    cancelBtn.addEventListener('click', function () { if (confirmState) confirmState.close(false); });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay && confirmState) confirmState.close(false);
    });
    document.addEventListener('keydown', function (e) {
      if (overlay.hidden || !confirmState) return;
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        confirmState.close(false);
      } else if (e.key === 'Tab') {
        var first = confirmState.cancelBtn, last = confirmState.okBtn;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  })();

  function isOverlayOpen() {
    var c = document.getElementById('confirmOverlay');
    var s = document.getElementById('supportOverlay');
    return (c && !c.hidden) || (s && !s.hidden);
  }

  function fmtTime(ms) {
    var s = Math.floor(ms / 1000), m = Math.floor(s / 60);
    return (m < 10 ? '0' : '') + m + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
  }

  function wrongIds() { return Object.keys(store.wrong).filter(function (id) { return byId[id]; }); }
  function updateWrongBadge() {
    var el = document.getElementById('wrongCount');
    if (el) el.textContent = wrongIds().length;
  }

  function applyTheme() {
    var root = document.documentElement;
    root.setAttribute('data-theme', store.settings.theme || 'auto');
    var eq = (store.player && store.player.equipped) || {};
    if (eq.bg && eq.bg !== 'default') root.setAttribute('data-bg', eq.bg);
    else root.removeAttribute('data-bg');
    if (eq.frame && eq.frame !== 'default') root.setAttribute('data-frame', eq.frame);
    else root.removeAttribute('data-frame');
    if (eq.palette && eq.palette !== 'default') root.setAttribute('data-palette', eq.palette);
    else root.removeAttribute('data-palette');
  }

  function noShuffle(q) {
    return q.o.some(function (t) {
      return /(tất cả|toàn bộ)\s*(các\s*)?(đáp án|phương án)|không có (đáp án|phương án)|cả hai|cả \d/i.test(t);
    });
  }
  function makeItem(q) {
    var order = [0, 1, 2, 3];
    if (store.settings.shuffleOpts && !noShuffle(q)) order = shuffle(order);
    return { q: q, order: order, picked: null, hiddenOpts: [] };
  }
  function correctPos(it) { return it.order.indexOf(it.q.a); }

  function kbdBar(pairs) {
    return h('div', { class: 'kbd-bar', 'aria-hidden': 'true' },
      pairs.map(function (p) {
        return h('span', { class: 'kbd-item' }, h('kbd', null, p[0]), ' ' + p[1]);
      }));
  }

  /* ---------- Lưu / làm tiếp phần đang ôn dở ---------- */
  function serItems(items) {
    return items.map(function (it) { return { id: it.q.id, o: it.order, p: it.picked }; });
  }
  function desItems(arr) {
    return arr.filter(function (x) { return byId[x.id]; })
      .map(function (x) { return { q: byId[x.id], order: x.o, picked: x.p, hiddenOpts: [] }; });
  }
  function answeredCount(items) {
    return items.filter(function (it) { return it.picked !== null; }).length;
  }
  function saveSession() {
    if (!S) return;
    if (S.view === 'practice' && answeredCount(S.items)) {
      store.sessions.practice[S.cfg.sid] = {
        cfg: {
          kind: S.cfg.kind, key: S.cfg.key, sid: S.cfg.sid, title: S.cfg.title,
          poolIds: S.cfg.pool.map(function (q) { return q.id; })
        },
        items: serItems(S.items), i: S.i, right: S.right, wrong: S.wrong, streak: S.streak,
        best: S.best, wrongIds: S.wrongIds, runs: S.runs, ts: Date.now()
      };
      save();
    } else if (S.view === 'mix' && !S.submitted && answeredCount(S.items)) {
      store.sessions.mix = {
        items: serItems(S.items), i: S.i, elapsed: Date.now() - S.start, limit: S.limit || 0, ts: Date.now()
      };
      save();
    }
  }
  function dropPractice(sid) { delete store.sessions.practice[sid]; save(); }
  function dropMix() { store.sessions.mix = null; save(); }

  function resumePractice(sid) {
    var s = store.sessions.practice[sid];
    if (!s) return;
    var items = desItems(s.items);
    if (!items.length) { dropPractice(sid); toast('Dữ liệu cũ không còn hợp lệ.', 'bad'); home(); return; }
    var cfg = {
      kind: s.cfg.kind, key: s.cfg.key, sid: s.cfg.sid, title: s.cfg.title, ordered: false,
      pool: s.cfg.poolIds.map(function (id) { return byId[id]; }).filter(Boolean)
    };
    S = {
      view: 'practice', cfg: cfg, items: items, i: Math.min(s.i, items.length - 1), right: s.right, wrong: s.wrong,
      streak: s.streak, best: s.best, wrongIds: s.wrongIds || [], runs: s.runs || 1
    };
    setNav(cfg.kind === 'wrong' || cfg.kind === 'marks' ? 'navWrong' : 'navHome');
    renderPractice();
  }
  function resumeMix() {
    var s = store.sessions.mix;
    if (!s) return;
    var items = desItems(s.items);
    if (items.length !== MIX_SIZE) { dropMix(); toast('Đề cũ không còn hợp lệ.', 'bad'); home(); return; }
    S = {
      view: 'mix', items: items, i: Math.min(s.i, items.length - 1),
      start: Date.now() - (s.elapsed || 0), submitted: false, limit: s.limit || 0
    };
    setNav('navHome');
    renderMix();
    runMixTimer();
  }
  function pendingList(chOnly) {
    var list = [];
    Object.keys(store.sessions.practice).forEach(function (sid) {
      var s = store.sessions.practice[sid];
      if (chOnly && s.cfg.key !== 'ch' + chOnly) return;
      list.push({
        type: 'practice', sid: sid, title: s.cfg.title, done: answeredCount(s.items), total: s.items.length,
        extra: 'đúng ' + s.right + ' · sai ' + s.wrong, ts: s.ts || 0
      });
    });
    if (!chOnly && store.sessions.mix) {
      var m = store.sessions.mix;
      list.push({
        type: 'mix', title: 'Ôn tổng hợp ' + MIX_SIZE + ' câu', done: answeredCount(m.items), total: m.items.length,
        extra: 'đã mất ' + fmtTime(m.elapsed || 0), ts: m.ts || 0
      });
    }
    return list.sort(function (a, b) { return b.ts - a.ts; });
  }
  function pendingCard(p, after) {
    var go = function () { if (p.type === 'mix') resumeMix(); else resumePractice(p.sid); };
    var drop = function () {
      askConfirm({
        icon: '🗑️',
        title: 'Bỏ phần đang ôn dở?',
        message: 'Tiến độ của "' + p.title + '" sẽ bị xoá và không thể hoàn tác.',
        okText: 'Bỏ phần này',
        danger: true
      }, function () {
        if (p.type === 'mix') dropMix(); else dropPractice(p.sid);
        toast('Đã xoá phần ôn dở.', 'info');
        after();
      });
    };
    return h('div', { class: 'card pending' },
      h('div', { class: 'row between' },
        h('div', null,
          h('b', null, p.title),
          h('div', { class: 'meta muted small' }, 'Đã làm ' + p.done + '/' + p.total + ' câu · ' + p.extra)),
        h('div', { class: 'row' },
          h('button', { class: 'btn primary', onclick: go }, '▶ Làm tiếp'),
          h('button', { class: 'btn ghost', onclick: drop, title: 'Bỏ phần này' }, 'Bỏ'))),
      h('div', { class: 'progress' }, h('span', { style: 'width:' + Math.round(p.done / p.total * 100) + '%' })));
  }

  function optionButton(it, k, state, onClick) {
    var cls = 'opt' + (state ? ' ' + state : '');
    return h('button', {
      class: cls, type: 'button',
      disabled: state.indexOf('locked') >= 0 ? true : null,
      onclick: onClick, 'data-k': k
    },
      h('span', { class: 'key' }, LETTERS[k]),
      h('span', { class: 'txt' }, it.q.o[it.order[k]]));
  }
  function qHeader(it, label) {
    return h('div', { class: 'qmeta' },
      h('span', { class: 'chip' }, 'Chương ' + it.q.ch + ' · Câu ' + it.q.n),
      h('span', { class: 'chip' }, 'Mức ' + it.q.lv),
      label ? h('span', { class: 'chip' }, label) : null,
      h('span', { class: 'spacer' }),
      markBtn(it.q));
  }

  /* ---------- Trạng thái hiện tại ---------- */
  var S = null;
  var timer = null;
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  /* ---------- Cài đặt & Sao lưu / Khôi phục JSON ---------- */
  function exportBackup() {
    var payload = {
      app: 'triet-ml-bas123',
      version: 3,
      exportedAt: new Date().toISOString(),
      data: store
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'triet-ml-backup-' + dateKey(0) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast('Đã xuất file sao lưu tiến độ (.json)!', 'ok');
  }

  function importBackupFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result || '{}'));
        var candidate = parsed && parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
        if (!candidate || typeof candidate !== 'object' || (!candidate.seen && !candidate.wrong && !candidate.stats)) {
          toast('File JSON không đúng định dạng sao lưu của web.', 'bad');
          return;
        }
        var imported = norm(candidate);
        var seenCount = Object.keys(imported.seen).length;
        askConfirm({
          icon: '📥',
          title: 'Khôi phục dữ liệu từ file sao lưu?',
          message: 'Bản sao lưu có ' + seenCount + ' câu đã làm đúng và ' + imported.player.coins + ' Xu Triết. Tiến độ hiện tại sẽ được thay thế.',
          okText: 'Khôi phục ngay'
        }, function () {
          store = imported;
          rebuildQuestionBank();
          save();
          applyTheme();
          toast('Đã khôi phục tiến độ thành công!', 'ok');
          openSettings();
        });
      } catch (e) {
        toast('Không đọc được file JSON. Hãy kiểm tra lại file.', 'bad');
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  function openSettings() {
    stopTimer(); S = null;
    setNav('navSettings');

    var themeSelect = h('select', {
      class: 'search', id: 'settingsTheme',
      onchange: function (e) {
        store.settings.theme = e.target.value;
        save();
        applyTheme();
      }
    },
      h('option', { value: 'light' }, 'Sáng'),
      h('option', { value: 'dark' }, 'Tối'),
      h('option', { value: 'auto' }, 'Theo thiết bị'));
    themeSelect.value = store.settings.theme || 'auto';

    var shuffleCheck = h('input', {
      type: 'checkbox', id: 'settingsShuffle',
      checked: store.settings.shuffleOpts ? true : null,
      onchange: function (e) {
        store.settings.shuffleOpts = e.target.checked;
        save();
        toast(e.target.checked ? 'Đã bật đảo thứ tự đáp án.' : 'Đã tắt đảo thứ tự đáp án.', 'info');
      }
    });

    var soundCheck = h('input', {
      type: 'checkbox', id: 'settingsSound',
      checked: store.settings.sound ? true : null,
      onchange: function (e) {
        store.settings.sound = e.target.checked;
        save();
        if (e.target.checked) sfx.ok();
        toast(e.target.checked ? 'Đã bật âm thanh phản hồi.' : 'Đã tắt âm thanh phản hồi.', 'info');
      }
    });

    var fileInput = h('input', {
      type: 'file', accept: '.json,application/json', hidden: true,
      onchange: function (e) {
        if (e.target.files && e.target.files[0]) importBackupFile(e.target.files[0]);
        e.target.value = '';
      }
    });

    var seenCount = Object.keys(store.seen).length;

    mount(h('div', { class: 'stack' },
      h('div', { class: 'hud settings-card' },
        h('h1', { style: 'margin:0' }, '⚙️ Cài đặt & Sao lưu'),
        h('button', { class: 'btn ghost', onclick: home }, '← Quay lại')),

      h('section', { class: 'card settings-card' },
        h('h2', null, 'Giao diện'),
        h('p', { class: 'muted' }, 'Chọn giao diện sáng, tối hoặc tự động theo thiết bị. Hình nền và khung thẻ có thể đổi thêm trong Cửa hàng Xu Triết.'),
        h('label', { class: 'settings-row', for: 'settingsTheme' },
          h('span', null, 'Chế độ hiển thị'), themeSelect),
        h('div', { class: 'theme-preview-row' },
          h('button', { class: 'btn', onclick: function () { store.settings.theme = 'light'; save(); applyTheme(); themeSelect.value = 'light'; } }, '☀️ Sáng'),
          h('button', { class: 'btn', onclick: function () { store.settings.theme = 'dark'; save(); applyTheme(); themeSelect.value = 'dark'; } }, '🌙 Tối'),
          h('button', { class: 'btn', onclick: function () { store.settings.theme = 'auto'; save(); applyTheme(); themeSelect.value = 'auto'; } }, '💻 Theo thiết bị'),
          h('button', { class: 'btn primary', onclick: function () { shopPage('bgs'); } }, '🏪 Đổi hình nền & khung thẻ'))),

      h('section', { class: 'card settings-card' },
        h('h2', null, 'Trải nghiệm làm bài'),
        h('label', { class: 'settings-row settings-check' },
          shuffleCheck,
          h('span', null,
            h('b', null, 'Đảo thứ tự đáp án'),
            h('small', { class: 'muted' }, 'Mỗi lần làm bài, thứ tự các lựa chọn A, B, C, D được xáo ngẫu nhiên.'))),
        h('label', { class: 'settings-row settings-check' },
          soundCheck,
          h('span', null,
            h('b', null, 'Âm thanh phản hồi'),
            h('small', { class: 'muted' }, 'Phát âm thanh nhẹ khi chọn đáp án đúng, sai hoặc hoàn thành vòng chơi.')))),

      h('section', { class: 'card settings-card' },
        h('h2', null, 'Sao lưu & Khôi phục dữ liệu'),
        h('p', { class: 'muted' }, 'Hiện tại bạn đã làm đúng ' + seenCount + '/' + Q.length + ' câu và sở hữu ' + store.player.coins + ' Xu Triết. Xuất file .json để chuyển tiến độ sang máy khác.'),
        fileInput,
        h('div', { class: 'actions' },
          h('button', { class: 'btn primary', onclick: exportBackup }, '⬇ Xuất file sao lưu (.json)'),
          h('button', { class: 'btn', onclick: function () { fileInput.click(); } }, '⬆ Nhập file khôi phục (.json)'),
          h('span', { class: 'spacer' }),
          h('button', {
            class: 'btn ghost bad-t',
            onclick: function () {
              askConfirm({
                icon: '⚠️',
                title: 'Xoá toàn bộ tiến độ học tập?',
                message: 'Toàn bộ lịch sử câu đúng, câu sai, đánh dấu sao, Xu Triết, Level và vật phẩm cửa hàng sẽ được đặt lại.',
                okText: 'Xoá toàn bộ',
                danger: true
              }, function () {
                var keepSettings = store.settings;
                store = defaults();
                store.settings = keepSettings;
                rebuildQuestionBank();
                save();
                applyTheme();
                toast('Đã đặt lại toàn bộ tiến độ.', 'info');
                openSettings();
              });
            }
          }, '🗑 Đặt lại tiến độ'))),

      h('div', { class: 'actions settings-card' },
        h('button', { class: 'btn primary', onclick: home }, 'Hoàn tất'))));
  }

  /* ---------- Trang chủ ---------- */
  function home() {
    stopTimer(); S = null;
    setNav('navHome');
    ensureDaily();
    var seenAll = Q.filter(function (q) { return store.seen[q.id]; }).length;
    var streak = effectiveStreak();

    var cards = [1, 2, 3].map(function (ch) {
      var list = chapterQs(ch);
      var seen = list.filter(function (q) { return store.seen[q.id]; }).length;
      var st = stat('ch' + ch);
      return h('section', { class: 'card chapter' },
        h('div', { class: 'eyebrow' }, 'Chương ' + ch),
        h('h3', null, CHAPTERS[ch].title),
        h('div', { class: 'meta' }, list.length + ' câu · đã làm đúng ' + seen),
        h('div', { class: 'progress', title: seen + '/' + list.length },
          h('span', { style: 'width:' + (list.length ? Math.round(seen / list.length * 100) : 0) + '%' })),
        st.bestStreak ? h('div', { class: 'meta' }, 'Chuỗi đúng dài nhất: ' + st.bestStreak) : null,
        h('div', { class: 'actions' },
          h('button', { class: 'btn primary', onclick: function () { chapterMenu(ch); } }, 'Ôn chương ' + ch),
          pendingList(ch).length ? h('button', { class: 'btn', onclick: function () { chapterMenu(ch); } }, '▶ Có phần ôn dở') : null));
    });

    var mixStat = stat('mix');
    var limSel = h('select', {
      class: 'search', 'aria-label': 'Giới hạn thời gian',
      onchange: function (e) { store.settings.mixLimit = parseInt(e.target.value, 10); save(); }
    },
      h('option', { value: '0' }, 'Không giới hạn giờ'),
      h('option', { value: '20' }, 'Thi thử 20 phút'),
      h('option', { value: '30' }, 'Thi thử 30 phút'),
      h('option', { value: '45' }, 'Thi thử 45 phút'));
    limSel.value = String(store.settings.mixLimit || 0);

    var mix = h('section', { class: 'card mix' },
      h('div', { class: 'eyebrow' }, 'Ôn tổng hợp'),
      h('h3', null, MIX_SIZE + ' câu ngẫu nhiên từ cả 3 chương'),
      h('div', { class: 'meta' }, 'Làm như đi thi: chọn đáp án, nộp bài rồi xem điểm và thưởng Xu Triết.' +
        (mixStat.runs ? ' · Đã làm ' + mixStat.runs + ' lần, điểm cao nhất ' + mixStat.best + '/' + MIX_SIZE : '')),
      h('div', { class: 'actions' },
        limSel,
        h('button', { class: 'btn primary big', onclick: function () { startMix(parseInt(limSel.value, 10)); } }, 'Bắt đầu đề ' + MIX_SIZE + ' câu')));

    var fun = h('section', { class: 'card wide' },
      h('div', { class: 'eyebrow' }, 'ĐẤU TRƯỜNG GAMESHOW · KIẾM XU TRIẾT'),
      h('h3', null, 'Thách thức tri thức - Chinh phục đỉnh cao & săn Xu Triết'),
      h('div', { class: 'meta' }, 'Hoàn thành các gameshow để nhận Xu Triết và EXP, dùng đổi hình nền, khung thẻ và vật phẩm trong Cửa hàng.'),
      h('div', { class: 'actions' },
        h('button', { class: 'btn primary', onclick: function () { startMillionaire(); } }, '🏆 Ai là triệu phú'),
        h('button', { class: 'btn primary', onclick: function () { startOlympia(); } }, '🏔️ Đỉnh Olympia'),
        h('button', { class: 'btn', onclick: function () { gameMenu(); } }, '📺 Tất cả 4 gameshow'),
        h('button', { class: 'btn gold', onclick: function () { shopPage('bgs'); } }, '🏪 Mở Cửa hàng')));

    /* Thẻ nhiệm vụ ngày tóm gọn ngay trên Trang chủ */
    var questCards = DAILY_QUEST_DEFS.map(function (qd) {
      var prog = Math.min(qd.target, store.daily.progress[qd.id] || 0);
      var isClaimed = !!store.daily.claimed[qd.id];
      var isReady = prog >= qd.target && !isClaimed;
      return h('div', { class: 'card quest-card' + (isReady ? ' ready' : '') + (isClaimed ? ' claimed' : '') },
        h('div', { class: 'row between' },
          h('b', null, qd.icon + ' ' + qd.title),
          h('span', { class: 'chip' }, prog + '/' + qd.target)),
        h('div', { class: 'muted small' }, qd.desc),
        h('div', { class: 'progress' }, h('span', { style: 'width:' + Math.round(prog / qd.target * 100) + '%' })),
        h('div', { class: 'row between' },
          h('span', { class: 'small' }, 'Thưởng: ', h('b', null, '+' + qd.coins + ' Xu'), ' · +' + qd.xp + ' EXP'),
          isClaimed
            ? h('span', { class: 'ok-t small' }, '✔ Đã nhận')
            : (isReady
              ? h('button', { class: 'btn gold small', onclick: function () { claimQuest(qd.id); home(); } }, '🎁 Nhận thưởng')
              : h('span', { class: 'muted small' }, 'Đang thực hiện'))));
    });

    var pend = pendingList();
    mount(h('div', { class: 'stack' },
      h('div', { class: 'hero' },
        h('div', { class: 'hero-top' },
          h('span', { class: 'eyebrow', style: 'margin:0' }, 'HỌC PHẦN BAS 123'),
          h('span', { class: 'streak-pill', title: 'Chuỗi ngày học liên tiếp' },
            streak ? ('🔥 Chuỗi ' + streak + ' ngày liên tiếp') : '✨ Bắt đầu chuỗi học hôm nay')),
        h('h1', null, 'Ôn tập Triết học Mác - Lênin'),
        h('p', null, 'Ngân hàng ' + Q.length + ' câu trắc nghiệm, chia theo chương. Luyện tập, hoàn thành nhiệm vụ ngày, cày EXP thăng cấp và săn Xu Triết mở khóa giao diện.'),
        h('div', { class: 'progress', title: 'Tiến độ chung' },
          h('span', { style: 'width:' + (Q.length ? Math.round(seenAll / Q.length * 100) : 0) + '%' })),
        h('div', { class: 'small muted' }, 'Đã làm đúng ' + seenAll + '/' + Q.length + ' câu (' + (Q.length ? Math.round(seenAll / Q.length * 100) : 0) + '%) · lưu cục bộ trên trình duyệt')),
      pend.length ? h('section', { class: 'stack' }, h('h2', null, 'Đang ôn dở'), pend.map(function (p) { return pendingCard(p, home); })) : null,
      h('section', { class: 'stack' },
        h('div', { class: 'row between' },
          h('h2', { style: 'margin:0' }, '📋 Nhiệm vụ ngày (' + formatDateVN(dateKey(0)) + ')'),
          h('button', { class: 'btn ghost small', onclick: function () { shopPage('bgs'); } }, 'Tiêu Xu tại Cửa hàng →')),
        h('div', { class: 'quest-grid' }, questCards)),
      h('div', { class: 'grid' }, cards, mix, fun)));
  }

  /* ---------- Menu chọn phạm vi ôn chương ---------- */
  function chapterMenu(ch) {
    stopTimer(); S = null;
    setNav('navHome');
    var info = CHAPTERS[ch];
    var list = chapterQs(ch);
    var choices = [{ label: 'Cả chương ' + ch, count: list.length, from: 1, to: 9999 }].concat(
      info.sections.map(function (s) {
        var cnt = list.filter(function (q) { return q.n >= s.from && q.n <= s.to; }).length;
        return { label: s.name, count: cnt, from: s.from, to: s.to };
      }));
    var chosen = 0;
    var orderRandom = true;
    var radios = choices.map(function (c, i) {
      return h('label', { class: 'choice' },
        h('input', { type: 'radio', name: 'scope', value: i, checked: i === 0 ? true : null, onchange: function () { chosen = i; } }),
        h('span', null, h('b', null, c.label), h('span', { class: 'muted' }, ' · ' + c.count + ' câu')));
    });
    var start = function () {
      var c = choices[chosen];
      var pool = list.filter(function (q) { return q.n >= c.from && q.n <= c.to; });
      var sid = 'ch' + ch + '-' + chosen;
      var runCfg = {
        kind: 'chapter', key: 'ch' + ch, sid: sid,
        title: 'Chương ' + ch + (chosen ? ' · mục ' + info.sections[chosen - 1].name.split(' ')[0].replace(/\.$/, '') : ''),
        pool: pool, ordered: !orderRandom
      };
      if (store.sessions.practice[sid]) {
        askConfirm({
          icon: '↻',
          title: 'Bắt đầu lại từ đầu?',
          message: 'Phạm vi này đang có tiến độ ôn dở. Bắt đầu mới sẽ xoá tiến độ cũ của phần này.',
          okText: 'Bắt đầu mới',
          danger: true
        }, function () { startPractice(runCfg); });
        return;
      }
      startPractice(runCfg);
    };
    mount(h('div', { class: 'stack' },
      h('button', { class: 'btn ghost', style: 'align-self:flex-start', onclick: home }, '← Trang chủ'),
      h('h1', null, 'Chương ' + ch + ': ' + info.title),
      pendingList(ch).length ? h('section', { class: 'stack' }, h('h3', null, 'Đang ôn dở'), pendingList(ch).map(function (p) { return pendingCard(p, function () { chapterMenu(ch); }); })) : null,
      h('div', { class: 'card' },
        h('h3', null, 'Chọn phạm vi'),
        h('div', { class: 'menu-list' }, radios),
        h('h3', null, 'Thứ tự câu hỏi'),
        h('div', { class: 'menu-list' },
          h('label', { class: 'choice' },
            h('input', { type: 'radio', name: 'order', checked: true, onchange: function () { orderRandom = true; } }),
            h('span', null, h('b', null, 'Ngẫu nhiên'), h('span', { class: 'muted' }, ' · xáo thứ tự mỗi lần làm'))),
          h('label', { class: 'choice' },
            h('input', { type: 'radio', name: 'order', onchange: function () { orderRandom = false; } }),
            h('span', null, h('b', null, 'Theo thứ tự đề'), h('span', { class: 'muted' }, ' · lần làm lại từ đầu vẫn sẽ xáo ngẫu nhiên')))),
        h('button', { class: 'btn primary big', onclick: start }, 'Bắt đầu ôn mới'))));
  }

  /* ---------- Ôn chương / ôn câu sai ---------- */
  function startPractice(cfg) {
    if (!cfg.pool.length) { toast('Không có câu nào để ôn.', 'info'); return; }
    var pool = cfg.ordered ? cfg.pool.slice() : shuffle(cfg.pool);
    S = { view: 'practice', cfg: cfg, items: pool.map(makeItem), i: 0, right: 0, wrong: 0, streak: 0, best: 0, wrongIds: [], runs: 1 };
    delete store.sessions.practice[cfg.sid];
    stat(cfg.key).runs++; save();
    renderPractice();
  }
  function restartPractice() {
    S.items = shuffle(S.cfg.pool).map(makeItem);
    S.i = 0; S.right = 0; S.wrong = 0; S.streak
