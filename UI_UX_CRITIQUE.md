# MyStudents.Frontend — UI/UX Critique

**Ngày:** 2026-10-16  
**Phạm vi:** Toàn bộ ứng dụng frontend; đánh giá riêng teacher light và admin dark, sau đó đánh giá các quy ước dùng chung.  
**Định hướng đã xác nhận:** Giữ giao diện admin tối; cải thiện sự nhất quán về component và hành vi, không chuyển admin sang light theme.  
**Phương pháp:** Đối chiếu PRODUCT.md, DESIGN.md, AGENTS.md, CLAUDE.md, FRONTEND_REVIEW.md, README.md, DEPLOY_DEMO.md, source trong src/, ảnh Chromium đã lưu và Impeccable detector. Hai đánh giá độc lập (source review và detector).  
**Giới hạn:** Không sửa application code, PRODUCT.md, DESIGN.md hoặc .impeccable/design.json. Đây là đánh giá và tài liệu, chưa triển khai fix.

## Cách đọc mức độ ưu tiên

- **P0 — Chặn hoàn thành:** bằng chứng cho thấy người dùng không thể hoàn thành tác vụ chính.
- **P1 — Nghiêm trọng:** sai lệch dữ liệu, lỗi workflow hoặc rào cản đáng kể; nên xử lý trước khi mở rộng.
- **P2 — Cải thiện:** còn workaround nhưng ảnh hưởng độ rõ, nhất quán, khả năng tiếp cận hoặc chất lượng trên thiết bị.
- **Runtime status** nêu rõ bằng chứng hiện có và phần cần kiểm tra trên ứng dụng đang chạy. Không xem nhận định chưa kiểm tra là lỗi đã tái hiện.

## Tóm tắt sản phẩm và cấu trúc

PRODUCT.md mô tả MyStudents là ứng dụng web để giáo viên dạy thêm quản lý lớp, học sinh, lịch, buổi học và điểm danh; admin quản lý người dùng, vai trò, trạng thái tài khoản và môn học. Học sinh/phụ huynh hiện là dữ liệu hồ sơ, không phải nhóm người dùng đăng nhập đã được xác nhận. Demo dùng hạ tầng miễn phí cho mục đích học tập; yêu cầu production, bảo mật/lưu giữ dữ liệu cá nhân và chuẩn accessibility chính thức chưa được xác nhận.

Frontend dùng Next.js 16 App Router, React 19, TypeScript, Tailwind 4, Axios và Framer Motion. Teacher workspace có sidebar cố định ở desktop, drawer ở màn nhỏ. Admin có trang đăng nhập và dashboard riêng. Các form/API phụ thuộc cấu hình NEXT_PUBLIC_API_URL; tài liệu deploy ghi backend demo có cold start và không đảm bảo uptime như production.

## Tình trạng sức khỏe tổng quát

| Heuristic | Điểm / 4 | Bằng chứng chính |
|---|---:|---|
| Hiển thị trạng thái hệ thống | 2 | Một số tải/lưu/đổi trạng thái chỉ log lỗi; một vài workflow đã có loading/error rõ. |
| Khớp với công việc thật | 3 | Các đối tượng và luồng teacher tương ứng việc quản lý dạy thêm. |
| Quyền kiểm soát và thoát | 2 | Sidebar mobile tốt; modal và xác nhận destructive chưa theo cùng pattern. |
| Nhất quán và tiêu chuẩn | 1 | Hai theme dùng cùng thương hiệu nhưng shell, control và cách phản hồi khác nhau. |
| Ngăn lỗi | 2 | Một số validation và kiểm tra lịch có sẵn; metric dashboard có thể bị hiểu là tổng. |
| Nhận biết thay vì ghi nhớ | 2 | Có labels, empty/error state ở một số trang; action môn học bị ẩn khi không hover. |
| Linh hoạt và hiệu quả | 2 | Student/class list có search/filter/pagination; các tác vụ ghi nhận vẫn theo từng hồ sơ/modal. |
| Tối giản thẩm mỹ | 2 | Dashboard teacher dùng nhiều khoảng trống, blur, glow, radius và chuyển động. |
| Phục hồi lỗi | 2 | Student list có retry; nhiều API khác không có thông báo phục hồi tương đương. |
| Trợ giúp và tài liệu | 2 | Chưa thấy hướng dẫn theo ngữ cảnh trong các workflow chính. |
| **Tổng** | **20/40** | **Chấp nhận được, nhưng tồn tại các vấn đề tin cậy và nhất quán đáng kể.** |

