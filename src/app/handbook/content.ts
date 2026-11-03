export type GuideTopic = {
  id: string;
  title: string;
  summary: string;
  steps: { title: string; text: string }[];
  note: string;
  link?: { href: string; label: string };
};

export const handbook = {
  vi: {
    title: 'Một nơi để bắt đầu. Một cuốn sổ để tra cứu.',
    description: 'Từ lớp học đầu tiên đến mỗi lần điểm danh. Làm quen với My Student theo nhịp của bạn.',
    search: 'Bạn đang muốn làm gì?', placeholder: 'Thử “thêm học sinh”, “lịch học”, “mật khẩu”…',
    clear: 'Xóa tìm kiếm', contents: 'Trong hướng dẫn này', quickTitle: 'Buổi dạy đầu tiên, bắt đầu từ đây',
    quick: [
      { href: '#students', title: 'Tạo hồ sơ học sinh', text: 'Lưu tên và thông tin liên hệ.' },
      { href: '#classes', title: 'Chuẩn bị lớp học', text: 'Chọn môn, hình thức và lịch dạy.' },
      { href: '#enrollment', title: 'Kết nối học sinh với lớp', text: 'Sẵn sàng cho buổi điểm danh đầu tiên.' },
    ],
    result: 'chủ đề phù hợp', empty: 'Chưa tìm thấy hướng dẫn phù hợp',
    emptyText: 'Thử từ ngắn hơn như “lớp”, “học sinh” hoặc “điểm danh”. Bạn có thể tìm có dấu hoặc không dấu.',
    reset: 'Xem toàn bộ hướng dẫn', note: 'Nhớ một chút', backTop: 'Về đầu trang',
    footer: 'Bạn có thể quay lại cuốn hướng dẫn này bất cứ lúc nào từ thanh điều hướng.',
    faqTitle: 'Khi cần gỡ rối', faqIntro: 'Một vài tình huống thường gặp và bước tiếp theo bạn có thể làm.',
    faqs: [
      { q: 'Tôi không thấy lớp hoặc học sinh vừa thêm?', a: 'Kiểm tra từ khóa, bộ lọc trạng thái và trang hiện tại. Bỏ bộ lọc rồi tải lại danh sách. Chỉ tạo lại khi đã chắc chắn bản ghi chưa có để tránh trùng dữ liệu.' },
      { q: 'Tại sao lịch học bị báo trùng?', a: 'Có buổi học giao nhau về ngày và giờ, trong lớp đang tạo hoặc với lớp khác của bạn. Kiểm tra giờ bắt đầu, thời lượng và các thứ trong tuần rồi chọn khoảng thời gian khác.' },
      { q: 'Tôi bị yêu cầu đăng nhập lại?', a: 'Phiên có thể hết hạn hoặc bị thu hồi sau khi đổi mật khẩu. Đăng nhập lại bằng mật khẩu hiện tại, sau đó mở lại màn hình cần dùng. Không gửi mật khẩu cho người khác.' },
      { q: 'Màn hình báo không có quyền hoặc không tìm thấy dữ liệu?', a: 'Kiểm tra bạn đang dùng đúng tài khoản đã tạo lớp hoặc học sinh đó. Nếu đường dẫn cũ không còn dùng được, quay về danh sách thay vì tiếp tục sửa qua đường dẫn đã lưu.' },
      { q: 'Bấm lưu nhưng mạng bị gián đoạn thì làm gì?', a: 'Giữ lại nội dung đang nhập nếu có thể. Khi mạng ổn định, tải lại để kiểm tra thao tác đã thành công chưa trước khi bấm tạo thêm lần nữa. Nếu lỗi vẫn còn, ghi lại thông báo và thao tác vừa thực hiện để nhờ hỗ trợ; che thông tin cá nhân trong ảnh.' },
    ],
    topics: [
      { id: 'account', title: 'Đăng ký và đăng nhập', summary: 'Dùng tài khoản giáo viên để giữ lớp học và hồ sơ của bạn trong cùng một không gian.',
        steps: [
          { title: 'Tạo tài khoản giáo viên', text: 'Tại trang đăng nhập, chọn tạo tài khoản. Điền họ tên, tên đăng nhập, email và mật khẩu theo yêu cầu trên biểu mẫu, rồi gửi đăng ký.' },
          { title: 'Vào không gian làm việc', text: 'Đăng nhập bằng tên đăng nhập và mật khẩu. Chọn Lớp học hoặc Học sinh trên thanh điều hướng; trên điện thoại, mở nút menu để thấy các mục này.' },
          { title: 'Lấy lại mật khẩu khi cần', text: 'Chọn Quên mật khẩu ở trang đăng nhập, nhập email của tài khoản. Nếu tài khoản đủ điều kiện, bạn sẽ nhận hướng dẫn qua email; kiểm tra cả thư rác và dùng liên kết còn hạn để đặt mật khẩu mới.' },
        ], note: 'Học sinh trong danh sách là hồ sơ bạn quản lý, không phải tài khoản học sinh tự đăng nhập.', link: { href: '/auth/login', label: 'Đến trang đăng nhập' } },
      { id: 'students', title: 'Quản lý hồ sơ học sinh', summary: 'Tạo hồ sơ một lần, sau đó thêm học sinh vào các lớp phù hợp.',
        steps: [
          { title: 'Thêm học sinh', text: 'Mở Học sinh → Thêm học sinh. Điền tên và các trường bắt buộc; bổ sung thông tin trường học, liên hệ, phụ huynh và ghi chú khi có. Lưu biểu mẫu và chờ thông báo kết quả.' },
          { title: 'Tìm đúng hồ sơ', text: 'Dùng ô tìm kiếm theo tên, email hoặc số điện thoại và bộ lọc trạng thái. Chuyển trang nếu danh sách có nhiều học sinh. Mở một học sinh để xem thông tin chi tiết.' },
          { title: 'Đổi trạng thái hồ sơ', text: 'Trong danh sách Học sinh, bấm nút trạng thái trên dòng của học sinh để chuyển giữa Đang hoạt động và Tạm dừng. Chờ lưu xong rồi kiểm tra nhãn mới; nếu dòng biến mất do bộ lọc, chọn Tất cả trạng thái để tìm lại. Thao tác này áp dụng cho hồ sơ, không phải trạng thái thành viên trong từng lớp.' },
          { title: 'Cập nhật hoặc xóa hồ sơ', text: 'Dùng thao tác chỉnh sửa để cập nhật thông tin. Kiểm tra đúng học sinh trước khi xác nhận xóa; nếu chỉ ngừng học một lớp, dùng thao tác trong lớp thay vì xóa cả hồ sơ.' },
        ], note: 'Chỉ nhập thông tin cần cho việc dạy học và liên hệ. Không chia sẻ ảnh màn hình chứa dữ liệu học sinh hoặc phụ huynh khi chưa che thông tin.', link: { href: '/teacher/students', label: 'Mở danh sách học sinh' } },
      { id: 'classes', title: 'Tạo và quản lý lớp học', summary: 'Chuẩn bị thông tin lớp trước, rồi sắp xếp thời gian dạy ở bước tiếp theo.',
        steps: [
          { title: 'Điền thông tin cơ bản', text: 'Trong Lớp học, chọn tạo lớp mới. Nhập tên lớp, mã lớp, môn học và hình thức Online hoặc Offline. Với lớp Online, thêm liên kết phòng học nếu có.' },
          { title: 'Chọn thời gian khóa học', text: 'Sang bước lịch trình, chọn ngày bắt đầu và ngày kết thúc dự kiến. Thêm từng lịch định kỳ gồm thứ, giờ bắt đầu và thời lượng; bỏ dòng không dùng rồi kiểm tra lại trước khi tạo lớp.' },
          { title: 'Tìm và cập nhật lớp', text: 'Dùng tìm kiếm, lọc hoặc sắp xếp trong danh sách. Mở lớp để xem học sinh và buổi học; chọn Chỉnh sửa để cập nhật thông tin hoặc lịch trình khi cần.' },
          { title: 'Xóa lớp không còn cần dùng', text: 'Trong danh sách Lớp học, mở nút ba chấm của đúng lớp rồi chọn Xóa. Đọc hộp xác nhận và chỉ đồng ý khi chắc chắn; chờ thông báo kết quả rồi kiểm tra lớp đã biến mất khỏi danh sách. Nếu chỉ tạm ngừng dạy, cân nhắc chỉnh sửa trạng thái lớp thay vì xóa.' },
        ], note: 'Khi hệ thống báo trùng lịch, đổi ngày hoặc giờ theo thông báo rồi kiểm tra lại. Đừng gửi biểu mẫu liên tiếp khi đang lưu.', link: { href: '/teacher', label: 'Mở danh sách lớp học' } },
      { id: 'enrollment', title: 'Thêm học sinh vào lớp', summary: 'Hồ sơ học sinh và danh sách thành viên lớp là hai bước khác nhau.',
        steps: [
          { title: 'Mở danh sách thành viên', text: 'Mở lớp cần quản lý, chọn tab Học sinh rồi chọn Thêm học sinh.' },
          { title: 'Chọn hồ sơ có sẵn', text: 'Tìm và chọn học sinh trong danh sách có thể thêm. Nếu chưa có hồ sơ, vào Học sinh để tạo trước, sau đó quay lại lớp.' },
          { title: 'Theo dõi việc học trong lớp', text: 'Kiểm tra học sinh đã xuất hiện. Dùng trạng thái thành viên để phản ánh việc theo học, hoặc thao tác xóa khỏi lớp nếu cần ngừng liên kết. Kiểm tra kỹ học sinh và lớp trước khi xác nhận.' },
        ], note: 'Xóa khỏi một lớp khác với xóa hồ sơ học sinh. Trạng thái trong lớp cũng khác trạng thái của hồ sơ ở danh sách Học sinh.' },
      { id: 'schedule', title: 'Lịch dạy và buổi học', summary: 'Lịch định kỳ là kế hoạch theo tuần; buổi học là một lần dạy cụ thể theo ngày.',
        steps: [
          { title: 'Xem kế hoạch của lớp', text: 'Mở chi tiết lớp để xem các thứ, giờ và thời lượng. Chuyển sang tab Buổi học để xem các buổi theo ngày cùng trạng thái của chúng.' },
          { title: 'Ghi nhận một buổi học', text: 'Chọn Ghi nhận buổi học. Kiểm tra ngày, giờ bắt đầu, giờ kết thúc và ghi chú. Chọn thời gian nằm trong khoảng của khóa học và không giao với buổi khác.' },
          { title: 'Kiểm tra trước khi đổi lịch', text: 'Khi chỉnh sửa lịch lớp hoặc thông tin buổi, đọc thông báo kết quả và kiểm tra lại danh sách. Những buổi đã có lịch sử có thể bị giới hạn thay đổi để bảo toàn dữ liệu điểm danh.' },
        ], note: 'Đừng tạo thêm buổi nếu buổi định kỳ đúng ngày giờ đã có. Mở buổi có sẵn để tiếp tục điểm danh.' },
      { id: 'attendance', title: 'Điểm danh trong mỗi buổi', summary: 'Mở đúng buổi, cập nhật từng học sinh và kiểm tra kết quả trước khi rời màn hình.',
        steps: [
          { title: 'Chọn đúng buổi học', text: 'Trong tab Buổi học của lớp, mở thao tác điểm danh ở buổi cần dùng. Nếu tạo buổi mới, nhập thông tin rồi chọn Tiếp tục điểm danh.' },
          { title: 'Ghi nhận từng học sinh', text: 'Chọn trạng thái phù hợp cho từng người theo các lựa chọn đang hiển thị. Chờ thao tác lưu của từng học sinh hoàn tất; nếu có thông báo lỗi, kiểm tra lại dòng đó trước khi chuyển tiếp.' },
          { title: 'Rà soát và kết thúc', text: 'Kiểm tra đã cập nhật đủ danh sách, chọn Hoàn tất buổi học để đóng màn hình và quay lại lớp. Mở lại buổi nếu muốn xác nhận các trạng thái đã được lưu.' },
        ], note: 'Thay đổi trạng thái điểm danh được gửi khi bạn chọn cho từng học sinh. Nút Hoàn tất buổi học ở màn hình này giúp bạn kết thúc thao tác; hãy kiểm tra thông báo lưu, đừng chỉ dựa vào việc cửa sổ đã đóng.' },
      { id: 'profile', title: 'Hồ sơ và bảo mật tài khoản', summary: 'Giữ thông tin liên hệ chính xác và tài khoản riêng tư, nhất là trên máy dùng chung.',
        steps: [
          { title: 'Cập nhật hồ sơ', text: 'Mở Hồ sơ từ thanh điều hướng hoặc ảnh đại diện. Sửa họ tên, email rồi chọn Lưu thay đổi. Tên đăng nhập được hiển thị để bạn nhận biết tài khoản đang dùng.' },
          { title: 'Thay ảnh đại diện', text: 'Chọn ảnh đại diện → Chọn ảnh mới, dùng tệp ảnh phù hợp và chờ tải lên thành công. Nếu ảnh không cập nhật, kiểm tra thông báo rồi thử lại với tệp nhỏ hơn.' },
          { title: 'Đổi mật khẩu và đăng xuất', text: 'Trong Hồ sơ → Bảo mật, nhập mật khẩu hiện tại, mật khẩu mới và xác nhận. Sau khi đổi thành công, đăng nhập lại bằng mật khẩu mới. Khi dùng xong máy chung, mở menu tài khoản và chọn Đăng xuất.' },
        ], note: 'Bạn có thể chuyển VI / EN trên thanh điều hướng. Không chia sẻ mật khẩu, liên kết đặt lại mật khẩu hoặc ảnh chụp chứa cookie phiên.', link: { href: '/me', label: 'Mở hồ sơ của tôi' } },
    ] satisfies GuideTopic[],
  },
  en: {
    title: 'A place to start. A guide to come back to.',
    description: 'From your first class to everyday attendance. Get to know My Student at your own pace.',
    search: 'What would you like to do?', placeholder: 'Try “add students”, “schedule”, “password”…',
    clear: 'Clear search', contents: 'In this guide', quickTitle: 'Your first lesson starts here',
    quick: [
      { href: '#students', title: 'Create student profiles', text: 'Keep names and contact details together.' },
      { href: '#classes', title: 'Prepare your class', text: 'Choose a subject, format and schedule.' },
      { href: '#enrollment', title: 'Connect students to a class', text: 'Get ready for your first attendance check.' },
    ],
    result: 'matching topics', empty: 'No matching guidance yet',
    emptyText: 'Try a shorter term such as “class”, “student” or “attendance”. Vietnamese searches also work without accents.',
    reset: 'Show the whole guide', note: 'Good to know', backTop: 'Back to top',
    footer: 'You can return to this guide at any time from the navigation.',
    faqTitle: 'When you need a hand', faqIntro: 'Common situations and a next step you can take.',
    faqs: [
      { q: 'Why can’t I see the class or student I just added?', a: 'Check your search, status filters and current page. Clear filters and reload the list. Create the record again only after checking that it does not already exist.' },
      { q: 'Why does my schedule overlap?', a: 'A lesson overlaps another time slot in this class or another class you own. Check weekdays, start times and durations, then choose a different time.' },
      { q: 'Why am I being asked to sign in again?', a: 'Your session may have expired or been revoked after a password change. Sign in using your current password, then reopen the page you need. Never share your password.' },
      { q: 'Why am I seeing an access denied or not found message?', a: 'Make sure you are using the account that created the class or student. If an old link no longer works, return to the list instead of continuing to edit through that link.' },
      { q: 'What if my connection drops while saving?', a: 'Keep a copy of your input where possible. Once the connection returns, reload and check whether the action succeeded before creating another record. If the error continues, record the message and action for support, hiding personal details in screenshots.' },
    ],
    topics: [
      { id: 'account', title: 'Register and sign in', summary: 'Use your teacher account to keep your classes and records in one workspace.',
        steps: [
          { title: 'Create a teacher account', text: 'On the login page, choose to create an account. Enter your full name, username, email and a password that meets the form requirements, then submit.' },
          { title: 'Enter your workspace', text: 'Sign in with your username and password. Choose Classes or Students in the navigation. On a phone, open the menu to find these links.' },
          { title: 'Recover your password', text: 'Choose Forgot password on the login page and enter your account email. Eligible accounts receive an email with instructions. Check spam too, and use an unexpired link to set a new password.' },
        ], note: 'Students in your list are records you manage, not student accounts that sign in.', link: { href: '/auth/login', label: 'Go to login' } },
      { id: 'students', title: 'Manage student profiles', summary: 'Create a profile once, then add the student to the classes they attend.',
        steps: [
          { title: 'Add a student', text: 'Open Students → Add student. Enter the name and required fields. Add school, contact, parent details and notes where available. Save the form and wait for confirmation.' },
          { title: 'Find a profile', text: 'Search by name, email or phone and use the status filter. Move between pages for longer lists. Open a student to see their details.' },
          { title: 'Change a profile’s status', text: 'In Students, select the status button on the student’s row to switch between Active and Inactive. Wait for the save and check the new label. If a filter hides the row, choose All statuses to find it again. This changes the profile status, not membership in each class.' },
          { title: 'Update or remove a profile', text: 'Use Edit to update details. Double-check the student before confirming deletion. To stop membership in just one class, use that class instead of deleting the whole profile.' },
        ], note: 'Only enter details needed for teaching and contact. Hide student and parent information before sharing screenshots.', link: { href: '/teacher/students', label: 'Open students' } },
      { id: 'classes', title: 'Create and manage classes', summary: 'Set up the class details first, then plan when you will teach.',
        steps: [
          { title: 'Enter the basics', text: 'In Classes, choose to create a new class. Enter its name, code, subject and Online or Offline format. Add a meeting link for an online class if available.' },
          { title: 'Plan the course', text: 'Continue to the schedule step and choose the start and expected end dates. Add each recurring weekday, start time and duration. Remove unused rows and review before creating the class.' },
          { title: 'Find and update a class', text: 'Search, filter or sort the class list. Open a class to see students and lessons. Choose Edit when you need to update its details or schedule.' },
          { title: 'Delete a class you no longer need', text: 'In Classes, open the three-dot menu for the correct class and choose Delete. Read the confirmation and proceed only when certain. Wait for the result and check that the class is removed from the list. To pause teaching, consider editing its status instead.' },
        ], note: 'If a schedule conflict appears, adjust the dates or times as instructed. Avoid repeatedly submitting while a save is in progress.', link: { href: '/teacher', label: 'Open classes' } },
      { id: 'enrollment', title: 'Add students to a class', summary: 'A student profile and class membership are two separate steps.',
        steps: [
          { title: 'Open class members', text: 'Open the class, choose the Students tab and select Add student.' },
          { title: 'Choose an existing profile', text: 'Find and select a student from the available list. If their profile does not exist yet, create it under Students, then return to the class.' },
          { title: 'Manage membership', text: 'Check that the student appears. Update their membership status or remove them from the class when needed. Verify both the student and class before confirming.' },
        ], note: 'Removing a student from a class differs from deleting their profile. Membership status also differs from the status in the main Students list.' },
      { id: 'schedule', title: 'Schedules and lessons', summary: 'A recurring schedule is your weekly plan. A lesson is one teaching session on a specific date.',
        steps: [
          { title: 'Review your plan', text: 'Open class details to see weekdays, times and durations. Switch to Lessons to see dated sessions and their statuses.' },
          { title: 'Record a lesson', text: 'Choose Record session. Check the date, start time, end time and notes. Pick a time within the course dates that does not overlap another lesson.' },
          { title: 'Check schedule changes', text: 'After editing a class schedule or lesson details, read the result message and review the list. Lessons with existing history may restrict changes to preserve attendance records.' },
        ], note: 'Do not create another lesson if the recurring session already exists at that date and time. Open the existing session to take attendance.' },
      { id: 'attendance', title: 'Take attendance', summary: 'Open the right lesson, update each student and check the results before leaving.',
        steps: [
          { title: 'Choose the lesson', text: 'In the class Lessons tab, open attendance for the session you need. When creating a lesson, enter its details and continue to attendance.' },
          { title: 'Update each student', text: 'Choose the appropriate status from the displayed options. Wait for each student’s update to finish. If an error appears, check that row before continuing.' },
          { title: 'Review and finish', text: 'Check the full list, then use the finish button to close the screen and return to the class. Reopen the session if you want to confirm that statuses were saved.' },
        ], note: 'Attendance updates are sent as you select each student’s status. The finish button ends this screen’s workflow; check save messages rather than assuming that closing the window saved everything.' },
      { id: 'profile', title: 'Profile and account security', summary: 'Keep contact details current and your account private, especially on shared computers.',
        steps: [
          { title: 'Update your profile', text: 'Open Profile from navigation or your avatar. Edit your name and email, then Save changes. The displayed username helps identify the account you are using.' },
          { title: 'Change your avatar', text: 'Select your avatar, choose a new image and wait for upload confirmation. If it does not update, check the message and try a smaller image.' },
          { title: 'Change your password and sign out', text: 'In Profile → Security, enter your current password, a new password and its confirmation. Sign in again after a successful change. On shared computers, open the account menu and Sign out when finished.' },
        ], note: 'Switch VI / EN in navigation. Never share passwords, reset links or screenshots containing session cookies.', link: { href: '/me', label: 'Open my profile' } },
    ] satisfies GuideTopic[],
  },
};

export function normalizeGuideSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}

export function matchesGuideSearch(text: string, query: string) {
  const haystack = normalizeGuideSearch(text);
  return normalizeGuideSearch(query).split(/\s+/).every(word => haystack.includes(word));
}
