import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { 
  FiSearch, 
  FiShoppingCart, 
  FiCreditCard, 
  FiCheck, 
  FiKey,
  FiAlertCircle,
  FiChevronRight
} from 'react-icons/fi';

const Guide = () => {
  const steps = [
    {
      number: 1,
      icon: FiSearch,
      title: 'Tìm kiếm tài khoản',
      description: 'Duyệt qua danh mục hoặc sử dụng bộ lọc để tìm tài khoản game phù hợp với nhu cầu của bạn.',
      details: [
        'Chọn danh mục game bạn quan tâm',
        'Sử dụng bộ lọc theo giá, đội hình, BP',
        'Xem chi tiết thông tin và hình ảnh tài khoản'
      ]
    },
    {
      number: 2,
      icon: FiShoppingCart,
      title: 'Thêm vào giỏ hàng',
      description: 'Thêm các tài khoản yêu thích vào giỏ hàng hoặc mua ngay để thanh toán nhanh chóng.',
      details: [
        'Nhấn "Thêm vào giỏ" để mua nhiều tài khoản cùng lúc',
        'Chọn "Mua ngay" để thanh toán trực tiếp',
        'Kiểm tra giỏ hàng trước khi thanh toán'
      ]
    },
    {
      number: 3,
      icon: FiCreditCard,
      title: 'Thanh toán',
      description: 'Đăng nhập và sử dụng số dư tài khoản để hoàn tất giao dịch một cách an toàn.',
      details: [
        'Đăng nhập hoặc đăng ký tài khoản',
        'Nạp tiền vào tài khoản nếu số dư không đủ',
        'Xác nhận đơn hàng và hoàn tất thanh toán'
      ]
    },
    {
      number: 4,
      icon: FiKey,
      title: 'Nhận tài khoản',
      description: 'Sau khi thanh toán thành công, thông tin tài khoản sẽ hiển thị ngay lập tức.',
      details: [
        'Xem thông tin đăng nhập trong "Tài khoản đã mua"',
        'Lưu lại thông tin tài khoản an toàn',
        'Đổi mật khẩu ngay sau khi nhận để bảo mật'
      ]
    }
  ];

  const tips = [
    {
      icon: FiCheck,
      text: 'Kiểm tra kỹ thông tin tài khoản trước khi mua'
    },
    {
      icon: FiCheck,
      text: 'Đổi mật khẩu ngay sau khi nhận tài khoản'
    },
    {
      icon: FiCheck,
      text: 'Liên kết tài khoản với email và số điện thoại của bạn'
    },
    {
      icon: FiCheck,
      text: 'Không chia sẻ thông tin tài khoản với người khác'
    },
    {
      icon: FiCheck,
      text: 'Liên hệ hỗ trợ nếu gặp vấn đề với tài khoản'
    }
  ];

  return (
    <>
      <SEOHead
        title="Hướng dẫn mua hàng - Shopluanhuynh"
        description="Hướng dẫn chi tiết cách tìm kiếm, mua và nhận tài khoản game tại Shopluanhuynh. Quy trình đơn giản, nhanh chóng và an toàn."
      />

      <div className="min-h-screen bg-white dark:bg-dark pt-20 pb-12">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Hướng dẫn mua hàng
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Quy trình mua tài khoản game đơn giản chỉ với 4 bước. An toàn, nhanh chóng và tiện lợi.
            </p>
          </div>

          {/* Steps */}
          <div className="max-w-4xl mx-auto mb-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  {/* Connecting line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute left-12 top-24 w-0.5 h-full bg-slate-200 dark:bg-slate-800" />
                  )}

                  <div className="flex gap-6 mb-8 relative">
                    {/* Icon circle */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center relative z-10">
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <div className="text-center mt-2">
                        <span className="text-sm font-bold text-primary">Bước {step.number}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-slate-50 dark:bg-dark-light rounded-xl border border-slate-200 dark:border-slate-800 p-6 mt-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        {step.description}
                      </p>
                      <ul className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                            <FiChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tips section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl border border-primary/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <FiAlertCircle className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Lưu ý quan trọng
                </h2>
              </div>
              <ul className="space-y-3">
                {tips.map((tip, index) => {
                  const Icon = tip.icon;
                  return (
                    <li key={index} className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{tip.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Bạn đã sẵn sàng? Hãy bắt đầu mua sắm ngay!
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors"
            >
              Khám phá cửa hàng
              <FiChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Guide;
