import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiSave, FiDollarSign, FiPhone, FiFacebook, FiMail } from 'react-icons/fi';

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get('/settings');
      return data;
    },
  });

  const { data: bankAccounts } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const { data } = await api.get('/admin/bank-accounts');
      return data;
    },
  });

  const [generalForm, setGeneralForm] = useState({
    siteName: '',
    siteDescription: '',
    contactPhone: '',
    contactEmail: '',
    facebookLink: '',
    zaloLink: '',
  });

  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    isActive: true,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => api.put('/admin/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
      toast.success('Cập nhật cài đặt thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const createBankMutation = useMutation({
    mutationFn: (data) => api.post('/admin/bank-accounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['bank-accounts']);
      toast.success('Thêm tài khoản ngân hàng thành công');
      setBankForm({ bankName: '', accountName: '', accountNumber: '', isActive: true });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const deleteBankMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/bank-accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['bank-accounts']);
      toast.success('Xóa tài khoản ngân hàng thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(generalForm);
  };

  const handleBankSubmit = (e) => {
    e.preventDefault();
    createBankMutation.mutate(bankForm);
  };

  const handleDeleteBank = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa tài khoản ngân hàng này?')) {
      deleteBankMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Cài đặt chung', icon: FiSave },
    { id: 'banking', label: 'Tài khoản ngân hàng', icon: FiDollarSign },
  ];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Cài đặt</h1>
        <p className="text-slate-400 mt-1">Cấu hình hệ thống</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="card max-w-3xl">
          <h2 className="text-xl font-bold text-slate-100 mb-2">Cài đặt chung</h2>
          <form onSubmit={handleGeneralSubmit} className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tên website
              </label>
              <input
                type="text"
                value={generalForm.siteName}
                onChange={(e) => setGeneralForm({ ...generalForm, siteName: e.target.value })}
                className="input-field"
                placeholder="Shopluanhuynh"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mô tả website
              </label>
              <textarea
                value={generalForm.siteDescription}
                onChange={(e) => setGeneralForm({ ...generalForm, siteDescription: e.target.value })}
                className="input-field"
                rows="3"
                placeholder="Cung cấp tài khoản game chất lượng..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <FiPhone className="inline mr-2" />
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={generalForm.contactPhone}
                  onChange={(e) => setGeneralForm({ ...generalForm, contactPhone: e.target.value })}
                  className="input-field"
                  placeholder="0123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <FiMail className="inline mr-2" />
                  Email liên hệ
                </label>
                <input
                  type="email"
                  value={generalForm.contactEmail}
                  onChange={(e) => setGeneralForm({ ...generalForm, contactEmail: e.target.value })}
                  className="input-field"
                  placeholder="contact@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <FiFacebook className="inline mr-2" />
                  Link Facebook
                </label>
                <input
                  type="url"
                  value={generalForm.facebookLink}
                  onChange={(e) => setGeneralForm({ ...generalForm, facebookLink: e.target.value })}
                  className="input-field"
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Link Zalo
                </label>
                <input
                  type="url"
                  value={generalForm.zaloLink}
                  onChange={(e) => setGeneralForm({ ...generalForm, zaloLink: e.target.value })}
                  className="input-field"
                  placeholder="https://zalo.me/..."
                />
              </div>
            </div>

            <button type="submit" className="w-full btn-primary mt-6">
              <FiSave className="inline mr-2" />
              Lưu cài đặt
            </button>
          </form>
        </div>
      )}

      {/* Banking Settings */}
      {activeTab === 'banking' && (
        <div className="space-y-6">
          {/* Add Bank Form */}
          <div className="card max-w-3xl">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Thêm tài khoản ngân hàng</h2>
            <form onSubmit={handleBankSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tên ngân hàng
                  </label>
                  <input
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    className="input-field"
                    placeholder="Vietcombank"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Chủ tài khoản
                  </label>
                  <input
                    type="text"
                    value={bankForm.accountName}
                    onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                    className="input-field"
                    placeholder="NGUYEN VAN A"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Số tài khoản
                  </label>
                  <input
                    type="text"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    className="input-field"
                    placeholder="1234567890"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary">
                Thêm tài khoản
              </button>
            </form>
          </div>

          {/* Bank Accounts List */}
          <div className="card">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Danh sách tài khoản</h2>
            <div className="space-y-2">
              {bankAccounts?.length > 0 ? (
                bankAccounts.map((bank) => (
                  <div
                    key={bank._id}
                    className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                        <FiDollarSign className="text-cyan-400 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100">{bank.bankName}</h3>
                        <p className="text-sm text-slate-400">{bank.accountName}</p>
                        <p className="text-sm text-cyan-400 font-mono">{bank.accountNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${bank.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {bank.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleDeleteBank(bank._id)}
                        className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-all"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-4">Chưa có tài khoản ngân hàng nào</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
