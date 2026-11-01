# MyStudents Frontend

Ứng dụng Next.js 16 cho giáo viên và quản trị viên. Các API xác thực và nghiệp vụ đi qua `/api/bff/*` cùng origin. Browser chỉ giữ mã phiên trong cookie HttpOnly; access token và refresh token chỉ tồn tại phía server.

## Development

Tạo `.env.local` (không commit):

```dotenv
API_INTERNAL_URL=http://localhost:5268
APP_ORIGIN=http://localhost:3000
# Chỉ dùng cho URL ảnh/avatar công khai, không dùng để gọi API xác thực:
NEXT_PUBLIC_API_URL=http://localhost:5268
```

`API_INTERNAL_URL` là URL gốc, không gồm `/api/v1`. Không tắt kiểm tra chứng chỉ TLS để kết nối API. Nếu dùng HTTPS local, cần chứng chỉ được Node tin cậy.

Development dùng kho phiên trong bộ nhớ, cookie `mystudents-dev-session` trên HTTP. Restart server sẽ yêu cầu đăng nhập lại. Có thể cấu hình Redis như production để kiểm thử nhiều instance. Không cần CORS giữa browser và .NET cho các request BFF.

## Production (bắt buộc)

```dotenv
APP_ORIGIN=https://students.example.com
API_INTERNAL_URL=https://api.internal.example.com
SESSION_REDIS_REST_URL=https://your-redis-rest-endpoint
SESSION_REDIS_REST_TOKEN=<server-only-credential>
SESSION_ENCRYPTION_KEY=<base64-of-32-random-bytes>
NEXT_PUBLIC_API_URL=https://public-api.example.com
```

Kho phiên dùng Redis REST API tương thích Upstash, hỗ trợ `GET`, `SET NX PX`, `DEL`, `EVAL`. Tạo Redis và đưa credential vào secret manager của nền tảng triển khai; không dùng biến `NEXT_PUBLIC_*` cho bí mật. Các instance phải cùng Redis và khóa mã hóa. Redis cần mạng hạn chế, TLS, phân quyền và chính sách không tự ý eviction phiên đang dùng. Không ghi token, cookie hoặc request body đăng nhập vào log.

Tạo khóa bằng `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`. Đổi khóa sẽ vô hiệu hóa các phiên cũ. Thiếu cấu hình production, BFF trả 503 và không chuyển sang bộ nhớ tạm. Next.js phải chạy Node server; static export không hỗ trợ BFF.

Cookie production: `__Host-session`, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, không `Domain`. Hạn tuyệt đối 7 ngày, hết hạn khi không hoạt động 24 giờ. Hồ sơ chỉ nằm trong React state và được lấy lại qua `/auth/me`. Response BFF dùng `Cache-Control: no-store`; không cấu hình CDN hoặc service worker cache `/api/bff/*`.

Token trong Redis được mã hóa AES-256-GCM; khóa Redis dùng SHA-256 của mã phiên. Khóa phân tán theo phiên ngăn các tab/instance refresh đồng thời. Lease khóa 60 giây, upstream timeout 10 giây/request; mất khóa sẽ không ghi đè phiên. Trường hợp worker dừng đột ngột có thể cần đợi lease hết hạn rồi thử lại. Lỗi mạng, 429, 5xx giữ phiên; refresh bị từ chối 401/403 sẽ thu hồi phiên BFF.

BFF yêu cầu `X-Requested-With: MyStudents`, kiểm tra chính xác Origin cho request thay đổi dữ liệu, từ chối Origin khác và Fetch Metadata cross-site; không cấp CORS. Giữ `APP_ORIGIN` đúng URL công khai sau reverse proxy. Chặn request tại reverse proxy nếu body lớn hơn 6 MB (avatar tối đa 5 MB); cấu hình rate limit phù hợp cho đăng nhập/quên mật khẩu. Không proxy tùy ý URL do browser cung cấp.

## Triển khai chuyển đổi

Deploy backend lưu hash refresh token và frontend BFF cùng đợt. Trường database `refresh_token` giữ nguyên schema, nay chỉ chứa `sha256:<hash>`. Refresh token plaintext cũ không còn được chấp nhận; frontend xóa token localStorage cũ và người dùng cần đăng nhập lại. Access JWT cũ còn có thể dùng đến khi hết hạn nếu không thu hồi: nếu cần cắt toàn bộ phiên cũ ngay, thực hiện qua quy trình vận hành cập nhật SecurityStamp/xóa refresh token trước khi mở lại dịch vụ.

Backend hiện vẫn có một refresh token trên mỗi tài khoản; đăng nhập thiết bị khác thay token đó, logout/đổi mật khẩu thu hồi các phiên của tài khoản. Chưa chuyển sang bảng phiên nhiều thiết bị hoặc lưu lịch sử token family; đây là phạm vi riêng. BFF áp dụng hạn tuyệt đối cho phiên web, không thay đổi contract bearer API cho các client khác. Nên giới hạn API auth trực tiếp ở tầng mạng cho BFF nếu ứng dụng chỉ phục vụ web.

## Chạy và kiểm tra

```powershell
npm ci
npm run dev
npm test
npm run test:bff-integration
npx tsc --noEmit --incremental false
npm run lint
npm run build
```

Integration test khởi động Next.js thật với API giả lập độc lập, kiểm tra cookie, response không có token, reload phiên, refresh và logout qua HTTP. Backend có bộ test riêng với JWT và database SQLite thật. Kiểm tra Redis production và reverse proxy trên staging trước khi triển khai. Build tải font Google Fonts nên cần mạng hoặc font cache.
