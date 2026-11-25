# Ôn tập Triết học Mác - Lênin (BAS 123) — Bản Nâng Cấp Chuyên Nghiệp

Ứng dụng web ôn tập trắc nghiệm tĩnh (HTML + CSS + JavaScript thuần), chạy mượt trên mọi trình duyệt, hỗ trợ cài đặt như ứng dụng (PWA) và dùng ngoại tuyến (offline) mà không cần máy chủ.

## Tính năng nổi bật
- **Ôn lý thuyết trọng tâm**: 19 chủ đề chia theo 3 chương gồm tóm tắt ý cốt lõi, mẹo ghi nhớ nhanh, ví dụ đời sống/kỹ thuật, cảnh báo điểm dễ nhầm và tô sáng từ khoá tìm kiếm.
- **Luyện tập theo chương / mục**: Chia 3 chương (600 câu), chọn ôn cả chương hoặc từng mục nhỏ. Chọn sai có nút **Làm lại từ đầu** (xáo ngẫu nhiên câu hỏi & đáp án).
- **Đề thi tổng hợp 40 câu**: Ngẫu nhiên từ 600 câu, hỗ trợ thi thử tính giờ (20 / 30 / 45 phút), bảng điều hướng nhanh từng câu, quy đổi điểm thang 10 và xem lại bài chi tiết.
- **Tự động lưu & làm tiếp**: Đang làm dở có thể bấm *Lưu & thoát* hoặc đóng tab; quay lại Trang chủ bấm **▶ Làm tiếp** để tiếp tục đúng vị trí cũ.
- **Quản lý câu sai & đánh dấu sao (★)**: Tự động gom câu làm sai và tự xoá khỏi danh sách khi làm đúng lại ở bất kỳ chế độ nào; hỗ trợ gắn sao (`☆`/`★`) để ôn tập riêng.
- **Đấu trường 4 Gameshow truyền hình**:
  - 🏆 **Ai Là Triệu Phú**: 15 câu tăng dần độ khó, thang tiền thưởng, 3 quyền trợ giúp (`50:50`, `Khán giả`, `Chuyên gia`) và quyền dừng chơi an toàn.
  - 🏔️ **Đường Lên Đỉnh Olympia**: Đủ 4 vòng (*Khởi động*, *Vượt chướng ngại vật*, *Tăng tốc* tính điểm theo giây, *Về đích* cược điểm & Ngôi sao hy vọng).
  - 🎡 **Chiếc Nón Kỳ Diệu**: Vòng quay 8 ô thưởng/phạt căn góc chuẩn kết hợp câu hỏi ngẫu nhiên.
  - 🟦 **Jeopardy Triết Học**: Bảng 4 chủ đề × 5 mức điểm, đúng cộng điểm, sai trừ điểm.
- **Bảng điều khiển Thống kê & Chuỗi Streak**: Theo dõi chuỗi ngày học liên tiếp (🔥 Streak), lưới hoạt động 12 tuần kiểu GitHub, biểu đồ vòng tròn tỷ lệ nắm vững 3 chương và Top 10 câu hay sai nhất.
- **Sao lưu & Khôi phục dữ liệu (.json)**: Xuất/nhập file tiến độ `.json` trong **⚙ Cài đặt** để đồng bộ giữa điện thoại và máy tính.
- **Trải nghiệm chuẩn sản phẩm**: Hộp thoại xác nhận đồng bộ giao diện (không dùng popup thô của trình duyệt), thông báo Toast xếp chồng, âm thanh phản hồi nhẹ (bật/tắt tuỳ chọn) và giao diện Sáng / Tối / Theo thiết bị.
- **Phím tắt bàn phím**: `1–4` hoặc `A–D` chọn đáp án, `Enter` / `Space` sang câu tiếp theo, `←` / `→` chuyển câu trong đề 40 câu, `S` đánh dấu sao, `R` làm lại từ đầu, `Esc` đóng hộp thoại.

## Cấu trúc thư mục
| File | Vai trò |
|---|---|
| `index.html` | Khung giao diện chính, modal xác nhận và hộp ủng hộ |
| `style.css` | Hệ thống giao diện Sáng/Tối, biểu đồ thống kê, gameshow và responsive |
| `app.js` | Toàn bộ logic luyện tập, chấm điểm, phím tắt, thống kê, sao lưu và gameshow |
| `questions.js` | Ngân hàng 600 câu hỏi trắc nghiệm và đáp án |
| `theory.js` | Nội dung ôn lý thuyết 19 chủ đề |
| `explain.js` | Giải thích chi tiết từng câu hỏi (tuỳ chọn) |
| `qr-mb.png` | Mã VietQR MB Bank trong hộp ủng hộ |
| `sw.js` + `manifest.webmanifest` + `icon.svg` + `icon-192.png` + `icon-512.png` | Cấu hình PWA cài đặt như ứng dụng và hỗ trợ offline |

## Đưa lên GitHub Pages
1. Tạo repository mới trên GitHub (chế độ **Public**).
2. Tải lên toàn bộ các file trong thư mục dự án (`index.html`, `style.css`, `app.js`, `questions.js`, `theory.js`, `explain.js`, `manifest.webmanifest`, `sw.js`, `icon.svg`, `icon-192.png`, `icon-512.png`, `qr-mb.png`, `README.md`).
3. Vào **Settings → Pages**, chọn **Deploy from a branch**, branch `main`, thư mục `/ (root)` rồi bấm **Save**.
4. Sau 1–2 phút, truy cập địa chỉ `https://<tên-tài-khoản>.github.io/<tên-repo>/` để sử dụng.

## Lưu ý học thuật
Đáp án trong `questions.js` và phần tóm lược trong `theory.js` được biên soạn phục vụ mục đích ôn tập. Khi đối chiếu điểm số hoặc thuật ngữ chuẩn, vui lòng tham khảo giáo trình Triết học Mác - Lênin chính thức của nhà trường.
