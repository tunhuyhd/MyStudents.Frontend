# Rà soát frontend MyStudents — 16/10/2026

Áp dụng Impeccable theo hướng cải thiện giao diện vận hành hiện có, giữ nhận diện xanh và cấu trúc chức năng. Phạm vi chỉnh sửa: nền tảng màu sắc, Button/Input dùng chung và khung điều hướng giáo viên. Đây không phải kết luận kiểm định toàn bộ ứng dụng.

## Đã cải thiện

- Bổ sung các token surface-400 đến surface-700 và surface-950 vốn đang được dùng nhưng chưa khai báo. Chữ phụ và placeholder có màu xác định thay vì phụ thuộc màu kế thừa.
- Tách màu thao tác xanh đậm khỏi màu thương hiệu. Button mặc định có chữ trắng dễ đọc hơn; nơi truyền class màu riêng vẫn giữ màu riêng.
- Sửa Button: `disabled={false}` từ bên ngoài không còn vô hiệu hóa khóa nút khi `isLoading`. Thêm `aria-busy`; spinner lấy màu chữ để hiện rõ cả trên nút outline.
- Input liên kết lỗi bằng `aria-describedby` và `aria-invalid`, giữ mô tả đã có, thông báo lỗi qua `role="alert"`. Cỡ chữ mobile 16px hạn chế tự zoom khi nhập. Bỏ các màu dark cục bộ không khớp nền sáng hiện tại.
- Bổ sung focus bàn phím, màu vùng chọn và caret. CSS tôn trọng reduced motion; thay đổi này không thay thế việc rà soát các animation JavaScript riêng.
- Sidebar từ 320px xuống 288px, cuộn độc lập trên màn hình thấp, giới hạn chiều rộng trên điện thoại. Điều hướng hiện tại có `aria-current`, bao gồm trang chi tiết lớp.
- Menu đóng không nhận focus. Khi mở trên mobile, focus được giữ trong menu, khóa cuộn nền, đóng bằng Escape và trả focus về vị trí mở. Đổi sang desktop sẽ đóng trạng thái menu mobile.
- Thêm nhãn tiếng Việt/Anh và liên kết đến nội dung chính. Bỏ các nút tìm kiếm/thông báo trên header chưa có hành động; tìm kiếm danh sách lớp vẫn giữ nguyên.

## Bằng chứng và giới hạn

- `npm run build`: đạt, bao gồm TypeScript và tạo các route production.
- `npm test`: 5/5 kiểm thử API client đạt; đây không phải kiểm thử end-to-end backend.
- ESLint các component TSX đã sửa: không có error; còn cảnh báo `<img>` avatar có sẵn trong sidebar.
- `tsc --noEmit` và `git diff --check`: đạt sau sửa cuối.
- Impeccable detector: không có phát hiện tại thời điểm quét các tệp giao diện đã chỉnh.
- Chromium: xem desktop 1440×1000, mobile 390×844, trạng thái menu mở và đóng. Dùng API giả lập tài khoản giáo viên và danh sách rỗng; không gọi thao tác ghi dữ liệu thật.
- Ảnh kiểm tra lưu tại `../tmp/frontend-review/`. Chưa kiểm tra Safari, thiết bị thật hoặc toàn bộ trạng thái dữ liệu của từng màn hình.

## Các phát hiện còn lại

1. **Độ chính xác trạng thái dashboard:** `teacher/page.tsx` cộng `studentCount` từ trang hiện tại nhưng hiển thị như thống kê tổng thể. Cần xác định tổng lượt ghi danh hay học sinh duy nhất, rồi dùng dữ liệu tổng hợp tương ứng.
2. **Khôi phục sau lỗi tải:** lỗi `fetchClasses` chỉ ghi console; giao diện có thể hiển thị danh sách trống hoặc dữ liệu cũ mà không giải thích. Nên có thông báo lỗi và nút thử lại, phân biệt chưa có lớp với bộ lọc không có kết quả.
3. **Mật độ thông tin:** tiêu đề lớn, khoảng cách rộng, thẻ bo góc lớn và nhiều chuyển động khiến nội dung chính xuống thấp trên mobile. Nên tinh gọn đồng bộ dashboard, danh sách lớp và chi tiết trong một lượt riêng, kiểm tra cả dữ liệu dài.
4. **Khả năng truy cập toàn ứng dụng:** các menu tùy biến, modal và nút chỉ có icon bên ngoài phạm vi này cần kiểm tra bàn phím, nhãn và focus. Nhiều nút vẫn ghi đè màu mặc định của Button nên chưa được bảo đảm tương phản.
5. **Motion và theme:** cần rà soát animation Framer Motion để tôn trọng reduced motion; các trang khác vẫn có biến thể dark trong khi ứng dụng chưa có hệ thống theme hoàn chỉnh.

Chưa có PRODUCT.md/DESIGN.md. Có thể dùng Impeccable init ở bước tiếp theo để ghi lại người dùng mục tiêu, các luồng ưu tiên và quy chuẩn giao diện trước khi cải tổ rộng hơn.
