/* Ôn tập Triết học Mác - Lênin (BAS 123) — Pro Edition v2
 * Đầy đủ: Luyện tập, Đề 40 câu, Lý thuyết, Tra cứu, 4 Gameshow, Xu Triết, EXP/Level,
 * Nhiệm vụ ngày, Cửa hàng Background/Vật phẩm, Hướng dẫn & Quản lý Thêm/Xóa câu hỏi.
 */
(function () {
  'use strict';

  var RAW_QUESTIONS = Array.isArray(window.QUESTIONS) ? window.QUESTIONS.slice() : [];
  var BASE_EXPLAIN = Object.assign({}, window.EXPLAIN || {});
  var Q = [];
  var EXPLAIN = {};
  var byId = {};
  var normCache = null;

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

  /* ---------- Dữ liệu Cửa hàng & Nhiệm vụ ngày ---------- */
  var SHOP_CATALOG = {
    uiTheme: [
      { id: 'default', name: 'Tiêu chuẩn', price: 0, preview: 'thm-default', desc: 'Giao diện mặc định bo góc sạch sẽ, cân đối.' },
      { id: 'classic', name: 'Cổ điển', price: 800, preview: 'thm-classic', desc: 'Nền giấy ngà ấm áp cùng kiểu chữ sách triết học kinh điển.' },
      { id: 'kitty', name: 'Kitty', price: 1000, preview: 'thm-kitty', desc: 'Tông hồng dâu ngọt ngào, bo tròn mềm mại kèm nơ dễ thương.' },
      { id: 'liquid-glass', name: 'Liquid', price: 1200, preview: 'thm-liquid-glass', desc: 'Hiệu ứng kính mờ trong suốt phản quang 3D sang trọng.' },
      { id: 'cyberpunk', name: 'Cyberpunk', price: 1500, preview: 'thm-cyberpunk', desc: 'Nền đêm công nghệ sâu với viền phát sáng neon cyan & magenta.' },
      { id: 'pixel', name: 'Pixel', price: 2000, preview: 'thm-pixel', desc: 'Biến toàn bộ font chữ thành kiểu Minecraft cùng giao diện khối vuông 3D.' }
    ],
    bg: [
      { id: 'default', name: 'Mặc định Thanh lịch', price: 0, preview: 'bg-default', desc: 'Nền tiêu chuẩn tối giản, dịu mắt khi ôn bài lâu.' },
      { id: 'sunrise', name: 'Bình minh Cách mạng', price: 120, preview: 'bg-sunrise', desc: 'Ánh đỏ cam ấm áp đầy nhiệt huyết lý luận.' },
      { id: 'emerald', name: 'Thảo nguyên Biện chứng', price: 150, preview: 'bg-emerald', desc: 'Sắc xanh ngọc lục bảo thư giãn, tập trung cao.' },
      { id: 'sakura', name: 'Hoa anh đào Mùa xuân', price: 180, preview: 'bg-sakura', desc: 'Tông hồng phấn nhẹ nhàng, tươi mới.' },
      { id: 'cosmos', name: 'Vũ trụ Duy vật', price: 250, preview: 'bg-cosmos', desc: 'Dải ngân hà tím lam huyền ảo chiều sâu.' },
      { id: 'cyber', name: 'Lưới Tri thức Số', price: 320, preview: 'bg-cyber', desc: 'Lưới tọa độ chuyển động hiện đại phong cách công nghệ.' },
      { id: 'royal', name: 'Hào quang Vàng son', price: 400, preview: 'bg-royal', desc: 'Ánh kim sang trọng dành cho cao thủ Triết học.' }
    ],
    palette: [
      { id: 'default', name: 'Đỏ Cờ Truyền thống', price: 0, preview: 'pal-default', desc: 'Tông đỏ đặc trưng của bộ môn Triết học Mác - Lênin.' },
      { id: 'blue', name: 'Xanh Hàn lâm', price: 140, preview: 'pal-blue', desc: 'Tông xanh dương chuẩn mực, sắc nét.' },
      { id: 'violet', name: 'Tím Triết gia', price: 160, preview: 'pal-violet', desc: 'Tông tím tư duy sâu sắc, hiện đại.' },
      { id: 'emerald', name: 'Xanh Lục bảo', price: 160, preview: 'pal-emerald', desc: 'Tông xanh lá cân bằng, dễ chịu.' }
    ],
    frame: [
      { id: 'default', name: 'Khung Chuẩn', price: 0, preview: 'frm-default', desc: 'Viền thẻ câu hỏi gọn gàng tiêu chuẩn.' },
      { id: 'gold', name: 'Khung Viền Vàng Gold', price: 200, preview: 'frm-gold', desc: 'Viền vàng ánh kim nổi bật quanh thẻ câu hỏi.' },
      { id: 'neon', name: 'Khung Phát Sáng Neon', price: 240, preview: 'frm-neon', desc: 'Hào quang phát sáng theo màu chủ đạo.' },
      { id: 'crimson', name: 'Khung Đỏ Hoàng Kim', price: 300, preview: 'frm-crimson', desc: 'Viền đỏ kết hợp đỉnh vàng quyền uy.' }
    ],
    title: [
      { id: 'Tập sự Tư duy', name: 'Tập sự Tư duy', price: 0, desc: 'Danh hiệu khởi đầu trên hành trình khám phá Triết học.' },
      { id: 'Nhà Duy vật Biện chứng', name: 'Nhà Duy vật Biện chứng', price: 120, desc: 'Nắm vững mối quan hệ giữa vật chất và ý thức.' },
      { id: 'Chiến sĩ Lý luận', name: 'Chiến sĩ Lý luận', price: 200, desc: 'Bản lĩnh vững vàng qua hàng trăm câu hỏi hóc búa.' },
      { id: 'Bậc thầy Phép Biện chứng', name: 'Bậc thầy Phép Biện chứng', price: 350, desc: 'Thông thạo 2 nguyên lý, 6 cặp phạm trù và 3 quy luật.' },
      { id: 'Hiền triết Mác - Lênin', name: 'Hiền triết Mác - Lênin', price: 500, desc: 'Đỉnh cao tri thức học phần BAS 123.' }
    ],
    item: [
      { id: 'f50', icon: '✂', name: 'Thẻ 50:50 Ôn tập', price: 35, desc: 'Loại bỏ ngay 2 đáp án sai khi đang luyện chương hoặc thi thử 40 câu.' },
      { id: 'hint', icon: '💡', name: 'Thẻ Gợi ý Triết học', price: 40, desc: 'Mở giải thích chi tiết hoặc loại bớt 1 phương án gây nhiễu.' },
      { id: 'x2', icon: '⚡', name: 'Thẻ x2 Xu & EXP (15p)', price: 80, desc: 'Nhân đôi toàn bộ Xu Triết và EXP nhận được trong 15 phút.' },
      { id: 'shield', icon: '🛡️', name: 'Khiên Giữ Chuỗi', price: 60, desc: 'Tự động bảo vệ chuỗi trả lời đúng khi bạn lỡ chọn nhầm 1 câu.' }
    ]
  };

  var DAILY_QUESTS = [
    { id: 'q_correct10', title: 'Khởi động tư duy', desc: 'Trả lời đúng 10 câu hỏi bất kỳ hôm nay', field: 'correct', target: 10, xu: 40, exp: 30 },
    { id: 'q_streak5', title: 'Chuỗi bất bại', desc: 'Đạt chuỗi đúng liên tiếp 5 câu trong ngày', field: 'bestStreak', target: 5, xu: 50, exp: 40 },
    { id: 'q_game1', title: 'Ngôi sao Gameshow', desc: 'Hoàn thành 1 ván Gameshow bất kỳ', field: 'games', target: 1, xu: 60, exp: 50 },
    { id: 'q_correct25', title: 'Nhà lý luận sắc bén', desc: 'Trả lời đúng 25 câu hỏi hôm nay', field: 'correct', target: 25, xu: 100, exp: 80 }
  ];

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
      economy: { xu: 100, exp: 0, level: 1, totalXuEarned: 100 },
      inventory: {
        uiThemes: ['default'],
        bgs: ['default'],
        palettes: ['default'],
        frames: ['default'],
        titles: ['Tập sự Tư duy'],
        customBgUnlocked: false,
        items: { f50: 1, hint: 1, x2: 0, shield: 0 }
      },
      equipped: {
        uiTheme: 'default',
        bg: 'default',
        palette: 'default',
        frame: 'default',
        title: 'Tập sự Tư duy',
        customBgData: '',
        customBgDim: 38,
        customBgBlur: 0
      },
      buffs: { x2Until: 0, shieldActive: false },
      daily: { date: dateKey(0), correct: 0, bestStreak: 0, streakNow: 0, games: 0, claimed: {} },
      customQuestions: [],
      deletedIds: {},
      lastModified: 0
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
    if (raw.economy && typeof raw.economy === 'object') {
      d.economy = {
        xu: Math.max(0, Number(raw.economy.xu) || 0),
        exp: Math.max(0, Number(raw.economy.exp) || 0),
        level: Math.max(1, Number(raw.economy.level) || 1),
        totalXuEarned: Math.max(0, Number(raw.economy.totalXuEarned) || 0)
      };
    }
    if (raw.inventory && typeof raw.inventory === 'object') {
      d.inventory.uiThemes = Array.isArray(raw.inventory.uiThemes) && raw.inventory.uiThemes.length ? raw.inventory.uiThemes : ['default'];
      d.inventory.customBgUnlocked = !!raw.inventory.customBgUnlocked;
      d.inventory.bgs = Array.isArray(raw.inventory.bgs) && raw.inventory.bgs.length ? raw.inventory.bgs : ['default'];
      d.inventory.palettes = Array.isArray(raw.inventory.palettes) && raw.inventory.palettes.length ? raw.inventory.palettes : ['default'];
      d.inventory.frames = Array.isArray(raw.inventory.frames) && raw.inventory.frames.length ? raw.inventory.frames : ['default'];
      d.inventory.titles = Array.isArray(raw.inventory.titles) && raw.inventory.titles.length ? raw.inventory.titles : ['Tập sự Tư duy'];
      d.inventory.items = Object.assign({ f50: 0, hint: 0, x2: 0, shield: 0 }, raw.inventory.items || {});
    }
    if (raw.equipped && typeof raw.equipped === 'object') {
      d.equipped = Object.assign(d.equipped, raw.equipped);
    }
    if (raw.buffs && typeof raw.buffs === 'object') {
      d.buffs = {
        x2Until: Number(raw.buffs.x2Until) || 0,
        shieldActive: !!raw.buffs.shieldActive
      };
    }
    if (raw.daily && typeof raw.daily === 'object' && raw.daily.date === dateKey(0)) {
      d.daily = {
        date: raw.daily.date,
        correct: Number(raw.daily.correct) || 0,
        bestStreak: Number(raw.daily.bestStreak) || 0,
        streakNow: Number(raw.daily.streakNow) || 0,
        games: Number(raw.daily.games) || 0,
        claimed: raw.daily.claimed && typeof raw.daily.claimed === 'object' ? raw.daily.claimed : {}
      };
    }
    d.customQuestions = Array.isArray(raw.customQuestions) ? raw.customQuestions : [];
    d.deletedIds = raw.deletedIds && typeof raw.deletedIds === 'object' ? raw.deletedIds : {};
    d.lastModified = Number(raw.lastModified) || 0;
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

  function ensureDailyToday() {
    var today = dateKey(0);
    if (!store.daily || store.daily.date !== today) {
      store.daily = { date: today, correct: 0, bestStreak: 0, streakNow: 0, games: 0, claimed: {} };
    }
  }

  function rebuildQuestionBank() {
    var deleted = store.deletedIds || {};
    var customs = Array.isArray(store.customQuestions) ? store.customQuestions : [];
    Q = RAW_QUESTIONS.filter(function (q) { return !deleted[q.id]; }).concat(customs);
    byId = {};
    EXPLAIN = Object.assign({}, BASE_EXPLAIN);
    Q.forEach(function (q) {
      byId[q.id] = q;
      if (q.explain) EXPLAIN[q.id] = q.explain;
    });
    normCache = null;
  }

  rebuildQuestionBank();

  function explainBox(q) {
    return EXPLAIN[q.id] ? h('div', { class: 'explain' }, h('b', null, 'Giải thích: '), EXPLAIN[q.id]) : null;
  }

  function chapterQs(ch) { return Q.filter(function (q) { return q.ch === ch; }); }

  function save(skipCloudNotify) {
    if (!skipCloudNotify) {
      store.lastModified = Date.now();
    }
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {}
    updateWrongBadge();
    renderHud();
    if (!skipCloudNotify && typeof window.notifyAppProgressChanged === 'function') {
      window.notifyAppProgressChanged();
    }
  }

  window.applySyncedAppProgress = function (cloudRaw) {
    store = norm(cloudRaw || {});
    rebuildQuestionBank();
    save(true);
    applyCosmetics();
    if (!S) {
      home();
    }
  };

  window.resetLocalAppProgress = function () {
    store = defaults();
    rebuildQuestionBank();
    save(true);
    applyCosmetics();
    if (!S) {
      home();
    }
  };

  /* ---------- Hệ thống Xu Triết, EXP, Level & Nhiệm vụ ngày ---------- */
  function xpNeeded(lv) {
    return 100 + (Math.max(1, lv) - 1) * 50;
  }

  function isX2Active() {
    return store.buffs && store.buffs.x2Until && Date.now() < store.buffs.x2Until;
  }

  function launchConfetti(count) {
    var layer = document.getElementById('confettiLayer');
    if (!layer) return;
    var colors = ['#b3261e', '#d99a08', '#16804a', '#2563eb', '#9333ea', '#f59e0b'];
    var total = count || 34;
    for (var i = 0; i < total; i++) {
      var piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = Math.round(Math.random() * 100) + 'vw';
      piece.style.background = colors[i % colors.length];
      piece.style.setProperty('--dx', Math.round((Math.random() - 0.5) * 220) + 'px');
      piece.style.setProperty('--rot', Math.round(360 + Math.random() * 540) + 'deg');
      piece.style.setProperty('--dur', (1.4 + Math.random() * 1.1).toFixed(2) + 's');
      piece.style.animationDelay = (Math.random() * 0.25).toFixed(2) + 's';
      layer.appendChild(piece);
      (function (el) {
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 2800);
      })(piece);
    }
  }

  function awardProgress(baseXu, baseExp, reason, silent) {
    var mult = isX2Active() ? 2 : 1;
    var xuGain = Math.max(0, Math.round((baseXu || 0) * mult));
    var expGain = Math.max(0, Math.round((baseExp || 0) * mult));
    if (!xuGain && !expGain) return { xu: 0, exp: 0 };

    store.economy.xu += xuGain;
    store.economy.totalXuEarned += xuGain;
    store.economy.exp += expGain;

    var leveledUp = false;
    var bonusXu = 0;
    while (store.economy.exp >= xpNeeded(store.economy.level)) {
      store.economy.exp -= xpNeeded(store.economy.level);
      store.economy.level++;
      leveledUp = true;
      bonusXu += 30;
    }
    if (leveledUp) {
      store.economy.xu += bonusXu;
      store.economy.totalXuEarned += bonusXu;
      sfx.win();
      launchConfetti(42);
      toast('🎉 Chúc mừng lên Level ' + store.economy.level + '! Thưởng +' + bonusXu + ' Xu Triết!', 'ok');
    } else if (!silent && reason) {
      toast(reason + ': +' + xuGain + ' Xu Triết, +' + expGain + ' EXP' + (mult > 1 ? ' (x2)' : ''), 'ok');
    }
    return { xu: xuGain + bonusXu, exp: expGain };
  }

  function recordGameComplete(gameName, xuReward, expReward) {
    ensureDailyToday();
    store.daily.games = (store.daily.games || 0) + 1;
    var res = awardProgress(xuReward, expReward, null, true);
    save();
    toast('🏆 Hoàn thành ' + gameName + ': +' + res.xu + ' Xu Triết & +' + res.exp + ' EXP!', 'ok');
    return res;
  }

  function claimDailyQuest(quest) {
    ensureDailyToday();
    if (store.daily.claimed[quest.id]) return;
    var curVal = Number(store.daily[quest.field]) || 0;
    if (curVal < quest.target) return;
    store.daily.claimed[quest.id] = 1;
    sfx.win();
    launchConfetti(28);
    awardProgress(quest.xu, quest.exp, '🎁 Nhận thưởng nhiệm vụ "' + quest.title + '"', false);
    save();
    home();
  }

  function renderHud() {
    var hud = document.getElementById('playerHud');
    if (!hud) return;
    ensureDailyToday();
    var eco = store.economy;
    var need = xpNeeded(eco.level);
    var pct = Math.min(100, Math.round((eco.exp / need) * 100));
    var readyQuests = DAILY_QUESTS.filter(function (q) {
      return !store.daily.claimed[q.id] && (Number(store.daily[q.field]) || 0) >= q.target;
    }).length;
    var claimedCount = Object.keys(store.daily.claimed).length;

    var buffs = [];
    if (isX2Active()) {
      var minsLeft = Math.max(1, Math.ceil((store.buffs.x2Until - Date.now()) / 60000));
      buffs.push(h('span', { class: 'buff-pill', title: 'Đang nhân đôi Xu Triết và EXP' }, '⚡ x2 (' + minsLeft + 'p)'));
    }
    if (store.buffs.shieldActive) {
      buffs.push(h('span', { class: 'buff-pill', title: 'Bảo vệ chuỗi đúng khi chọn nhầm 1 câu' }, '🛡️ Khiên chuỗi'));
    }

    hud.replaceChildren(
      h('div', { class: 'player-left' },
        h('span', { class: 'lvl-badge' }, '⭐ Lv.' + eco.level),
        h('span', { class: 'title-badge' }, '🏅 ' + (store.equipped.title || 'Tập sự Tư duy')),
        h('div', { class: 'xp-box', title: 'Kinh nghiệm lên cấp tiếp theo' },
          h('div', { class: 'xp-track' }, h('span', { class: 'xp-fill', style: 'width:' + pct + '%' })),
          h('span', null, eco.exp + '/' + need + ' EXP')),
        buffs),
      h('div', { class: 'player-right' },
        h('button', {
          class: 'btn small' + (readyQuests ? ' gold' : ''), type: 'button',
          title: 'Xem nhiệm vụ ngày',
          onclick: function () {
            home();
            setTimeout(function () {
              var qEl = document.getElementById('dailyQuestsSection');
              if (qEl) qEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 60);
          }
        }, readyQuests ? ('🎁 Nhận thưởng (' + readyQuests + ')') : ('📋 Nhiệm vụ (' + claimedCount + '/' + DAILY_QUESTS.length + ')')),
        h('button', {
          class: 'xu-pill', type: 'button',
          title: 'Mở Cửa hàng Xu Triết để mua Background & vật phẩm',
          onclick: function () { shopPage('uiTheme'); }
        }, '🪙 ' + eco.xu.toLocaleString() + ' Xu Triết'))
    );
  }

  /* ---------- Hoạt động & Ghi nhận kết quả ---------- */
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
    ensureDailyToday();
    if (ok) {
      store.seen[q.id] = 1;
      delete store.wrong[q.id];
      store.daily.correct = (store.daily.correct || 0) + 1;
      store.daily.streakNow = (store.daily.streakNow || 0) + 1;
      if (store.daily.streakNow > (store.daily.bestStreak || 0)) {
        store.daily.bestStreak = store.daily.streakNow;
      }
      awardProgress(5, 10, null, true);
      if (!silent) sfx.ok();
    } else {
      store.wrong[q.id] = (store.wrong[q.id] || 0) + 1;
      store.daily.streakNow = 0;
      awardProgress(0, 2, null, true);
      if (!silent) sfx.bad();
    }
    bumpActivity();
    if (typeof window.recordQuizAnswer === 'function') {
      window.recordQuizAnswer(!!ok);
    }
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
      if (/chính xác|đã lưu|đã sao chép|thành công|hoàn tất|khôi phục|xuất|nhận thưởng|mua|trang bị|thăng cấp|đã thêm/i.test(msg)) type = 'ok';
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

  var previewTimer = null;
  var pendingCustomWallpaper = '';

  function applyCosmetics(override) {
    var root = document.documentElement;
    root.setAttribute('data-theme', store.settings.theme || 'auto');

    var uiTheme = (override && override.uiTheme !== undefined) ? override.uiTheme : (store.equipped.uiTheme || 'default');
    var bg = (override && override.bg !== undefined) ? override.bg : (store.equipped.bg || 'default');
    var pal = (override && override.palette !== undefined) ? override.palette : (store.equipped.palette || 'default');
    var frm = (override && override.frame !== undefined) ? override.frame : (store.equipped.frame || 'default');
    var customData = (override && override.customBgData !== undefined) ? override.customBgData : (store.equipped.customBgData || '');
    var dim = (override && override.customBgDim !== undefined) ? override.customBgDim : (Number(store.equipped.customBgDim) || 38);
    var blur = (override && override.customBgBlur !== undefined) ? override.customBgBlur : (Number(store.equipped.customBgBlur) || 0);

    if (uiTheme && uiTheme !== 'default') root.setAttribute('data-ui-theme', uiTheme);
    else root.removeAttribute('data-ui-theme');

    if (bg === 'custom' && customData) {
      root.setAttribute('data-bg', 'custom');
      root.style.setProperty('--custom-bg-url', 'url("' + customData.replace(/"/g, '\\"') + '")');
      root.style.setProperty('--custom-bg-dim', (Math.min(85, Math.max(0, dim)) / 100).toFixed(2));
      root.style.setProperty('--custom-bg-blur', Math.min(20, Math.max(0, blur)) + 'px');
    } else {
      root.style.removeProperty('--custom-bg-url');
      root.style.removeProperty('--custom-bg-dim');
      root.style.removeProperty('--custom-bg-blur');
      if (bg && bg !== 'default' && bg !== 'custom') root.setAttribute('data-bg', bg);
      else root.removeAttribute('data-bg');
    }

    if (pal && pal !== 'default') root.setAttribute('data-palette', pal); else root.removeAttribute('data-palette');
    if (frm && frm !== 'default') root.setAttribute('data-frame', frm); else root.removeAttribute('data-frame');
  }

  function compressCustomWallpaper(file, done) {
    var reader = new FileReader();
    reader.onload = function (ev) {
      var img = new Image();
      img.onload = function () {
        var maxSide = 1280;
        var w = img.width, h = img.height;
        if (w > maxSide || h > maxSide) {
          if (w >= h) { h = Math.round(h * maxSide / w); w = maxSide; }
          else { w = Math.round(w * maxSide / h); h = maxSide; }
        }
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        var quality = 0.78;
        var dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length > 360000 && quality > 0.42) {
          quality -= 0.12;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        done(null, dataUrl);
      };
      img.onerror = function () { done('Không đọc được tệp ảnh này.'); };
      img.src = ev.target.result;
    };
    reader.onerror = function () { done('Lỗi tải ảnh từ thiết bị.'); };
    reader.readAsDataURL(file);
  }

  function previewCosmetic(type, id, name) {
    clearTimeout(previewTimer);
    var ov = {};
    ov[type] = id;
    applyCosmetics(ov);
    toast('👁 Đang xem thử "' + name + '" trong 5 giây…', 'info');
    previewTimer = setTimeout(function () {
      applyCosmetics();
    }, 5000);
  }

  function noShuffle(q) {
    return q.o.some(function (t) {
      return /(tất cả|toàn bộ)\s*(các\s*)?(đáp án|phương án)|không có (đáp án|phương án)|cả hai|cả \d/i.test(t);
    });
  }
  function makeItem(q) {
    var order = [0, 1, 2, 3];
    if (store.settings.shuffleOpts && !noShuffle(q)) order = shuffle(order);
    return { q: q, order: order, picked: null, hiddenOpts: [], hintShown: false };
  }
  function correctPos(it) { return it.order.indexOf(it.q.a); }

  function kbdBar(pairs) {
    return h('div', { class: 'kbd-bar', 'aria-hidden': 'true' },
      pairs.map(function (p) {
        return h('span', { class: 'kbd-item' }, h('kbd', null, p[0]), ' ' + p[1]);
      }));
  }

  /* ---------- Thanh vật phẩm trợ giúp trong lúc làm bài ---------- */
  function powerupBar(it, rerenderFn) {
    if (!it || it.picked !== null) return null;
    var items = store.inventory.items || {};
    var f50Count = items.f50 || 0;
    var hintCount = items.hint || 0;

    var useF50 = function () {
      if (f50Count <= 0 || (it.hiddenOpts && it.hiddenOpts.length >= 2)) return;
      store.inventory.items.f50 = f50Count - 1;
      var cp = correctPos(it);
      var wrongs = shuffle([0, 1, 2, 3].filter(function (k) { return k !== cp; }));
      it.hiddenOpts = [wrongs[0], wrongs[1]];
      save();
      toast('✂ Đã dùng thẻ 50:50, loại bỏ 2 phương án sai!', 'ok');
      rerenderFn(false);
    };

    var useHint = function () {
      if (hintCount <= 0 || it.hintShown) return;
      store.inventory.items.hint = hintCount - 1;
      it.hintShown = true;
      var cp = correctPos(it);
      var wrongs = shuffle([0, 1, 2, 3].filter(function (k) { return k !== cp && (!it.hiddenOpts || it.hiddenOpts.indexOf(k) < 0); }));
      if (wrongs.length) {
        it.hiddenOpts = (it.hiddenOpts || []).concat([wrongs[0]]);
      }
      save();
      toast('💡 Đã dùng thẻ Gợi ý!', 'ok');
      rerenderFn(false);
    };

    return h('div', { class: 'powerup-bar' },
      h('span', { class: 'small muted' }, '🎒 Vật phẩm trợ giúp:'),
      h('div', { class: 'powerup-group' },
        h('button', {
          class: 'btn small', type: 'button',
          disabled: f50Count <= 0 || (it.hiddenOpts && it.hiddenOpts.length >= 2) ? true : null,
          onclick: useF50
        }, '✂ 50:50 (' + f50Count + ')'),
        h('button', {
          class: 'btn small', type: 'button',
          disabled: hintCount <= 0 || it.hintShown ? true : null,
          onclick: useHint
        }, '💡 Gợi ý (' + hintCount + ')'),
        h('button', {
          class: 'btn ghost small', type: 'button',
          onclick: function () { shopPage('item'); }
        }, '+ Mua thêm')));
  }

  /* ---------- Lưu / làm tiếp phần đang ôn dở ---------- */
  function serItems(items) {
    return items.map(function (it) { return { id: it.q.id, o: it.order, p: it.picked }; });
  }
  function desItems(arr) {
    return arr.filter(function (x) { return byId[x.id]; })
      .map(function (x) { return { q: byId[x.id], order: x.o, picked: x.p, hiddenOpts: [], hintShown: false }; });
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
    var isHidden = it.hiddenOpts && it.hiddenOpts.indexOf(k) >= 0 && it.picked === null;
    var cls = 'opt' + (state ? ' ' + state : '') + (isHidden ? ' dim' : '');
    var btn = h('button', {
      class: cls, type: 'button',
      disabled: (state.indexOf('locked') >= 0 || isHidden) ? true : null,
      onclick: onClick, 'data-k': k
    },
      h('span', { class: 'key' }, LETTERS[k]),
      h('span', { class: 'txt' }, it.q.o[it.order[k]]));
    if (isHidden) btn.style.visibility = 'hidden';
    return btn;
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
    toast('Đã xuất file sao lưu tiến độ & câu hỏi (.json)!', 'ok');
  }

  function importBackupFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result || '{}'));
        var candidate = parsed && parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
        if (!candidate || typeof candidate !== 'object' || (!candidate.seen && !candidate.wrong && !candidate.stats && !candidate.economy)) {
          toast('File JSON không đúng định dạng sao lưu của web.', 'bad');
          return;
        }
        var imported = norm(candidate);
        var seenCount = Object.keys(imported.seen).length;
        askConfirm({
          icon: '📥',
          title: 'Khôi phục dữ liệu từ file sao lưu?',
          message: 'Bản sao lưu có ' + seenCount + ' câu đã làm đúng và ' + imported.economy.xu + ' Xu Triết. Tiến độ hiện tại sẽ được thay thế.',
          okText: 'Khôi phục ngay'
        }, function () {
          store = imported;
          rebuildQuestionBank();
          save();
          applyCosmetics();
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
        applyCosmetics();
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
        h('p', { class: 'muted' }, 'Chọn giao diện sáng, tối hoặc tự động theo thiết bị. Hình nền và bảng màu mua tại Cửa hàng sẽ tự động đồng bộ.'),
        h('label', { class: 'settings-row', for: 'settingsTheme' },
          h('span', null, 'Chế độ hiển thị'), themeSelect),
        h('div', { class: 'theme-preview-row' },
          h('button', { class: 'btn', onclick: function () { store.settings.theme = 'light'; save(); applyCosmetics(); themeSelect.value = 'light'; } }, '☀️ Sáng'),
          h('button', { class: 'btn', onclick: function () { store.settings.theme = 'dark'; save(); applyCosmetics(); themeSelect.value = 'dark'; } }, '🌙 Tối'),
          h('button', { class: 'btn', onclick: function () { store.settings.theme = 'auto'; save(); applyCosmetics(); themeSelect.value = 'auto'; } }, '💻 Theo thiết bị'),
          h('button', { class: 'btn gold', onclick: function () { shopPage('bg'); } }, '🏪 Đổi Background & Theme'))),

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
        h('h2', null, 'Đồng bộ tài khoản & Sao lưu dữ liệu'),
        (function () {
          var acc = typeof window.getCloudAccountInfo === 'function' ? window.getCloudAccountInfo() : null;
          if (acc) {
            return h('p', { class: 'muted' }, '☁️ Đang tự động đồng bộ lên tài khoản: ', h('b', null, acc.name + (acc.email ? ' (' + acc.email + ')' : '')), '.');
          }
          return h('p', { class: 'muted' }, '💡 Bạn đang học ở chế độ Khách. Hãy bấm "Đăng nhập / Leo Rank" ở thanh trên cùng để tự động đồng bộ toàn bộ tiến độ sang điện thoại và máy tính khác.');
        })(),
        h('p', { class: 'muted' }, 'Hiện tại bạn đã làm đúng ' + seenCount + '/' + Q.length + ' câu · ' + store.economy.xu.toLocaleString() + ' Xu Triết · Level ' + store.economy.level + '.'),
        fileInput,
        h('div', { class: 'actions' },
          (typeof window.getCloudAccountInfo === 'function' && window.getCloudAccountInfo())
            ? h('button', {
                class: 'btn gold',
                onclick: async function () {
                  if (typeof window.forceCloudSync === 'function') {
                    var ok = await window.forceCloudSync();
                    toast(ok ? '☁️ Đã đồng bộ tiến độ lên tài khoản!' : '⚠️ Không thể đồng bộ lúc này, hãy kiểm tra mạng.', ok ? 'ok' : 'bad');
                  }
                }
              }, '☁️ Đồng bộ ngay')
            : h('button', {
                class: 'btn gold',
                onclick: function () {
                  if (typeof window.loginWithGoogle === 'function') window.loginWithGoogle();
                }
              }, '🔐 Đăng nhập để đồng bộ'),
          h('button', { class: 'btn primary', onclick: exportBackup }, '⬇ Xuất file sao lưu (.json)'),
          h('button', { class: 'btn', onclick: function () { fileInput.click(); } }, '⬆ Nhập file khôi phục (.json)'),
          h('span', { class: 'spacer' }),
          h('button', {
            class: 'btn ghost bad-t',
            onclick: function () {
              askConfirm({
                icon: '⚠️',
                title: 'Xoá toàn bộ tiến độ học tập?',
                message: 'Toàn bộ lịch sử câu đúng, câu sai, Xu Triết, Level, vật phẩm và kỷ lục gameshow sẽ bị đặt lại.',
                okText: 'Xoá toàn bộ',
                danger: true
              }, function () {
                var keepSettings = store.settings;
                store = defaults();
                store.settings = keepSettings;
                rebuildQuestionBank();
                save();
                applyCosmetics();
                toast('Đã đặt lại toàn bộ tiến độ.', 'info');
                openSettings();
              });
            }
          }, '🗑 Đặt lại tiến độ'))),

      h('div', { class: 'actions settings-card' },
        h('button', { class: 'btn primary', onclick: home }, 'Hoàn tất'))));
  }

  /* ---------- Trang chủ ---------- */
  function buildDailyQuestsCard() {
    ensureDailyToday();
    var cards = DAILY_QUESTS.map(function (q) {
      var cur = Math.min(q.target, Number(store.daily[q.field]) || 0);
      var pct = Math.round((cur / q.target) * 100);
      var done = cur >= q.target;
      var claimed = !!store.daily.claimed[q.id];
      var cls = 'quest-card' + (claimed ? ' claimed' : (done ? ' ready' : ''));
      return h('div', { class: cls },
        h('div', { class: 'quest-top' },
          h('div', null,
            h('div', { class: 'quest-title' }, q.title),
            h('div', { class: 'muted small' }, q.desc)),
          h('span', { class: 'quest-reward' }, '🪙 +' + q.xu + ' · +' + q.exp + ' EXP')),
        h('div', { class: 'progress', style: 'margin:4px 0' }, h('span', { style: 'width:' + pct + '%' })),
        h('div', { class: 'row between' },
          h('span', { class: 'small muted' }, 'Tiến độ: ' + cur + '/' + q.target),
          claimed
            ? h('span', { class: 'chip ok-t' }, '✔ Đã nhận thưởng')
            : (done
                ? h('button', { class: 'btn gold small', onclick: function () { claimDailyQuest(q); } }, '🎁 Nhận thưởng')
                : h('span', { class: 'chip' }, 'Đang thực hiện'))));
    });

    return h('section', { class: 'card wide stack', id: 'dailyQuestsSection' },
      h('div', { class: 'row between' },
        h('div', null,
          h('div', { class: 'eyebrow', style: 'margin-bottom:2px' }, 'NHIỆM VỤ HẰNG NGÀY · LÀM MỚI MỖI NGÀY'),
          h('h2', { style: 'margin:0' }, '📋 Hoàn thành nhiệm vụ để nhận Xu Triết & EXP')),
        h('button', { class: 'btn gold small', onclick: function () { shopPage('bg'); } }, '🏪 Tiêu Xu tại Cửa hàng →')),
      h('div', { class: 'quest-grid' }, cards));
  }

  function home() {
    stopTimer(); S = null;
    setNav('navHome');
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
      h('div', { class: 'meta' }, 'Làm như đi thi: chọn đáp án, nộp bài rồi xem điểm, nhận thưởng Xu Triết & EXP.' +
        (mixStat.runs ? ' · Đã làm ' + mixStat.runs + ' lần, điểm cao nhất ' + mixStat.best + '/' + MIX_SIZE : '')),
      h('div', { class: 'actions' },
        limSel,
        h('button', { class: 'btn primary big', onclick: function () { startMix(parseInt(limSel.value, 10)); } }, 'Bắt đầu đề ' + MIX_SIZE + ' câu')));

    var fun = h('section', { class: 'card wide' },
      h('div', { class: 'eyebrow' }, 'ĐẤU TRƯỜNG GAMESHOW TRUYỀN HÌNH · THƯỞNG XU TRIẾT'),
      h('h3', null, 'Thách thức tri thức - Chinh phục đỉnh cao'),
      h('div', { class: 'meta' }, 'Bốn gameshow: Ai là triệu phú, Đường lên đỉnh Olympia, Chiếc nón kỳ diệu và Jeopardy. Hoàn thành mỗi ván để nhận Xu Triết & EXP đổi giao diện!'),
      h('div', { class: 'actions' },
        h('button', { class: 'btn primary', onclick: function () { startMillionaire(); } }, '🏆 Ai là triệu phú'),
        h('button', { class: 'btn primary', onclick: function () { gameMenu(); } }, '📺 Chọn gameshow'),
        h('button', { class: 'btn primary', onclick: function () { startOlympia(); } }, '🏔️ Đỉnh Olympia'),
        h('button', { class: 'btn gold', onclick: function () { shopPage('bg'); } }, '🏪 Cửa hàng Background')));

    var pend = pendingList();
    mount(h('div', { class: 'stack' },
      h('div', { class: 'hero' },
        h('div', { class: 'hero-top' },
          h('span', { class: 'eyebrow', style: 'margin:0' }, 'HỌC PHẦN BAS 123'),
          h('span', { class: 'streak-pill', title: 'Chuỗi ngày học liên tiếp' },
            streak ? ('🔥 Chuỗi ' + streak + ' ngày liên tiếp') : '✨ Bắt đầu chuỗi học hôm nay')),
        h('h1', null, 'Ôn tập Triết học Mác - Lênin'),
        h('p', null, 'Ngân hàng ' + Q.length + ' câu trắc nghiệm, chia theo chương. Luyện tập theo chương, đề thi tổng hợp, nhiệm vụ ngày và Gameshow truyền hình nhận Xu Triết.'),
        h('div', { class: 'progress', title: 'Tiến độ chung' },
          h('span', { style: 'width:' + (Q.length ? Math.round(seenAll / Q.length * 100) : 0) + '%' })),
        h('div', { class: 'small muted' }, 'Đã làm đúng ' + seenAll + '/' + Q.length + ' câu (' + (Q.length ? Math.round(seenAll / Q.length * 100) : 0) + '%) · lưu cục bộ trên trình duyệt')),
      pend.length ? h('section', { class: 'stack' }, h('h2', null, 'Đang ôn dở'), pend.map(function (p) { return pendingCard(p, home); })) : null,
      buildDailyQuestsCard(),
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
    S.i = 0; S.right = 0; S.wrong = 0; S.streak = 0; S.wrongIds = []; S.runs++;
    delete store.sessions.practice[S.cfg.sid];
    stat(S.cfg.key).runs++; save();
    renderPractice();
  }
  function pickPractice(k) {
    var it = S.items[S.i];
    if (it.picked !== null) return;
    if (it.hiddenOpts && it.hiddenOpts.indexOf(k) >= 0) return;
    it.picked = k;
    var ok = it.order[k] === it.q.a;
    record(it.q, ok);
    if (ok) {
      S.right++; S.streak++;
      if (S.streak > S.best) S.best = S.streak;
      var st = stat(S.cfg.key);
      if (S.best > st.bestStreak) st.bestStreak = S.best;
    } else {
      S.wrong++;
      if (store.buffs && store.buffs.shieldActive && S.streak > 0) {
        store.buffs.shieldActive = false;
        toast('🛡️ Khiên Giữ Chuỗi đã kích hoạt! Bảo toàn chuỗi ' + S.streak + ' câu đúng.', 'info');
      } else {
        S.streak = 0;
      }
      if (S.wrongIds.indexOf(it.q.id) < 0) S.wrongIds.push(it.q.id);
    }
    save();
    renderPractice(false);
  }
  function nextPractice() {
    var it = S.items[S.i];
    if (it.picked === null) return;
    if (S.i + 1 < S.items.length) { S.i++; renderPractice(); }
    else finishPractice();
  }
  function renderPractice(scroll) {
    saveSession();
    var it = S.items[S.i];
    var total = S.items.length;
    var answered = it.picked !== null;
    var ok = answered && it.order[it.picked] === it.q.a;
    var cp = correctPos(it);

    var opts = [0, 1, 2, 3].map(function (k) {
      var state = '';
      if (answered) {
        if (k === cp) state = 'correct';
        else if (k === it.picked) state = 'wrong';
        else state = 'dim';
        state += ' locked';
      }
      var b = optionButton(it, k, state.trim(), function () { pickPractice(k); });
      if (answered) { b.setAttribute('disabled', ''); b.classList.remove('locked'); }
      return b;
    });

    var hintBanner = (!answered && it.hintShown)
      ? h('div', { class: 'explain', style: 'margin-bottom:14px' },
          h('b', null, '💡 Gợi ý: '),
          EXPLAIN[it.q.id] || ('Đã loại bớt 1 phương án gây nhiễu. Hãy chú ý khái niệm trọng tâm ở Chương ' + it.q.ch + ' (Mức ' + it.q.lv + ').'))
      : null;

    var feedback = null;
    if (answered) {
      var isLast = S.i + 1 >= total;
      if (ok) {
        feedback = h('div', { class: 'feedback ok' },
          h('b', null, '✔ Chính xác! (+5 Xu Triết, +10 EXP)'), explainBox(it.q),
          h('div', { class: 'row', style: 'margin-top:10px' },
            h('button', { class: 'btn primary', id: 'nextBtn', onclick: nextPractice }, isLast ? 'Xem kết quả' : 'Câu tiếp theo →')));
      } else {
        feedback = h('div', { class: 'feedback bad' },
          h('b', null, '✘ Chưa đúng. Đáp án đúng là ' + LETTERS[cp] + '.'), explainBox(it.q),
          h('div', { class: 'row', style: 'margin-top:10px' },
            S.cfg.kind === 'chapter'
              ? h('button', { class: 'btn primary', id: 'restartBtn', onclick: restartPractice }, '↻ Làm lại từ đầu (xáo ngẫu nhiên)')
              : null,
            h('button', { class: 'btn', id: 'nextBtn', onclick: nextPractice }, isLast ? 'Xem kết quả' : (S.cfg.kind === 'chapter' ? 'Bỏ qua, làm tiếp →' : 'Câu tiếp theo →'))));
      }
    }

    var hints = [['1-4 / A-D', 'Chọn đáp án'], ['Enter', 'Câu tiếp theo'], ['S', 'Đánh dấu']];
    if (answered && !ok && S.cfg.kind === 'chapter') hints.push(['R', 'Làm lại từ đầu']);

    mount(h('div', { class: 'stack' },
      h('div', { class: 'hud' },
        h('div', null, h('b', null, S.cfg.title), S.runs > 1 ? h('span', { class: 'muted' }, ' · lần ' + S.runs) : null),
        h('button', { class: 'btn ghost', onclick: function () { saveSession(); home(); toast('Đã lưu. Bạn có thể làm tiếp ở Trang chủ.', 'ok'); } }, 'Lưu & thoát')),
      h('div', { class: 'progress' }, h('span', { style: 'width:' + Math.round(S.i / total * 100) + '%' })),
      h('div', { class: 'hud' },
        h('div', { class: 'stats' },
          h('span', null, 'Câu ', h('b', null, S.i + 1 + '/' + total)),
          h('span', { class: 'ok-t' }, 'Đúng ', h('b', null, S.right)),
          h('span', { class: 'bad-t' }, 'Sai ', h('b', null, S.wrong)),
          h('span', null, 'Chuỗi đúng ', h('b', null, S.streak)))),
      powerupBar(it, renderPractice),
      h('div', { class: 'card qcard' },
        qHeader(it),
        h('div', { class: 'qtext' }, it.q.q),
        hintBanner,
        h('div', { class: 'opts' }, opts),
        feedback),
      kbdBar(hints)), scroll);
    var f = document.getElementById(answered && !ok && S.cfg.kind === 'chapter' ? 'restartBtn' : 'nextBtn');
    if (f && answered) f.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function finishPractice() {
    var st = stat(S.cfg.key);
    st.completed++;
    delete store.sessions.practice[S.cfg.sid];
    var bonus = awardProgress(25, 30, null, true);
    save();
    sfx.win();
    launchConfetti(30);
    var total = S.items.length;
    var perfect = S.wrong === 0;
    var wrongList = S.wrongIds.map(function (id) { return byId[id]; }).filter(Boolean);
    mount(h('div', { class: 'stack' },
      h('div', { class: 'card score' },
        h('div', { class: 'muted' }, S.cfg.title),
        h('div', { class: 'big' }, S.right + '/' + total),
        h('p', null, perfect ? 'Tuyệt vời! Bạn làm đúng toàn bộ.' : 'Bạn sai ' + S.wrong + ' câu trong lượt này.'),
        h('p', { class: 'ok-t' }, '🎁 Thưởng hoàn thành: +' + bonus.xu + ' Xu Triết & +' + bonus.exp + ' EXP'),
        h('div', { class: 'row', style: 'justify-content:center' },
          h('button', { class: 'btn primary', onclick: restartPractice }, '↻ Làm lại từ đầu (ngẫu nhiên)'),
          wrongList.length ? h('button', { class: 'btn', onclick: startWrongBank }, 'Ôn các câu sai') : null,
          h('button', { class: 'btn', onclick: home }, 'Trang chủ'))),
      wrongList.length ? h('h2', null, 'Các câu sai trong lượt này') : null,
      wrongList.map(function (q) { return reviewCard(q, null); })));
  }

  function startWrongBank() {
    var ids = wrongIds();
    if (!ids.length) { toast('Chưa có câu sai nào. Cứ làm tiếp nhé!', 'info'); return; }
    setNav('navWrong');
    startPractice({
      kind: 'wrong', key: 'wrong', sid: 'wrong',
      title: 'Ôn các câu đã sai (' + ids.length + ')',
      pool: ids.map(function (id) { return byId[id]; }), ordered: false
    });
  }

  /* ---------- Ôn tổng hợp (đề 40 câu) ---------- */
  function startMix(limitMin) {
    if (typeof limitMin !== 'number') limitMin = store.settings.mixLimit || 0;
    setNav('navHome');
    var size = Math.min(MIX_SIZE, Q.length);
    var pool = shuffle(Q).slice(0, size);
    S = { view: 'mix', items: pool.map(makeItem), i: 0, start: Date.now(), submitted: false, limit: limitMin * 60000 };
    dropMix();
    renderMix();
    runMixTimer();
  }
  function runMixTimer() {
    stopTimer();
    timer = setInterval(function () {
      var el = document.getElementById('timer');
      if (!S || S.view !== 'mix' || S.submitted) return;
      if (el) el.textContent = mixClock();
      if (S.limit && Date.now() - S.start >= S.limit) {
        toast('Hết giờ! Bài được nộp tự động.', 'bad');
        submitMix(true);
      }
    }, 1000);
  }
  function mixClock() {
    var used = Date.now() - S.start;
    return S.limit ? fmtTime(Math.max(0, S.limit - used)) : fmtTime(used);
  }
  function pickMix(k) {
    var it = S.items[S.i];
    if (it.hiddenOpts && it.hiddenOpts.indexOf(k) >= 0) return;
    it.picked = k;
    renderMix(false);
  }
  function mixNavDots() {
    return S.items.map(function (it, i) {
      var cls = 'nav-dot' + (it.picked !== null ? ' answered' : '') + (i === S.i ? ' current' : '');
      return h('button', { class: cls, type: 'button', title: 'Câu ' + (i + 1), onclick: function () { S.i = i; renderMix(); } }, i + 1);
    });
  }
  function renderMix(scroll) {
    saveSession();
    var it = S.items[S.i];
    var total = S.items.length;
    var done = S.items.filter(function (x) { return x.picked !== null; }).length;
    var opts = [0, 1, 2, 3].map(function (k) {
      return optionButton(it, k, it.picked === k ? 'selected' : '', function () { pickMix(k); });
    });
    var hintBanner = it.hintShown
      ? h('div', { class: 'explain', style: 'margin-bottom:14px' },
          h('b', null, '💡 Gợi ý: '),
          EXPLAIN[it.q.id] || ('Đã loại bớt 1 phương án gây nhiễu. Xem kỹ khái niệm thuộc Chương ' + it.q.ch + '.'))
      : null;

    mount(h('div', { class: 'stack' },
      h('div', { class: 'hud' },
        h('div', null, h('b', null, 'Ôn tổng hợp · ' + total + ' câu')),
        h('div', { class: 'stats' },
          h('span', { class: S.limit && S.limit - (Date.now() - S.start) < 300000 ? 'bad-t' : null }, S.limit ? '⏳ Còn ' : '⏱ ', h('b', { id: 'timer' }, mixClock())),
          h('span', null, 'Đã trả lời ', h('b', null, done + '/' + total)))),
      h('div', { class: 'navgrid' }, mixNavDots()),
      powerupBar(it, renderMix),
      h('div', { class: 'card qcard' },
        qHeader(it, 'Câu ' + (S.i + 1) + '/' + total + ' của đề'),
        h('div', { class: 'qtext' }, it.q.q),
        hintBanner,
        h('div', { class: 'opts' }, opts)),
      h('div', { class: 'row between', style: 'max-width:900px;margin-inline:auto;width:100%' },
        h('button', { class: 'btn', disabled: S.i === 0 ? true : null, onclick: function () { S.i--; renderMix(); } }, '← Câu trước'),
        S.i + 1 < total
          ? h('button', { class: 'btn', onclick: function () { S.i++; renderMix(); } }, 'Câu sau →')
          : h('button', { class: 'btn primary', onclick: function () { submitMix(false); } }, 'Nộp bài')),
      h('div', { class: 'row', style: 'justify-content:center' },
        h('button', { class: 'btn primary big', onclick: function () { submitMix(false); } }, 'Nộp bài'),
        h('button', { class: 'btn', onclick: function () { saveSession(); home(); toast('Đã lưu đề. Bạn có thể làm tiếp ở Trang chủ.', 'ok'); } }, 'Lưu & thoát'),
        h('button', {
          class: 'btn ghost',
          onclick: function () {
            askConfirm({
              icon: '🗑️',
              title: 'Bỏ đề thi hiện tại?',
              message: 'Tiến độ của đề ' + total + ' câu đang làm sẽ bị xoá.',
              okText: 'Bỏ đề',
              danger: true
            }, function () { dropMix(); home(); });
          }
        }, 'Bỏ đề')),
      kbdBar([['1-4 / A-D', 'Chọn đáp án'], ['← / →', 'Chuyển câu'], ['S', 'Đánh dấu']])), scroll);
  }
  function submitMix(auto) {
    var left = S.items.filter(function (x) { return x.picked === null; }).length;
    var finalize = function () {
      S.submitted = true; stopTimer(); store.sessions.mix = null;
      var right = 0;
      S.items.forEach(function (it) {
        var ok = it.picked !== null && it.order[it.picked] === it.q.a;
        if (ok) right++;
        record(it.q, ok, true);
      });
      S.right = right;
      S.elapsed = S.limit ? Math.min(Date.now() - S.start, S.limit) : Date.now() - S.start;
      var st = stat('mix'); st.runs++; st.completed++; if (right > st.best) st.best = right;
      var bonus = awardProgress(right * 2, 50, null, true);
      S.mixBonus = bonus;
      save();
      sfx.win();
      launchConfetti(34);
      renderMixResult('all');
    };
    if (auto !== true && left > 0) {
      askConfirm({
        icon: '📝',
        title: 'Nộp bài khi chưa làm xong?',
        message: 'Còn ' + left + ' câu chưa trả lời (sẽ tính là sai). Bạn vẫn muốn nộp bài chứ?',
        okText: 'Nộp bài ngay'
      }, finalize);
      return;
    }
    finalize();
  }
  function renderMixResult(filter) {
    var total = S.items.length;
    var list = S.items.filter(function (it) {
      var ok = it.picked !== null && it.order[it.picked] === it.q.a;
      return filter === 'all' || (filter === 'wrong' && !ok);
    });
    var score10 = (S.right / total * 10).toFixed(2).replace(/\.?0+$/, '');
    var dots = S.items.map(function (it, i) {
      var ok = it.picked !== null && it.order[it.picked] === it.q.a;
      return h('span', { class: 'nav-dot ' + (ok ? 'r-ok' : 'r-bad'), style: 'display:grid;place-items:center;cursor:default', title: 'Câu ' + (i + 1) }, i + 1);
    });
    mount(h('div', { class: 'stack' },
      h('div', { class: 'card score' },
        h('div', { class: 'muted' }, 'Kết quả ôn tổng hợp · thời gian ' + fmtTime(S.elapsed)),
        h('div', { class: 'big' }, S.right + '/' + total),
        h('p', null, 'Quy đổi thang 10: ', h('b', null, score10), ' điểm'),
        S.mixBonus ? h('p', { class: 'ok-t' }, '🎁 Thưởng nộp bài: +' + S.mixBonus.xu + ' Xu Triết & +' + S.mixBonus.exp + ' EXP') : null,
        h('div', { class: 'navgrid', style: 'justify-content:center' }, dots),
        h('div', { class: 'row', style: 'justify-content:center;margin-top:16px' },
          h('button', { class: 'btn primary', onclick: function () { startMix(); } }, 'Làm đề mới'),
          h('button', { class: 'btn', onclick: startWrongBank }, 'Ôn các câu sai'),
          h('button', { class: 'btn', onclick: home }, 'Trang chủ'))),
      h('div', { class: 'row' },
        h('h2', { style: 'margin:0' }, 'Xem lại bài làm'),
        h('span', { class: 'spacer' }),
        h('button', { class: 'btn' + (filter === 'all' ? ' primary' : ''), onclick: function () { renderMixResult('all'); } }, 'Tất cả'),
        h('button', { class: 'btn' + (filter === 'wrong' ? ' primary' : ''), onclick: function () { renderMixResult('wrong'); } }, 'Chỉ câu sai')),
      list.length ? list.map(function (it) { return reviewCard(it.q, it); }) : h('p', { class: 'muted' }, 'Không có câu nào để hiển thị.')));
  }

  function reviewCard(q, it, extra, highlightKw) {
    var opts = [0, 1, 2, 3].map(function (k) {
      var cls = 'opt';
      var origIdx = it ? it.order[k] : k;
      if (origIdx === q.a) cls += ' correct';
      else if (it && it.picked === k) cls += ' wrong';
      return h('div', { class: cls },
        h('span', { class: 'key' }, LETTERS[k]),
        h('span', { class: 'txt' }, highlightKw ? highlightNode(q.o[origIdx], highlightKw) : q.o[origIdx]));
    });
    var status = null;
    if (it) {
      var ok = it.picked !== null && it.order[it.picked] === q.a;
      status = h('span', { class: ok ? 'ok-t' : 'bad-t' }, it.picked === null ? '✘ Chưa trả lời' : (ok ? '✔ Đúng' : '✘ Sai'));
    }
    return h('div', { class: 'card review-item' },
      h('div', { class: 'qmeta' },
        h('span', { class: 'chip' }, 'Chương ' + q.ch + ' · Câu ' + q.n), status,
        h('span', { class: 'spacer' }), extra, markBtn(q)),
      h('div', { class: 'qtext' }, highlightKw ? highlightNode(q.q, highlightKw) : q.q),
      h('div', { class: 'opts' }, opts),
      explainBox(q));
  }

  /* ---------- Chuẩn hoá & Tô sáng từ khoá (<mark>) ---------- */
  function normalize(s) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  }

  function highlightNode(text, rawQuery) {
    var kw = normalize((rawQuery || '').trim());
    if (!kw || !text) return text;
    var normStr = '';
    var idxMap = [];
    for (var i = 0; i < text.length; i++) {
      var chNorm = normalize(text[i]);
      for (var c = 0; c < chNorm.length; c++) {
        normStr += chNorm[c];
        idxMap.push(i);
      }
    }
    var pos = normStr.indexOf(kw);
    if (pos < 0) return text;
    var frag = document.createDocumentFragment();
    var lastOrig = 0;
    while (pos >= 0) {
      var startOrig = idxMap[pos];
      var endOrig = idxMap[pos + kw.length - 1] + 1;
      if (startOrig > lastOrig) frag.appendChild(document.createTextNode(text.slice(lastOrig, startOrig)));
      frag.appendChild(h('mark', null, text.slice(startOrig, endOrig)));
      lastOrig = endOrig;
      pos = normStr.indexOf(kw, pos + kw.length);
    }
    if (lastOrig < text.length) frag.appendChild(document.createTextNode(text.slice(lastOrig)));
    return frag;
  }

  /* ---------- ÔN LÝ THUYẾT ---------- */
  function theoryPage() {
    stopTimer(); S = null;
    setNav('navTheory');
    var all = window.THEORY || [];
    var chapter = 0;
    var query = h('input', {
      class: 'search', type: 'search',
      placeholder: 'Tìm khái niệm, mẹo nhớ hoặc ví dụ...', 'aria-label': 'Tìm lý thuyết'
    });
    var tabs = h('div', { class: 'actions theory-tabs' });
    var results = h('div', { class: 'stack theory-list' });
    function render() {
      results.replaceChildren();
      var rawKw = query.value.trim();
      var key = normalize(rawKw);
      var found = all.filter(function (item) {
        return (!chapter || item.ch === chapter) &&
          (!key || normalize(item.title + ' ' + item.summary + ' ' + item.tip + ' ' + item.example + ' ' + item.trap + ' ' + item.keywords).indexOf(key) >= 0);
      });
      results.appendChild(h('p', { class: 'muted small' },
        'Có ' + found.length + ' chủ đề phù hợp. Nội dung cô đọng theo các khái niệm thường xuất hiện trong ngân hàng câu hỏi.'));
      found.forEach(function (item) {
        results.appendChild(h('article', { class: 'card theory-card' },
          h('div', { class: 'eyebrow' }, 'CHƯƠNG ' + item.ch),
          h('h3', null, highlightNode(item.title, rawKw)),
          h('p', null, highlightNode(item.summary, rawKw)),
          h('div', { class: 'theory-block tip' }, h('strong', null, '🧠 Mẹo dễ nhớ'), h('p', null, highlightNode(item.tip, rawKw))),
          h('div', { class: 'theory-block example' }, h('strong', null, '💡 Ví dụ trực quan'), h('p', null, highlightNode(item.example, rawKw))),
          h('div', { class: 'theory-block trap' }, h('strong', null, '⚠️ Dễ nhầm'), h('p', null, highlightNode(item.trap, rawKw))),
          h('div', { class: 'meta small' }, 'Từ khóa: ', highlightNode(item.keywords, rawKw))));
      });
      if (!found.length) {
        results.appendChild(h('div', { class: 'empty-state' },
          h('div', { class: 'empty-icon' }, '🔍'),
          h('h3', null, 'Không tìm thấy chủ đề phù hợp'),
          h('p', null, 'Thử nhập từ khoá ngắn gọn hơn hoặc chọn "Tất cả" để xem toàn bộ chủ đề lý thuyết.'),
          h('button', { class: 'btn primary', onclick: function () { query.value = ''; render(); } }, 'Xoá bộ lọc tìm kiếm')));
      }
    }
    [0, 1, 2, 3].forEach(function (ch) {
      var b = h('button', {
        class: 'btn ' + (chapter === ch ? 'primary' : 'ghost'), type: 'button',
        onclick: function () {
          chapter = ch;
          Array.prototype.forEach.call(tabs.children, function (el) {
            el.classList.toggle('primary', el.dataset.chapter === String(ch));
            el.classList.toggle('ghost', el.dataset.chapter !== String(ch));
          });
          render();
        }
      }, ch ? 'Chương ' + ch : 'Tất cả');
      b.dataset.chapter = String(ch);
      tabs.appendChild(b);
    });
    query.addEventListener('input', render);
    mount(h('div', { class: 'stack' },
      h('div', { class: 'card theory-intro' },
        h('div', { class: 'eyebrow' }, 'HỌC HIỂU · NHỚ LÂU · VẬN DỤNG'),
        h('h1', null, 'Ôn lý thuyết Triết học Mác – Lênin'),
        h('p', null, 'Mỗi chủ đề gồm ý cốt lõi, mẹo nhớ nhanh, ví dụ đời sống/kỹ thuật và điểm dễ nhầm khi làm trắc nghiệm.')),
      h('div', { class: 'row theory-search' }, query),
      tabs, results));
    render();
  }

  /* ---------- Tra cứu ---------- */
  function browse() {
    stopTimer(); S = null;
    setNav('navBrowse');
    if (!normCache) {
      normCache = Q.map(function (q) { return normalize(q.q + ' ' + q.o.join(' ')); });
    }
    var chSel = h('select', { class: 'search', 'aria-label': 'Lọc theo chương' },
      h('option', { value: '0' }, 'Tất cả chương'),
      h('option', { value: '1' }, 'Chương 1'), h('option', { value: '2' }, 'Chương 2'), h('option', { value: '3' }, 'Chương 3'));
    var input = h('input', {
      class: 'search', style: 'flex:1;min-width:220px', type: 'search',
      placeholder: 'Gõ từ khoá không cần dấu (ví dụ: vat chat, giai cap, thuc tien...)', 'aria-label': 'Tìm câu hỏi'
    });
    var out = h('div', { class: 'stack' });
    var run = function () {
      var rawKw = input.value.trim();
      var kw = normalize(rawKw);
      var ch = parseInt(chSel.value, 10);
      var res = [];
      for (var i = 0; i < Q.length && res.length < 40; i++) {
        if (ch && Q[i].ch !== ch) continue;
        if (kw && normCache[i].indexOf(kw) < 0) continue;
        res.push(Q[i]);
      }
      var nodes = [];
      if (!kw && !ch) {
        nodes.push(h('div', { class: 'empty-state' },
          h('div', { class: 'empty-icon' }, '📚'),
          h('h3', null, 'Tra cứu nhanh ' + Q.length + ' câu trắc nghiệm'),
          h('p', null, 'Nhập từ khoá bất kỳ (hỗ trợ gõ không dấu) hoặc chọn chương ở thanh phía trên để xem câu hỏi cùng đáp án chuẩn.')));
      } else if (!res.length) {
        nodes.push(h('div', { class: 'empty-state' },
          h('div', { class: 'empty-icon' }, '🔎'),
          h('h3', null, 'Không tìm thấy câu hỏi nào'),
          h('p', null, 'Không có câu hỏi khớp với từ khoá "' + rawKw + '". Thử từ khoá khác hoặc mở rộng sang Tất cả chương.')));
      } else {
        nodes.push(h('p', { class: 'muted small' }, 'Hiển thị tối đa 40 kết quả đầu tiên: ' + res.length + ' câu.'));
        res.forEach(function (q) { nodes.push(reviewCard(q, null, null, rawKw)); });
      }
      out.replaceChildren.apply(out, nodes);
    };
    var tid = null;
    input.addEventListener('input', function () { clearTimeout(tid); tid = setTimeout(run, 150); });
    chSel.addEventListener('change', run);
    mount(h('div', { class: 'stack' },
      h('h1', null, 'Tra cứu câu hỏi'),
      h('div', { class: 'row' }, input, chSel),
      out));
    run();
    input.focus();
  }

  /* ---------- Câu sai & Đánh dấu ---------- */
  function markIds() { return Object.keys(store.marks).filter(function (id) { return byId[id]; }); }
  function markBtn(q) {
    var b = h('button', {
      class: 'btn ghost star' + (store.marks[q.id] ? ' on' : ''), type: 'button',
      title: 'Đánh dấu câu này để xem lại sau (Phím S)', 'aria-label': 'Đánh dấu câu hỏi',
      onclick: function (e) {
        e.stopPropagation();
        if (store.marks[q.id]) {
          delete store.marks[q.id];
          toast('Đã bỏ đánh dấu câu hỏi.', 'info');
        } else {
          store.marks[q.id] = 1;
          toast('Đã đánh dấu sao câu hỏi.', 'ok');
        }
        save();
        b.classList.toggle('on', !!store.marks[q.id]);
        b.textContent = store.marks[q.id] ? '★' : '☆';
        b.blur();
      }
    }, store.marks[q.id] ? '★' : '☆');
    return b;
  }
  function startMarks() {
    var ids = markIds();
    if (!ids.length) { toast('Chưa đánh dấu câu nào. Bấm ☆ ở góc câu hỏi để đánh dấu.', 'info'); return; }
    setNav('navWrong');
    startPractice({
      kind: 'marks', key: 'marks', sid: 'marks', title: 'Ôn câu đã đánh dấu (' + ids.length + ')',
      pool: ids.map(function (id) { return byId[id]; }), ordered: false
    });
  }
  function byOrder(a, b) { return a.ch - b.ch || a.n - b.n; }

  function reviewPage(tab, keepScroll) {
    stopTimer(); S = null;
    setNav('navWrong');
    tab = tab || 'wrong';
    var isWrong = tab === 'wrong';
    var list = (isWrong ? wrongIds() : markIds()).map(function (id) { return byId[id]; }).sort(byOrder);
    var tabBtn = function (t, label, n) {
      return h('button', { class: 'btn' + (t === tab ? ' primary' : ''), onclick: function () { reviewPage(t); } }, label + ' (' + n + ')');
    };
    var cards = list.map(function (q) {
      var extra = isWrong
        ? [h('span', { class: 'chip bad-t' }, 'sai ' + store.wrong[q.id] + ' lần'),
           h('button', {
             class: 'btn', title: 'Xoá khỏi danh sách câu sai',
             onclick: function () { delete store.wrong[q.id]; save(); reviewPage('wrong', true); }
           }, 'Xoá')]
        : null;
      return reviewCard(q, null, extra);
    });
    mount(h('div', { class: 'stack' },
      h('h1', null, 'Câu sai & câu đã đánh dấu'),
      h('div', { class: 'row' }, tabBtn('wrong', 'Câu sai', wrongIds().length), tabBtn('marks', '★ Đã đánh dấu', markIds().length)),
      list.length
        ? h('div', { class: 'row' },
            h('button', { class: 'btn primary', onclick: isWrong ? startWrongBank : startMarks }, '▶ Ôn ' + list.length + ' câu này'),
            isWrong ? h('button', {
              class: 'btn',
              onclick: function () {
                askConfirm({
                  icon: '🗑️',
                  title: 'Xoá toàn bộ danh sách câu sai?',
                  message: 'Tất cả ' + list.length + ' câu trong mục Câu sai sẽ bị xoá khỏi danh sách ôn lại.',
                  okText: 'Xoá tất cả',
                  danger: true
                }, function () {
                  store.wrong = {};
                  save();
                  toast('Đã xoá toàn bộ danh sách câu sai.', 'info');
                  reviewPage('wrong', true);
                });
              }
            }, 'Xoá tất cả') : null)
        : null,
      isWrong && list.length ? h('p', { class: 'muted small' }, 'Mẹo: Làm đúng một câu từng sai ở bất kỳ chế độ nào sẽ tự động xoá câu đó khỏi danh sách.') : null,
      list.length ? cards : h('div', { class: 'empty-state' },
        h('div', { class: 'empty-icon' }, isWrong ? '🎉' : '⭐'),
        h('h3', null, isWrong ? 'Chưa có câu sai nào!' : 'Chưa có câu nào được đánh dấu'),
        h('p', null, isWrong ? 'Bạn đang giữ phong độ rất tốt. Hãy tiếp tục luyện tập theo chương hoặc thử sức với đề 40 câu.' : 'Trong lúc làm bài hoặc tra cứu, bấm nút ☆ ở góc thẻ câu hỏi để lưu lại những câu quan trọng.'),
        h('button', { class: 'btn primary', onclick: home }, 'Về trang chủ ôn bài'))),
      keepScroll ? false : true);
  }

  /* ==========================================================================
   * 🏪 CỬA HÀNG XU TRIẾT (MUA BACKGROUND, BẢNG MÀU, KHUNG THẺ, DANH HIỆU & VẬT PHẨM)
   * ========================================================================== */
  function shopPage(activeTab) {
    stopTimer(); S = null;
    setNav('navShop');
    activeTab = activeTab || 'uiTheme';

    var tabsMeta = [
      { id: 'uiTheme', label: '✨ Giao diện (Theme)' },
      { id: 'bg', label: '🎨 Hình nền (Background)' },
      { id: 'palette', label: '🖌️ Bảng màu' },
      { id: 'frame', label: '🖼️ Khung thẻ bài' },
      { id: 'title', label: '🏅 Danh hiệu' },
      { id: 'item', label: '🎒 Vật phẩm trợ giúp' }
    ];

    var tabBtns = tabsMeta.map(function (t) {
      return h('button', {
        class: 'btn ' + (t.id === activeTab ? 'primary' : 'ghost'),
        onclick: function () { shopPage(t.id); }
      }, t.label);
    });

    var list = SHOP_CATALOG[activeTab] || [];
    var cards = list.map(function (entry) {
      if (activeTab === 'item') {
        var count = (store.inventory.items && store.inventory.items[entry.id]) || 0;
        var canBuy = store.economy.xu >= entry.price;
        var buyItem = function () {
          if (store.economy.xu < entry.price) {
            toast('Không đủ Xu Triết! Hãy làm bài hoặc chơi Gameshow để kiếm thêm.', 'bad');
            return;
          }
          store.economy.xu -= entry.price;
          store.inventory.items[entry.id] = count + 1;
          sfx.ok();
          save();
          toast('Đã mua "' + entry.name + '" (-' + entry.price + ' Xu Triết)!', 'ok');
          shopPage('item');
        };
        var useNow = function () {
          if (count <= 0) return;
          if (entry.id === 'x2') {
            store.inventory.items.x2 = count - 1;
            var baseTime = isX2Active() ? store.buffs.x2Until : Date.now();
            store.buffs.x2Until = baseTime + 15 * 60 * 1000;
            sfx.win();
            save();
            toast('⚡ Đã kích hoạt Thẻ x2 Xu Triết & EXP trong 15 phút!', 'ok');
            shopPage('item');
          } else if (entry.id === 'shield') {
            if (store.buffs.shieldActive) {
              toast('Bạn đang có sẵn Khiên Giữ Chuỗi đang kích hoạt rồi!', 'info');
              return;
            }
            store.inventory.items.shield = count - 1;
            store.buffs.shieldActive = true;
            sfx.ok();
            save();
            toast('🛡️ Đã kích hoạt Khiên Giữ Chuỗi cho lần ôn bài tiếp theo!', 'ok');
            shopPage('item');
          }
        };

        return h('div', { class: 'card shop-item' },
          h('div', { class: 'shop-preview item-card' }, entry.icon),
          h('div', { class: 'row between' },
            h('h3', { style: 'margin:0' }, entry.name),
            h('span', { class: 'chip' }, 'Đang có: ' + count)),
          h('p', { class: 'muted small', style: 'margin:0' }, entry.desc),
          h('div', { class: 'shop-actions' },
            h('button', {
              class: 'btn ' + (canBuy ? 'gold' : ''),
              onclick: buyItem
            }, '🪙 Mua (' + entry.price + ' Xu)'),
            (entry.id === 'x2' || entry.id === 'shield') && count > 0
              ? h('button', { class: 'btn primary', onclick: useNow }, '⚡ Dùng ngay')
              : null));
      }

      var invMap = { uiTheme: 'uiThemes', bg: 'bgs', palette: 'palettes', frame: 'frames', title: 'titles' };
      var eqMap = { uiTheme: 'uiTheme', bg: 'bg', palette: 'palette', frame: 'frame', title: 'title' };
      var ownedList = store.inventory[invMap[activeTab]] || [];
      var owned = ownedList.indexOf(entry.id) >= 0;
      var equipped = store.equipped[eqMap[activeTab]] === entry.id;

      var previewEl = activeTab === 'title'
        ? h('div', { class: 'shop-preview title-card' }, '🏅 ' + entry.name)
        : h('div', { class: 'shop-preview ' + entry.preview }, entry.name);

      var equipFn = function () {
        store.equipped[eqMap[activeTab]] = entry.id;
        applyCosmetics();
        save();
        toast('✔ Đã trang bị "' + entry.name + '"!', 'ok');
        shopPage(activeTab);
      };

      var buyFn = function () {
        if (store.economy.xu < entry.price) {
          toast('Không đủ Xu Triết! Cần ' + entry.price + ' Xu Triết.', 'bad');
          return;
        }
        store.economy.xu -= entry.price;
        ownedList.push(entry.id);
        store.equipped[eqMap[activeTab]] = entry.id;
        applyCosmetics();
        sfx.win();
        launchConfetti(26);
        save();
        toast('🎉 Mua & trang bị thành công "' + entry.name + '"!', 'ok');
        shopPage(activeTab);
      };

      return h('div', { class: 'card shop-item' + (equipped ? ' equipped' : '') },
        previewEl,
        h('div', { class: 'row between' },
          h('h3', { style: 'margin:0' }, entry.name),
          equipped
            ? h('span', { class: 'chip ok-t' }, '✔ Đang dùng')
            : (owned ? h('span', { class: 'chip' }, 'Đã sở hữu') : h('span', { class: 'chip' }, '🪙 ' + entry.price + ' Xu'))),
        h('p', { class: 'muted small', style: 'margin:0' }, entry.desc),
        h('div', { class: 'shop-actions' },
          equipped
            ? h('button', { class: 'btn', disabled: true }, 'Đang trang bị')
            : (owned
                ? h('button', { class: 'btn primary', onclick: equipFn }, '✨ Trang bị')
                : h('button', { class: 'btn gold', onclick: buyFn }, '🪙 Mua (' + entry.price + ' Xu)')),
          activeTab !== 'title'
            ? h('button', { class: 'btn ghost small', onclick: function () { previewCosmetic(activeTab, entry.id, entry.name); } }, '👁 Xem thử')
            : null));
    });

    /* Thẻ đặc biệt: Đổi Ảnh Nền Tùy Chỉnh (1.800 Xu) trong tab Background */
    if (activeTab === 'bg') {
      var CUSTOM_BG_PRICE = 1800;
      var unlocked = !!store.inventory.customBgUnlocked;
      var hasImg = !!store.equipped.customBgData;
      var isCustomEquipped = store.equipped.bg === 'custom' && hasImg;

      var fileInput = h('input', {
        type: 'file',
        accept: 'image/*',
        style: 'display:none',
        onchange: function (e) {
          var file = e.target.files && e.target.files[0];
          if (!file) return;
          compressCustomWallpaper(file, function (err, dataUrl) {
            if (err) { toast(err, 'bad'); return; }
            if (unlocked) {
              store.equipped.customBgData = dataUrl;
              store.equipped.bg = 'custom';
              applyCosmetics();
              save();
              toast('🖼️ Đã cập nhật ảnh nền cá nhân!', 'ok');
              shopPage('bg');
            } else {
              pendingCustomWallpaper = dataUrl;
              clearTimeout(previewTimer);
              applyCosmetics({ bg: 'custom', customBgData: dataUrl });
              toast('👁 Đang xem thử ảnh của bạn trong 6 giây! Bấm Mở khóa (1.800 Xu) để lưu vĩnh viễn.', 'info');
              previewTimer = setTimeout(function () { applyCosmetics(); }, 6000);
            }
          });
        }
      });

      var unlockCustomBg = function () {
        if (store.economy.xu < CUSTOM_BG_PRICE) {
          toast('Không đủ Xu Triết! Cần ' + CUSTOM_BG_PRICE.toLocaleString() + ' Xu Triết để mở khóa.', 'bad');
          return;
        }
        store.economy.xu -= CUSTOM_BG_PRICE;
        store.inventory.customBgUnlocked = true;
        if (pendingCustomWallpaper) {
          store.equipped.customBgData = pendingCustomWallpaper;
          pendingCustomWallpaper = '';
        }
        if (store.equipped.customBgData) store.equipped.bg = 'custom';
        applyCosmetics();
        sfx.win();
        launchConfetti(36);
        save();
        toast('🎉 Đã mở khóa tính năng Đổi Ảnh Nền Tùy Chỉnh vĩnh viễn!', 'ok');
        shopPage('bg');
      };

      var dimLabel = h('span', null, 'Độ tối lớp phủ bảo vệ chữ (' + (store.equipped.customBgDim || 38) + '%)');
      var dimSlider = h('input', {
        type: 'range', min: '0', max: '80', value: String(store.equipped.customBgDim || 38),
        oninput: function (e) {
          var v = Number(e.target.value);
          store.equipped.customBgDim = v;
          dimLabel.textContent = 'Độ tối lớp phủ bảo vệ chữ (' + v + '%)';
          applyCosmetics();
        },
        onchange: function () { save(); }
      });

      var blurLabel = h('span', null, 'Độ làm mờ ảnh nền (' + (store.equipped.customBgBlur || 0) + 'px)');
      var blurSlider = h('input', {
        type: 'range', min: '0', max: '16', value: String(store.equipped.customBgBlur || 0),
        oninput: function (e) {
          var v = Number(e.target.value);
          store.equipped.customBgBlur = v;
          blurLabel.textContent = 'Độ làm mờ ảnh nền (' + v + 'px)';
          applyCosmetics();
        },
        onchange: function () { save(); }
      });

      cards.unshift(
        h('div', { class: 'card shop-item custom-bg-panel' + (isCustomEquipped ? ' equipped' : '') },
          fileInput,
          h('div', { class: 'row between' },
            h('div', null,
              h('div', { class: 'eyebrow' }, 'ĐẶC QUYỀN VIP • TẢI ẢNH TỪ ĐIỆN THOẠI / MÁY TÍNH'),
              h('h3', { style: 'margin:0' }, '🖼️ Ảnh nền Cá nhân Tùy chỉnh')),
            unlocked
              ? h('span', { class: 'chip ok-t' }, isCustomEquipped ? '✔ Đang dùng ảnh cá nhân' : '✔ Đã mở khóa vĩnh viễn')
              : h('span', { class: 'chip' }, '🪙 ' + CUSTOM_BG_PRICE.toLocaleString() + ' Xu')),
          h('p', { class: 'muted small', style: 'margin:0' },
            'Tải lên bất kỳ bức ảnh nào từ thiết bị của bạn làm hình nền toàn trang. Hỗ trợ tự động nén nhẹ để đồng bộ Cloud & tùy chỉnh độ tối/mờ giúp chữ luôn sắc nét.'),
          unlocked ? h('div', { class: 'custom-bg-controls' },
            h('label', { class: 'field-label' }, dimLabel, dimSlider),
            h('label', { class: 'field-label' }, blurLabel, blurSlider)) : null,
          h('div', { class: 'shop-actions' },
            unlocked
              ? [
                  h('button', { class: 'btn primary', onclick: function () { fileInput.click(); } }, '📁 Chọn ảnh từ máy'),
                  hasImg && !isCustomEquipped
                    ? h('button', { class: 'btn', onclick: function () { store.equipped.bg = 'custom'; applyCosmetics(); save(); shopPage('bg'); } }, '✨ Bật ảnh đã lưu')
                    : null
                ]
              : [
                  h('button', { class: 'btn gold', onclick: unlockCustomBg }, '🪙 Mở khóa (1.800 Xu)'),
                  h('button', { class: 'btn ghost', onclick: function () { fileInput.click(); } }, '👁 Chọn ảnh xem thử trước')
                ]))
      );
    }

    mount(h('div', { class: 'stack' },
      h('div', { class: 'card shop-hero' },
        h('div', null,
          h('div', { class: 'eyebrow' }, 'CỬA HÀNG ĐỔI THƯỞNG XU TRIẾT'),
          h('h1', { style: 'margin:0 0 6px' }, '🏪 Cửa hàng Giao diện & Vật phẩm'),
          h('p', { class: 'muted', style: 'margin:0' }, 'Mở khóa dàn Theme (Cổ điển, Kitty, Liquid, Cyberpunk, Pixel), ảnh nền cá nhân 1.800 Xu và vật phẩm trợ giúp.')),
        h('div', { class: 'row' },
          h('span', { class: 'xu-pill', style: 'font-size:1rem;padding:8px 16px' }, '🪙 Số dư: ' + store.economy.xu.toLocaleString() + ' Xu Triết'),
          h('button', { class: 'btn ghost', onclick: home }, '← Trang chủ'))),
      h('div', { class: 'shop-tabs' }, tabBtns),
      h('div', { class: 'shop-grid' }, cards)));
  }

  /* ==========================================================================
   * 📖 HƯỚNG DẪN SỬ DỤNG & QUẢN LÝ THÊM / XÓA CÂU HỎI
   * ========================================================================== */
  function guidePage(activeTab) {
    stopTimer(); S = null;
    setNav('navGuide');
    activeTab = activeTab || 'usage';

    var tabs = h('div', { class: 'actions' },
      h('button', { class: 'btn ' + (activeTab === 'usage' ? 'primary' : 'ghost'), onclick: function () { guidePage('usage'); } }, '📖 Hướng dẫn sử dụng Web'),
      h('button', { class: 'btn ' + (activeTab === 'manage' ? 'primary' : 'ghost'), onclick: function () { guidePage('manage'); } }, '➕ Thêm / Xóa câu hỏi trên Web'),
      h('button', { class: 'btn ' + (activeTab === 'code' ? 'primary' : 'ghost'), onclick: function () { guidePage('code'); } }, '💻 Sửa file questions.js thủ công'));

    var body = null;

    if (activeTab === 'usage') {
      body = h('div', { class: 'stack' },
        h('div', { class: 'card stack' },
          h('h2', null, '1. Lộ trình ôn tập & kiếm Xu Triết hiệu quả'),
          h('p', null, '• ', h('b', null, 'Ôn theo chương (Trang chủ): '), 'Chọn Chương 1, 2 hoặc 3 (hoặc từng mục nhỏ) để luyện từng câu có phản hồi đúng/sai ngay lập tức. Mỗi câu đúng nhận ', h('b', null, '+5 Xu Triết & +10 EXP'), '.'),
          h('p', null, '• ', h('b', null, 'Đề thi tổng hợp 40 câu: '), 'Trộn ngẫu nhiên 40 câu từ toàn bộ ngân hàng, có đồng hồ tính giờ (20/30/45 phút) và quy đổi điểm thang 10.'),
          h('p', null, '• ', h('b', null, 'Nhiệm vụ ngày & Cửa hàng: '), 'Hoàn thành 4 nhiệm vụ mỗi ngày ở Trang chủ để nhận thưởng lớn, sau đó vào ', h('b', null, '🏪 Cửa hàng'), ' mua và thay đổi hình nền (Background), bảng màu, khung thẻ câu hỏi hoặc thẻ trợ giúp 50:50 / Gợi ý / x2 Xu.'),
          h('p', null, '• ', h('b', null, 'Đấu trường 4 Gameshow: '), 'Chơi Ai Là Triệu Phú, Đường Lên Đỉnh Olympia, Chiếc Nón Kỳ Diệu và Jeopardy để vừa ôn kiến thức vừa cày Xu Triết.'),
          h('p', null, '• ', h('b', null, 'Tự động gom Câu sai & Đánh dấu sao (★): '), 'Mọi câu làm sai tự động lưu vào mục Câu sai và sẽ tự xóa khỏi danh sách khi bạn làm đúng lại ở bất kỳ chế độ nào.')),
        h('div', { class: 'card stack' },
          h('h2', null, '2. Phím tắt bàn phím & Sao lưu dữ liệu'),
          h('p', null, '• ', h('kbd', null, '1'), '–', h('kbd', null, '4'), ' hoặc ', h('kbd', null, 'A'), '–', h('kbd', null, 'D'), ': Chọn nhanh đáp án.'),
          h('p', null, '• ', h('kbd', null, 'Enter'), ' / ', h('kbd', null, 'Space'), ': Chuyển sang câu tiếp theo hoặc quay nón.'),
          h('p', null, '• ', h('kbd', null, '←'), ' / ', h('kbd', null, '→'), ': Chuyển câu trước/sau trong đề tổng hợp 40 câu.'),
          h('p', null, '• ', h('kbd', null, 'S'), ': Gắn/bỏ dấu sao câu hỏi hiện tại · ', h('kbd', null, 'R'), ': Làm lại từ đầu khi chọn sai.'),
          h('p', null, '• ', h('b', null, 'Sao lưu sang máy khác: '), 'Vào ', h('b', null, '⚙ Cài đặt'), ' → bấm ', h('b', null, '⬇ Xuất file sao lưu (.json)'), ' để lưu toàn bộ tiến độ, Xu Triết, Background đã mua và các câu hỏi bạn tự thêm.')));
    } else if (activeTab === 'manage') {
      var chSel = h('select', { class: 'search' },
        h('option', { value: '1' }, 'Chương 1: Khái luận Triết học'),
        h('option', { value: '2' }, 'Chương 2: Chủ nghĩa duy vật biện chứng'),
        h('option', { value: '3' }, 'Chương 3: Chủ nghĩa duy vật lịch sử'));
      var lvSel = h('select', { class: 'search' },
        h('option', { value: '1' }, 'Mức 1 (Dễ)'),
        h('option', { value: '2' }, 'Mức 2 (Trung bình)'),
        h('option', { value: '3' }, 'Mức 3 (Khá)'),
        h('option', { value: '4' }, 'Mức 4 (Vận dụng)'),
        h('option', { value: '5' }, 'Mức 5 (Nâng cao)'));
      var qInput = h('textarea', { placeholder: 'Nhập nội dung câu hỏi trắc nghiệm mới...' });
      var optInputs = [0, 1, 2, 3].map(function (idx) {
        return h('input', { class: 'search', type: 'text', placeholder: 'Nhập đáp án ' + LETTERS[idx] + '...' });
      });
      var ansSel = h('select', { class: 'search' },
        h('option', { value: '0' }, 'Đáp án đúng: A'),
        h('option', { value: '1' }, 'Đáp án đúng: B'),
        h('option', { value: '2' }, 'Đáp án đúng: C'),
        h('option', { value: '3' }, 'Đáp án đúng: D'));
      var expInput = h('input', { class: 'search', type: 'text', placeholder: 'Giải thích ngắn (không bắt buộc)...' });

      var addCustomQuestion = function () {
        var qText = qInput.value.trim();
        var opts = optInputs.map(function (inp) { return inp.value.trim(); });
        if (!qText || opts.some(function (x) { return !x; })) {
          toast('Vui lòng nhập đầy đủ nội dung câu hỏi và cả 4 đáp án A, B, C, D.', 'bad');
          return;
        }
        var ch = parseInt(chSel.value, 10) || 1;
        var lv = parseInt(lvSel.value, 10) || 1;
        var ans = parseInt(ansSel.value, 10) || 0;
        var maxN = Q.filter(function (x) { return x.ch === ch; }).reduce(function (m, x) { return Math.max(m, x.n || 0); }, 0);
        var newId = 'custom-' + Date.now();
        var item = {
          id: newId,
          ch: ch,
          n: maxN + 1,
          lv: lv,
          q: qText,
          o: opts,
          a: ans,
          explain: expInput.value.trim()
        };
        store.customQuestions.push(item);
        rebuildQuestionBank();
        save();
        sfx.ok();
        toast('✔ Đã thêm câu hỏi mới vào Chương ' + ch + ' (Câu ' + item.n + ')!', 'ok');
        guidePage('manage');
      };

      // Tìm & Xóa/Ẩn câu hỏi có sẵn trong ngân hàng
      var delSearch = h('input', {
        class: 'search', style: 'flex:1;min-width:220px', type: 'search',
        placeholder: 'Nhập mã câu (vd: c1-5) hoặc từ khoá để tìm câu muốn xoá...'
      });
      var delResults = h('div', { class: 'stack' });
      var runDelSearch = function () {
        var raw = delSearch.value.trim();
        var kw = normalize(raw);
        delResults.replaceChildren();
        if (!kw) return;
        var hits = Q.filter(function (x) {
          return normalize(x.id + ' ' + x.q).indexOf(kw) >= 0;
        }).slice(0, 8);
        if (!hits.length) {
          delResults.appendChild(h('p', { class: 'muted small' }, 'Không tìm thấy câu hỏi khớp với "' + raw + '".'));
          return;
        }
        hits.forEach(function (item) {
          var isCustom = String(item.id).indexOf('custom-') === 0;
          delResults.appendChild(h('div', { class: 'custom-q-item' },
            h('div', { class: 'row between' },
              h('span', { class: 'chip' }, 'Chương ' + item.ch + ' · Câu ' + item.n + ' (' + item.id + ')' + (isCustom ? ' · Tự thêm' : '')),
              h('button', {
                class: 'btn danger small',
                onclick: function () {
                  askConfirm({
                    icon: '🗑️',
                    title: 'Xoá câu hỏi này khỏi ngân hàng ôn tập?',
                    message: item.q,
                    okText: 'Xoá câu hỏi',
                    danger: true
                  }, function () {
                    if (isCustom) {
                      store.customQuestions = store.customQuestions.filter(function (c) { return c.id !== item.id; });
                    } else {
                      store.deletedIds[item.id] = 1;
                    }
                    delete store.wrong[item.id];
                    delete store.marks[item.id];
                    rebuildQuestionBank();
                    save();
                    toast('Đã xoá câu hỏi khỏi danh sách ôn tập.', 'info');
                    guidePage('manage');
                  });
                }
              }, '🗑 Xóa câu này')),
            h('div', { class: 'small' }, item.q)));
        });
      };
      delSearch.addEventListener('input', runDelSearch);

      var deletedCount = Object.keys(store.deletedIds || {}).length;
      var customCards = (store.customQuestions || []).map(function (item) {
        return h('div', { class: 'custom-q-item' },
          h('div', { class: 'row between' },
            h('span', { class: 'chip' }, 'Chương ' + item.ch + ' · Câu ' + item.n + ' · Mức ' + item.lv),
            h('button', {
              class: 'btn danger small',
              onclick: function () {
                store.customQuestions = store.customQuestions.filter(function (c) { return c.id !== item.id; });
                rebuildQuestionBank();
                save();
                toast('Đã xoá câu hỏi tự thêm.', 'info');
                guidePage('manage');
              }
            }, '🗑 Xóa')),
          h('b', null, item.q),
          h('div', { class: 'small ok-t' }, 'Đáp án đúng: ' + LETTERS[item.a] + '. ' + item.o[item.a]));
      });

      body = h('div', { class: 'stack' },
        h('div', { class: 'card stack' },
          h('h2', null, '➕ Thêm câu hỏi trắc nghiệm mới'),
          h('p', { class: 'muted small' }, 'Câu hỏi thêm tại đây sẽ được tích hợp ngay vào Luyện tập theo chương, Đề 40 câu, Tra cứu và cả 4 Gameshow.'),
          h('div', { class: 'q-form-grid' },
            h('label', { class: 'field-label' }, 'Chọn chương', chSel),
            h('label', { class: 'field-label' }, 'Độ khó', lvSel),
            h('label', { class: 'field-label wide' }, 'Nội dung câu hỏi', qInput),
            h('label', { class: 'field-label' }, 'Đáp án A', optInputs[0]),
            h('label', { class: 'field-label' }, 'Đáp án B', optInputs[1]),
            h('label', { class: 'field-label' }, 'Đáp án C', optInputs[2]),
            h('label', { class: 'field-label' }, 'Đáp án D', optInputs[3]),
            h('label', { class: 'field-label' }, 'Chọn đáp án đúng', ansSel),
            h('label', { class: 'field-label' }, 'Giải thích (tuỳ chọn)', expInput)),
          h('div', { class: 'actions' },
            h('button', { class: 'btn primary', onclick: addCustomQuestion }, '➕ Thêm câu hỏi vào ngân hàng'))),

        h('div', { class: 'card stack' },
          h('div', { class: 'row between' },
            h('h2', { style: 'margin:0' }, '🗑 Xóa / Ẩn câu hỏi bất kỳ'),
            deletedCount ? h('button', {
              class: 'btn small',
              onclick: function () {
                store.deletedIds = {};
                rebuildQuestionBank();
                save();
                toast('Đã khôi phục ' + deletedCount + ' câu hỏi gốc.', 'ok');
                guidePage('manage');
              }
            }, '↻ Khôi phục ' + deletedCount + ' câu gốc đã ẩn') : null),
          h('p', { class: 'muted small' }, 'Tìm theo từ khoá hoặc mã câu (ví dụ: c1-1, c2-15) để xoá câu hỏi trùng hoặc không dùng đến.'),
          h('div', { class: 'row' }, delSearch),
          delResults),

        h('div', { class: 'card stack' },
          h('h2', null, '📋 Danh sách câu hỏi bạn đã tự thêm (' + customCards.length + ')'),
          customCards.length ? customCards : h('p', { class: 'muted small' }, 'Chưa có câu hỏi tự thêm nào. Hãy điền biểu mẫu phía trên để thêm mới.')));
    } else {
      var sampleSnippet = '{\n  "lv": 1,\n  "id": "c1-96",\n  "ch": 1,\n  "n": 96,\n  "q": "Nội dung câu hỏi trắc nghiệm?",\n  "o": [\n    "Phương án A",\n    "Phương án B",\n    "Phương án C",\n    "Phương án D"\n  ],\n  "a": 0\n}';
      body = h('div', { class: 'card stack' },
        h('h2', null, '💻 Cách thêm / xóa câu hỏi vĩnh viễn trong mã nguồn GitHub'),
        h('p', null, 'Nếu bạn muốn cập nhật trực tiếp vào repository GitHub để mọi người truy cập đều thấy ngân hàng câu hỏi mới nhất, hãy mở file ', h('b', null, 'questions.js'), ':'),
        h('p', null, '1. ', h('b', null, 'Thêm câu hỏi mới: '), 'Mở ', h('code', null, 'questions.js'), ', kéo xuống cuối mảng ', h('code', null, 'window.QUESTIONS = [ ... ]'), ' và thêm một đối tượng theo đúng cấu trúc sau (lưu ý ', h('code', null, '"a"'), ' là chỉ số đáp án đúng: ', h('code', null, '0'), '=A, ', h('code', null, '1'), '=B, ', h('code', null, '2'), '=C, ', h('code', null, '3'), '=D):'),
        h('pre', { class: 'guide-code' }, sampleSnippet),
        h('p', null, '2. ', h('b', null, 'Xóa câu hỏi: '), 'Tìm khối ', h('code', null, '{"lv":...,"id":"cX-Y",...}'), ' tương ứng trong ', h('code', null, 'questions.js'), ' và xoá trọn vẹn từ dấu ', h('code', null, '{'), ' đến dấu ', h('code', null, '},'), ' của câu đó.'),
        h('p', null, '3. ', h('b', null, 'Thêm giải thích đáp án: '), 'Mở file ', h('code', null, 'explain.js'), ' và thêm dòng ', h('code', null, '"c1-96": "Nội dung giải thích...",'), ' theo đúng mã ', h('code', null, 'id'), ' của câu hỏi.'));
    }

    mount(h('div', { class: 'stack' },
      h('div', { class: 'hud' },
        h('h1', { style: 'margin:0' }, '📖 Hướng dẫn & Quản lý câu hỏi'),
        h('button', { class: 'btn ghost', onclick: home }, '← Trang chủ')),
      tabs,
      body));
  }

  /* ---------- Thống kê & Biểu đồ Analytics ---------- */
  function barRow(label, a, b, extra) {
    var pct = b ? Math.round(a / b * 100) : 0;
    return h('div', { class: 'barrow' },
      h('div', { class: 'row between small' }, h('span', null, label), h('span', { class: 'muted' }, a + '/' + b + ' (' + pct + '%)' + (extra || ''))),
      h('div', { class: 'progress' }, h('span', { style: 'width:' + pct + '%' })));
  }

  function svgRingCard(ch, seen, total) {
    var pct = total ? Math.round(seen / total * 100) : 0;
    var r = 25;
    var circ = 2 * Math.PI * r;
    var offset = circ * (1 - pct / 100);
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'ring-svg');
    svg.setAttribute('viewBox', '0 0 64 64');
    var bg = document.createElementNS(ns, 'circle');
    bg.setAttribute('class', 'ring-bg');
    bg.setAttribute('cx', '32'); bg.setAttribute('cy', '32'); bg.setAttribute('r', String(r));
    var fg = document.createElementNS(ns, 'circle');
    fg.setAttribute('class', 'ring-fg');
    fg.setAttribute('cx', '32'); fg.setAttribute('cy', '32'); fg.setAttribute('r', String(r));
    fg.setAttribute('stroke-dasharray', circ.toFixed(2));
    fg.setAttribute('stroke-dashoffset', offset.toFixed(2));
    svg.appendChild(bg);
    svg.appendChild(fg);

    return h('div', { class: 'ring-card' },
      svg,
      h('div', { class: 'ring-info' },
        h('div', { class: 'ring-pct' }, pct + '% · ' + seen + '/' + total),
        h('div', { class: 'ring-title' }, 'Chương ' + ch + ': ' + CHAPTERS[ch].title)));
  }

  function buildHeatmapCard() {
    var days = 84;
    var cells = [];
    var totalRecent = 0;
    for (var offset = -(days - 1); offset <= 0; offset++) {
      var k = dateKey(offset);
      var cnt = store.activity[k] || 0;
      totalRecent += cnt;
      var lv = cnt === 0 ? 0 : (cnt <= 5 ? 1 : (cnt <= 15 ? 2 : (cnt <= 30 ? 3 : 4)));
      cells.push(h('div', {
        class: 'hm-cell hm-' + lv,
        title: formatDateVN(k) + ': ' + cnt + ' lượt trả lời'
      }));
    }
    return h('div', { class: 'card stack' },
      h('div', { class: 'row between' },
        h('h3', { style: 'margin:0' }, 'Lịch sử hoạt động 12 tuần gần nhất'),
        h('span', { class: 'chip' }, totalRecent + ' lượt trả lời trong 84 ngày')),
      h('div', { class: 'heatmap-wrap' },
        h('div', { class: 'heatmap-grid' }, cells)),
      h('div', { class: 'heatmap-legend' },
        h('span', null, 'Ít'),
        h('span', { class: 'hm-cell hm-0' }),
        h('span', { class: 'hm-cell hm-1' }),
        h('span', { class: 'hm-cell hm-2' }),
        h('span', { class: 'hm-cell hm-3' }),
        h('span', { class: 'hm-cell hm-4' }),
        h('span', null, 'Nhiều')));
  }

  function statsPage() {
    stopTimer(); S = null;
    setNav('navStats');
    var seenAll = Q.filter(function (q) { return store.seen[q.id]; }).length;
    var pctAll = Q.length ? Math.round(seenAll / Q.length * 100) : 0;
    var curStreak = effectiveStreak();
    var bestStreak = store.streak.best || 0;
    var mx = stat('mix'), mil = stat('millionaire'), oly = stat('olympia'), wheel = stat('wheel'), jeopardy = stat('jeopardy');
    var mixScore10 = mx.best ? (mx.best / MIX_SIZE * 10).toFixed(2).replace(/\.?0+$/, '') : '0';

    var rings = [1, 2, 3].map(function (ch) {
      var list = chapterQs(ch);
      var seen = list.filter(function (q) { return store.seen[q.id]; }).length;
      return svgRingCard(ch, seen, list.length);
    });

    var blocks = [1, 2, 3].map(function (ch) {
      var list = chapterQs(ch);
      var rows = CHAPTERS[ch].sections.map(function (s) {
        var pool = list.filter(function (q) { return q.n >= s.from && q.n <= s.to; });
        var seen = pool.filter(function (q) { return store.seen[q.id]; }).length;
        var wr = pool.filter(function (q) { return store.wrong[q.id]; }).length;
        return barRow(s.name, seen, pool.length, wr ? ' · đang sai ' + wr : '');
      });
      var st = stat('ch' + ch);
      return h('div', { class: 'card stack' },
        h('h3', null, 'Chương ' + ch + ': ' + CHAPTERS[ch].title),
        h('div', { class: 'muted small' }, 'Đã bắt đầu ôn ' + st.runs + ' lần · hoàn thành ' + st.completed + ' lần · chuỗi đúng dài nhất ' + st.bestStreak),
        rows);
    });

    var top = wrongIds().sort(function (a, b) { return store.wrong[b] - store.wrong[a]; }).slice(0, 10).map(function (id) {
      var q = byId[id];
      return h('div', { class: 'toprow' },
        h('span', { class: 'chip' }, 'C' + q.ch + '.' + q.n),
        h('span', { class: 'toptxt', title: q.q }, q.q),
        h('span', { class: 'bad-t small', style: 'white-space:nowrap;font-weight:700' }, 'sai ' + store.wrong[id] + ' lần'));
    });

    mount(h('div', { class: 'stack' },
      h('h1', null, 'Thống kê tiến độ học tập'),

      h('div', { class: 'kpi-grid' },
        h('div', { class: 'kpi-card' },
          h('span', { class: 'kpi-label' }, 'Độ phủ ngân hàng'),
          h('span', { class: 'kpi-val' }, pctAll + '%'),
          h('span', { class: 'kpi-sub' }, seenAll + '/' + Q.length + ' câu đã làm đúng')),
        h('div', { class: 'kpi-card' },
          h('span', { class: 'kpi-label' }, 'Cấp độ & Xu Triết'),
          h('span', { class: 'kpi-val' }, 'Lv.' + store.economy.level),
          h('span', { class: 'kpi-sub' }, '🪙 ' + store.economy.xu.toLocaleString() + ' Xu hiện có')),
        h('div', { class: 'kpi-card' },
          h('span', { class: 'kpi-label' }, 'Chuỗi ngày học'),
          h('span', { class: 'kpi-val' }, '🔥 ' + curStreak + ' ngày'),
          h('span', { class: 'kpi-sub' }, 'Kỷ lục: ' + bestStreak + ' ngày liên tiếp')),
        h('div', { class: 'kpi-card' },
          h('span', { class: 'kpi-label' }, 'Kỷ lục thi thử'),
          h('span', { class: 'kpi-val' }, mx.best ? (mx.best + '/' + MIX_SIZE) : '—'),
          h('span', { class: 'kpi-sub' }, mx.best ? ('Thang 10: ' + mixScore10 + ' điểm') : 'Chưa làm đề tổng hợp'))),

      buildHeatmapCard(),

      h('div', { class: 'card stack' },
        h('h3', { style: 'margin:0' }, 'Tỷ lệ nắm vững theo 3 chương'),
        h('div', { class: 'ring-grid' }, rings),
        h('div', { class: 'muted small' },
          'Kỷ lục Gameshow — Triệu phú: ' + (mil.best ? mil.best.toLocaleString() + ' đ' : 'Chưa chơi') +
          ' · Olympia: ' + oly.best + ' điểm' +
          ' · Chiếc Nón: ' + wheel.best + ' điểm' +
          ' · Jeopardy: ' + jeopardy.best + ' điểm')),

      blocks,

      h('div', { class: 'card stack' },
        h('h3', null, 'Top 10 câu hay sai nhất'),
        top.length ? top : h('p', { class: 'muted' }, 'Chưa có dữ liệu câu sai.'))));
  }

  /* ==========================================================================
   * 🏆 ĐẤU TRƯỜNG GAMESHOW TRUYỀN HÌNH (THƯỞNG XU TRIẾT & EXP)
   * ========================================================================== */
  function gameMenu() {
    stopTimer(); S = null;
    setNav('navGame');
    var mil = stat('millionaire'), oly = stat('olympia'), wheel = stat('wheel'), jeopardy = stat('jeopardy');
    mount(h('div', { class: 'stack' },
      h('button', { class: 'btn ghost', style: 'align-self:flex-start', onclick: home }, '← Trang chủ'),
      h('h1', null, '📺 Đấu Trường Gameshow Triết Học'),
      h('p', { class: 'muted' }, 'Hoàn thành bất kỳ gameshow nào để nhận thưởng Xu Triết & EXP dùng mở khóa Background và vật phẩm trong Cửa hàng!'),
      h('div', { class: 'grid game-grid' },
        gameCard('🏆 Ai Là Triệu Phú', '15 câu hỏi tăng dần độ khó, thang tiền thưởng, 3 quyền trợ giúp. Thưởng tới +300 Xu Triết.',
          mil.best ? 'Kỷ lục: ' + mil.best.toLocaleString() + ' VNĐ · ' + mil.runs + ' lượt' : 'Chưa chơi', startMillionaire),
        gameCard('🏔️ Đường Lên Đỉnh Olympia', 'Đủ 4 phần: Khởi động, Vượt chướng ngại vật, Tăng tốc và Về đích. Thưởng Xu theo điểm số.',
          oly.best ? 'Kỷ lục: ' + oly.best + ' điểm · ' + oly.runs + ' lượt' : 'Chưa chơi', startOlympia),
        gameCard('🎡 Chiếc Nón Kỳ Diệu', 'Quay vòng nhận điểm thưởng/phạt và trả lời câu hỏi ngẫu nhiên. Thưởng tới +180 Xu Triết.',
          wheel.best ? 'Kỷ lục: ' + wheel.best + ' điểm · ' + wheel.runs + ' lượt' : 'Chưa chơi', startWheel),
        gameCard('🟦 Jeopardy Triết Học', 'Chọn ô điểm trên bảng chủ đề. Đúng cộng điểm, sai trừ điểm. Thưởng tới +220 Xu Triết.',
          jeopardy.best ? 'Kỷ lục: ' + jeopardy.best + ' điểm · ' + jeopardy.runs + ' lượt' : 'Chưa chơi', startJeopardy))));
  }

  function gameCard(title, desc, meta, fn) {
    return h('div', { class: 'card gcard' },
      h('h3', null, title), h('p', { class: 'muted small' }, desc),
      meta ? h('div', { class: 'meta small' }, meta) : null,
      h('div', { class: 'actions' }, h('button', { class: 'btn primary', onclick: fn }, 'Bắt đầu tham gia')));
  }

  /* ---------- GAMESHOW 1: AI LÀ TRIỆU PHÚ ---------- */
  var MIL_PRIZES = [
    200000, 400000, 600000, 1000000, 2000000,
    3000000, 6000000, 10000000, 14000000, 22000000,
    30000000, 40000000, 60000000, 85000000, 150000000
  ];

  function startMillionaire() {
    stopTimer();
    setNav('navGame');
    var pool = [];
    var easy = shuffle(Q.filter(function (q) { return q.lv <= 2; }));
    var med = shuffle(Q.filter(function (q) { return q.lv >= 3 && q.lv <= 4; }));
    var hard = shuffle(Q.filter(function (q) { return q.lv >= 5; }));

    for (var i = 0; i < 5; i++) pool.push(easy[i] || Q[i % Q.length]);
    for (var j = 0; j < 5; j++) pool.push(med[j] || Q[(j + 5) % Q.length]);
    for (var k = 0; k < 5; k++) pool.push(hard[k] || Q[(k + 10) % Q.length]);

    S = {
      view: 'millionaire',
      items: pool.map(makeItem),
      level: 0,
      lifelines: { f50: true, audience: true, expert: true },
      hiddenOpts: [],
      modalInfo: null,
      locked: false,
      won: false
    };
    renderMillionaire();
  }

  function renderMillionaire() {
    var it = S.items[S.level];
    var cp = correctPos(it);
    var prize = MIL_PRIZES[S.level];

    var ladderNodes = MIL_PRIZES.map(function (p, idx) {
      var isMilestone = idx === 4 || idx === 9 || idx === 14;
      var cls = 'mil-step' + (idx === S.level ? ' active' : '') + (idx < S.level ? ' passed' : '') + (isMilestone ? ' milestone' : '');
      return h('div', { class: cls },
        h('span', { class: 'mil-num' }, (idx + 1)),
        h('span', { class: 'mil-val' }, p.toLocaleString() + ' VNĐ'));
    }).reverse();

    var btn50 = h('button', {
      class: 'btn' + (!S.lifelines.f50 ? ' used' : ''),
      disabled: !S.lifelines.f50 || S.locked ? true : null,
      onclick: use5050
    }, '✂ 50:50');

    var btnAudience = h('button', {
      class: 'btn' + (!S.lifelines.audience ? ' used' : ''),
      disabled: !S.lifelines.audience || S.locked ? true : null,
      onclick: useAudience
    }, '📊 Khán giả');

    var btnExpert = h('button', {
      class: 'btn' + (!S.lifelines.expert ? ' used' : ''),
      disabled: !S.lifelines.expert || S.locked ? true : null,
      onclick: useExpert
    }, '☎ Chuyên gia');

    var btnWalk = h('button', {
      class: 'btn bad-t',
      disabled: S.locked ? true : null,
      onclick: walkawayMillionaire
    }, '🛑 Dừng chơi');

    var opts = [0, 1, 2, 3].map(function (k) {
      var isHidden = S.hiddenOpts.indexOf(k) >= 0;
      var state = isHidden ? 'dim locked' : '';
      if (S.locked) {
        if (k === cp) state = 'correct locked';
        else if (k === it.picked) state = 'wrong locked';
        else state = 'dim locked';
      }
      var btn = optionButton(it, k, state, function () { pickMillionaire(k); });
      if (isHidden) btn.style.visibility = 'hidden';
      return btn;
    });

    mount(h('div', { class: 'stack' },
      h('div', { class: 'hud' },
        h('b', null, '🏆 AI LÀ TRIỆU PHÚ TRIẾT HỌC'),
        h('div', { class: 'stats' },
          h('span', null, 'Câu ', h('b', null, (S.level + 1) + '/15')),
          h('span', { class: 'ok-t' }, 'Giá trị: ', h('b', null, prize.toLocaleString() + ' VNĐ'))),
        h('button', { class: 'btn ghost', onclick: gameMenu }, 'Thoát')),

      h('div', { class: 'mil-layout' },
        h('div', { class: 'mil-main' },
          h('div', { class: 'card qcard' },
            qHeader(it, 'Mức thưởng: ' + prize.toLocaleString() + ' VNĐ'),
            h('div', { class: 'qtext' }, it.q.q),
            h('div', { class: 'opts' }, opts)),

          h('div', { class: 'card row between' },
            h('div', { class: 'row' }, btn50, btnAudience, btnExpert),
            btnWalk),

          S.modalInfo ? h('div', { class: 'card explain' }, S.modalInfo) : null
        ),
        h('div', { class: 'card mil-ladder' }, h('h3', null, 'Thang Tiền Thưởng'), ladderNodes)
      ),
      kbdBar([['1-4 / A-D', 'Chọn đáp án'], ['S', 'Đánh dấu']])));
  }

  function pickMillionaire(k) {
    if (S.locked || S.hiddenOpts.indexOf(k) >= 0) return;
    var it = S.items[S.level];
    it.picked = k;
    S.locked = true;
    var ok = it.order[k] === it.q.a;
    record(it.q, ok);
    save();
    renderMillionaire();

    setTimeout(function () {
      if (!S || S.view !== 'millionaire') return;
      if (ok) {
        if (S.level + 1 >= 15) {
          finishMillionaire(true);
        } else {
          S.level++;
          S.hiddenOpts = [];
          S.modalInfo = null;
          S.locked = false;
          renderMillionaire();
        }
      } else {
        finishMillionaire(false);
      }
    }, 1500);
  }

  function use5050() {
    if (!S.lifelines.f50 || S.locked) return;
    S.lifelines.f50 = false;
    var it = S.items[S.level];
    var cp = correctPos(it);
    var wrongPositions = shuffle([0, 1, 2, 3].filter(function (p) { return p !== cp; }));
    S.hiddenOpts = [wrongPositions[0], wrongPositions[1]];
    toast('Đã loại bỏ 2 phương án sai!', 'info');
    renderMillionaire();
  }

  function useAudience() {
    if (!S.lifelines.audience || S.locked) return;
    S.lifelines.audience = false;
    var it = S.items[S.level];
    var cp = correctPos(it);
    var pCorrect = 55 + Math.floor(Math.random() * 25);
    var pRemain = 100 - pCorrect;
    var p1 = Math.floor(Math.random() * pRemain);
    var p2 = Math.floor(Math.random() * (pRemain - p1));
    var p3 = pRemain - p1 - p2;

    var percents = [0, 0, 0, 0];
    var wrongs = [0, 1, 2, 3].filter(function (x) { return x !== cp; });
    percents[cp] = pCorrect;
    percents[wrongs[0]] = p1;
    percents[wrongs[1]] = p2;
    percents[wrongs[2]] = p3;

    S.modalInfo = h('div', null,
      h('b', null, '📊 Ý kiến khán giả trường quay:'),
      h('div', { class: 'row', style: 'margin-top:8px;' },
        LETTERS.map(function (lettr, idx) {
          return h('div', { style: 'flex:1; text-align:center;' },
            h('div', { class: 'small' }, lettr),
            h('b', null, percents[idx] + '%'));
        })));
    renderMillionaire();
  }

  function useExpert() {
    if (!S.lifelines.expert || S.locked) return;
    S.lifelines.expert = false;
    var it = S.items[S.level];
    var cp = correctPos(it);
    var correctLetter = LETTERS[cp];
    S.modalInfo = h('div', null,
      h('b', null, '☎ Tư vấn từ Chuyên gia Triết học:'),
      h('p', { style: 'margin-top:6px;' }, '"Dựa trên phép biện chứng duy vật và hệ thống phạm trù cơ bản, phương án chính xác là ' + correctLetter + '."'));
    renderMillionaire();
  }

  function walkawayMillionaire() {
    var safePrize = S.level > 0 ? MIL_PRIZES[S.level - 1].toLocaleString() + ' VNĐ' : '0 VNĐ';
    askConfirm({
      icon: '🛑',
      title: 'Dừng cuộc chơi?',
      message: 'Bạn sẽ dừng lại và mang về mức tiền thưởng bảo toàn hiện tại: ' + safePrize + '.',
      okText: 'Dừng chơi & nhận thưởng'
    }, function () {
      finishMillionaire('walkaway');
    });
  }

  function finishMillionaire(status) {
    stopTimer();
    var finalPrize = 0;
    var st = stat('millionaire');
    st.runs++;

    if (status === true) {
      finalPrize = MIL_PRIZES[14];
      sfx.win();
      launchConfetti(45);
    } else if (status === 'walkaway') {
      finalPrize = S.level > 0 ? MIL_PRIZES[S.level - 1] : 0;
    } else {
      if (S.level >= 10) finalPrize = MIL_PRIZES[9];
      else if (S.level >= 5) finalPrize = MIL_PRIZES[4];
      else finalPrize = 0;
    }

    if (finalPrize > st.best) st.best = finalPrize;
    var reached = status === true ? 15 : S.level;
    var xuReward = status === true ? 300 : Math.max(15, reached * 15);
    var expReward = status === true ? 120 : Math.max(20, reached * 8);
    var res = recordGameComplete('Ai Là Triệu Phú', xuReward, expReward);

    mount(h('div', { class: 'stack' },
      h('div', { class: 'card score' },
        h('div', { class: 'muted' }, 'KẾT QUẢ GAME "AI LÀ TRIỆU PHÚ TRIẾT HỌC"'),
        h('div', { class: 'big ok-t' }, finalPrize.toLocaleString() + ' VNĐ'),
        h('p', null, status === true ? '🎉 Xuất sắc! Bạn đã vượt qua 15 câu hỏi để trở thành TRIỆU PHÚ TRIẾT HỌC!' : (status === 'walkaway' ? 'Bạn đã quyết định dừng cuộc chơi an toàn.' : 'Rất tiếc! Bạn đã chọn sai ở câu ' + (S.level + 1))),
        h('p', { class: 'ok-t' }, '🪙 Phần thưởng nhận được: +' + res.xu + ' Xu Triết & +' + res.exp + ' EXP'),
        h('div', { class: 'row', style: 'justify-content:center; margin-top:16px;' },
          h('button', { class: 'btn primary', onclick: startMillionaire }, '↻ Chơi lại'),
          h('button', { class: 'btn gold', onclick: function () { shopPage('bg'); } }, '🏪 Vào Cửa hàng'),
          h('button', { class: 'btn', onclick: gameMenu }, 'Gameshow khác')))));
  }

  /* ---------- GAMESHOW 2: ĐƯỜNG LÊN ĐỈNH OLYMPIA ---------- */
  function startOlympia() {
    stopTimer();
    setNav('navGame');
    var pool = shuffle(Q).slice(0, 14).map(makeItem);
    S = {
      view: 'olympia', items: pool, round: 0, idx: 0, score: 0, locked: false,
      round1: pool.slice(0, 6), obstacle: pool[6], round3: pool.slice(7, 11), round4: pool.slice(11, 14),
      obstacleSolved: false, obstacleHints: 0, timeLeft: 15, finalStake: 20, starUsed: false, starActive: false
    };
    renderOlympiaRound();
  }

  function renderOlympiaRound() {
    stopTimer();
    if (S.round === 0) return renderOlympiaQuestionRound(S.round1, 'Khởi động', 10, 15, 'Mỗi câu đúng được 10 điểm. Trả lời nhanh trong 15 giây.');
    if (S.round === 1) return renderOlympiaObstacle();
    if (S.round === 2) return renderOlympiaQuestionRound(S.round3, 'Tăng tốc', null, 10, 'Vòng biến tấu: điểm tính theo tốc độ — đúng trong 3 giây được 30 điểm, 6 giây được 20 điểm, sau đó được 10 điểm.');
    if (S.round === 3) return renderOlympiaFinishRound();
    finishOlympia();
  }

  function renderOlympiaQuestionRound(items, title, base, seconds, description) {
    var it = items[S.idx];
    if (!it) { S.round++; S.idx = 0; renderOlympiaRound(); return; }
    var cp = correctPos(it);
    var opts = [0, 1, 2, 3].map(function (k) {
      var state = '';
      if (S.locked) state = k === cp ? 'correct locked' : (k === it.picked ? 'wrong locked' : 'dim locked');
      return optionButton(it, k, state, function () { pickOlympiaRound(k, title, base, seconds); });
    });
    mount(h('div', { class: 'stack olympia-game' },
      h('div', { class: 'hud' }, h('b', null, '🏔️ ĐƯỜNG LÊN ĐỈNH OLYMPIA'),
        h('div', { class: 'stats' }, h('span', null, 'Điểm: ', h('b', null, S.score)), h('span', null, 'Vòng ', h('b', null, (S.round + 1) + '/4'))),
        h('button', { class: 'btn ghost', onclick: gameMenu }, 'Thoát')),
      olympiaProgress(),
      h('div', { class: 'card qcard' },
        h('div', { class: 'eyebrow' }, title.toUpperCase()),
        h('h2', null, title + ' · Câu ' + (S.idx + 1) + '/' + items.length),
        h('p', { class: 'muted' }, description),
        h('div', { class: 'hud' }, qHeader(it, title), seconds ? h('span', { class: 'chip', id: 'olyTimer' }, '⏱ ' + S.timeLeft + ' giây') : null),
        h('div', { class: 'qtext' }, it.q.q), h('div', { class: 'opts' }, opts)),
      kbdBar([['1-4 / A-D', 'Chọn đáp án']])));
    if (seconds) runOlympiaRoundTimer(title, base, seconds);
  }

  function olympiaProgress() {
    return h('div', { class: 'olympia-rounds' }, ['Khởi động', 'Vượt chướng ngại vật', 'Tăng tốc', 'Về đích'].map(function (t, i) {
      return h('div', { class: 'olympia-round' + (i === S.round ? ' active' : '') + (i < S.round ? ' done' : '') }, h('b', null, (i + 1) + '. '), t);
    }));
  }

  function runOlympiaRoundTimer(title, base, seconds) {
    stopTimer();
    timer = setInterval(function () {
      if (!S || S.view !== 'olympia' || S.locked) return;
      S.timeLeft--;
      var el = document.getElementById('olyTimer');
      if (el) el.textContent = '⏱ ' + S.timeLeft + ' giây';
      if (S.timeLeft <= 0) pickOlympiaRound(-1, title, base, seconds);
    }, 1000);
  }

  function pickOlympiaRound(k, title, base, seconds) {
    if (S.locked) return;
    stopTimer(); S.locked = true;
    var items = S.round === 0 ? S.round1 : S.round3;
    var it = items[S.idx]; it.picked = k;
    var ok = k >= 0 && it.order[k] === it.q.a;
    var earned = 0;
    if (ok) {
      if (title === 'Tăng tốc') earned = S.timeLeft >= 7 ? 30 : (S.timeLeft >= 4 ? 20 : 10);
      else earned = base || 10;
      S.score += earned; record(it.q, true);
    } else if (k >= 0) record(it.q, false);
    else sfx.bad();
    save();
    renderOlympiaQuestionRound(items, title, base, seconds, title === 'Tăng tốc' ? 'Tăng tốc: điểm theo thời gian còn lại.' : 'Kết quả: ' + (ok ? 'đúng, +' + earned + ' điểm.' : 'chưa đúng, không có điểm.'));
    setTimeout(function () {
      if (!S || S.view !== 'olympia') return;
      S.idx++;
      if (S.idx >= items.length) { S.round++; S.idx = 0; }
      S.locked = false; S.timeLeft = seconds || 10; renderOlympiaRound();
    }, 1000);
  }

  function renderOlympiaObstacle() {
    var it = S.obstacle;
    var answer = it.q.o[it.q.a];
    var hints = [
      'Gợi ý 1: Đáp án thuộc nội dung Triết học Mác – Lênin.',
      'Gợi ý 2: Đọc kỹ câu hỏi gốc; chú ý khái niệm trọng tâm và mối quan hệ được hỏi.',
      'Gợi ý 3: Đáp án có ' + answer.length + ' ký tự (tính cả khoảng trắng).'
    ];
    var opts = [0, 1, 2, 3].map(function (k) {
      var state = '';
      if (S.locked) state = k === correctPos(it) ? 'correct locked' : (k === it.picked ? 'wrong locked' : 'dim locked');
      return optionButton(it, k, state, function () { pickOlympiaObstacle(k); });
    });
    mount(h('div', { class: 'stack olympia-game' },
      h('div', { class: 'hud' }, h('b', null, '🏔️ ĐƯỜNG LÊN ĐỈNH OLYMPIA'), h('span', { class: 'chip' }, 'Điểm: ' + S.score), h('button', { class: 'btn ghost', onclick: gameMenu }, 'Thoát')),
      olympiaProgress(),
      h('div', { class: 'card qcard' }, h('div', { class: 'eyebrow' }, 'VÒNG 2 · VƯỢT CHƯỚNG NGẠI VẬT'),
        h('h2', null, 'Giải mã chướng ngại vật'),
        h('p', { class: 'muted' }, 'Trả lời câu hỏi để mở khóa chướng ngại vật. Đúng +40 điểm; sai -10 điểm. Bạn có thể mở từng gợi ý.'),
        h('div', { class: 'qtext' }, it.q.q),
        h('div', { class: 'row', style: 'margin-bottom:12px' },
          h('button', {
            class: 'btn', disabled: S.obstacleHints >= 3 || S.locked ? true : null,
            onclick: function () { S.obstacleHints++; toast(hints[S.obstacleHints - 1], 'info'); renderOlympiaObstacle(); }
          }, '💡 Mở gợi ý (' + S.obstacleHints + '/3)'),
          h('span', { class: 'chip' }, 'Chương ' + it.q.ch)),
        h('div', { class: 'opts' }, opts),
        S.locked ? h('div', { class: 'feedback ' + (S.obstacleSolved ? 'ok' : 'bad') }, S.obstacleSolved ? '✔ Mở khóa thành công! +40 điểm.' : '✘ Chướng ngại vật vẫn còn. -10 điểm.') : null,
        S.locked ? h('div', { class: 'actions' }, h('button', { class: 'btn primary', onclick: nextOlympiaFromObstacle }, 'Sang vòng Tăng tốc →')) : null)));
  }

  function pickOlympiaObstacle(k) {
    if (S.locked) return;
    S.locked = true;
    var it = S.obstacle;
    it.picked = k;
    var ok = it.order[k] === it.q.a;
    if (ok) { S.score += 40; S.obstacleSolved = true; record(it.q, true); }
    else { S.score = Math.max(0, S.score - 10); record(it.q, false); }
    save();
    renderOlympiaObstacle();
  }

  function nextOlympiaFromObstacle() {
    S.round = 2; S.idx = 0; S.locked = false; S.timeLeft = 10; renderOlympiaRound();
  }

  function renderOlympiaFinishRound() {
    var items = S.round4, it = items[S.idx];
    if (!it) { finishOlympia(); return; }
    var cp = correctPos(it);
    var opts = [0, 1, 2, 3].map(function (k) {
      var state = '';
      if (S.locked) state = k === cp ? 'correct locked' : (k === it.picked ? 'wrong locked' : 'dim locked');
      return optionButton(it, k, state, function () { pickOlympiaFinish(k); });
    });
    var stakeBtns = [20, 30].map(function (n) {
      return h('button', { class: 'btn' + (S.finalStake === n ? ' primary' : ''), disabled: S.locked ? true : null, onclick: function () { S.finalStake = n; renderOlympiaFinishRound(); } }, n + ' điểm');
    });
    mount(h('div', { class: 'stack olympia-game' },
      h('div', { class: 'hud' }, h('b', null, '🏔️ ĐƯỜNG LÊN ĐỈNH OLYMPIA'), h('span', { class: 'stats' }, 'Điểm: ', h('b', null, S.score)), h('button', { class: 'btn ghost', onclick: gameMenu }, 'Thoát')),
      olympiaProgress(),
      h('div', { class: 'card qcard' }, h('div', { class: 'eyebrow' }, 'VÒNG 4 · VỀ ĐÍCH'), h('h2', null, 'Câu ' + (S.idx + 1) + '/3'),
        h('p', { class: 'muted' }, 'Chọn mức điểm cược trước khi trả lời. Đúng cộng điểm, sai trừ điểm cược.'),
        h('div', { class: 'row', style: 'margin-bottom:10px' }, h('b', null, 'Mức cược:'), stakeBtns),
        qHeader(it, 'Cược ' + S.finalStake + ' điểm'),
        h('div', { class: 'qtext' }, it.q.q),
        h('div', { class: 'opts' }, opts),
        h('div', { class: 'actions' },
          h('button', {
            class: 'btn' + (S.starUsed ? ' used' : ''), disabled: S.starUsed || S.locked ? true : null,
            onclick: function () { S.starUsed = true; S.finalStake = 30; toast('Ngôi sao hy vọng: câu này cược 30 điểm!', 'info'); renderOlympiaFinishRound(); }
          }, '🌟 Ngôi sao hy vọng (cược 30 điểm)')))));
  }

  function pickOlympiaFinish(k) {
    if (S.locked) return;
    S.locked = true;
    var it = S.round4[S.idx]; it.picked = k;
    var ok = k >= 0 && it.order[k] === it.q.a;
    if (ok) { S.score += S.finalStake; record(it.q, true); }
    else { S.score -= S.finalStake; if (k >= 0) record(it.q, false); }
    save();
    renderOlympiaFinishRound();
    setTimeout(function () {
      if (!S || S.view !== 'olympia') return;
      S.idx++; S.locked = false; S.finalStake = 20;
      if (S.idx >= S.round4.length) finishOlympia(); else renderOlympiaFinishRound();
    }, 1200);
  }

  function finishOlympia() {
    stopTimer();
    var st = stat('olympia'); st.runs++; if (S.score > st.best) st.best = S.score;
    var xuReward = Math.max(25, Math.round(Math.max(0, S.score) * 0.8));
    var expReward = Math.max(30, Math.round(Math.max(0, S.score) * 0.6));
    var res = recordGameComplete('Đường Lên Đỉnh Olympia', xuReward, expReward);
    sfx.win();
    launchConfetti(34);
    mount(h('div', { class: 'stack' },
      h('div', { class: 'card score' },
        h('div', { class: 'muted' }, 'KẾT QUẢ ĐƯỜNG LÊN ĐỈNH OLYMPIA'),
        h('div', { class: 'big ok-t' }, S.score + ' ĐIỂM'),
        h('p', null, 'Bạn đã hoàn thành đủ 4 vòng: Khởi động, Vượt chướng ngại vật, Tăng tốc và Về đích.'),
        h('p', { class: 'ok-t' }, '🪙 Phần thưởng nhận được: +' + res.xu + ' Xu Triết & +' + res.exp + ' EXP'),
        h('div', { class: 'row', style: 'justify-content:center;margin-top:16px;' },
          h('button', { class: 'btn primary', onclick: startOlympia }, '↻ Thi đấu lại'),
          h('button', { class: 'btn gold', onclick: function () { shopPage('bg'); } }, '🏪 Vào Cửa hàng'),
          h('button', { class: 'btn', onclick: gameMenu }, 'Gameshow khác')))));
  }

  /* ---------- GAMESHOW 3: CHIẾC NÓN KỲ DIỆU ---------- */
  var WHEEL_SLICES = [
    { name: 'Mất lượt', type: 'lose' },
    { name: '+100 điểm', type: 'points', value: 100 },
    { name: 'Nhân đôi', type: 'double' },
    { name: '+200 điểm', type: 'points', value: 200 },
    { name: 'Thêm lượt', type: 'again' },
    { name: '-100 điểm', type: 'minus', value: 100 },
    { name: '+300 điểm', type: 'points', value: 300 },
    { name: 'Bí mật', type: 'mystery' }
  ];

  function startWheel() {
    stopTimer();
    setNav('navGame');
    S = { view: 'wheel', score: 0, round: 0, used: [], current: null, item: null, spinning: false, angle: 0, finished: false, bonusTurn: false, rewardRes: null };
    renderWheel();
  }

  function renderWheel() {
    var done = S.round >= 8;
    if (done && !S.finished) {
      S.finished = true;
      var ws = stat('wheel'); ws.runs++; if (S.score > ws.best) ws.best = S.score;
      var xuReward = Math.max(25, Math.min(200, Math.round(Math.max(0, S.score) * 0.12)));
      S.rewardRes = recordGameComplete('Chiếc Nón Kỳ Diệu', xuReward, 45);
      sfx.win();
      launchConfetti(30);
    }
    var body = done
      ? h('div', { class: 'card score' },
          h('h2', null, 'Kết thúc 8 lượt quay!'),
          h('div', { class: 'big' }, S.score + ' điểm'),
          S.rewardRes ? h('p', { class: 'ok-t' }, '🪙 Phần thưởng nhận được: +' + S.rewardRes.xu + ' Xu Triết & +' + S.rewardRes.exp + ' EXP') : null,
          h('div', { class: 'row', style: 'justify-content:center;margin-top:16px' },
            h('button', { class: 'btn primary', onclick: startWheel }, '↻ Chơi lại'),
            h('button', { class: 'btn gold', onclick: function () { shopPage('bg'); } }, '🏪 Vào Cửa hàng'),
            h('button', { class: 'btn', onclick: gameMenu }, 'Gameshow khác')))
      : h('div', { class: 'card qcard stack' },
          h('div', { class: 'wheel-wrap' },
            h('div', { class: 'wheel-pointer' }, '▼'),
            h('div', {
              class: 'wheel-disc',
              style: 'transform:rotate(' + S.angle + 'deg)'
            }, WHEEL_SLICES.map(function (x, i) {
              return h('span', { class: 'wheel-label', style: '--slice:' + i }, x.name);
            }))),
          h('div', { class: 'row between' },
            h('span', { class: 'chip' }, 'Lượt ' + (S.round + 1) + '/8'),
            h('span', { class: 'chip' }, 'Điểm: ' + S.score)),
          h('p', { class: 'muted' }, 'Quay nón để nhận ô thử thách điểm số, sau đó trả lời câu hỏi Triết học để ghi điểm.'),
          h('button', { class: 'btn primary big', disabled: S.spinning ? true : null, onclick: spinWheel }, S.spinning ? 'Đang quay nón…' : '🎡 QUAY NÓN'));

    mount(h('div', { class: 'stack' },
      h('div', { class: 'hud' }, h('b', null, '🎡 CHIẾC NÓN KỲ DIỆU'), h('span', { class: 'chip' }, 'Điểm: ' + S.score), h('button', { class: 'btn ghost', onclick: gameMenu }, 'Thoát')),
      body,
      !done ? kbdBar([['Enter / Space', 'Quay nón']]) : null));
  }

  function spinWheel() {
    if (S.spinning || S.round >= 8) return;
    S.spinning = true;
    var sliceIdx = Math.floor(Math.random() * WHEEL_SLICES.length);
    var slice = WHEEL_SLICES[sliceIdx];
    var targetOffset = (360 - (sliceIdx * 45 + 22.5)) % 360;
    var currentMod = ((S.angle % 360) + 360) % 360;
    var delta = (targetOffset - currentMod + 360) % 360;
    S.angle += 1440 + delta;
    renderWheel();

    setTimeout(function () {
      if (!S || S.view !== 'wheel') return;
      S.spinning = false;
      S.current = slice;
      if (slice.type === 'lose') {
        sfx.bad();
        toast('Ô Mất lượt! Điểm giữ nguyên.', 'bad');
        S.round++;
        renderWheel();
        return;
      }
      toast('Ô trúng: ' + slice.name + '!', 'info');
      if (slice.type === 'points') S.pending = slice.value;
      else if (slice.type === 'minus') S.pending = -slice.value;
      else if (slice.type === 'double') S.pending = 'double';
      else if (slice.type === 'again') { S.pending = 100; S.bonusTurn = true; }
      else S.pending = 200;

      setTimeout(function () {
        if (!S || S.view !== 'wheel') return;
        var q = shuffle(Q.filter(function (x) { return S.used.indexOf(x.id) < 0; }))[0] || Q[Math.floor(Math.random() * Q.length)];
        S.used.push(q.id);
        S.item = makeItem(q);
        renderWheelQuestion();
      }, 500);
    }, 1750);
  }

  function renderWheelQuestion() {
    var it = S.item;
    var opts = [0, 1, 2, 3].map(function (k) {
      return optionButton(it, k, '', function () { answerWheel(k); });
    });
    mount(h('div', { class: 'stack' },
      h('div', { class: 'hud' },
        h('b', null, '🎡 CHIẾC NÓN KỲ DIỆU'),
        h('span', { class: 'chip' }, 'Ô trúng: ' + S.current.name),
        h('span', { class: 'chip' }, 'Điểm: ' + S.score),
        h('button', { class: 'btn ghost', onclick: gameMenu }, 'Thoát')),
      h('div', { class: 'card qcard' },
        h('div', { class: 'eyebrow' }, 'THỬ THÁCH LƯỢT ' + (S.round + 1)),
        qHeader(it),
        h('div', { class: 'qtext' }, it.q.q),
        h('div', { class: 'opts' }, opts)),
      kbdBar([['1-4 / A-D', 'Chọn đáp án'], ['S', 'Đánh dấu']])));
  }

  function answerWheel(k) {
    var it = S.item;
    var ok = it.order[k] === it.q.a;
    record(it.q, ok);
    if (ok) {
      var delta = S.pending === 'double' ? (S.score > 0 ? S.score : 200) : S.pending;
      S.score += delta;
      toast('Chính xác! ' + (delta >= 0 ? '+' : '') + delta + ' điểm.', 'ok');
    } else {
      if (typeof S.pending === 'number' && S.pending < 0) S.score += S.pending;
      toast('Chưa chính xác!', 'bad');
    }
    save();
    if (!(ok && S.bonusTurn)) {
      S.round++;
    } else {
      toast('Bạn nhận thêm một lượt quay miễn phí!', 'ok');
    }
    S.bonusTurn = false;
    S.item = null;
    renderWheel();
  }

  /* ---------- GAMESHOW 4: JEOPARDY TRIẾT HỌC ---------- */
  var JEOPARDY_CATS = ['Chương 1', 'Chương 2', 'Chương 3', 'Thử thách tổng hợp'];
  function startJeopardy() {
    stopTimer();
    setNav('navGame');
    var board = [];
    JEOPARDY_CATS.forEach(function (cat, c) {
      var pool = shuffle(Q.filter(function (q) { return c === 3 || q.ch === c + 1; }));
      for (var r = 0; r < 5; r++) {
        var q = pool[r] || shuffle(Q)[0];
        board.push({ cat: cat, value: (r + 1) * 100, item: makeItem(q), used: false });
      }
    });
    S = { view: 'jeopardy', board: board, score: 0, current: null, answered: 0, finished: false, rewardRes: null };
    renderJeopardy();
  }
  function renderJeopardy() {
    if (S.board.every(function (x) { return x.used; }) && !S.finished) {
      S.finished = true;
      var js = stat('jeopardy'); js.runs++; if (S.score > js.best) js.best = S.score;
      var xuReward = Math.max(30, Math.min(240, Math.round(Math.max(0, S.score) * 0.05)));
      S.rewardRes = recordGameComplete('Jeopardy Triết Học', xuReward, 60);
      sfx.win();
      launchConfetti(34);
    }
    if (S.current) {
      var cell = S.current, it = cell.item, cp = correctPos(it);
      var opts = [0, 1, 2, 3].map(function (k) {
        var state = '';
        if (cell.locked) state = k === cp ? 'correct locked' : (k === it.picked ? 'wrong locked' : 'dim locked');
        return optionButton(it, k, state, function () { answerJeopardy(k); });
      });
      mount(h('div', { class: 'stack' },
        h('div', { class: 'hud' }, h('b', null, '🟦 JEOPARDY TRIẾT HỌC'), h('span', { class: 'chip' }, 'Điểm: ' + S.score), h('button', { class: 'btn ghost', onclick: gameMenu }, 'Thoát')),
        h('div', { class: 'card qcard' },
          h('div', { class: 'eyebrow' }, cell.cat + ' · ' + cell.value + ' ĐIỂM'),
          qHeader(it),
          h('div', { class: 'qtext' }, it.q.q),
          h('div', { class: 'opts' }, opts),
          cell.locked ? h('div', { class: 'actions' }, h('button', { class: 'btn primary', onclick: function () { S.current = null; renderJeopardy(); } }, 'Trở lại bảng điểm')) : null),
        kbdBar(cell.locked ? [['Enter', 'Trở lại bảng điểm']] : [['1-4 / A-D', 'Chọn đáp án'], ['S', 'Đánh dấu']])));
      return;
    }
    var cats = JEOPARDY_CATS.map(function (cat) { return h('div', { class: 'jeopardy-cat' }, cat); });
    var cells = [];
    for (var r = 0; r < 5; r++) {
      for (var c = 0; c < 4; c++) {
        var cell = S.board[c * 5 + r];
        cells.push(h('button', {
          class: 'jeopardy-cell' + (cell.used ? ' used' : ''), disabled: cell.used ? true : null,
          onclick: (function (target) { return function () { S.current = target; renderJeopardy(); }; })(cell)
        }, cell.used ? '✓' : cell.value));
      }
    }
    mount(h('div', { class: 'stack' },
      h('div', { class: 'hud' }, h('b', null, '🟦 JEOPARDY TRIẾT HỌC'), h('span', { class: 'chip' }, 'Điểm: ' + S.score), h('button', { class: 'btn ghost', onclick: gameMenu }, 'Thoát')),
      h('p', { class: 'muted' }, 'Chọn một ô điểm. Mỗi ô chỉ được mở một lần; đúng cộng điểm, sai trừ điểm.'),
      h('div', { class: 'jeopardy-board' }, cats.concat(cells)),
      S.board.every(function (x) { return x.used; })
        ? h('div', { class: 'card score' },
            h('h2', null, 'Ván đấu kết thúc'),
            h('div', { class: 'big' }, S.score + ' điểm'),
            S.rewardRes ? h('p', { class: 'ok-t' }, '🪙 Phần thưởng nhận được: +' + S.rewardRes.xu + ' Xu Triết & +' + S.rewardRes.exp + ' EXP') : null,
            h('div', { class: 'row', style: 'justify-content:center;margin-top:14px' },
              h('button', { class: 'btn primary', onclick: startJeopardy }, 'Chơi lại'),
              h('button', { class: 'btn gold', onclick: function () { shopPage('bg'); } }, '🏪 Vào Cửa hàng')))
        : null));
  }
  function answerJeopardy(k) {
    var cell = S.current;
    if (!cell || cell.locked) return;
    cell.locked = true;
    cell.item.picked = k;
    var ok = cell.item.order[k] === cell.item.q.a;
    cell.used = true;
    S.answered++;
    if (ok) { S.score += cell.value; record(cell.item.q, true); }
    else { S.score -= cell.value; record(cell.item.q, false); }
    var st = stat('jeopardy'); if (S.score > st.best) st.best = S.score;
    save();
    renderJeopardy();
  }

  /* ---------- Phím tắt bàn phím toàn cục ---------- */
  function currentQuestionObj() {
    if (!S) return null;
    if (S.view === 'practice' || S.view === 'mix') return S.items[S.i] ? S.items[S.i].q : null;
    if (S.view === 'millionaire') return S.items[S.level] ? S.items[S.level].q : null;
    if (S.view === 'olympia') {
      if (S.round === 0 && S.round1[S.idx]) return S.round1[S.idx].q;
      if (S.round === 1 && S.obstacle) return S.obstacle.q;
      if (S.round === 2 && S.round3[S.idx]) return S.round3[S.idx].q;
      if (S.round === 3 && S.round4[S.idx]) return S.round4[S.idx].q;
    }
    if (S.view === 'wheel' && S.item) return S.item.q;
    if (S.view === 'jeopardy' && S.current) return S.current.item.q;
    return null;
  }

  document.addEventListener('keydown', function (e) {
    if (isOverlayOpen() || !S) return;
    var tag = document.activeElement ? document.activeElement.tagName : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    var key = e.key;
    var lower = key.toLowerCase();

    if (lower === 's') {
      var cq = currentQuestionObj();
      if (cq) {
        e.preventDefault();
        if (store.marks[cq.id]) { delete store.marks[cq.id]; toast('Đã bỏ đánh dấu câu hỏi.', 'info'); }
        else { store.marks[cq.id] = 1; toast('Đã đánh dấu sao câu hỏi.', 'ok'); }
        save();
        var starEl = document.querySelector('.star');
        if (starEl) {
          starEl.classList.toggle('on', !!store.marks[cq.id]);
          starEl.textContent = store.marks[cq.id] ? '★' : '☆';
        }
      }
      return;
    }

    var optIdx = -1;
    if (key >= '1' && key <= '4') optIdx = parseInt(key, 10) - 1;
    else if (lower >= 'a' && lower <= 'd') optIdx = lower.charCodeAt(0) - 97;

    if (optIdx >= 0 && optIdx <= 3) {
      if (S.view === 'practice' && S.items[S.i] && S.items[S.i].picked === null) {
        e.preventDefault(); pickPractice(optIdx); return;
      }
      if (S.view === 'mix' && !S.submitted && S.items[S.i]) {
        e.preventDefault(); pickMix(optIdx); return;
      }
      if (S.view === 'millionaire' && !S.locked) {
        e.preventDefault(); pickMillionaire(optIdx); return;
      }
      if (S.view === 'olympia' && !S.locked) {
        e.preventDefault();
        if (S.round === 0) pickOlympiaRound(optIdx, 'Khởi động', 10, 15);
        else if (S.round === 1) pickOlympiaObstacle(optIdx);
        else if (S.round === 2) pickOlympiaRound(optIdx, 'Tăng tốc', null, 10);
        else if (S.round === 3) pickOlympiaFinish(optIdx);
        return;
      }
      if (S.view === 'wheel' && S.item) {
        e.preventDefault(); answerWheel(optIdx); return;
      }
      if (S.view === 'jeopardy' && S.current && !S.current.locked) {
        e.preventDefault(); answerJeopardy(optIdx); return;
      }
    }

    if (key === 'Enter' || key === ' ') {
      if (S.view === 'practice' && S.items[S.i] && S.items[S.i].picked !== null) {
        e.preventDefault(); nextPractice(); return;
      }
      if (S.view === 'mix' && !S.submitted && S.i + 1 < S.items.length) {
        e.preventDefault(); S.i++; renderMix(); return;
      }
      if (S.view === 'olympia' && S.round === 1 && S.locked) {
        e.preventDefault(); nextOlympiaFromObstacle(); return;
      }
      if (S.view === 'jeopardy' && S.current && S.current.locked) {
        e.preventDefault(); S.current = null; renderJeopardy(); return;
      }
      if (S.view === 'wheel' && !S.item && !S.spinning && S.round < 8) {
        e.preventDefault(); spinWheel(); return;
      }
    }

    if (lower === 'r' && S.view === 'practice' && S.cfg.kind === 'chapter') {
      var curIt = S.items[S.i];
      if (curIt && curIt.picked !== null && curIt.order[curIt.picked] !== curIt.q.a) {
        e.preventDefault(); restartPractice(); return;
      }
    }

    if (S.view === 'mix' && !S.submitted) {
      if (key === 'ArrowLeft' && S.i > 0) { e.preventDefault(); S.i--; renderMix(); }
      else if (key === 'ArrowRight' && S.i + 1 < S.items.length) { e.preventDefault(); S.i++; renderMix(); }
    }
  });

  /* ---------- Khởi động ---------- */
  document.getElementById('navHome').addEventListener('click', home);
  document.getElementById('brand').addEventListener('click', function (e) { e.preventDefault(); home(); });
  document.getElementById('navBrowse').addEventListener('click', browse);
  document.getElementById('navTheory').addEventListener('click', theoryPage);
  document.getElementById('navWrong').addEventListener('click', function () { reviewPage('wrong'); });
  document.getElementById('navStats').addEventListener('click', statsPage);
  document.getElementById('navGame').addEventListener('click', gameMenu);
  var navShopEl = document.getElementById('navShop');
  if (navShopEl) navShopEl.addEventListener('click', function () { shopPage('bg'); });
  var navGuideEl = document.getElementById('navGuide');
  if (navGuideEl) navGuideEl.addEventListener('click', function () { guidePage('usage'); });
  var footerGuideEl = document.getElementById('footerGuideBtn');
  if (footerGuideEl) footerGuideEl.addEventListener('click', function () { guidePage('manage'); });
  var footerSupportEl = document.getElementById('footerSupportBtn');
  if (footerSupportEl) {
    footerSupportEl.addEventListener('click', function () {
      if (typeof window.openSupportModal === 'function') window.openSupportModal();
    });
  }
  document.getElementById('navSettings').addEventListener('click', openSettings);

  window.addEventListener('pagehide', saveSession);
  document.addEventListener('visibilitychange', function () { if (document.hidden) saveSession(); });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        if (reg && typeof reg.update === 'function') reg.update().catch(function () {});
      }).catch(function () {});
    });
  }
  applyCosmetics();
  updateWrongBadge();
  renderHud();
  if (!Q.length) {
    mount(h('p', null, 'Không tải được dữ liệu câu hỏi (questions.js).'));
  } else {
    home();
  }
})();
