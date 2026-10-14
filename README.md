# MyStudents Frontend

Ứng dụng Next.js 16 cho giáo viên và quản trị viên.

## Cấu hình

Tạo `.env.local` (không commit file này) và đặt URL gốc của API:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5268
```

Biến này không bao gồm `/api/v1`; client tự thêm tiền tố đó. API phải cấu hình CORS cho `http://localhost:3000`.

## Chạy và kiểm tra

```powershell
npm ci
npm run dev
npm test
npx tsc --noEmit --incremental false
npm run lint
npm run build
```

Mở `http://localhost:3000`. Production dùng `npm run build` và `npm start`. Build Next.js tải font Inter và Be Vietnam Pro từ Google Fonts; build cần kết nối mạng hoặc cache font tương ứng.

Danh sách học sinh dùng API phân trang, tìm kiếm và lọc trạng thái; endpoint tương thích cũ `/api/v1/students` vẫn giữ phản hồi dạng mảng và phân trang nội bộ theo lô 100 bản ghi.