Điểm heuristic là đánh giá tĩnh từ mã và tài liệu, không phải kiểm thử usability với người dùng. FRONTEND_REVIEW.md ghi nhận một số thao tác đã được chụp bằng Chromium trước đây; không có kiểm thử E2E toàn bộ luồng trong phạm vi review này.

## A. Teacher interface — light theme

### T-01 — Dashboard hiển thị subtotal như tổng toàn bộ
**Ưu tiên:** P1 · **Loại:** Functional, usability  
**Vị trí:** Teacher dashboard, trang /teacher; src/app/teacher/page.tsx:62, 84–103, 198–200.

**Hành vi hiện tại và bằng chứng:** Trang đặt pageSize = 9, tải res.data.items của trang hiện tại vào classes, đồng thời nhận totalCount. Metric có nhãn teacher.totalImpact (“Total Impact” / “Tác động Tổng thể”) nhưng giá trị được tính bằng classes.reduce(...), không dùng totalCount hoặc aggregate riêng. FRONTEND_REVIEW.md cũng liệt kê đây là phát hiện còn lại.

**Hành vi kỳ vọng và tác động:** Metric có nhãn tổng thể phải không đổi theo trang, sort hoặc filter; nếu chỉ là subtotal thì cần thể hiện phạm vi. Hiện tại giáo viên có thể hiểu nhầm số học sinh thuộc toàn bộ lớp hoặc so sánh sai khi chuyển trang.

**Đề xuất:** Xác nhận ý nghĩa mong muốn (tổng lượt ghi danh hay số học sinh duy nhất), dùng dữ liệu tổng hợp có phạm vi xác định từ API; nếu chưa có, đổi nhãn thành subtotal của các lớp đang hiển thị.

**Runtime verification:** Công thức sai phạm vi xác nhận được từ source. Cần chạy trang với hơn 9 lớp, dữ liệu nhiều trang và filter để xác nhận cách metric thay đổi trên giao diện.

### T-02 — Tải lớp thất bại thành empty state; lỗi xóa không được báo
**Ưu tiên:** P1 · **Loại:** Functional, usability  
**Vị trí:** Teacher dashboard; src/app/teacher/page.tsx:84–103, 147–159, 458–480.

**Hành vi hiện tại và bằng chứng:** fetchClasses bắt lỗi bằng console.error, rồi đặt loading=false; component không lưu/hiển thị lỗi tải hay retry. Khi không có classes, render đi đến nhánh empty state “chưa có lớp”. handleConfirmDelete cũng chỉ log lỗi nếu xóa thất bại. Lưu lớp được ném lại cho ClassModal, nơi có thông báo lỗi; vì vậy finding này áp dụng cho tải và xóa, không áp dụng cho lỗi lưu đã được modal xử lý.

**Hành vi kỳ vọng và tác động:** Phân biệt rõ “chưa tạo lớp” với “không tải được lớp”; khi xóa thất bại cần thông báo và giữ ngữ cảnh bản ghi. Nếu không, giáo viên có thể nghĩ dữ liệu đã mất hoặc bắt đầu tạo lớp trùng.

**Đề xuất:** Thêm lỗi inline với retry cho tải; thông báo lỗi xóa cạnh modal xác nhận và giữ modal/bản ghi để thử lại. Duy trì pattern error/retry tốt hơn đã có ở student list.

**Runtime verification:** Các nhánh xử lý lỗi được xác nhận trong source. Việc màn hình rỗng/trạng thái modal thực tế cần thử bằng cách mô phỏng API lỗi.

### T-03 — Copy tiếng Việt của student list bị thay bằng dấu hỏi
**Ưu tiên:** P1 · **Loại:** Usability, accessibility/i18n  
**Vị trí:** Teacher student list, trang /teacher/students; src/locales/vi.json:129–144, src/locales/en.json:129–144, src/app/teacher/students/page.tsx:191, 205, 218, 242, 365–386.

