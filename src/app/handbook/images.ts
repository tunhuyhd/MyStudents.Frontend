import vi from '../../../public/handbook/vi/provenance.json';
import en from '../../../public/handbook/en/provenance.json';

export type GuideImage = { src: string; title: string; alt: string; labels: string[]; width: number; height: number };
type Caption = { topic: string; file: string; vi: [string, ...string[]]; en: [string, ...string[]] };
const captions: Caption[] = [
  { topic: 'account', file: 'account', vi: ['Tìm đường vào tài khoản', 'Nhập tên đăng nhập.', 'Lấy lại mật khẩu qua email.', 'Tạo tài khoản giáo viên nếu bạn mới bắt đầu.'],
    en: ['Find your way into your account', 'Enter your username.', 'Recover your password by email.', 'Create a teacher account if you are new.'] },
  { topic: 'students', file: 'students', vi: ['Các thao tác ở danh sách học sinh', 'Tạo hồ sơ học sinh mới.', 'Tìm hồ sơ theo tên, email hoặc số điện thoại.', 'Bấm trạng thái trên dòng để cập nhật hồ sơ.'],
    en: ['Your student workspace', 'Create a new student profile.', 'Find profiles by name, email or phone.', 'Select the row status to update the profile.'] },
  { topic: 'classes', file: 'classes', vi: ['Nhìn nhanh không gian lớp học', 'Bắt đầu tạo lớp học.', 'Tìm, lọc và sắp xếp các lớp.', 'Mở menu chỉnh sửa hoặc xóa lớp.'],
    en: ['Find your way around classes', 'Start creating a class.', 'Search, filter and sort classes.', 'Open the edit or delete menu.'] },
  { topic: 'classes', file: 'class-details', vi: ['Tạo lớp bước thông tin cơ bản', 'Đặt tên dễ nhận biết cho lớp.', 'Nhập mã lớp để phân biệt.', 'Tiếp tục sang bước lịch trình.'],
    en: ['Create a class with clear details', 'Give the class a recognizable name.', 'Enter its identifying code.', 'Continue to the schedule step.'] },
  { topic: 'classes', file: 'class-schedule', vi: ['Tạo lớp bước lịch trình', 'Chọn khoảng ngày của khóa học.', 'Chọn thứ, giờ bắt đầu và thời lượng.', 'Kiểm tra xong rồi tạo lớp.'],
    en: ['Set up the class schedule', 'Choose the course date range.', 'Choose the weekday, start time and duration.', 'Review the details and create the class.'] },
  { topic: 'enrollment', file: 'enrollment', vi: ['Chọn học sinh có sẵn để thêm vào lớp', 'Tìm trong các hồ sơ có thể thêm.', 'Chọn đúng học sinh trước khi thêm.'],
    en: ['Choose an existing student for your class', 'Search available student profiles.', 'Check the student before adding them.'] },
  { topic: 'schedule', file: 'schedule', vi: ['Làm việc với các buổi học', 'Mở tab Buổi học của lớp.', 'Ghi nhận buổi học chưa có trong danh sách.', 'Đọc ngày giờ và mở chi tiết buổi tương ứng.'],
    en: ['Work with individual lessons', 'Open the class Lessons tab.', 'Record a session that is not already listed.', 'Check the date and time, then open its details.'] },
  { topic: 'attendance', file: 'attendance', vi: ['Điểm danh từng học sinh', 'Kiểm tra tên học sinh đang điểm danh.', 'Chọn trạng thái và chờ lưu cho học sinh đó.', 'Rà soát kết quả rồi kết thúc màn hình.'],
    en: ['Take attendance one student at a time', 'Check whose attendance you are recording.', 'Choose a status and wait for that student’s save.', 'Review the results before finishing the screen.'] },
  { topic: 'profile', file: 'profile', vi: ['Cập nhật hồ sơ của bạn', 'Chọn ảnh đại diện mới.', 'Sửa họ tên và thông tin liên hệ.', 'Lưu thay đổi và chờ thông báo kết quả.'],
    en: ['Keep your profile up to date', 'Choose a new avatar.', 'Edit your name and contact details.', 'Save changes and wait for confirmation.'] },
  { topic: 'profile', file: 'security', vi: ['Đổi mật khẩu trong phần Bảo mật', 'Chuyển sang mục Bảo mật.', 'Nhập mật khẩu hiện tại và các trường mật khẩu mới.', 'Gửi thay đổi; đăng nhập lại khi thành công.'],
    en: ['Change your password under Security', 'Switch to Security.', 'Enter your current and new password fields.', 'Submit the change and sign in again after success.'] },
];

export function getGuideImages(topic: string, language: 'vi' | 'en'): GuideImage[] {
  const manifest = language === 'vi' ? vi : en;
  return captions.filter(item => item.topic === topic).map(item => {
    const [title, ...labels] = item[language];
    const entry = manifest.find(image => image.file === `${item.file}.jpg`)!;
    return { src: `/handbook/${language}/${item.file}.jpg`, title, labels,
      alt: `${title}. ${labels.map((label, i) => `${i + 1}: ${label}`).join(' ')}`,
      width: entry.dimensions[0], height: entry.dimensions[1] };
  });
}
