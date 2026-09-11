import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wheel } from 'react-custom-roulette';
import { useSpinConfig, useMySpins, spinWheel } from '../hooks/useSpin';
import { useAuthStore } from '../store/authStore';
import { FiArrowLeft, FiRefreshCw, FiGift } from 'react-icons/fi';
import { GiSpinningBlades, GiTrophy, GiTicket } from 'react-icons/gi';
import Loading from '../components/Loading';

const SpinWheel = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuthStore();

  const { data: config, loading: configLoading } = useSpinConfig();
  const { data: mySpins, refetch: refetchSpins } = useMySpins();

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Transform config to wheel data
  const wheelData = config?.map((reward) => ({
    option: reward.label,
    style: { 
      backgroundColor: reward.color || '#FF6D00',
      textColor: '#FFFFFF'
    },
    _id: reward._id,
    rewardType: reward.rewardType,
    value: reward.value,
    voucherCode: reward.voucherCode,
    voucherDiscount: reward.voucherDiscount
  })) || [];

  const availableSpins = mySpins?.spins || 0;

  const handleSpinClick = async () => {
    if (spinning || mustSpin || availableSpins <= 0) return;

    setSpinning(true);
    const response = await spinWheel();

    if (response.success) {
      // Find the prize index
      const rewardLabel = response.data.reward.label;
      const prizeIdx = wheelData.findIndex(item => item.option === rewardLabel);
      
      if (prizeIdx !== -1) {
        setPrizeNumber(prizeIdx);
        setResult(response.data.reward);
        setMustSpin(true);
      }
    } else {
      alert(response.error);
      setSpinning(false);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setSpinning(false);
    setShowResult(true);
    
    // Refresh user data and spins
    refreshUser();
    refetchSpins();
  };

  const closeResultModal = () => {
    setShowResult(false);
    setResult(null);
  };

  if (configLoading) {
    return <Loading />;
  }

  if (!config || wheelData.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark pt-20 pb-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center py-12">
            <GiSpinningBlades className="w-24 h-24 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Vòng quay chưa khả dụng
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Hiện tại chưa có phần thưởng nào cho loại vòng quay này
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="btn-primary"
            >
              <FiArrowLeft className="inline mr-2" />
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-dark dark:via-dark-light dark:to-dark pt-20 pb-12">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FiArrowLeft />
            <span>Quay lại</span>
          </button>

          <button
            onClick={() => navigate('/spin/history')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FiRefreshCw />
            <span>Lịch sử</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Title Card */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 mb-8 text-white shadow-xl">
            <div className="text-center">
              <GiSpinningBlades className="w-16 h-16 mx-auto mb-3 animate-pulse" />
              <h1 className="text-3xl font-bold mb-2">
                Vòng Quay May Mắn
              </h1>
              <p className="text-white/90 mb-4">
                Quay để nhận tiền mặt, tài khoản game & voucher giảm giá!
              </p>
              <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                <GiTicket className="w-8 h-8" />
                <span>{availableSpins} lượt quay</span>
              </div>
            </div>
          </div>

          {/* Wheel Container */}
          <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex flex-col items-center">
              {/* Wheel */}
              <div className="mb-8 relative">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-500 drop-shadow-lg"></div>
                </div>

                <Wheel
                  mustStartSpinning={mustSpin}
                  prizeNumber={prizeNumber}
                  data={wheelData}
                  onStopSpinning={handleStopSpinning}
                  backgroundColors={['#FF6D00', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899']}
                  textColors={['#FFFFFF']}
                  outerBorderColor="#1E293B"
                  outerBorderWidth={8}
                  innerBorderColor="#F8FAFC"
                  innerBorderWidth={4}
                  radiusLineColor="#1E293B"
                  radiusLineWidth={2}
                  fontSize={16}
                  perpendicularText={false}
                  textDistance={60}
                />
              </div>

              {/* Spin Button */}
              <button
                onClick={handleSpinClick}
                disabled={spinning || mustSpin || availableSpins <= 0}
                className={`px-12 py-4 rounded-xl font-bold text-xl shadow-lg transition-all transform ${
                  spinning || mustSpin || availableSpins <= 0
                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-105 hover:shadow-2xl active:scale-95'
                }`}
              >
                {spinning || mustSpin ? (
                  <span className="flex items-center gap-3">
                    <GiSpinningBlades className="w-6 h-6 animate-spin" />
                    Đang quay...
                  </span>
                ) : availableSpins <= 0 ? (
                  'Hết lượt quay'
                ) : (
                  <span className="flex items-center gap-3">
                    <GiSpinningBlades className="w-6 h-6" />
                    QUAY NGAY
                  </span>
                )}
              </button>

              {availableSpins <= 0 && (
                <p className="mt-4 text-slate-600 dark:text-slate-400 text-center">
                  Mua sắm để nhận thêm lượt quay! <br />
                  <span className="text-sm">
                    Mỗi 200,000đ mua hàng = 1 lượt quay
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white/50 dark:bg-dark-light/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <FiGift />
              Cách nhận lượt quay
            </h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 font-bold">•</span>
                <span>Mỗi 200,000đ mua hàng = 1 lượt quay (cộng dồn)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">•</span>
                <span>Tiền thắng được sẽ tự động cộng vào tài khoản</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold">•</span>
                <span>Tài khoản trúng thưởng sẽ xuất hiện trong "Tài khoản của tôi"</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showResult && result && (
        <div className="!mt-0 fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-dark-light rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scaleIn">
            <div className="text-center">
              {/* Icon based on reward type */}
              <div className="mb-4">
                {result.type === 'cash' && (
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-4xl">💰</span>
                  </div>
                )}
                {result.type === 'account' && (
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                    <GiTrophy className="w-12 h-12 text-white" />
                  </div>
                )}
                {result.type === 'voucher' && (
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <GiTicket className="w-12 h-12 text-white" />
                  </div>
                )}
                {result.type === 'nothing' && (
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-4xl">😢</span>
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                {result.type === 'nothing' ? 'Chúc bạn may mắn lần sau!' : 'Chúc mừng!'}
              </h2>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                {result.label}
              </p>

              {result.type === 'cash' && (
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-4 mb-4">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    +{result.value?.toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Đã cộng vào tài khoản
                  </p>
                </div>
              )}

              {result.type === 'voucher' && result.voucherCode && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 rounded-xl p-4 mb-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Mã giảm giá</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 font-mono">
                    {result.voucherCode}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Giảm {result.voucherDiscount}%
                  </p>
                </div>
              )}

              {result.type === 'account' && result.account && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500 rounded-xl p-4 mb-4">
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {result.account.title}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Kiểm tra trong tài khoản của bạn
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeResultModal}
                  className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Đóng
                </button>
                {availableSpins > 0 && (
                  <button
                    onClick={() => {
                      closeResultModal();
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Quay tiếp
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinWheel;
