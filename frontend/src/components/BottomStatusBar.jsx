import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiUser, FiCreditCard, FiUserCheck } from 'react-icons/fi';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

// Mock data for when there are no real deposits - full names
const MOCK_TOP_DEPOSITORS = [
  { fullName: 'Nguyễn Minh Tuấn', totalAmount: 2500000, isMock: true },
  { fullName: 'Trần Thanh Hà', totalAmount: 1800000, isMock: true },
  { fullName: 'Lê Hoàng Nam', totalAmount: 1500000, isMock: true },
  { fullName: 'Phạm Thu Hương', totalAmount: 1200000, isMock: true },
  { fullName: 'Hoàng Đức Anh', totalAmount: 950000, isMock: true },
  { fullName: 'Vũ Mai Phương', totalAmount: 850000, isMock: true },
  { fullName: 'Đặng Xuân Hùng', totalAmount: 720000, isMock: true },
  { fullName: 'Bùi Thị Lan', totalAmount: 680000, isMock: true },
  { fullName: 'Đỗ Văn Quang', totalAmount: 550000, isMock: true },
  { fullName: 'Lý Thị Mai', totalAmount: 480000, isMock: true },
  { fullName: 'Ngô Minh Khoa', totalAmount: 420000, isMock: true },
  { fullName: 'Phan Thị Ngọc', totalAmount: 380000, isMock: true },
  { fullName: 'Trịnh Đình Phúc', totalAmount: 350000, isMock: true },
  { fullName: 'Hồ Thị Thu', totalAmount: 320000, isMock: true },
  { fullName: 'Võ Thanh Sơn', totalAmount: 280000, isMock: true },
];

const BottomStatusBar = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [topDepositors, setTopDepositors] = useState([]);
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  // Check API connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await api.get('/health');
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      }
    };

    checkConnection();
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch top depositors
  useEffect(() => {
    const fetchTopDepositors = async () => {
      try {
        const res = await api.get('/deposits/top-depositors');
        const realDepositors = res.data.map(depositor => ({
          ...depositor,
          isMock: false
        }));

        // Merge real data with mock data
        // Real users come first, then mock data
        const allDepositors = [...realDepositors];
        
        // Add mock data if we don't have enough
        MOCK_TOP_DEPOSITORS.forEach(mock => {
          if (allDepositors.length < 10) {
            // Check if this mock amount already exists in real data
            const exists = allDepositors.some(
              d => !d.isMock && d.totalAmount === mock.totalAmount
            );
            if (!exists) {
              allDepositors.push(mock);
            }
          }
        });

        // Sort by amount descending
        allDepositors.sort((a, b) => b.totalAmount - a.totalAmount);

        // Take only top 10
        setTopDepositors(allDepositors.slice(0, 10));
      } catch (error) {
        // On error, just use mock data
        setTopDepositors(MOCK_TOP_DEPOSITORS.slice(0, 10));
      }
    };

    fetchTopDepositors();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  // Navigation items for mobile
  const navItems = [
    { path: '/', icon: FiHome, label: 'Trang chủ' },
    { path: '/shop', icon: FiUser, label: 'Tài khoản' },
    { path: '/deposit', icon: FiCreditCard, label: 'Nạp tiền' },
    { path: user ? '/profile' : '#', icon: FiUserCheck, label: user?.fullName || 'Đăng nhập' }
  ];

  // Check if current path matches
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop - Bottom Status Bar */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700/50">
        <div className="container mx-auto px-4 h-10 flex items-center justify-between gap-4">
          {/* Left side - Online status */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-300 font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Right side - Top depositors with marquee animation */}
          <div className="flex items-center space-x-4 overflow-hidden justify-start w-full">
            <span className="text-xs text-gray-400 flex-shrink-0">
              Top nạp tháng:
            </span>
            <div className="relative overflow-hidden flex-1">
              {/* Gradient fade effects */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none" />
              
              {/* Scrolling container */}
              <div className="marquee-container">
                <div className="marquee-content">
                  {topDepositors.map((depositor, index) => (
                    <span
                      key={depositor._id || `mock-${index}`}
                      className="inline-flex items-center"
                    >
                      <span className="text-xs text-gray-300">
                        {depositor.fullName}
                      </span>
                      <span className={`text-xs font-semibold mx-1 ${depositor.isMock ? 'text-amber-400' : 'text-green-400'}`}>
                        {formatCurrency(depositor.totalAmount)}
                      </span>
                      <span className="text-gray-600 mx-2">•</span>
                    </span>
                  ))}
                  {/* Duplicate for seamless loop */}
                  {topDepositors.map((depositor, index) => (
                    <span
                      key={`dup-${depositor._id || index}`}
                      className="inline-flex items-center"
                    >
                      <span className="text-xs text-gray-300">
                        {depositor.fullName}
                      </span>
                      <span className={`text-xs font-semibold mx-1 ${depositor.isMock ? 'text-amber-400' : 'text-green-400'}`}>
                        {formatCurrency(depositor.totalAmount)}
                      </span>
                      <span className="text-gray-600 mx-2">•</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile - Footer Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path === '#' ? (isAuthenticated ? '/profile' : '/') : item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  active 
                    ? 'text-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Marquee Animation Styles */}
      <style>{`
        .marquee-container {
          overflow: hidden;
          white-space: nowrap;
        }
        
        .marquee-content {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
        
        .marquee-content:hover {
          animation-play-state: paused;
        }
        
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </>
  );
};

export default BottomStatusBar;