**Hành vi hiện tại và bằng chứng:** Các giá trị tiếng Việt trong vi.json chứa ký tự ? theo nghĩa đen: “T?m ki?m h?c sinh”, “L?c theo tr?ng th?i”, “Th? l?i”, chuỗi lỗi tải, empty state, phân trang và accessible names cho action. Student page sử dụng các khóa đó làm nhãn/feedback. Các khóa tiếng Anh tương ứng ở en.json có nội dung đọc được. PRODUCT.md ghi giao diện hỗ trợ tiếng Việt và tiếng Anh, mặc định tiếng Việt.

**Hành vi kỳ vọng và tác động:** Nhãn, trợ giúp, lỗi và accessible name cần hiển thị đầy đủ ở locale đã chọn. Copy hỏng khiến người dùng khó hiểu filter/retry và làm screen reader phát ra tên action khó nhận diện.

**Đề xuất:** Khôi phục các chuỗi tiếng Việt trong locale catalog; thêm kiểm tra định dạng/locale để phát hiện ký tự thay thế trong strings; kiểm tra workflow student list bằng cả hai locale.

**Runtime verification:** Nội dung JSON hỏng được xác nhận tĩnh. Cần mở app ở vi và en để kiểm tra hydration, persisted preference và nội dung render.

### T-04 — Dialog thao tác chưa có pattern accessible nhất quán
**Ưu tiên:** P1 · **Loại:** Accessibility, usability  
**Vị trí:** Class/student/add-student/session/confirmation modals; ví dụ src/components/teacher/RecordSessionModal.tsx:218–229, 262–267, src/components/teacher/ClassModal.tsx:154–160, 221–230, src/components/teacher/StudentModal.tsx:295–326, src/components/teacher/AddStudentToClassModal.tsx:66–92, src/components/teacher/ConfirmModal.tsx:34–53.

**Hành vi hiện tại và bằng chứng:** Các lớp phủ được tạo bằng div/Framer Motion; các wrapper được review không khai báo role=dialog, aria-modal hoặc liên kết nhãn dialog. Backdrop nhận click đóng modal. Một số nút đóng chỉ chứa icon (ví dụ X ở RecordSessionModal). DESIGN.md cũng ghi nhận modal không có focus-trap/return pattern dùng chung. Đây là khác biệt với mobile teacher sidebar, nơi source có xử lý Escape, giữ/trả focus và scroll lock.

**Hành vi kỳ vọng và tác động:** Khi mở dialog, screen reader cần được thông báo tên/ngữ nghĩa; focus phải ở trong dialog, có cách đóng bàn phím và quay lại control đã mở. Nếu không, người dùng bàn phím/AT có thể rơi vào nội dung nền hoặc không biết đang ở bước nào.

**Đề xuất:** Dùng một dialog primitive có tên, role=dialog/aria-modal, focus containment/return, Escape, nút close có accessible name và quy tắc backdrop nhất quán. Với form đã thay đổi, xác nhận trước khi đóng để tránh mất dữ liệu.

**Runtime verification:** Thiếu attribute xác nhận qua source. Hành vi focus, thứ tự tab, screen reader và nguy cơ mất form data cần kiểm thử trực tiếp; chưa khẳng định đã tái hiện.

### T-05 — Lỗi cập nhật điểm danh bị rollback âm thầm
**Ưu tiên:** P1 · **Loại:** Functional, usability  
**Vị trí:** Ghi buổi học/điểm danh; src/components/teacher/RecordSessionModal.tsx:170–194.

**Hành vi hiện tại và bằng chứng:** Cập nhật attendance dùng optimistic state; nếu request lỗi, code log console.error và khôi phục oldAttendances, nhưng không set lỗi hiển thị/toast trong nhánh catch.

**Hành vi kỳ vọng và tác động:** Khi trạng thái điểm danh không được lưu, giáo viên cần biết thay đổi đã bị hoàn tác và có thể thử lại. Nếu không, người dùng có thể rời form với giả định attendance đã được ghi.

**Đề xuất:** Báo lỗi ngay cạnh dòng học sinh hoặc bằng thông báo bền vững; hiển thị rõ trạng thái đã rollback, giữ cho phép thử lại và tránh mất các cập nhật khác.

