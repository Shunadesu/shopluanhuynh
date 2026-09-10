import { FiX, FiAlertCircle } from 'react-icons/fi';

export default function BuyNowModal({ isOpen, onClose, account, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Xác nhận mua tài khoản</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Account Info */}
          <div className="border rounded-xl p-4 bg-gradient-to-br from-primary/5 to-primary/10">
            <h3 className="font-semibold text-gray-900 mb-2">{account?.title}</h3>
            <p className="text-3xl font-bold text-primary">
              {account?.price?.toLocaleString('vi-VN')}đ
            </p>
          </div>

          {/* Warning */}
          <div className="flex gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <FiAlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-800">
              Bạn có chắc chắn muốn mua tài khoản này? Số tiền sẽ được trừ từ số dư của bạn ngay lập tức.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận mua'}
          </button>
        </div>
      </div>
    </div>
  );
}
