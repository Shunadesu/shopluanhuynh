import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getImageUrl } from '../utils/api';
import toast from 'react-hot-toast';
import {
  FiPlus, FiRefreshCw, FiEdit2, FiTrash2, FiX,
  FiDollarSign, FiImage, FiUpload, FiCreditCard,
} from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export default function BankAccounts() {
  const queryClient = useQueryClient();

  // ─── Modal state ───────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [qrPreview, setQrPreview] = useState('');
  const [qrFile, setQrFile] = useState(null);
  const [isUploadingQr, setIsUploadingQr] = useState(false);
  const [qrLightboxOpen, setQrLightboxOpen] = useState(false);
  const [qrLightboxImages, setQrLightboxImages] = useState([]);

  const [form, setForm] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    isActive: true,
  });

  // ─── Fetch ─────────────────────────────────────────────────
  const { data: banks = [], isLoading, refetch } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const { data } = await api.get('/admin/bank-accounts');
      return Array.isArray(data) ? data : (data?.bankAccounts || []);
    },
  });

  // ─── Mutations ──────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/admin/bank-accounts', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['bank-accounts']);
      toast.success('Thêm tài khoản ngân hàng thành công');
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/admin/bank-accounts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['bank-accounts']);
      toast.success('Cập nhật thành công');
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/bank-accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['bank-accounts']);
      toast.success('Xóa thành công');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id }) => api.put(`/admin/bank-accounts/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries(['bank-accounts']);
      toast.success('Cập nhật trạng thái');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  // ─── QR Upload ──────────────────────────────────────────────
  const handleQrFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file tối đa 5MB');
      return;
    }

    // Preview local
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
    setIsUploadingQr(true);

    try {
      const { data } = await api.uploadImage(file);
      const url = data?.url || data?.urls?.[0] || '';
      setQrPreview(url);
      setQrFile(null);
      toast.success('Upload ảnh QR thành công');
    } catch {
      toast.error('Upload ảnh QR thất bại');
      setQrFile(null);
    } finally {
      setIsUploadingQr(false);
    }
  };

  // ─── Modal helpers ──────────────────────────────────────────
  const openAddModal = () => {
    setForm({ bankName: '', accountName: '', accountNumber: '', isActive: true });
    setQrPreview('');
    setQrFile(null);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEditModal = (bank) => {
    setForm({
      bankName: bank.bankName || '',
      accountName: bank.accountName || '',
      accountNumber: bank.accountNumber || '',
      isActive: bank.isActive ?? true,
    });
    setQrPreview(bank.qrCodeImage || '');
    setQrFile(null);
    setEditingId(bank._id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setQrPreview('');
    setQrFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, qrCodeImage: qrPreview };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa tài khoản này?')) {
      deleteMutation.mutate(id);
    }
  };

  // ─── QR Lightbox ───────────────────────────────────────────
  const openQrLightbox = (bank) => {
    if (!bank.qrCodeImage) return;
    setQrLightboxImages([bank.qrCodeImage]);
    setQrLightboxOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Tài khoản ngân hàng</h1>
          <p className="text-slate-400 mt-1">Quản lý tài khoản ngân hàng</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all"
          >
            <FiRefreshCw className={`${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all"
          >
            <FiPlus />
            Thêm mới
          </button>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">#</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Tên ngân hàng</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Chủ tài khoản</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Số tài khoản</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Ảnh QR</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/50 animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-slate-700 rounded w-4" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-700 rounded w-32" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-700 rounded w-24" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-700 rounded w-28" /></td>
                    <td className="px-4 py-3"><div className="h-10 w-10 bg-slate-700 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-5 w-14 bg-slate-700 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-8 w-16 bg-slate-700 rounded" /></td>
                  </tr>
                ))
              ) : banks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Chưa có tài khoản ngân hàng nào
                  </td>
                </tr>
              ) : (
                banks.map((bank, index) => (
                  <tr
                    key={bank._id}
                    className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">{bank.bankName}</td>
                    <td className="px-4 py-3 text-slate-300">{bank.accountName}</td>
                    <td className="px-4 py-3 text-cyan-400 font-mono">{bank.accountNumber}</td>
                    <td className="px-4 py-3">
                      {bank.qrCodeImage ? (
                        <button
                          onClick={() => openQrLightbox(bank)}
                          className="relative group"
                        >
                          <img
                            src={getImageUrl(bank.qrCodeImage)}
                            alt="QR"
                            className="h-10 w-10 object-cover rounded border border-slate-600 hover:border-cyan-500 transition-colors"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                            <FiImage className="text-white text-sm" />
                          </div>
                        </button>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleMutation.mutate({ id: bank._id })}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                          bank.isActive
                            ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                        }`}
                      >
                        {bank.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(bank)}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
                          title="Sửa"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(bank._id)}
                          className="p-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-all"
                          title="Xóa"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal ─── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg mx-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FiCreditCard />
                {editingId ? 'Sửa tài khoản ngân hàng' : 'Thêm tài khoản ngân hàng'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tên ngân hàng <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="input-field"
                  placeholder="Vietcombank"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Chủ tài khoản <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.accountName}
                  onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                  className="input-field"
                  placeholder="NGUYEN VAN A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Số tài khoản <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  className="input-field"
                  placeholder="1234567890"
                  required
                />
              </div>

              {/* QR Image */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ảnh QR Code
                </label>

                {qrPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={getImageUrl(qrPreview)}
                      alt="QR Preview"
                      className="max-h-40 rounded-lg border border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => { setQrPreview(''); setQrFile(null); }}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-400 text-white rounded-full transition-all"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-600 hover:border-cyan-500/50 rounded-lg p-6 cursor-pointer transition-all text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrFileChange}
                      className="hidden"
                      disabled={isUploadingQr}
                    />
                    {isUploadingQr ? (
                      <div className="flex items-center gap-2 text-cyan-400">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-cyan-500 border-t-transparent" />
                        <span>Đang upload...</span>
                      </div>
                    ) : (
                      <>
                        <FiUpload className="text-3xl text-slate-500" />
                        <div className="text-sm text-slate-400">
                          <p>Nhấn để upload ảnh QR</p>
                          <p className="text-xs text-slate-500">PNG, JPG, WEBP (tối đa 5MB)</p>
                        </div>
                      </>
                    )}
                  </label>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    form.isActive ? 'bg-cyan-600' : 'bg-slate-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      form.isActive ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-slate-300">
                  {form.isActive ? 'Hiển thị' : 'Ẩn'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 btn-primary"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Đang xử lý...'
                    : editingId
                    ? 'Cập nhật'
                    : 'Thêm mới'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── QR Lightbox ─── */}
      {qrLightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex flex-col"
          onClick={() => setQrLightboxOpen(false)}
        >
          <div className="flex items-center justify-between px-6 py-4 shrink-0">
            <p className="text-white font-medium">Ảnh QR Code</p>
            <button
              onClick={() => setQrLightboxOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-6">
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              className="!max-w-lg !w-full"
            >
              {qrLightboxImages.map((img, i) => (
                <SwiperSlide key={i}>
                  <img
                    src={getImageUrl(img)}
                    alt={`QR ${i + 1}`}
                    className="max-w-full max-h-[80vh] object-contain mx-auto rounded-lg"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </div>
  );
}