**Runtime verification:** Cơ chế rollback và thiếu thông báo trong nhánh catch xác nhận tĩnh. Cần mô phỏng lỗi mạng/API và kiểm tra liệu có thông báo khác ngoài component này trước khi kết luận về toàn bộ màn hình.

### T-06 — Custom date picker có target nhỏ và thiếu semantics lịch trong source
**Ưu tiên:** P2 · **Loại:** Accessibility, usability  
**Vị trí:** src/components/ui/CustomDatePicker.tsx:81–143.

**Hành vi hiện tại và bằng chứng:** Popover là div; tên ngày trong tuần dùng div; ngày và nút trước/sau tháng là các button 32×32px. Không thấy grid/calendar semantics hoặc điều hướng bàn phím theo lịch trong cấu trúc được review.

**Hành vi kỳ vọng và tác động:** Người dùng bàn phím/screen reader cần biết đang chọn ngày/tháng nào và có thể di chuyển qua ngày bằng phím. Target nhỏ làm thao tác chạm kém chính xác.

**Đề xuất:** Dùng date picker có grid semantics, nhãn ngày đầy đủ, selected/today state và keyboard calendar navigation; hoặc dùng native date input nếu phù hợp. Tăng touch target cho điều khiển lịch.

**Runtime verification:** Kích thước/markup xác nhận tĩnh. Trải nghiệm keyboard, AT, touch và độ chạm chính xác cần thử trên trình duyệt/thiết bị.

### T-07 — Dashboard ưu tiên trang trí hơn mật độ thao tác
**Ưu tiên:** P2 · **Loại:** Visual design, usability  
**Vị trí:** /teacher; src/app/teacher/page.tsx:165–178, 217–234, 344–366, 408, 463–465.

**Hành vi hiện tại và bằng chứng:** Source đặt space-y-12, heading text-5xl, card lớp p-10 với rounded-[3.5rem], heading card text-3xl, blur/glow; empty state dùng py-32 và radius 4rem. Ảnh kiểm tra hiện có ../tmp/frontend-review/desktop.png và mobile.png là Chromium captures với lớp rỗng; ở 390×844, heading chiếm hai dòng, CTA và filter xếp dọc, empty state chỉ bắt đầu ở mép dưới viewport. FRONTEND_REVIEW.md nói ảnh dùng account/API giả lập và danh sách rỗng.

**Hành vi kỳ vọng và tác động:** Màn vận hành cần giúp giáo viên quét nhiều lớp và đến thao tác chính nhanh; khoảng trống lớn và lớp phủ trang trí làm tăng cuộn, đặc biệt khi dữ liệu xuất hiện.

**Đề xuất:** Tinh gọn header/empty state và giảm padding/radius card trong màn quản lý; giữ chất emerald/mint và một vài hiệu ứng đặc trưng. Đặt tạo lớp ở gần tiêu đề, dùng diện tích còn lại cho danh sách.

**Runtime verification:** Empty state và bố cục teacher có ảnh capture lưu sẵn theo hai viewport nêu trên. Không có ảnh trang lớp có dữ liệu dài; cần kiểm tra với nội dung thật/chuỗi dài và kích thước khác trước khi định lượng mức độ.

### T-08 — Sort options của class dashboard hardcode tiếng Việt
**Ưu tiên:** P2 · **Loại:** Usability, i18n  
**Vị trí:** /teacher; src/app/teacher/page.tsx:309–315.

**Hành vi hiện tại và bằng chứng:** Các lựa chọn “Mới nhất”, “Cũ nhất”, “Tên (A-Z/Z-A)”, “Học sinh (Nhiều nhất/Ít nhất)” được khai báo trực tiếp trong component thay vì gọi translation keys. App có LanguageContext với vi/en, và các khu teacher khác dùng t(...).

**Hành vi kỳ vọng và tác động:** Khi chọn English, các lựa chọn sort vẫn là tiếng Việt, tạo một workflow pha ngôn ngữ và làm giảm khả năng nhận biết hành động.

**Đề xuất:** Đưa nhãn sort vào locale catalog; kiểm tra toàn bộ dashboard để các label/filter không trộn ngôn ngữ.

