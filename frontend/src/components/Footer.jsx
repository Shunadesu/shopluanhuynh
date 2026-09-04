import { Link } from 'react-router-dom';
import { FiFacebook, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-dark-light border-t border-slate-800 mt-20">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">LH</span>
              </div>
              <span className="text-xl font-bold text-white">Shopluanhuynh</span>
            </div>
            <p className="text-slate-400 text-sm">
              Chuyên cung cấp tài khoản game chất lượng cao với giá cả hợp lý. Uy tín - Nhanh chóng - Bảo mật.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-400 hover:text-primary transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-slate-400 hover:text-primary transition-colors">
                  Cửa hàng
                </Link>
              </li>
              <li>
                <Link to="/deposit" className="text-slate-400 hover:text-primary transition-colors">
                  Nạp tiền
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-slate-400 hover:text-primary transition-colors">
                  Tài khoản
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                  Câu hỏi thường gặp
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-slate-400">
                <FiPhone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <a href="tel:0123456789" className="hover:text-primary transition-colors">
                  0123 456 789
                </a>
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <FiMail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <a href="mailto:support@shopluanhuynh.com" className="hover:text-primary transition-colors">
                  support@shopluanhuynh.com
                </a>
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <FiFacebook className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <a
                  href="https://facebook.com/luanhuynhfco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  fb.com/luanhuynhfco
                </a>
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <FiMapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span>Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-slate-400 text-sm">
              © 2024 <span className="text-primary font-semibold">LuanHuynhFCO</span>. All rights reserved.
            </p>
            <div className="flex items-center space-x-2">
              <a
                href="https://facebook.com/luanhuynhfco"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-slate-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
              >
                <FiFacebook className="w-4 h-4 text-slate-300" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
