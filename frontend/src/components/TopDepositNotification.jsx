import { FiTrendingUp } from 'react-icons/fi';

const TopDepositNotification = ({ notifications }) => {
  if (!notifications || notifications.length === 0) return null;

  const topDepositNotifications = notifications.filter(n => n.type === 'top_deposit');

  if (topDepositNotifications.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-primary-dark/20 to-primary/20 border border-primary/30 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <FiTrendingUp className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-2 flex items-center">
            <span className="animate-pulse mr-2">🔥</span>
            Thông báo nạp tiền
          </h3>
          <div className="space-y-2">
            {topDepositNotifications.map((notification) => (
              <p key={notification._id} className="text-slate-300 text-sm">
                {notification.content}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopDepositNotification;
