// 1. CẤU HÌNH FIREBASE CỦA DỰ ÁN TRIET-ML
const firebaseConfig = {
  apiKey: "AIzaSyCX_UWsSB55e5XclLXNjati6GvJkaZON9A",
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

// 2. DỮ LIỆU RANK CỤC BỘ (Cày trước khi đăng nhập vẫn giữ nguyên điểm)
let rankData = JSON.parse(localStorage.getItem('triet_rank_data')) || {
  rp: 0,              // Điểm Rank tích lũy
  correctCount: 0,    // Tổng số câu làm đúng
  streak: 0,          // Chuỗi đúng liên tiếp hiện tại
  studyMinutes: 0     // Tổng số phút học thực tế
};

let currentUser = null;
let needSync = false;
let lastInteractionTime = Date.now();

['click', 'keydown', 'touchstart'].forEach(evt => {
  window.addEventListener(evt, () => { lastInteractionTime = Date.now(); });
});

// Tính bậc Rank theo mốc điểm RP
function getRankTier(rp) {
  if (rp >= 7000) return "👑 Cao Thủ Triết Học";
  if (rp >= 3500) return "💎 Kim Cương";
  if (rp >= 1500) return "💠 Bạch Kim";
  if (rp >= 600)  return "🥇 Vàng";
  if (rp >= 200)  return "🥈 Bạc";
  return "🥉 Đồng";
}

function updateRankUI() {
  const tier = getRankTier(rankData.rp);
  const userInfo = document.getElementById('user-info');
  const btnLogin = document.getElementById('btn-google-login');
  const btnLogout = document.getElementById('btn-logout');
  if (!userInfo) return;

  if (currentUser) {
    const avatar = currentUser.photoURL 
      ? `<img src="${currentUser.photoURL}" style="width:22px;height:22px;border-radius:50%;vertical-align:middle;margin-right:6px;">` 
      : `🎓 `;
    const name = currentUser.displayName || currentUser.email.split('@')[0];
    userInfo.innerHTML = `${avatar}<strong>${name}</strong> • <span id="rank-badge">${tier} (${rankData.rp} RP)</span>`;
    if (btnLogin) btnLogin.style.display = 'none';
    if (btnLogout) btnLogout.style.display = 'inline-block';
  } else {
    userInfo.innerHTML = `Khách • <strong id="rank-badge">${tier} (${rankData.rp} RP)</strong>`;
    if (btnLogin) {
      btnLogin.textContent = "Đăng nhập / Leo Rank";
      btnLogin.style.display = 'inline-block';
    }
    if (btnLogout) btnLogout.style.display = 'none';
  }
}

function saveLocalRank() {
  localStorage.setItem('triet_rank_data', JSON.stringify(rankData));
  needSync = true;
  updateRankUI();
}

// 3. HÀM CỘNG ĐIỂM KHI TRẢ LỜI CÂU HỎI (Móc vào app.js)
window.recordQuizAnswer = function(isCorrect) {
  lastInteractionTime = Date.now();
  if (isCorrect) {
    rankData.correctCount += 1;
    rankData.streak += 1;
    let bonus = (rankData.streak % 5 === 0) ? 15 : 0; // Thưởng chuỗi 5 câu đúng liên tiếp
    rankData.rp += (10 + bonus);
  } else {
    rankData.streak = 0;
  }
  saveLocalRank();
};

// 4. BỘ ĐẾM THỜI GIAN HỌC THỰC TẾ (Mỗi phút có tương tác cộng +2 RP)
setInterval(() => {
  const isTabActive = !document.hidden;
  const isRecentlyActive = (Date.now() - lastInteractionTime) < 60000;
  if (isTabActive && isRecentlyActive) {
    rankData.studyMinutes += 1;
    rankData.rp += 2;
    saveLocalRank();
  }
}, 60000);

// 5. CỬA SỔ ĐĂNG NHẬP (GOOGLE + EMAIL/MẬT KHẨU)
function ensureAuthModal() {
  if (document.getElementById('auth-modal')) return;
  const modalHTML = `
    <div id="auth-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:10000; align-items:center; justify-content:center;">
      <div style="background:#1e293b; color:#fff; width:90%; max-width:380px; border-radius:14px; padding:20px; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h3 style="margin:0; font-size:18px;">🔐 Tài khoản Leo Rank</h3>
          <button onclick="document.getElementById('auth-modal').style.display='none'" style="background:none; border:none; color:#94a3b8; font-size:20px; cursor:pointer;">✕</button>
        </div>
        <button onclick="signInGoogleNow()" style="width:100%; padding:10px; border:none; border-radius:8px; background:#4285F4; color:#fff; font-weight:bold; cursor:pointer; margin-bottom:14px;">
          G • Tiếp tục với Google
        </button>
        <div style="text-align:center; color:#94a3b8; font-size:12px; margin-bottom:12px;">— Hoặc dùng Email & Mật khẩu —</div>
        <input id="auth-name" type="text" placeholder="Tên hiển thị trên BXH (khi đăng ký)" style="width:100%; box-sizing:border-box; padding:9px; margin-bottom:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#fff;">
        <input id="auth-email" type="email" placeholder="Email của bạn" style="width:100%; box-sizing:border-box; padding:9px; margin-bottom:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#fff;">
        <input id="auth-pass" type="password" placeholder="Mật khẩu (từ 6 ký tự)" style="width:100%; box-sizing:border-box; padding:9px; margin-bottom:12px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#fff;">
        <div style="display:flex; gap:8px;">
          <button onclick="signInEmailNow()" style="flex:1; padding:9px; border:none; border-radius:6px; background:#10b981; color:#fff; font-weight:bold; cursor:pointer;">Đăng nhập</button>
          <button onclick="registerEmailNow()" style="flex:1; padding:9px; border:none; border-radius:6px; background:#6366f1; color:#fff; font-weight:bold; cursor:pointer;">Đăng ký mới</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.loginWithGoogle = function() {
  ensureAuthModal();
  document.getElementById('auth-modal').style.display = 'flex';
};

window.signInGoogleNow = function() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => { document.getElementById('auth-modal').style.display = 'none'; })
    .catch(err => alert("Lỗi đăng nhập Google: " + err.message));
};

window.signInEmailNow = function() {
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-pass').value;
  if (!email || !pass) return alert("Vui lòng nhập đầy đủ Email và Mật khẩu!");
  auth.signInWithEmailAndPassword(email, pass)
    .then(() => { document.getElementById('auth-modal').style.display = 'none'; })
    .catch(err => alert("Lỗi đăng nhập: " + err.message));
};

window.registerEmailNow = async function() {
  const name = document.getElementById('auth-name').value.trim();
  const email = document.getElementById('auth-email').value.trim();
  const