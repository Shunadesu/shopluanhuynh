import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Loading from '../components/Loading';
import { FiDollarSign, FiCopy } from 'react-icons/fi';

const Deposit = () => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);

  // Fetch bank accounts
  const { data: bankAccounts, isLoading: banksLoading } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const res = await api.get('/deposits/bank-accounts');
      return res.data;
    }
  });

  // Fetch user info
  const { data: user } = useQuery({
    queryKey: ['user-me'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data;
    }
  });

  // Create deposit request mutation
  const depositMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/deposits/request', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Yêu cầu nạp tiền đã được gửi!');
      setAmount('');
      setSelectedBank(null);
      queryClient.invalidateQueries(['deposit-requests']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể tạo yêu cầu nạp tiền');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10,000đ');
      return;
    }

    if (!selectedBank) {
      toast.error('Vui lòng chọn ngân hàng');
      return;
    }

    depositMutation.mutate({
      amount: parseFloat(amount),
      bankAccountId: selectedBank._id,
      transferNote: `${user?.email} ${amount}`
    });
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${label}`);
  };

  if (banksLoading) return <Loading />;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Nạp tiền</h1>
          <Link to="/profile/deposits" className="text-primary hover:text-primary-light">
            Lịch sử nạp tiền →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {/* Form */}
          <div className="lg:col-span-2">
            {/* Current Balance */}
            <div className="card mb-6 bg-gradient-to-br from-primary-dark to-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 mb-2">Số dư hiện tại</p>
                  <p className="text-3xl font-bold text-white">
                    {user?.balance?.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <FiDollarSign className="w-16 h-16 text-white/30" />
              </div>
            </div>

            {/* Amount Input */}
            <div className="card mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Số tiền muốn nạp</h2>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field text-2xl font-bold text-center mb-4"
                placeholder="0"
                min="10000"
                step="10000"
              />
              <div className="grid grid-cols-3 gap-2">
                {[50000, 100000, 200000, 500000, 1000000, 2000000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    className="btn-secondary text-sm"
                  >
                    {(amt / 1000).toLocaleString('vi-VN')}K
                  </button>
                ))}
              </div>
            </div>

            {/* Bank Selection */}
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-4">Chọn tài khoản ngân hàng</h2>
              {!bankAccounts || bankAccounts.length === 0 ? (
                <p className="text-slate-400">Hiện chưa có tài khoản ngân hàng nào</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {bankAccounts.map((bank) => (
                    <div
                      key={bank._id}
                      onClick={() => setSelectedBank(bank)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedBank?._id === bank._id
                          ? 'border-primary bg-primary/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {bank.qrCodeImage && (
                          <img
                            src={bank.qrCodeImage}
                            alt={bank.bankName}
                            className="w-24 h-24 object-cover rounded"
                          />
                        )}
                        <div className="flex-grow">
                          <h3 className="text-white font-semibold mb-1">{bank.bankName}</h3>
                          <p className="text-slate-400 text-sm mb-1">
                            STK: {bank.accountNumber}
                          </p>
                          <p className="text-slate-400 text-sm mb-1">
                            Tên: {bank.accountName}
                          </p>
                          {bank.identifier && (
                            <p className="text-primary text-xs">
                              ID: {bank.identifier}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="text-xl font-bold text-white mb-4">Hướng dẫn nạp tiền</h3>

              {selectedBank && amount ? (
                <div className="space-y-2 mb-2">
                  <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">Số tiền chuyển</p>
                    <div className="flex items-center justify-between">
                      <p className="text-primary font-bold text-2xl">
                        {parseFloat(amount).toLocaleString('vi-VN')}đ
                      </p>
                      <button
                        onClick={() => copyToClipboard(amount, 'số tiền')}
                        className="p-2 hover:bg-slate-700 rounded transition-colors"
                      >
                        <FiCopy className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">Nội dung chuyển khoản</p>
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm">
                        {user?.email} {amount}
                      </p>
                      <button
                        onClick={() => copyToClipboard(`${user?.email} ${amount}`, 'nội dung')}
                        className="p-2 hover:bg-slate-700 rounded transition-colors"
                      >
                        <FiCopy className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {selectedBank.qrCodeImage && (
                    <div className="text-center">
                      <img
                        src={selectedBank.qrCodeImage}
                        alt="QR Code"
                        className="w-48 h-48 mx-auto rounded-lg"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={depositMutation.isPending}
                    className="btn-primary w-full"
                  >
                    {depositMutation.isPending ? 'Đang xử lý...' : 'Xác nhận đã chuyển'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2 text-slate-400 text-sm mb-2">
                  <p>1️⃣ Nhập số tiền muốn nạp (tối thiểu 10,000đ)</p>
                  <p>2️⃣ Chọn tài khoản ngân hàng</p>
                  <p>3️⃣ Quét mã QR hoặc chuyển khoản theo thông tin</p>
                  <p>4️⃣ Nhập đúng nội dung chuyển khoản</p>
                  <p>5️⃣ Nhấn "Xác nhận đã chuyển"</p>
                  <p>6️⃣ Chờ admin duyệt (thường trong vài phút)</p>
                </div>
              )}

              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Lưu ý: Vui lòng chuyển khoản đúng số tiền và nội dung để được duyệt nhanh nhất.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
