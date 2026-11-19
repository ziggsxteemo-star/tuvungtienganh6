# Từ vựng Tiếng Anh 6 – Global Success

Web học và kiểm tra từ vựng, chạy trên Vercel. Học sinh **không cần đăng nhập**.

- `/` – bản giáo viên (thêm từ, bài tập, hội thoại, giao bài, bảng điểm)
- `/hoc-sinh/?a=<mã bài>` – link học sinh (không có tab Giáo viên, có bấm giờ, nhập tên, tự gửi điểm)
- `/api/*` – máy chủ nhỏ (Vercel Functions) lưu bài và điểm trong Upstash Redis

## 1. Đưa lên GitHub
```bash
git init
git add .
git commit -m "Từ vựng Tiếng Anh 6"
git branch -M main
git remote add origin https://github.com/<tai-khoan>/<ten-repo>.git
git push -u origin main
```

## 2. Triển khai trên Vercel
1. vercel.com → Add New → Project → Import repo. Framework Preset: **Other**. Không cần Build Command. Bấm Deploy.

## 3. Bật lưu điểm (Upstash Redis)
1. Trong dự án Vercel, vào tab **Storage** → tạo **Upstash Redis** từ Marketplace (gói miễn phí đủ dùng) → Connect to Project. Vercel tự thêm biến môi trường (`KV_REST_API_URL`/`KV_REST_API_TOKEN` hoặc `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`).
2. Vào **Settings → Environment Variables**, thêm `TEACHER_KEY` = mật khẩu giáo viên bạn tự đặt (đủ dài, khó đoán).
3. Vào **Deployments** → Redeploy để biến môi trường có hiệu lực.

## 4. Cách dùng
1. Mở trang chủ → tab **Giáo viên** → mục **Giao bài kiểm tra có tính giờ**: đặt tên bài, phạm vi, số phút mỗi phần.
2. Nhập mật khẩu giáo viên → **Tạo link học sinh** → sao chép link gửi cho lớp. Sửa nội dung rồi bấm **Cập nhật link học sinh** thì link cũ nhận nội dung mới.
3. Học sinh mở link, nhập họ tên, làm bài. Hết giờ bài tự khóa, điểm tự gửi về máy chủ.
4. Giáo viên vào mục **Bảng điểm học sinh** → **Tải điểm từ máy chủ**. Có nút sao chép bảng để dán vào Excel.

## Lưu ý
- Nếu mạng lỗi lúc nộp, học sinh nhận mã nộp điểm để gửi cho giáo viên (qua Zalo) rồi giáo viên dán vào ô "Nhận điểm".
- Từ mới, bài tập, hội thoại của giáo viên lưu trong trình duyệt của giáo viên và được gửi lên máy chủ khi bấm Tạo/Cập nhật link.
- File âm thanh giáo viên tải lên chỉ nằm trên máy giáo viên; học sinh nghe giọng đọc tự động của thiết bị.
- Điểm do trình duyệt học sinh gửi nên chưa chống gian lận hoàn toàn. Phù hợp cho kiểm tra trên lớp có giám sát.
- Muốn làm lại một bài kiểm tra "chỉ làm một lần", hãy tạo link mới.
