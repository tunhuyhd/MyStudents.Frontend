# Deploy demo frontend lên Netlify Free

Repo: `tunhuyhd/MyStudents.Frontend`. Backend demo chạy trên Render và database PostgreSQL trên Supabase; cấu hình phù hợp học tập, không đảm bảo uptime hoặc backup như production trả phí.

## Tạo site Netlify

1. Đăng nhập Netlify, chọn **Add new site → Import an existing project**, kết nối GitHub và chọn repo frontend.
2. Base directory: root repo. Build command: `npm run build`. Chọn preset Next.js/Netlify OpenNext nếu dashboard không tự phát hiện; không cấu hình static export vì app dùng Next.js runtime.
3. Trong **Site configuration → Environment variables**, thêm:

   ```dotenv
   NEXT_PUBLIC_API_URL=https://<render-service>.onrender.com
   ```

   URL chỉ là origin, không thêm `/api/v1`. Biến `NEXT_PUBLIC_*` được đóng gói trong build, nên đổi biến cần deploy lại.

4. Deploy và ghi lại domain HTTPS, ví dụ `https://ten-site.netlify.app`.
5. Sang Render, đặt `Cors__AllowedOrigins__0` bằng origin Netlify chính xác rồi redeploy backend.
6. Thử đăng nhập và các chức năng gọi API. Backend cold start trên gói miễn phí có thể làm request đầu tiên chậm.

## Cấu hình GitHub Actions hiện có

Workflow trong `.github/workflows/ci.yml` chạy lint, unit tests, TypeScript và production build trên pull request/push. Netlify tự deploy khi push branch production được chọn trong dashboard; CI xanh không tự cấu hình Netlify hay tạo secrets cho Netlify.

## Nếu build lỗi do Google Fonts

Root layout tải Inter và Be Vietnam Pro bằng `next/font/google`; Next.js tải font lúc build. Netlify thường có network trong build, nhưng nếu build log báo không tải được Google Fonts thì cần đưa file font vào repo và chuyển sang `next/font/local`, hoặc sửa mạng/build tương ứng rồi deploy lại.
