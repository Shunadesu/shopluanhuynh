import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FiFacebook, FiMail, FiPhone, FiMapPin, FiGlobe } from 'react-icons/fi';

const Footer = () => {
  // Fetch settings for logo
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get('/settings');
      return data;
    },
  });

  // Fetch social links
  const { data: socialLinks } = useQuery({
    queryKey: ['social-links'],
    queryFn: async () => {
      const { data } = await api.get('/social-links');
      return data;
    },
  });

  // Component để hiển thị icon theo platform
  const PlatformIcon = ({ platform, className = "w-5 h-5" }) => {
    const icons = {
      facebook: <FiFacebook className={className} />,
      zalo: <span className={`${className} font-bold text-xs`}>Z</span>,
      youtube: <span className={`${className} font-bold text-xs`}>YT</span>,
      tiktok: <span className={`${className} font-bold text-xs`}>TK</span>,
      website: <FiGlobe className={className} />,
      other: <FiMail className={className} />,
    };
    return icons[platform] || icons.other;
  };

  return (
    <footer className="bg-dark-light border-t border-slate-800 mt-20">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              {settings?.logo ? (
                <img
                  src={settings.logo}
                  alt="Shopluanhuynh"
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">LH</span>
                </div>
              )}
              
            </Link>
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
              {settings?.contactPhone && (
                <li className="flex items-start space-x-2 text-slate-400">
                  <FiPhone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <a href={`tel:${settings.contactPhone}`} className="hover:text-primary transition-colors">
                    {settings.contactPhone}
                  </a>
                </li>
              )}
              {settings?.contactEmail && (
                <li className="flex items-start space-x-2 text-slate-400">
                  <FiMail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <a href={`mailto:${settings.contactEmail}`} className="hover:text-primary transition-colors">
                    {settings.contactEmail}
                  </a>
                </li>
              )}
              {socialLinks?.map((link) => (
                <li key={link._id} className="flex items-start space-x-2 text-slate-400">
                  <span className="w-5 h-5 text-primary mt-1 flex-shrink-0 flex items-center justify-center">
                    <PlatformIcon platform={link.platform} />
                  </span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
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
              {socialLinks?.map((link) => (
                <a
                  key={link._id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-slate-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                  title={link.name}
                >
                  <span className="text-slate-300">
                    <PlatformIcon platform={link.platform} className="w-4 h-4" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
