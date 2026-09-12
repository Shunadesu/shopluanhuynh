import { useState } from 'react';
import { FiCreditCard, FiHash, FiKey, FiAlertCircle, FiCheck, FiPhone } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useDepositStore } from '../store/data/depositStore';

const CARD_TYPES = [
  { value: '', label: 'Chọn loại thẻ', disabled: true },
  { value: 'viettel', label: 'Viettel' },
  { value: 'mobifone', label: 'Mobifone' },
  { value: 'vinaphone', label: 'Vinaphone' },
];

const AMOUNTS = [
  { value: 0, label: 'Chọn mệnh giá', disabled: true },
  { value: 10000, label: '10,000đ' },
  { value: 20000, label: '20,000đ' },
  { value: 30000, label: '30,000đ' },
  { value: 50000, label: '50,000đ' },
  { value: 100000, label: '100,000đ' },
  { value: 200000, label: '200,000đ' },
  { value: 300000, label: '300,000đ' },
  { value: 500000, label: '500,000đ' },
];

export default function CardDepositPanel() {
  const createCardDeposit = useDepositStore((s) => s.createCardDeposit);
  
  const [cardType, setCardType] = useState('');
  const [amount, setAmount] = useState(0);
  const [cardSerial, setCardSerial] = useState('');
  const [cardCode, setCardCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cardType) {
      toast.error('Vui lòng chọn loại thẻ');
      return;
    }
    if (!amount || amount === 0) {
      toast.error('Vui lòng chọn mệnh giá');
      return;
    }
    if (!cardSerial || cardSerial.trim().length < 8) {
      toast.error('Số serial phải có ít nhất 8 ký tự');
      return;
    }
    if (!cardCode || cardCode.trim().length < 8) {
      toast.error('Mã thẻ phải có ít nhất 8 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      await createCardDeposit({
        amount,
        cardType,
        cardSerial: cardSerial.trim(),
        cardCode: cardCode.trim(),
      });
      
      toast.success('Đã gửi yêu cầu nạp thẻ cào!');
      
      // Reset form
      setCardType('');
      setAmount(0);
      setCardSerial('');
      setCardCode('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = cardType && amount > 0 && cardSerial.trim().length >= 8 && cardCode.trim().length >= 8;

  return (
    <>
      {/* Hero Section - giống các tab khác */}
      <div className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shrink-0">
              <FiPhone className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Nạp tiền bằng thẻ cào</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Hỗ trợ Viettel, Mobifone, Vinaphone</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card Type Select */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Loại thẻ <span className="text-red-500">*</span>
            </label>
            <select
              value={cardType}
              onChange={(e) => setCardType(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              {CARD_TYPES.map((type) => (
                <option key={type.value} value={type.value} disabled={type.disabled}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Select */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Mệnh giá <span className="text-red-500">*</span>
            </label>
            <select
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              {AMOUNTS.map((amt) => (
                <option key={amt.value} value={amt.value} disabled={amt.disabled}>
                  {amt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Card Serial */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Số serial <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={cardSerial}
                onChange={(e) => setCardSerial(e.target.value)}
                placeholder="Nhập số serial trên thẻ"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tối thiểu 8 ký tự
            </p>
          </div>

          {/* Card Code */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Mã thẻ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={cardCode}
                onChange={(e) => setCardCode(e.target.value)}
                placeholder="Nhập mã thẻ cào"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tối thiểu 8 ký tự
            </p>
          </div>

          {/* Warning Notice */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex gap-3">
              <FiAlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-300 space-y-2">
                <p className="font-semibold">Lưu ý quan trọng:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Thẻ phải chưa sử dụng, còn nguyên mệnh giá</li>
                  <li>Nhập đúng số serial và mã thẻ, không có dấu cách</li>
                  {/* <li>Không nạp thẻ đã bị trầy xước hoặc hỏng</li> */}
                  {/* <li>Admin sẽ kiểm tra và duyệt trong vòng 5-30 phút</li> */}
                  <li>Không thể hoàn tiền nếu thẻ sai hoặc đã sử dụng</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Summary - chỉ hiện khi đã nhập đủ thông tin */}
          {isFormValid && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <FiCheck className="w-4 h-4 text-primary" />
                Thông tin nạp thẻ
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Loại thẻ:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100 capitalize">
                    {CARD_TYPES.find((t) => t.value === cardType)?.label}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Mệnh giá:</span>
                  <span className="font-bold text-primary text-base">
                    {amount.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 dark:text-slate-400">Serial:</span>
                  <span className="font-mono text-xs text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {cardSerial}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang gửi yêu cầu...
              </>
            ) : (
              <>
                <FiCheck className="w-5 h-5" />
                Gửi yêu cầu nạp thẻ
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}