**Runtime verification:** Hardcoded strings xác nhận tĩnh; cần đổi locale trong app để xác nhận trạng thái thực tế.

## B. Admin interface — dark theme

Dark emerald/near-black là hướng thiết kế hiện có được DESIGN.md mô tả. Các finding dưới đây đề xuất củng cố theme này, không thay bằng light theme.

### A-01 — Lỗi tải/quản lý user và subject không được trình bày cho admin
**Ưu tiên:** P1 · **Loại:** Functional, usability  
**Vị trí:** Admin dashboard /admin; src/app/admin/page.tsx:42–55, 68–96, 143–151; subject management src/components/admin/SubjectManagement.tsx:19–25, 34–48, 57–64.

**Hành vi hiện tại và bằng chứng:** Dashboard fetch users/roles chỉ log lỗi rồi tắt loading; role/status mutation catches cũng chỉ log. Có nút refresh (:143–151) nhưng không có trạng thái error/retry tự động hoặc thông báo mutation failure theo bản ghi. Subject fetch/save/delete cũng chỉ console.error; subject load không có trạng thái lỗi hiển thị trong component.

**Hành vi kỳ vọng và tác động:** Admin cần phân biệt danh sách rỗng với request lỗi, biết mutation có thành công và khôi phục được. Đây là quản lý quyền/trạng thái tài khoản và danh mục, nên phản hồi mơ hồ làm tăng nguy cơ quyết định sai hoặc lặp thao tác.

**Đề xuất:** Thêm loading/error/empty states riêng; cho retry data fetch; chỉ báo lỗi cạnh hàng hoặc form; khóa control trong lúc mutation và giữ dữ liệu form để thử lại. Giữ palette dark hiện tại cho các trạng thái này.

**Runtime verification:** Catch/loading logic xác nhận tĩnh. Cần giả lập lỗi API từng endpoint và xác nhận user nhìn thấy trạng thái retry/mutation.

### A-02 — Action môn học ẩn khi không hover; nút chỉ có icon
**Ưu tiên:** P1 · **Loại:** Accessibility, usability  
**Vị trí:** Subject cards; src/components/admin/SubjectManagement.tsx:127–138, 58–64.

**Hành vi hiện tại và bằng chứng:** Nhóm action dùng opacity-0 group-hover:opacity-100; không có group-focus-within như ở student list. Edit/Delete buttons chỉ chứa icon Edit2/Trash2, không khai báo aria-label hoặc text label. Xóa gọi native confirm() ở :58.

**Hành vi kỳ vọng và tác động:** Action destructive/primary phải có thể phát hiện khi dùng keyboard và touch, có accessible name và xác nhận phù hợp với ngữ cảnh dark admin. Hiện tại người dùng có thể không thấy action, còn screen reader không có tên nút rõ ràng.

**Đề xuất:** Hiện action thường trực hoặc khi card nhận focus; thêm accessible names; dùng dialog xác nhận trong app có tên môn học và hậu quả cụ thể, vẫn theo visual language dark.

**Runtime verification:** Class names/markup xác nhận tĩnh. Cần thử tab/focus, touch device và screen reader; hành vi hover trên thiết bị cụ thể chưa kiểm chứng.

### A-03 — User table chỉ có horizontal scroll cho màn hẹp
**Ưu tiên:** P1 · **Loại:** Usability, responsive  
**Vị trí:** Admin user management; src/app/admin/page.tsx:161–165, các cột :167–171.

**Hành vi hiện tại và bằng chứng:** Table năm cột nằm trong overflow-x-auto; không có alternate card layout hoặc cột ưu tiên cho màn nhỏ trong component này.

**Hành vi kỳ vọng và tác động:** Trên màn nhỏ, admin cần xem danh tính, role, status và action liên quan mà không phải lia ngang qua bảng để đối chiếu.

**Đề xuất:** Ở breakpoint hẹp, chuyển từng user sang compact card có nhãn cho từng giá trị và action rõ; nếu giữ bảng thì ưu tiên cột thiết yếu và cung cấp affordance cuộn.

**Runtime verification:** Cấu trúc overflow xác nhận tĩnh. Không có ảnh admin; phải kiểm tra ở 320/390px, landscape, zoom 200% và với email/tên dài.

