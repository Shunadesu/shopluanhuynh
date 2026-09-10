import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useNotifications } from '../hooks';

const STORAGE_KEY = 'notification_dismissed';
const STORAGE_TIME_KEY = 'notification_dismissed_time';

export default function NotificationModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  // Fetch active notifications
  const { data: notifications } = useNotifications();

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const notification = notifications[0]; // Get first active notification

      // Check if user has dismissed this notification within dismiss duration
      const dismissedData = localStorage.getItem(STORAGE_KEY);
      const dismissedTime = localStorage.getItem(STORAGE_TIME_KEY);

      if (dismissedData && dismissedTime) {
        const hoursPassed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
        const dismissDuration = notification.dismissDuration || 24;

        // If same notification and within duration, don't show
        if (dismissedData === notification._id && hoursPassed < dismissDuration) {
          return;
        }
      }

      // If notification is not dismissible, always show
      if (!notification.dismissible) {
        // Clear any previous dismissal for this notification
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_TIME_KEY);
      }

      setCurrentNotification(notification);
      setIsVisible(true);
    }
  }, [notifications]);

  const handleDismiss = () => {
    if (currentNotification) {
      // Save to localStorage with timestamp
      localStorage.setItem(STORAGE_KEY, currentNotification._id);
      localStorage.setItem(STORAGE_TIME_KEY, Date.now().toString());
    }
    setIsVisible(false);
  };

  if (!isVisible || !currentNotification) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={currentNotification.dismissible ? handleDismiss : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-dark-lighter rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Close button */}
        {currentNotification.dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-10 p-2 bg-black/30 hover:bg-black/50 dark:bg-dark/50 dark:hover:bg-dark rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 text-center">
            {currentNotification.title}
          </h2>

          {/* Image */}
          {currentNotification.image && (
            <div className="relative mb-4 overflow-hidden rounded-xl">
              <img
                src={currentNotification.image}
                alt={currentNotification.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Content - supports HTML */}
          <div
            className="text-slate-600 dark:text-slate-300 text-center leading-relaxed"
            dangerouslySetInnerHTML={{ __html: currentNotification.content }}
          />

          {/* Dismiss checkbox */}
          {currentNotification.dismissible && (
            <label className="flex items-center justify-center gap-2 mt-6 cursor-pointer group">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    handleDismiss();
                  }
                }}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                Đóng trong 24 giờ
              </span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
