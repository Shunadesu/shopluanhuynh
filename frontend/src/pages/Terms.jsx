import SEOHead from '../components/SEOHead';
import { 
  FiFileText, 
  FiCheckCircle, 
  FiAlertTriangle,
  FiRefreshCw,
  FiUserCheck,
  FiDollarSign
} from 'react-icons/fi';

const Terms = () => {
  const sections = [
    {
      icon: FiFileText,
      title: 'Điều khoản chung',
      content: [
        {
          subtitle: 'Chấp nhận điều khoản',
          text: 'Khi sử dụng dịch vụ của Shopluanhuynh, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.'
        },
        {
          subtitle: 'Thay đổi điều khoản',
          text: 'Chúng tôi có quyền cập nhật hoặc thay đổi các điều khoản này bất kỳ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website. Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.'
        },
        {
          subtitle: 'Độ tuổi sử dụng',
          text: 'Bạn phải đủ 18 tuổi hoặc có sự đồng ý của cha mẹ/người giám hộ hợp pháp để sử dụng dịch vụ và thực hiện giao dịch trên website.'
        }
      ]
    },
    {
      icon: FiUserCheck,
      title: 'Tài khoản người dùng',
      content: [
        {
          subtitle: 'Đăng ký tài khoản',
          text: 'Bạn cần cung cấp thông tin chính xác, đầy đủ khi đăng ký. Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động diễn ra dưới tài khoản của mình.'
        },
        {
          subtitle: 'Trách nhiệm người dùng',
          text: 'Bạn không được sử dụng tài khoản cho mục đích bất hợp pháp, vi phạm quyền lợi của người khác, hoặc gây tổn hại đến hệ thống. Mỗi người chỉ được đăng ký một tài khoản.'
        },
        {
          subtitle: 'Đình chỉ tài khoản',
          text: 'Chúng tôi có quyền đình chỉ hoặc xóa tài khoản nếu phát hiện hành vi gian lận, vi phạm điều khoản hoặc các hoạt động đáng ngờ mà không cần thông báo trước.'
        }
      ]
    },
    {
      icon: FiCheckCircle,
      title: 'Giao dịch và thanh toán',
      content: [
        {
          subtitle: 'Quy trình thanh toán',
          text: 'Tất cả giao dịch phải được thanh toán thông qua số dư tài khoản. Bạn cần nạp tiền vào tài khoản trước khi thực hiện mua hàng. Chúng tôi không chịu trách nhiệm với các khoản thanh toán ngoài hệ thống chính thức.'
        },
        {
          subtitle: 'Giá cả',
          text: 'Giá của tài khoản game có thể thay đổi bất kỳ lúc nào. Giá hiển thị tại thời điểm bạn đặt hàng là giá cuối cùng được áp dụng.'
        },
        {
          subtitle: 'Xác nhận đơn hàng',
          text: 'Sau khi thanh toán thành công, đơn hàng sẽ được xử lý tự động. Thông tin tài khoản game sẽ hiển thị ngay trong mục "Tài khoản đã mua" của bạn.'
        },
        {
          subtitle: 'Nạp tiền',
          text: 'Yêu cầu nạp tiền sẽ được xử lý trong vòng 5-30 phút trong giờ hành chính. Nếu quá thời gian trên mà chưa được duyệt, vui lòng liên hệ bộ phận hỗ trợ.'
        }
      ]
    },
    {
      icon: FiRefreshCw,
      title: 'Chính sách đổi trả và hoàn tiền',
      content: [
        {
          subtitle: 'Điều kiện đổi trả',
          text: 'Tài khoản game chỉ được đổi trả trong trường hợp thông tin không chính xác so với mô tả, tài khoản bị khóa do lỗi từ nhà cung cấp, hoặc không thể đăng nhập được. Yêu cầu phải được gửi trong vòng 24 giờ kể từ khi mua.'
        },
        {
          subtitle: 'Trường hợp không được hoàn tiền',
          text: 'Không hoàn tiền nếu tài khoản bị khóa do vi phạm chính sách của game, bạn đã thay đổi thông tin tài khoản, hoặc đã sử dụng tài khoản quá 24 giờ mà không có khiếu nại.'
        },
        {
          subtitle: 'Quy trình hoàn tiền',
          text: 'Nếu yêu cầu hoàn tiền được chấp nhận, số tiền sẽ được hoàn lại vào số dư tài khoản của bạn trong vòng 24-48 giờ. Chúng tôi không hoàn tiền ra ngoài hệ thống.'
        },
        {
          subtitle: 'Chính sách đổi tài khoản',
          text: 'Trong một số trường hợp đặc biệt, chúng tôi có thể hỗ trợ đổi sang tài khoản tương đương thay vì hoàn tiền, tùy thuộc vào tình trạng tồn kho.'
        }
      ]
    },
    {
      icon: FiAlertTriangle,
      title: 'Giới hạn trách nhiệm',
      content: [
        {
          subtitle: 'Tính chính xác của thông tin',
          text: 'Chúng tôi cố gắng cung cấp thông tin tài khoản chính xác nhất. Tuy nhiên, một số thông tin có thể thay đổi do cập nhật từ nhà phát hành game. Chúng tôi không chịu trách nhiệm với các thay đổi này sau khi giao dịch hoàn tất.'
        },
        {
          subtitle: 'Sự cố kỹ thuật',
          text: 'Chúng tôi không chịu trách nhiệm với các thiệt hại phát sinh do sự cố kỹ thuật, lỗi hệ thống, gián đoạn dịch vụ hoặc các sự kiện bất khả kháng.'
        },
        {
          subtitle: 'Trách nhiệm người mua',
          text: 'Sau khi nhận tài khoản, bạn có trách nhiệm bảo mật thông tin đăng nhập, thay đổi mật khẩu và tuân thủ điều khoản của nhà phát hành game. Chúng tôi không chịu trách nhiệm nếu tài khoản bị mất do lỗi của bạn.'
        },
        {
          subtitle: 'Chính sách của bên thứ ba',
          text: 'Việc sử dụng tài khoản game phải tuân thủ điều khoản và chính sách của nhà phát hành. Chúng tôi không chịu trách nhiệm nếu tài khoản bị xử lý do vi phạm quy định của game.'
        }
      ]
    },
    {
      icon: FiDollarSign,
      title: 'Sở hữu trí tuệ',
      content: [
        {
          subtitle: 'Quyền sở hữu nội dung',
          text: 'Tất cả nội dung trên website bao gồm văn bản, hình ảnh, logo, thiết kế giao diện đều thuộc quyền sở hữu của Shopluanhuynh. Bạn không được sao chép, phân phối hoặc sử dụng cho mục đích thương mại mà không có sự cho phép.'
        },
        {
          subtitle: 'Quyền sử dụng',
          text: 'Khi mua tài khoản game, bạn chỉ được quyền sử dụng cá nhân. Bạn không được bán lại, cho thuê hoặc chuyển nhượng tài khoản cho bên thứ ba dưới bất kỳ hình thức nào.'
        },
        {
          subtitle: 'Nội dung người dùng',
          text: 'Bất kỳ nội dung nào bạn gửi lên website (đánh giá, bình luận) sẽ được coi là bạn cấp cho chúng tôi quyền sử dụng, chỉnh sửa và hiển thị công khai.'
        }
      ]
    }
  ];

  return (
    <>
      <SEOHead
        title="Điều khoản sử dụng - Shopluanhuynh"
        description="Điều khoản và điều kiện sử dụng dịch vụ tại Shopluanhuynh. Quyền và trách nhiệm của người mua và người bán."
      />

      <div className="min-h-screen bg-white dark:bg-dark pt-20 pb-12">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl mb-4">
              <FiFileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Điều khoản sử dụng
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Vui lòng đọc kỹ các điều khoản và điều kiện trước khi sử dụng dịch vụ. Việc sử dụng dịch vụ đồng nghĩa với việc bạn chấp nhận các điều khoản này.
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

          {/* Important notice */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-amber-500/10 rounded-2xl border border-amber-500/20 p-8">
              <div className="flex items-start gap-3 mb-4">
                <FiAlertTriangle className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    Lưu ý quan trọng
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    Bằng cách tiếp tục sử dụng dịch vụ của chúng tôi, bạn xác nhận rằng đã đọc, hiểu và đồng ý với tất cả các điều khoản được nêu trên.
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Nếu bạn có bất kỳ câu hỏi nào về điều khoản sử dụng, vui lòng liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;