### A-04 — Một phần admin copy hardcode tiếng Anh
**Ưu tiên:** P2 · **Loại:** Usability, i18n  
**Vị trí:** /admin, /admin/login; src/app/admin/page.tsx:129–139, src/app/admin/login/page.tsx:60–61, src/components/admin/SubjectManagement.tsx:72, 94–106.

**Hành vi hiện tại và bằng chứng:** Tab “Users/Subjects”, nhãn “Admin Access/Secure Terminal System”, tiêu đề “Subjects List”, field labels “Subject Name/Description” được viết trực tiếp bằng tiếng Anh. Một số nhãn admin khác đã gọi t(...), cho thấy bản địa hóa được dùng không đồng đều.

**Hành vi kỳ vọng và tác động:** Nếu admin dùng locale tiếng Việt, một phần workflow vẫn tiếng Anh; điều này phá vỡ tính liên tục ngôn ngữ, nhất là khi label liên quan tới sửa/xóa dữ liệu.

**Đề xuất:** Đưa toàn bộ copy người dùng thấy vào locale keys và giữ tone dark/terminal theo hướng hiện có; không cần đổi màu hoặc bố cục chỉ để bản địa hóa.

**Runtime verification:** String literals xác nhận tĩnh. Cần đổi locale ở route admin để xem cụ thể nội dung pha ngôn ngữ và text overflow.

### A-05 — Độ tương phản của text phụ trong dark admin cần đo
**Ưu tiên:** P2 · **Loại:** Accessibility, visual design  
**Vị trí:** Admin table/login; src/app/admin/page.tsx:167–171, src/app/admin/login/page.tsx:61, 104.

**Hành vi hiện tại và bằng chứng:** Một số text dùng text-emerald-500/40, text-emerald-500/60, và footer text-emerald-500/20 trên dark surfaces; các panel có alpha background và blur.

**Hành vi kỳ vọng và tác động:** Text phụ vẫn cần đủ tương phản để đọc; trạng thái/trường dữ liệu không nên chỉ được nhận biết qua sắc màu hoặc opacity thấp.

**Đề xuất:** Đo contrast thực tế trên các nền đã render, tăng contrast cho header/metadata cần đọc, và dùng icon/text/shape cùng màu cho role/status. Giữ dark emerald palette.

**Runtime verification:** Đây là rủi ro cần đo, chưa phải vi phạm WCAG đã xác nhận. Chưa có screenshot admin hoặc đo contrast trên background thực tế.

## C. Nhất quán giữa light teacher và dark admin

### C-01 — Dark admin là một nhánh visual độc lập, chưa được mô hình hóa như theme của cùng component system
**Ưu tiên:** P1 · **Loại:** Visual design, usability, accessibility  
**Vị trí:** Shared tokens src/app/globals.css:8–35; src/components/ui/Button.tsx:17–45; src/components/ui/Input.tsx:21–42; admin routes src/app/admin/page.tsx:101–119, 161, src/app/admin/login/page.tsx:42–55, src/components/admin/SubjectManagement.tsx:91–106.

**Hành vi hiện tại và bằng chứng:** Global semantic tokens chủ yếu mô tả emerald/mint/light surfaces; shared Input có nền trắng và Button có default light variants. Admin giữ nền #020403, panel #111814, emerald highlights và tự ghi đè style tại page/component. /admin còn dùng public Navbar và ZodiacBackground; CSS toàn cục gắn willow background ở src/app/globals.css:74–83. DESIGN.md xác nhận đây là hai visual branch hiện hữu.

**Hành vi kỳ vọng và tác động:** Admin tiếp tục là dark theme, nhưng component và interaction của nó cần cùng quy tắc về focus, disabled/loading, error, sizing và semantics với teacher. Nếu style dark chỉ được tạo bằng override cục bộ, mỗi component mới có thể lệch hành vi hoặc contrast.

**Đề xuất:** Giữ visual direction dark emerald/near-black; bổ sung semantic dark tokens/variants cho shared controls, status, surfaces, focus/error states; cấp dark-aware navbar/shell treatment thay vì để từng route tự override màu và lớp. Không chuyển admin sang light.

