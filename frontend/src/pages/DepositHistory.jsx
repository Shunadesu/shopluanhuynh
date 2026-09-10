import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import { useMyDepositRequests } from '../hooks/useDeposits';
import { FiClock, FiCheckCircle, FiXCircle, FiDollarSign } from 'react-icons/fi';

const DepositHistory = () => {
  const { data: deposits, loading: isLoading } = useMyDepositRequests();

  if (isLoading) return <Loading />;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center space-x-1 bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-sm">
            <FiCheckCircle />
            <span>Đã duyệt</span>
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-sm">
            <FiClock />
            <span>Chờ duyệt</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center space-x-1 bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-sm">
            <FiXCircle />
            <span>Từ chối</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Lịch sử nạp tiền</h1>
          <div className="flex items-center space-x-2">
            <Link to="/deposit" className="btn-primary">
              Nạp tiền
            </Link>
            <Link to="/profile" className="text-primary hover:text-primary-light">
              ←
            </Link>
          </div>
        </div>

        {!deposits || deposits.length === 0 ? (
          <div className="card text-center py-20">
            <FiDollarSign className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-6">Bạn chưa có lịch sử nạp tiền</p>
            <Link to="/deposit" className="btn-primary inline-block">
              Nạp tiền ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {deposits.map((deposit) => (
              <div key={deposit._id} className="card">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="text-primary font-bold text-2xl">
                        +{deposit.amount.toLocaleString('vi-VN')}đ
                      </p>
                      {getStatusBadge(deposit.status)}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      {new Date(deposit.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                {/* Bank Info */}
                {deposit.bankAccountId && (
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 mb-4">
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Ngân hàng</p>
                    <p className="text-slate-900 dark:text-white font-semibold">
                      {deposit.bankAccountId.bankName} - {deposit.bankAccountId.accountNumber}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      {deposit.bankAccountId.accountName}
                    </p>
                  </div>
                )}

                {/* Transfer Note */}
                {deposit.transferNote && (
                  <div className="mb-4">
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Nội dung chuyển khoản:</p>
                    <p className="text-slate-700 dark:text-slate-300">{deposit.transferNote}</p>
                  </div>
                )}

                {/* Admin Note */}
                {deposit.adminNote && (
                  <div className={`p-4 rounded-lg ${
                    deposit.status === 'rejected'
                      ? 'bg-red-500/20 border border-red-500'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Ghi chú từ admin:</p>
                    <p className={deposit.status === 'rejected' ? 'text-red-400' : 'text-slate-700 dark:text-slate-300'}>
                      {deposit.adminNote}
                    </p>
                  </div>
                )}

                {/* Processed Info */}
                {deposit.processedAt && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      {deposit.status === 'approved' ? 'Đã duyệt' : 'Đã xử lý'} lúc:{' '}
                      {new Date(deposit.processedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositHistory;
