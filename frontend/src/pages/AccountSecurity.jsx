import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { useSettings, useSocialLinks } from '../hooks';
import { 
  FiShield, 
  FiCheckCircle,
  FiChevronRight,
  FiMessageCircle,
  FiStar
} from 'react-icons/fi';

const AccountSecurity = () => {
  const { data: settings } = useSettings();
  const { data: socialLinks } = useSocialLinks();

  // Lấy link Facebook từ socialLinks
  const facebookLink = socialLinks?.find(link => link.platform === 'facebook')?.url || '#';

  const accountInfo = [
    'Tên đăng nhập & mật khẩu',
    'Thông tin tài khoản (bao gồm mật khẩu cấp 2 & câu hỏi bảo mật)',
    'Mật khẩu cấp 2 & câu trả lời bảo mật giúp đặt lại mật khẩu cấp 2 tại resetpass.fo4.garena.vn'
  ];

  const securityNotes = [
    'Ngay sau khi mua, hãy đổi mật khẩu cấp 2 & câu hỏi bảo mật để tránh rủi ro.',
    'Ghi nhớ thông tin mới để không bị mất quyền truy cập.'
  ];

  return (
    <>
      <SEOHead
        title="Hướng dẫn bảo mật tài khoản Garena - Shopluanhuynh"
        description="Hướng dẫn bảo mật tài khoản Garena sau khi mua. Đổi mật khẩu cấp 2, câu hỏi bảo mật để đảm bảo an toàn tuyệt đối."
      />

      <div className="min-h-screen bg-white dark:bg-dark pt-20 pb-8">
        <div className="container-custom max-w-3xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl mb-3">
              <FiShield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Hướng Dẫn Bảo Mật Tài Khoản Garena – Đảm Bảo An Toàn Tuyệt Đối
            </h1>
          </div>

          {/* Bước 1 */}
          <div className="mb-4">
            <div className="bg-slate-50 dark:bg-dark-light rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                Bước 1: Kiểm Tra Tài Khoản Sau Khi Mua
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                Sau khi hoàn tất giao dịch, hãy đăng nhập vào <span className="font-semibold text-primary">account.garena.com</span> để kiểm tra thông tin tài khoản.
              </p>

              <div className="bg-white dark:bg-dark rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                <p className="font-semibold text-sm text-slate-900 dark:text-white mb-2">
                  Thông tin tài khoản bao gồm:
                </p>
                <ul className="space-y-2">
                  {accountInfo.map((info, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <FiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{info}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bước 2 */}
          <div className="mb-4">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl border border-orange-200 dark:border-orange-800 p-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                Bước 2: Thay Đổi Mật Khẩu Để Đảm Bảo An Toàn
              </h2>
              <ul className="space-y-2">
                {securityNotes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-600 dark:text-orange-500 font-bold flex-shrink-0">🔹</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Chat Support CTA */}
          <div className="mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-2">
                <FiMessageCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                🎯 Có thắc mắc? Nhấn vào nút chat để được Admin hỗ trợ ngay!
              </p>
              {settings?.contactPhone && (
                <a
                  href={`tel:${settings.contactPhone}`}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  <FiMessageCircle className="w-4 h-4" />
                  Liên hệ Admin ngay
                </a>
              )}
            </div>
          </div>

          {/* Review CTA */}
          <div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl border border-primary/20 p-5 text-center">
              <div className="inline-flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                ⭐ Đánh Giá & Ủng Hộ Shop
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                Nếu hài lòng với dịch vụ, hãy dành ít phút để đánh giá 5 sao giúp shop trên fanpage!
              </p>
              <a
                href={facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <FiStar className="w-4 h-4" />
                📢 Nhấn vào đây để đánh giá ngay
                <FiChevronRight className="w-4 h-4" />
              </a>
              <p className="text-sm font-semibold text-primary mt-3">
                💖 Cảm ơn bạn đã tin tưởng và ủng hộ! 💖
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSecurity;
