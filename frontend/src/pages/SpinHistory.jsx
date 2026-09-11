import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpinHistory } from '../hooks/useSpin';
import { FiArrowLeft, FiCalendar } from 'react-icons/fi';
import { GiSpinningBlades, GiTrophy, GiTicket } from 'react-icons/gi';
import Loading from '../components/Loading';

const SpinHistory = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, loading, error } = useSpinHistory(page, 20);

  if (loading && !data) {
    return <Loading />;
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRewardIcon = (type) => {
    switch (type) {
      case 'cash':
        return <span className="text-2xl">💰</span>;
      case 'account':
        return <GiTrophy className="w-6 h-6 text-purple-500" />;
      case 'voucher':
        return <GiTicket className="w-6 h-6 text-orange-500" />;
      default:
        return <span className="text-2xl">😢</span>;
    }
  };



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark pt-20 pb-12">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/spin')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FiArrowLeft />
            <span>Quay lại</span>
          </button>

          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <GiSpinningBlades />
            Lịch sử quay
          </h1>

          <div className="w-24"></div>
        </div>

        {/* History List */}
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : !data?.history || data.history.length === 0 ? (
          <div className="bg-white dark:bg-dark-light rounded-xl p-12 text-center">
            <GiSpinningBlades className="w-20 h-20 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Bạn chưa có lịch sử quay nào
            </p>
            <button
              onClick={() => navigate('/spin')}
              className="mt-4 btn-primary"
            >
              Đi quay ngay
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {data.history.map((item) => (
                <div
                  key={item._id}
                  className="bg-white dark:bg-dark-light rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      {getRewardIcon(item.rewardType)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                            {item.rewardLabel}
                          </h3>

                          {/* Reward Details */}
                          {item.rewardType === 'cash' && (
                            <p className="text-green-600 dark:text-green-400 font-bold text-xl">
                              +{item.rewardValue?.toLocaleString('vi-VN')}đ
                            </p>
                          )}

                          {item.rewardType === 'voucher' && item.voucherCode && (
                            <div className="mt-2">
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Mã: <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{item.voucherCode}</span>
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Giảm {item.voucherDiscount}%
                              </p>
                            </div>
                          )}

                          {item.rewardType === 'account' && item.accountId && (
                            <div className="mt-2">
                              <p className="text-purple-600 dark:text-purple-400 font-semibold">
                                {item.accountId.title}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {item.accountId.price?.toLocaleString('vi-VN')}đ
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <FiCalendar className="w-4 h-4" />
                        <span>{formatDate(item.spinAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.pagination && data.pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Trước
                </button>

                <span className="px-4 py-2 text-slate-600 dark:text-slate-400">
                  Trang {page} / {data.pagination.pages}
                </span>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.pagination.pages}
                  className="px-4 py-2 bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SpinHistory;