**Runtime verification:** Token, class overrides và component imports xác nhận tĩnh. Mức độ “chuyển theme gây khó chịu” là đánh giá thiết kế; cần xem teacher/admin cạnh nhau trong browser, kiểm tra focus/disabled/error/contrast để xác định sai lệch có ảnh hưởng thật.

### C-02 — Ngôn ngữ document cố định English dù locale mặc định là Vietnamese
**Ưu tiên:** P2 · **Loại:** Accessibility, i18n  
**Vị trí:** src/app/layout.tsx:31–40; src/context/LanguageContext.tsx:31–45.

**Hành vi hiện tại và bằng chứng:** Root HTML khai báo lang="en". LanguageContext khởi tạo vi, sau đó đọc/ghi preference language trong localStorage; PRODUCT.md ghi tiếng Việt là mặc định.

**Hành vi kỳ vọng và tác động:** Thuộc tính ngôn ngữ của document nên khớp ngôn ngữ nội dung để screen reader và công cụ ngôn ngữ phát âm/xử lý đúng. Cấu hình hiện tại lệch locale mặc định và không theo preference đã lưu.

**Đề xuất:** Đồng bộ lang với locale được chọn theo cách tương thích với hydration, kiểm tra cả render ban đầu và sau khi đổi ngôn ngữ.

**Runtime verification:** HTML attribute và locale state xác nhận tĩnh. Cần thử đổi locale/reload và nghe với screen reader; chưa xác nhận mức ảnh hưởng với AT cụ thể.

### C-03 — CSS reduced-motion không bao phủ chắc chắn animation từ Framer Motion
**Ưu tiên:** P2 · **Loại:** Accessibility  
**Vị trí:** src/app/globals.css:58–65; src/app/template.tsx:1–13; src/components/PageTransition.tsx, src/components/NatureCursor.tsx.

**Hành vi hiện tại và bằng chứng:** prefers-reduced-motion trong CSS rút ngắn animation/transition CSS. App template mount PageTransition và NatureCursor qua route; hai component dùng Framer Motion/JS-driven interaction theo source và DESIGN.md ghi coverage reduced-motion của Framer Motion không được đảm bảo.

**Hành vi kỳ vọng và tác động:** Người bật giảm chuyển động không nên nhận page transition/cursor motion không cần thiết trong các luồng vận hành lặp lại.

**Đề xuất:** Đọc preference reduced-motion trong các component JS và tắt/giảm animation trang, cursor và micro-interaction tương ứng; giữ feedback trạng thái thiết yếu.

**Runtime verification:** CSS và component mount xác nhận tĩnh. Cần bật OS/browser reduced-motion và kiểm tra cả teacher/admin; chưa xác minh mức animation còn chạy thực tế.

### C-04 — Toast dùng chung nhưng thiếu accessibility/viewport affordances
**Ưu tiên:** P2 · **Loại:** Accessibility, usability, responsive  
**Vị trí:** src/components/ui/Toast.tsx:13–21, 26–37, 58–63; được dùng bởi src/app/teacher/page.tsx, class detail và auth logout trong src/context/AuthContext.tsx.

**Hành vi hiện tại và bằng chứng:** Toast tự đóng bằng timer 3 giây; container có min-w-[320px]; motion wrapper không khai báo role=status/alert hoặc live-region; nút close chỉ có icon, không có aria-label.

**Hành vi kỳ vọng và tác động:** Feedback cần được thông báo cho screen reader, action đóng cần tên accessible, và lỗi cần tồn tại đủ lâu để người dùng đọc/khôi phục. Ở viewport 320px, min-width 320px không để lại lề ngang cho toast.

**Đề xuất:** Chọn status/alert theo loại feedback, thêm accessible name cho close, cho lỗi quan trọng tồn tại đến khi đóng và giới hạn chiều rộng bằng viewport trừ khoảng đệm.

**Runtime verification:** Timer, min-width và markup xác nhận tĩnh. Cần kiểm tra ở viewport 320px, screen reader và với thông báo dài; không khẳng định đã thấy tràn hoặc bỏ lỡ toast trong runtime.

## Điểm tốt đã có

