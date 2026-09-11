import { useState } from 'react';
import SEOHead from '../components/SEOHead';
import { 
  FiHelpCircle, 
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      category: 'Tài khoản và đăng ký',
      questions: [
        {
          q: 'Làm thế nào để đăng ký tài khoản?',
          a: 'Bạn có thể đăng ký tài khoản bằng cách nhấn nút "Đăng ký" ở góc trên bên phải, sau đó điền đầy đủ thông tin bao gồm họ tên, email, số điện thoại và mật khẩu. Sau khi đăng ký thành công, bạn có thể đăng nhập và bắt đầu sử dụng dịch vụ.'
        },
        {
          q: 'Tôi quên mật khẩu, phải làm sao?',
          a: 'Tại trang đăng nhập, nhấn vào "Quên mật khẩu" và nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu đến email của bạn. Kiểm tra cả hộp thư spam nếu không thấy email.'
        },
        {
          q: 'Tôi có thể thay đổi thông tin cá nhân không?',
          a: 'Có, bạn có thể cập nhật thông tin cá nhân (họ tên, số điện thoại) trong phần "Tài khoản" của bạn. Tuy nhiên, email đăng ký không thể thay đổi sau khi tài khoản được tạo.'
        },
        {
          q: 'Một người có thể đăng ký nhiều tài khoản không?',
          a: 'Không, theo điều khoản sử dụng của chúng tôi, mỗi người chỉ được đăng ký một tài khoản duy nhất. Nếu phát hiện tài khoản trùng lặp, chúng tôi có quyền đình chỉ hoặc xóa tài khoản vi phạm.'
        }
      ]
    },
    {
      category: 'Thanh toán và nạp tiền',
      questions: [
        {
          q: 'Các phương thức nạp tiền được hỗ trợ?',
          a: 'Chúng tôi hỗ trợ nạp tiền qua chuyển khoản ngân hàng và quét mã QR. Bạn chỉ cần chọn phương thức phù hợp, nhập số tiền và làm theo hướng dẫn. Sau khi chuyển khoản, hãy chờ hệ thống xác nhận (5-30 phút).'
        },
        {
          q: 'Nạp tiền mất bao lâu để được duyệt?',
          a: 'Thời gian xử lý nạp tiền thường từ 5-30 phút trong giờ hành chính (8h-22h). Nếu nạp tiền ngoài giờ, yêu cầu sẽ được xử lý vào sáng hôm sau. Nếu quá thời gian trên mà chưa được duyệt, vui lòng liên hệ hỗ trợ.'
        },
        {
          q: 'Có mức nạp tối thiểu không?',
          a: 'Có, mức nạp tối thiểu thường là 10,000đ để tối ưu chi phí xử lý giao dịch. Mức nạp tối đa có thể thay đổi tùy thuộc vào phương thức thanh toán.'
        },
        {
          q: 'Tôi chuyển nhầm số tiền hoặc chuyển thiếu thì sao?',
          a: 'Nếu chuyển thiếu, số tiền đó sẽ được cộng vào tài khoản của bạn theo đúng số tiền đã chuyển. Nếu chuyển thừa, bạn có thể liên hệ hỗ trợ để được tư vấn. Không hoàn tiền ra ngoài hệ thống, số dư sẽ được giữ lại trong tài khoản.'
        },
        {
          q: 'Tôi có thể rút tiền từ tài khoản không?',
          a: 'Hiện tại chúng tôi chưa hỗ trợ tính năng rút tiền. Số dư trong tài khoản chỉ có thể sử dụng để mua tài khoản game trên hệ thống.'
        }
      ]
    },
    {
      category: 'Mua hàng và giao dịch',
      questions: [
        {
          q: 'Làm thế nào để mua tài khoản game?',
          a: 'Bạn có thể duyệt danh mục, chọn tài khoản yêu thích, sau đó nhấn "Thêm vào giỏ" hoặc "Mua ngay". Đảm bảo bạn đã đăng nhập và có đủ số dư trong tài khoản. Sau khi thanh toán, thông tin tài khoản sẽ hiển thị ngay lập tức.'
        },
        {
          q: 'Tôi có thể mua nhiều tài khoản cùng lúc không?',
          a: 'Có, bạn có thể thêm nhiều tài khoản vào giỏ hàng và thanh toán một lần. Tuy nhiên, hãy đảm bảo số dư tài khoản của bạn đủ để thanh toán tổng giá trị đơn hàng.'
        },
        {
          q: 'Tôi có thể hủy đơn hàng sau khi đã thanh toán không?',
          a: 'Không, do tính chất đặc thù của sản phẩm số, đơn hàng không thể hủy sau khi thanh toán thành công và thông tin tài khoản đã được hiển thị. Vui lòng kiểm tra kỹ trước khi xác nhận thanh toán.'
        },
        {
          q: 'Thông tin tài khoản game sẽ được gửi như thế nào?',
          a: 'Sau khi thanh toán thành công, thông tin đăng nhập (tên tài khoản, mật khẩu) sẽ hiển thị ngay trên trang web trong phần "Tài khoản đã mua". Bạn nên lưu lại thông tin này ngay và đổi mật khẩu sau khi đăng nhập lần đầu.'
        },
        {
          q: 'Tài khoản đã mua có thể sử dụng ngay không?',
          a: 'Có, tất cả tài khoản được bán đều có thể sử dụng ngay lập tức. Bạn chỉ cần đăng nhập vào game với thông tin được cung cấp. Nếu không đăng nhập được, vui lòng liên hệ hỗ trợ ngay.'
        }
      ]
    },
    {
      category: 'Bảo mật và an toàn',
      questions: [
        {
          q: 'Thông tin tài khoản game của tôi có an toàn không?',
          a: 'Chúng tôi cam kết bảo mật tuyệt đối thông tin tài khoản. Tuy nhiên, sau khi nhận tài khoản, bạn nên đổi mật khẩu ngay lập tức và liên kết với email/số điện thoại của bạn để tăng cường bảo mật.'
        },
        {
          q: 'Làm thế nào để bảo vệ tài khoản người dùng của tôi?',
          a: 'Sử dụng mật khẩu mạnh, không chia sẻ thông tin đăng nhập với người khác, không đăng nhập trên thiết bị công cộng, và luôn đăng xuất sau khi sử dụng. Nếu phát hiện hoạt động bất thường, hãy đổi mật khẩu ngay.'
        },
        {
          q: 'Tôi có thể tin tưởng vào chất lượng tài khoản không?',
          a: 'Chúng tôi cam kết cung cấp tài khoản đúng mô tả và có thể sử dụng. Tuy nhiên, do đặc thù của game, một số thông tin (điểm BP, rank) có thể thay đổi nhẹ do cập nhật từ nhà phát hành. Nếu có sai lệch nghiêm trọng, bạn có thể yêu cầu hỗ trợ trong 24 giờ.'
        }
      ]
    },
    {
      category: 'Chính sách đổi trả',
      questions: [
        {
          q: 'Tôi có thể đổi trả tài khoản đã mua không?',
          a: 'Tài khoản chỉ được đổi trả trong các trường hợp: thông tin không đúng mô tả, không đăng nhập được do lỗi từ nhà cung cấp, hoặc tài khoản bị khóa sẵn. Yêu cầu phải được gửi trong vòng 24 giờ kể từ khi mua.'
        },
        {
          q: 'Những trường hợp nào không được hoàn tiền?',
          a: 'Không hoàn tiền nếu: bạn đã thay đổi thông tin tài khoản, tài khoản bị khóa do vi phạm chính sách game, đã sử dụng quá 24 giờ mà không khiếu nại, hoặc lý do đổi trả không hợp lệ.'
        },
        {
          q: 'Quy trình đổi trả diễn ra như thế nào?',
          a: 'Liên hệ bộ phận hỗ trợ qua các kênh chính thức, cung cấp mã đơn hàng và mô tả vấn đề kèm bằng chứng (ảnh chụp màn hình). Đội ngũ sẽ kiểm tra và xử lý trong vòng 24-48 giờ. Nếu được chấp nhận, tiền sẽ được hoàn lại vào tài khoản của bạn.'
        },
        {
          q: 'Tôi có thể đổi sang tài khoản khác không?',
          a: 'Trong một số trường hợp đặc biệt, chúng tôi có thể hỗ trợ đổi sang tài khoản tương đương thay vì hoàn tiền, tùy thuộc vào tình trạng tồn kho và sự đồng ý của bạn.'
        }
      ]
    },
    {
      category: 'Hỗ trợ khách hàng',
      questions: [
        {
          q: 'Làm thế nào để liên hệ hỗ trợ?',
          a: 'Bạn có thể liên hệ qua các kênh: nút chat trực tuyến trên website, số điện thoại hotline, email, hoặc các kênh mạng xã hội được liệt kê ở phần footer. Chúng tôi sẽ phản hồi nhanh nhất có thể.'
        },
        {
          q: 'Thời gian hỗ trợ là khi nào?',
          a: 'Đội ngũ hỗ trợ làm việc từ 8h00 đến 22h00 hàng ngày. Các yêu cầu gửi ngoài giờ sẽ được xử lý vào sáng hôm sau. Đối với vấn đề khẩn cấp, vui lòng liên hệ qua hotline.'
        },
        {
          q: 'Tôi không nhận được phản hồi từ hỗ trợ?',
          a: 'Kiểm tra hộp thư spam nếu liên hệ qua email. Nếu gửi qua chat/form, hãy đảm bảo đã nhập đúng thông tin liên lạc. Thông thường phản hồi sẽ được gửi trong vòng 1-4 giờ trong giờ làm việc.'
        }
      ]
    }
  ];

  return (
    <>
      <SEOHead
        title="Câu hỏi thường gặp (FAQ) - Shopluanhuynh"
        description="Tìm câu trả lời cho các câu hỏi thường gặp về đăng ký, thanh toán, mua hàng và chính sách tại Shopluanhuynh."
      />

      <div className="min-h-screen bg-white dark:bg-dark pt-20 pb-12">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl mb-4">
              <FiHelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Câu hỏi thường gặp
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Tìm câu trả lời nhanh chóng cho các câu hỏi phổ biến về dịch vụ của chúng tôi.
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="max-w-4xl mx-auto space-y-8">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                {/* Category Title */}
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  {category.category}
                </h2>

                {/* Questions */}
                <div className="space-y-3">
                  {category.questions.map((faq, questionIndex) => {
                    const globalIndex = `${categoryIndex}-${questionIndex}`;
                    const isOpen = openIndex === globalIndex;

                    return (
                      <div
                        key={globalIndex}
                        className="bg-slate-50 dark:bg-dark-light rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all"
                      >
                        {/* Question Button */}
                        <button
                          onClick={() => toggleAccordion(globalIndex)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <span className="text-lg font-semibold text-slate-900 dark:text-white pr-4">
                            {faq.q}
                          </span>
                          {isOpen ? (
                            <FiChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                          ) : (
                            <FiChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          )}
                        </button>

                        {/* Answer */}
                        {isOpen && (
                          <div className="px-6 pb-4 pt-0">
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {faq.a}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Still have questions */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl border border-primary/20 p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Vẫn còn thắc mắc?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Nếu bạn không tìm thấy câu trả lời mình cần, đừng ngại liên hệ với đội ngũ hỗ trợ của chúng tôi. Chúng tôi luôn sẵn sàng giúp đỡ bạn!
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors"
                >
                  Liên hệ hỗ trợ
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;
