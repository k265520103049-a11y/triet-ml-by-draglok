# Ôn tập Triết học Mác - Lênin (BAS 123) — Pro Edition v2

Ứng dụng web ôn tập trắc nghiệm tĩnh (HTML + CSS + JavaScript thuần), hỗ trợ cài đặt PWA, dùng ngoại tuyến (offline) và đẩy trực tiếp lên GitHub Pages.

## Tính năng nổi bật (Pro Edition v2)
- **Hệ thống Tiền tệ (Xu Triết 🪙), EXP & Level**: Nhận Xu Triết và EXP khi trả lời đúng, hoàn thành đề thi, làm nhiệm vụ ngày hoặc thắng 4 Gameshow truyền hình.
- **Nhiệm vụ hằng ngày (Daily Quests)**: 4 nhiệm vụ tự động làm mới mỗi ngày để cày thêm Xu Triết và EXP.
- **🏪 Cửa hàng Xu Triết**: Mua và trang bị 7 hình nền (Background), 4 bảng màu chủ đạo, 4 khung thẻ câu hỏi, 5 danh hiệu và 4 vật phẩm trợ giúp (`50:50`, `Gợi ý`, `Thẻ x2 Xu & EXP 15 phút`, `Khiên Giữ Chuỗi`).
- **📖 Hướng dẫn & Quản lý Thêm / Xóa câu hỏi**: Tích hợp trình thêm câu hỏi mới và xóa/ẩn câu hỏi ngay trên giao diện web (lưu cục bộ & xuất/nhập JSON), kèm hướng dẫn chỉnh sửa `questions.js`.
- **Popup ủng hộ 2 chế độ**: Hỗ trợ **Đóng một lần** (tải lại trang vẫn hiện) và **Ẩn trong 2 giờ** (tạm ẩn trong 2 giờ rồi tự hiện lại).
- **Logo ứng dụng TRIẾT ML**: Đồng bộ trên thanh tiêu đề, favicon và biểu tượng cài đặt PWA (`icon-192.png`, `icon-512.png`, `logo.png`).

## Hệ thống Xếp hạng & Bảo mật (Anti-Cheat v4)
- **Các bậc Rank**:
  - `🥉 Đồng`: 0 – 199 RP
  - `🥈 Bạc`: 200 – 599 RP
  - `🥇 Vàng`: 600 – 1.499 RP
  - `💠 Bạch Kim`: 1.500 – 3.499 RP
  - `💎 Kim Cương`: 3.500 – 6.999 RP
  - `👑 Cao Thủ Triết Học`: 7.000+ RP
  - `🔥 Thách Đấu`: Dành riêng cho **Top 3** người chơi có điểm cao nhất đạt từ **15.000 RP** trở lên.
- **Kích hoạt luật bảo mật máy chủ (Firestore Rules)**: Copy toàn bộ nội dung file `firestore.rules` dán vào **Firebase Console → Firestore Database → Rules** rồi bấm **Publish**.