- src/app/teacher/layout.tsx và src/components/teacher/TeacherSidebar.tsx có skip link, aria-current, drawer mobile, scroll lock, Escape, giữ và trả focus. Đây là nền tảng tốt để mở rộng accessibility sang modal.
- src/app/teacher/students/page.tsx phân biệt list error, action error, loading, no-results và empty state; có retry, accessible names cho edit/delete/status và navigation pagination.
- Class/student flows kết nối đúng mục tiêu sản phẩm trong PRODUCT.md; admin cũng có semantic table cho dữ liệu user thay vì dựng bảng bằng div.
- Dark admin có palette, panel và ánh emerald nhất quán với hướng dark hiện hữu; các đề xuất trong tài liệu giữ nguyên hướng này.

## Detector và mức độ tin cậy

Impeccable detector đã quét markup trong src/app và src/components: **77 advisory**, gồm 75 design-system-font-size và 2 design-system-color; không có blocker. Sáu phát hiện là 9px, 45 là 10px và 24 là 11px. DESIGN.md mô tả label từ 10–12px, do đó 69 phát hiện 10/11px phù hợp với tài liệu hiện trạng; detector không chứng minh chúng là lỗi. Sáu nhãn 9px ở class/student form thấp hơn khoảng đã ghi. Hai color literals #059669 ở src/app/me/page.tsx:26 và src/components/teacher/TeacherSidebar.tsx:25 là cùng họ emerald nhưng không dùng token; đây là token drift, chưa phải bằng chứng lỗi contrast.

**Runtime evidence có sẵn:** FRONTEND_REVIEW.md ghi nhận Chromium capture teacher dashboard ở 1440×1000 và 390×844, account/API giả lập, danh sách lớp rỗng, không ghi dữ liệu thật. Ảnh ../tmp/frontend-review/desktop.png, mobile.png, mobile-menu.png cho phép xem layout teacher trong các điều kiện đó. Chưa có capture admin.

**Chưa kiểm chứng runtime trong lượt này:** Không có browser automation tool khả dụng và không khởi động ứng dụng. Cần kiểm tra admin theme, tương phản, keyboard/focus, dialog/calendar interaction, viewport 320px/390px/landscape/zoom 200%, lỗi API, empty/error transitions và dữ liệu dài. Chưa chạy test suite; FRONTEND_REVIEW.md ghi build và 5 API-client tests đã qua ở lượt kiểm tra trước, nhưng đó không phải E2E coverage.

## Ràng buộc và câu hỏi còn mở

- Giữ admin dark; chỉ chuẩn hóa component contract, semantic tokens và các trạng thái tương tác.
- DEPLOY_DEMO.md ghi backend demo có thể cold start và không bảo đảm uptime/backup như production. Loading/error/retry nên được thiết kế rõ cho môi trường demo.
- PRODUCT.md ghi student/parent contact details, address và notes nhưng privacy, retention, consent và quy định áp dụng chưa được xác nhận. Tài liệu này không đề xuất yêu cầu sản phẩm mới khi chưa có xác nhận.
- Chưa có accessibility conformance target hoặc ma trận screen reader/browser được xác nhận.

## Kế hoạch xử lý đề xuất

1. **P1 — Dữ liệu đáng tin cậy:** sửa metric dashboard; phân biệt lỗi tải với empty state; báo lỗi xóa lớp/điểm danh và lỗi admin fetch/mutation.
2. **P1 — Core Vietnamese workflows:** sửa chuỗi vi.json, kiểm tra student list và localize sort labels/admin copy theo locale.
3. **P1 — Tác vụ có thể hoàn tất bằng keyboard/AT:** chuẩn hóa dialog lifecycle, accessible names cho action, phản hồi khi điểm danh rollback.
4. **P1 — Responsive admin:** xác định cách sử dụng user table ở màn nhỏ bằng runtime test; chuyển sang cards nếu pan ngang cản trở tác vụ.
5. **P2 — Theme system:** định nghĩa dark semantic tokens/variants, đồng bộ focus/loading/error/disabled behavior trong khi giữ dark visual direction.
6. **P2 — Readability/motion:** tinh gọn mật độ dashboard, cải thiện date picker/Toast, đo contrast admin và kiểm tra reduced motion.
