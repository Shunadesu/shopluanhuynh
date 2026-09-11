import SEOHead from '../components/SEOHead';
import { 
  FiShield, 
  FiLock, 
  FiDatabase, 
  FiUsers,
  FiEye,
  FiFileText
} from 'react-icons/fi';

const Privacy = () => {
  const sections = [
    {
      icon: FiDatabase,
      title: 'Thông tin chúng tôi thu thập',
      content: [
        {
          subtitle: 'Thông tin cá nhân',
          text: 'Khi bạn đăng ký tài khoản, chúng tôi thu thập thông tin như: họ tên, địa chỉ email, số điện thoại và thông tin thanh toán. Thông tin này được sử dụng để xác thực tài khoản và xử lý giao dịch của bạn.'
        },
        {
          subtitle: 'Thông tin giao dịch',
          text: 'Chúng tôi lưu trữ lịch sử giao dịch, đơn hàng và thông tin thanh toán để phục vụ việc quản lý tài khoản và giải quyết tranh chấp nếu có.'
        },
        {
          subtitle: 'Thông tin thiết bị',
          text: 'Địa chỉ IP, loại trình duyệt, thời gian truy cập và các thông tin kỹ thuật khác được thu thập tự động để cải thiện trải nghiệm người dùng và bảo mật hệ thống.'
        }
      ]
    },
    {
      icon: FiLock,
      title: 'Cách chúng tôi sử dụng thông tin',
      content: [
        {
          subtitle: 'Xử lý giao dịch',
          text: 'Thông tin của bạn được sử dụng để xác minh và xử lý các giao dịch mua tài khoản game, nạp tiền và các dịch vụ liên quan.'
        },
        {
          subtitle: 'Cải thiện dịch vụ',
          text: 'Chúng tôi phân tích hành vi người dùng để tối ưu hóa giao diện, tính năng và cải thiện chất lượng dịch vụ.'
        },
        {
          subtitle: 'Liên lạc',
          text: 'Gửi thông báo về giao dịch, cập nhật tài khoản, khuyến mãi và các thông tin quan trọng liên quan đến dịch vụ.'
        },
        {
          subtitle: 'Bảo mật',
          text: 'Giám sát và phát hiện các hoạt động bất thường, gian lận để bảo vệ tài khoản của bạn và hệ thống.'
        }
      ]
    },
    {
      icon: FiShield,
      title: 'Bảo mật thông tin',
      content: [
        {
          subtitle: 'Mã hóa dữ liệu',
          text: 'Tất cả thông tin nhạy cảm được mã hóa bằng công nghệ SSL/TLS khi truyền tải và lưu trữ an toàn trên hệ thống.'
        },
        {
          subtitle: 'Kiểm soát truy cập',
          text: 'Chỉ nhân viên có thẩm quyền mới được truy cập thông tin cá nhân của bạn, và họ phải tuân thủ nghiêm ngặt các quy định về bảo mật.'
        },
        {
          subtitle: 'Sao lưu định kỳ',
          text: 'Dữ liệu được sao lưu thường xuyên để đảm bảo an toàn và có thể khôi phục trong trường hợp sự cố.'
        }
      ]
    },
    {
      icon: FiUsers,
      title: 'Chia sẻ thông tin',
      content: [
        {
          subtitle: 'Bên thứ ba',
          text: 'Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn. Thông tin chỉ được chia sẻ với đối tác thanh toán khi cần thiết để xử lý giao dịch.'
        },
        {
          subtitle: 'Yêu cầu pháp lý',
          text: 'Chúng tôi có thể tiết lộ thông tin khi được yêu cầu bởi pháp luật, lệnh của tòa án hoặc cơ quan chức năng.'
        },
        {
          subtitle: 'Chuyển nhượng doanh nghiệp',
          text: 'Trong trường hợp sáp nhập, mua lại hoặc chuyển nhượng, thông tin của bạn có thể được chuyển giao cho bên thứ ba với các cam kết bảo mật tương tự.'
        }
      ]
    },
    {
      icon: FiEye,
      title: 'Cookie và theo dõi',
      content: [
        {
          subtitle: 'Sử dụng Cookie',
          text: 'Chúng tôi sử dụng cookie để lưu trữ tùy chọn của bạn (như chế độ giao diện tối/sáng), duy trì phiên đăng nhập và phân tích lưu lượng truy cập.'
        },
        {
          subtitle: 'Công cụ phân tích',
          text: 'Chúng tôi có thể sử dụng các công cụ phân tích của bên thứ ba để hiểu cách người dùng tương tác với website.'
        },
        {
          subtitle: 'Quyền kiểm soát',
          text: 'Bạn có thể tắt cookie thông qua cài đặt trình duyệt, tuy nhiên điều này có thể ảnh hưởng đến một số tính năng của website.'
        }
      ]
    },
    {
      icon: FiFileText,
      title: 'Quyền của người dùng',
      content: [
        {
          subtitle: 'Quyền truy cập',
          text: 'Bạn có quyền yêu cầu xem thông tin cá nhân mà chúng tôi lưu trữ về bạn.'
        },
        {
          subtitle: 'Quyền chỉnh sửa',
          text: 'Bạn có thể cập nhật hoặc sửa đổi thông tin cá nhân bất kỳ lúc nào thông qua trang quản lý tài khoản.'
        },
        {
          subtitle: 'Quyền xóa',
          text: 'Bạn có thể yêu cầu xóa tài khoản và thông tin cá nhân, trừ các thông tin cần thiết cho mục đích pháp lý hoặc kế toán.'
        },
        {
          subtitle: 'Quyền từ chối',
          text: 'Bạn có thể từ chối nhận email marketing bằng cách nhấn vào liên kết hủy đăng ký trong email.'
        }
      ]
    }
  ];

  return (
    <>
      <SEOHead
        title="Chính sách bảo mật - Shopluanhuynh"
        description="Tìm hiểu cách Shopluanhuynh thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn. Cam kết bảo mật và minh bạch với người dùng."
      />

      <div className="min-h-screen bg-white dark:bg-dark pt-20 pb-12">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl mb-4">
              <FiShield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Chính sách bảo mật
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Chúng tôi cam kết bảo vệ thông tin cá nhân và quyền riêng tư của bạn. Dưới đây là các chính sách chi tiết về cách chúng tôi xử lý dữ liệu của bạn.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">
              Cập nhật lần cuối: 11/09/2026
            </p>
          </div>

          {/* Sections */}
          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div 
                  key={index}
                  className="bg-slate-50 dark:bg-dark-light rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {section.content.map((item, idx) => (
                      <div key={idx}>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          {item.subtitle}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact section */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl border border-primary/20 p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Có câu hỏi về chính sách bảo mật?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Nếu bạn có bất kỳ thắc mắc hoặc yêu cầu nào liên quan đến chính sách bảo mật, vui lòng liên hệ với chúng tôi qua các kênh hỗ trợ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;
