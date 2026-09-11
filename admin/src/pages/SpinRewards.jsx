import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiPackage } from 'react-icons/fi';
import { GiSpinningBlades } from 'react-icons/gi';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function SpinRewards() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    rewardType: 'cash',
    value: 0,
    accountId: null,
    voucherCode: '',
    voucherDiscount: 0,
    probability: 10,
    color: '#FF6D00',
    stock: null
  });

  // Fetch rewards
  const { data: rewards, isLoading } = useQuery({
    queryKey: ['admin-spin-rewards'],
    queryFn: async () => {
      const { data } = await api.get('/admin/spin/rewards');
      return data;
    }
  });

  // Fetch available accounts for rewards
  const { data: accounts } = useQuery({
    queryKey: ['available-accounts'],
    queryFn: async () => {
      const { data } = await api.get('/admin/accounts?status=available&limit=100');
      return data.accounts || [];
    },
    enabled: showModal
  });

  // Create reward
  const createMutation = useMutation({
    mutationFn: async (newReward) => {
      console.log('🚀 Creating reward with data:', newReward);
      const { data } = await api.post('/admin/spin/rewards', newReward);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-spin-rewards']);
      toast.success('Đã thêm phần thưởng');
      setShowModal(false);
      resetForm();
    },
    onError: (error) => {
      console.error('❌ Create reward error:', error.response?.data);
      const errorMsg = error.response?.data?.detail 
        ? `${error.response.data.message}\n${error.response.data.detail}`
        : error.response?.data?.message || 'Lỗi khi thêm phần thưởng';
      toast.error(errorMsg);
    }
  });

  // Update reward
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.put(`/admin/spin/rewards/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-spin-rewards']);
      toast.success('Đã cập nhật phần thưởng');
      setShowModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật');
    }
  });

  // Delete reward
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/spin/rewards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-spin-rewards']);
      toast.success('Đã xóa phần thưởng');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa');
    }
  });

  const resetForm = () => {
    setFormData({
      label: '',
      rewardType: 'cash',
      value: 0,
      accountId: null,
      voucherCode: '',
      voucherDiscount: 0,
      probability: 10,
      color: '#FF6D00',
      icon: '',
      stock: null
    });
    setEditingReward(null);
  };

  const handleOpenModal = (reward = null) => {
    if (reward) {
      setEditingReward(reward);
      setFormData({
        label: reward.label,
        rewardType: reward.rewardType,
        value: reward.value || 0,
        accountId: reward.accountId?._id || null,
        voucherCode: reward.voucherCode || '',
        voucherDiscount: reward.voucherDiscount || 0,
        probability: reward.probability,
        color: reward.color || '#FF6D00',
        icon: reward.icon || '',
        stock: reward.stock
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clean data before submit
    const submitData = {
      label: formData.label,
      rewardType: formData.rewardType,
      probability: Number(formData.probability),
      color: formData.color,
      icon: formData.icon || '',
      stock: formData.stock ? Number(formData.stock) : null
    };

    // Add conditional fields based on rewardType
    if (formData.rewardType === 'cash') {
      submitData.value = Number(formData.value);
    } else if (formData.rewardType === 'account') {
      submitData.accountId = formData.accountId;
    } else if (formData.rewardType === 'voucher') {
      submitData.voucherCode = formData.voucherCode;
      submitData.voucherDiscount = Number(formData.voucherDiscount);
    }
    // rewardType 'nothing' doesn't need extra fields

    console.log('📤 Submitting data:', submitData);

    if (editingReward) {
      updateMutation.mutate({ id: editingReward._id, updates: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Xác nhận xóa phần thưởng này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (reward) => {
    updateMutation.mutate({
      id: reward._id,
      updates: { isActive: !reward.isActive }
    });
  };

  const totalProbability = rewards?.reduce((sum, r) => r.isActive ? sum + r.probability : sum, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-200 flex items-center gap-3">
            <GiSpinningBlades className="text-cyan-400" />
            Quản lý Vòng quay
          </h1>
          <p className="text-slate-400 mt-1">Cấu hình phần thưởng cho vòng quay</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
        >
          <FiPlus />
          Thêm phần thưởng
        </button>
      </div>

      {/* Probability Summary */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Tổng xác suất hiện tại:</span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${totalProbability > 100 ? 'text-red-400' : 'text-cyan-400'}`}>
              {totalProbability}%
            </span>
            <span className="text-slate-400">/ 100%</span>
          </div>
        </div>
        {totalProbability > 100 && (
          <p className="text-red-400 text-sm mt-2">⚠️ Tổng xác suất vượt quá 100%!</p>
        )}
      </div>

      {/* Rewards List */}
      {isLoading ? (
        <div className="text-center py-12">
          <GiSpinningBlades className="w-12 h-12 mx-auto text-cyan-400 animate-spin" />
        </div>
      ) : rewards && rewards.length > 0 ? (
        <div className="grid gap-4">
          {rewards.map((reward) => (
            <div
              key={reward._id}
              className="bg-slate-950 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Color Preview */}
                <div
                  className="w-12 h-12 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: reward.color }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200">{reward.label}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                          {reward.rewardType === 'cash' && '💰 Tiền mặt'}
                          {reward.rewardType === 'account' && '🎮 Tài khoản'}
                          {reward.rewardType === 'voucher' && '🎫 Voucher'}
                          {reward.rewardType === 'nothing' && '❌ Chúc bạn may mắn'}
                        </span>
                        <span className="text-sm px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded font-semibold">
                          {reward.probability}%
                        </span>
                        {reward.stock !== null && (
                          <span className="text-sm px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded flex items-center gap-1">
                            <FiPackage className="w-3 h-3" />
                            {reward.stock} còn lại
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(reward)}
                        className={`p-2 rounded-lg transition-colors ${
                          reward.isActive
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                        }`}
                        title={reward.isActive ? 'Tắt' : 'Bật'}
                      >
                        {reward.isActive ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                      </button>
                      <button
                        onClick={() => handleOpenModal(reward)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(reward._id)}
                        className="p-2 bg-slate-800 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  {/* Reward Details */}
                  <div className="text-sm text-slate-400 space-y-1">
                    {reward.rewardType === 'cash' && (
                      <p>Giá trị: <span className="text-green-400 font-semibold">{reward.value?.toLocaleString('vi-VN')}đ</span></p>
                    )}
                    {reward.rewardType === 'voucher' && (
                      <p>Mã: <span className="font-mono text-orange-400">{reward.voucherCode}</span> - Giảm {reward.voucherDiscount}%</p>
                    )}
                    {reward.rewardType === 'account' && reward.accountId && (
                      <p>Tài khoản: <span className="text-purple-400">{reward.accountId.title}</span></p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-12 text-center">
          <GiSpinningBlades className="w-16 h-16 mx-auto text-slate-700 mb-4" />
          <p className="text-slate-400">Chưa có phần thưởng nào</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="!mt-0 fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-200 mb-6">
              {editingReward ? 'Sửa phần thưởng' : 'Thêm phần thưởng mới'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nhãn hiển thị *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="VD: 50,000đ"
                  required
                />
              </div>

              {/* Reward Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Loại phần thưởng *
                </label>
                <select
                  value={formData.rewardType}
                  onChange={(e) => setFormData({ ...formData, rewardType: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="cash">💰 Tiền mặt</option>
                  <option value="account">🎮 Tài khoản game</option>
                  <option value="voucher">🎫 Voucher giảm giá</option>
                  <option value="nothing">❌ Chúc bạn may mắn</option>
                </select>
              </div>

              {/* Conditional Fields */}
              {formData.rewardType === 'cash' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Số tiền (VNĐ) *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
              )}

              {formData.rewardType === 'account' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Chọn tài khoản *
                  </label>
                  <select
                    value={formData.accountId || ''}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value || null })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    required
                  >
                    <option value="">-- Chọn tài khoản --</option>
                    {accounts?.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.title} - {acc.price?.toLocaleString('vi-VN')}đ
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.rewardType === 'voucher' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Mã voucher *
                    </label>
                    <input
                      type="text"
                      value={formData.voucherCode}
                      onChange={(e) => setFormData({ ...formData, voucherCode: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      placeholder="GIAMGIA10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phần trăm giảm (%) *
                    </label>
                    <input
                      type="number"
                      value={formData.voucherDiscount}
                      onChange={(e) => setFormData({ ...formData, voucherDiscount: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                </>
              )}

              {/* Probability */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Xác suất (%) * - Hiện tại: {totalProbability}%
                </label>
                <input
                  type="number"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Màu sắc
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10 bg-slate-900 border border-slate-700 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    placeholder="#FF6D00"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Số lượng (để trống = không giới hạn)
                </label>
                <input
                  type="number"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value ? Number(e.target.value) : null })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  min="0"
                  placeholder="Không giới hạn"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                  className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {editingReward ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
