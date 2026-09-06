import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiSave, FiPhone, FiFacebook, FiMail, FiImage, FiUpload, FiLink, FiEdit2, FiTrash2, FiSearch, FiGlobe } from 'react-icons/fi';
import { FormSkeleton } from '../components/SkeletonLoader';

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

  const [generalForm, setGeneralForm] = useState({
    siteName: '',
    siteDescription: '',
    contactPhone: '',
    contactEmail: '',
    facebookLink: '',
    zaloLink: '',
  });

  const [logoForm, setLogoForm] = useState({
    logo: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  // SEO Form State
  const [seoForm, setSeoForm] = useState({
    favicon: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    ogImage: '',
    twitterCard: 'summary',
  });
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [isUploadingOg, setIsUploadingOg] = useState(false);

  // Initialize forms when settings load
  useEffect(() => {
    if (settings) {
      setGeneralForm({
        siteName: settings.siteName || '',
        siteDescription: settings.siteDescription || '',
        contactPhone: settings.contactPhone || '',
        contactEmail: settings.contactEmail || '',
        facebookLink: settings.facebookLink || '',
        zaloLink: settings.zaloLink || '',
      });
      setLogoForm({ logo: settings.logo || '' });
      setSeoForm({
        favicon: settings.favicon || '',
        seoTitle: settings.seoTitle || '',
        seoDescription: settings.seoDescription || '',
        seoKeywords: settings.seoKeywords || '',
        ogImage: settings.ogImage || '',
        twitterCard: settings.twitterCard || 'summary',
      });
    }
  }, [settings]);

  // Social Links State
  const [socialLinkForm, setSocialLinkForm] = useState({
    name: '',
    url: '',
    platform: 'facebook',
    order: 0,
    isActive: true,
  });
  const [editingSocialLink, setEditingSocialLink] = useState(null);

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

  const uploadLogoMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      // Set Content-Type to undefined to let axios set it with proper boundary for FormData
      const res = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': undefined,
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setLogoForm({ logo: data.url });
      toast.success('Upload logo thành công');
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Upload thất bại');
      setIsUploading(false);
    },
  });

  const saveLogoMutation = useMutation({
    mutationFn: (data) => api.put("/admin/logo", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["settings"]);
      toast.success("Lưu logo thành công");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    },
  });

  // SEO Upload Mutations
  const uploadFaviconMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': undefined },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setSeoForm(prev => ({ ...prev, favicon: data.url }));
      toast.success('Upload favicon thành công');
      setIsUploadingFavicon(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Upload thất bại');
      setIsUploadingFavicon(false);
    },
  });

  const uploadOgImageMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': undefined },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setSeoForm(prev => ({ ...prev, ogImage: data.url }));
      toast.success('Upload ảnh OG thành công');
      setIsUploadingOg(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Upload thất bại');
      setIsUploadingOg(false);
    },
  });

  const saveSeoMutation = useMutation({
    mutationFn: (data) => api.put('/admin/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
      toast.success('Lưu cấu hình SEO thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  // Social Links Queries and Mutations
  const { data: socialLinks } = useQuery({
    queryKey: ['social-links'],
    queryFn: async () => {
      const { data } = await api.get('/admin/social-links');
      return data;
    },
  });

  const createSocialLinkMutation = useMutation({
    mutationFn: (data) => api.post('/admin/social-links', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['social-links']);
      toast.success('Thêm link thành công');
      resetSocialLinkForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const updateSocialLinkMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/admin/social-links/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['social-links']);
      toast.success('Cập nhật link thành công');
      resetSocialLinkForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const deleteSocialLinkMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/social-links/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['social-links']);
      toast.success('Xóa link thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const resetSocialLinkForm = () => {
    setSocialLinkForm({
      name: '',
      url: '',
      platform: 'facebook',
      order: 0,
      isActive: true,
    });
    setEditingSocialLink(null);
  };

  const handleSocialLinkSubmit = (e) => {
    e.preventDefault();
    if (editingSocialLink) {
      updateSocialLinkMutation.mutate({ id: editingSocialLink._id, data: socialLinkForm });
    } else {
      createSocialLinkMutation.mutate(socialLinkForm);
    }
  };

  const handleEditSocialLink = (link) => {
    setEditingSocialLink(link);
    setSocialLinkForm({
      name: link.name,
      url: link.url,
      platform: link.platform,
      order: link.order || 0,
      isActive: link.isActive,
    });
  };

  const handleDeleteSocialLink = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa link này?')) {
      deleteSocialLinkMutation.mutate(id);
    }
  };

  const getPlatformLabel = (platform) => {
    const labels = {
      facebook: 'Facebook',
      zalo: 'Zalo',
      youtube: 'YouTube',
      tiktok: 'TikTok',
      website: 'Website',
      other: 'Khác',
    };
    return labels[platform] || platform;
  };

  const getPlatformColor = (platform) => {
    const colors = {
      facebook: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      zalo: 'bg-blue-600/20 border-blue-600/30 text-blue-300',
      youtube: 'bg-red-500/20 border-red-500/30 text-red-400',
      tiktok: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      website: 'bg-green-500/20 border-green-500/30 text-green-400',
      other: 'bg-slate-500/20 border-slate-500/30 text-slate-400',
    };
    return colors[platform] || colors.other;
  };

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(generalForm);
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file PNG, JPG, WEBP, GIF');
        return;
      }
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước file tối đa 2MB');
        return;
      }
      setIsUploading(true);
      uploadLogoMutation.mutate(file);
    }
  };

  const handleLogoUrlChange = (url) => {
    setLogoForm({ logo: url });
  };

  const handleSaveLogo = (e) => {
    e.preventDefault();
    if (!logoForm.logo) {
      toast.error('Vui lòng upload hoặc nhập URL logo');
      return;
    }
    saveLogoMutation.mutate({ logo: logoForm.logo });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="h-9 bg-slate-700 rounded w-24 animate-pulse" />
          <div className="h-5 bg-slate-800 rounded w-32 mt-2 animate-pulse" />
        </div>
        
        {/* Tabs Skeleton */}
        <div className="flex gap-2 border-b border-slate-700 pb-2">
          <div className="h-10 bg-slate-700 rounded w-32 animate-pulse" />
          <div className="h-10 bg-slate-800 rounded w-40 animate-pulse" />
        </div>
        
        {/* Form Skeleton */}
        <FormSkeleton />
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Cài đặt chung', icon: FiSave },
    { id: 'social', label: 'Mạng xã hội', icon: FiLink },
    { id: 'logo', label: 'Logo', icon: FiImage },
    { id: 'seo', label: 'SEO & Favicon', icon: FiGlobe },
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
        <div className="card">
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

      {/* Logo Settings */}
      {activeTab === 'logo' && (
        <div className="card">
          <h2 className="text-xl font-bold text-slate-100 mb-6">Logo Website</h2>
          <form onSubmit={handleSaveLogo} className="space-y-6">
            {/* Current Logo Preview */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Logo hiện tại
              </label>
              <div className="bg-slate-800 rounded-lg p-6 flex items-center justify-center min-h-[150px]">
                {settings?.logo || logoForm.logo ? (
                  <img
                    src={logoForm.logo || settings?.logo}
                    alt="Logo hiện tại"
                    className="max-h-24 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <FiImage className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Chưa có logo</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload File */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Upload file logo
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    onChange={handleLogoFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <div className={`flex items-center justify-center space-x-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <FiUpload />
                    <span>{isUploading ? 'Đang upload...' : 'Chọn file'}</span>
                  </div>
                </label>
              </div>
              <p className="text-slate-500 text-xs mt-2">
                PNG, JPG, WEBP, GIF - Tối đa 2MB
              </p>
            </div>

            {/* Or URL Input */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-400">Hoặc</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nhập URL logo
              </label>
              <input
                type="url"
                value={logoForm.logo || ''}
                onChange={(e) => handleLogoUrlChange(e.target.value)}
                className="input-field"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary"
              disabled={!logoForm.logo}
            >
              <FiSave className="inline mr-2" />
              Lưu Logo
            </button>
          </form>
        </div>
      )}

      {/* Social Links Settings */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          {/* Add/Edit Social Link Form */}
          <div className="card">
            <h2 className="text-xl font-bold text-slate-100 mb-6">
              {editingSocialLink ? 'Sửa link mạng xã hội' : 'Thêm link mạng xã hội'}
            </h2>
            <form onSubmit={handleSocialLinkSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tên hiển thị
                  </label>
                  <input
                    type="text"
                    value={socialLinkForm.name}
                    onChange={(e) => setSocialLinkForm({ ...socialLinkForm, name: e.target.value })}
                    className="input-field"
                    placeholder="Fanpage chính"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nền tảng
                  </label>
                  <select
                    value={socialLinkForm.platform}
                    onChange={(e) => setSocialLinkForm({ ...socialLinkForm, platform: e.target.value })}
                    className="input-field"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="zalo">Zalo</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="website">Website</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  URL liên kết
                </label>
                <input
                  type="url"
                  value={socialLinkForm.url}
                  onChange={(e) => setSocialLinkForm({ ...socialLinkForm, url: e.target.value })}
                  className="input-field"
                  placeholder="https://facebook.com/..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    value={socialLinkForm.order}
                    onChange={(e) => setSocialLinkForm({ ...socialLinkForm, order: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={socialLinkForm.isActive}
                      onChange={(e) => setSocialLinkForm({ ...socialLinkForm, isActive: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-slate-300">Hiển thị trên website</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary">
                  {editingSocialLink ? 'Cập nhật' : 'Thêm mới'}
                </button>
                {editingSocialLink && (
                  <button
                    type="button"
                    onClick={resetSocialLinkForm}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Social Links List */}
          <div className="card">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Danh sách link</h2>
            <div className="space-y-2">
              {socialLinks?.length > 0 ? (
                socialLinks.map((link) => (
                  <div
                    key={link._id}
                    className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${getPlatformColor(link.platform)}`}>
                        <FiFacebook className="text-xl" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-100">{link.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded border ${getPlatformColor(link.platform)}`}>
                            {getPlatformLabel(link.platform)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 truncate max-w-md">{link.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${link.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {link.isActive ? 'Hiển thị' : 'Ẩn'}
                      </span>
                      <button
                        onClick={() => handleEditSocialLink(link)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteSocialLink(link._id)}
                        className="p-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-all"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-4">Chưa có link mạng xã hội nào</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SEO & Favicon Settings */}
      {activeTab === 'seo' && (
        <div className="card">
          <h2 className="text-xl font-bold text-slate-100 mb-6">Cấu hình SEO & Favicon</h2>
          <form onSubmit={(e) => { e.preventDefault(); saveSeoMutation.mutate(seoForm); }} className="space-y-6">
            {/* Favicon */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Favicon
              </label>
              <div className="bg-slate-800 rounded-lg p-4 flex items-center gap-4 mb-3">
                {seoForm.favicon ? (
                  <img src={seoForm.favicon} alt="Favicon" className="w-12 h-12 object-contain" />
                ) : (
                  <div className="w-12 h-12 bg-slate-700 rounded flex items-center justify-center">
                    <FiImage className="text-slate-500" />
                  </div>
                )}
                <span className="text-sm text-slate-400">{seoForm.favicon || 'Chưa có favicon'}</span>
              </div>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/x-icon,image/webp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 512 * 1024) {
                          toast.error('Kích thước file tối đa 512KB');
                          return;
                        }
                        setIsUploadingFavicon(true);
                        uploadFaviconMutation.mutate(file);
                      }
                    }}
                    className="hidden"
                    disabled={isUploadingFavicon}
                  />
                  <div className={`flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors ${isUploadingFavicon ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <FiUpload />
                    <span>{isUploadingFavicon ? 'Đang upload...' : 'Upload Favicon'}</span>
                  </div>
                </label>
                <span className="text-slate-500 text-sm">PNG, ICO, WEBP - Tối đa 512KB</span>
              </div>
              <input
                type="url"
                value={seoForm.favicon || ''}
                onChange={(e) => setSeoForm({ ...seoForm, favicon: e.target.value })}
                className="input-field mt-3"
                placeholder="Hoặc nhập URL favicon"
              />
            </div>

            {/* OG Image */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Ảnh Open Graph (OG Image)
              </label>
              <div className="bg-slate-800 rounded-lg p-4 mb-3">
                {seoForm.ogImage ? (
                  <img src={seoForm.ogImage} alt="OG Image" className="max-h-40 object-contain mx-auto" />
                ) : (
                  <div className="text-center py-4">
                    <FiImage className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <span className="text-slate-500 text-sm">Chưa có ảnh OG</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error('Kích thước file tối đa 2MB');
                          return;
                        }
                        setIsUploadingOg(true);
                        uploadOgImageMutation.mutate(file);
                      }
                    }}
                    className="hidden"
                    disabled={isUploadingOg}
                  />
                  <div className={`flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors ${isUploadingOg ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <FiUpload />
                    <span>{isUploadingOg ? 'Đang upload...' : 'Upload Ảnh OG'}</span>
                  </div>
                </label>
                <span className="text-slate-500 text-sm">Kích thước khuyến nghị: 1200x630</span>
              </div>
              <input
                type="url"
                value={seoForm.ogImage || ''}
                onChange={(e) => setSeoForm({ ...seoForm, ogImage: e.target.value })}
                className="input-field mt-3"
                placeholder="Hoặc nhập URL ảnh OG"
              />
            </div>

            {/* SEO Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                SEO Title (Tiêu đề trang)
              </label>
              <input
                type="text"
                value={seoForm.seoTitle}
                onChange={(e) => setSeoForm({ ...seoForm, seoTitle: e.target.value })}
                className="input-field"
                placeholder="Shop Luan Huynh - Mua Bán Tài Khoản Game Giá Rẻ"
              />
              <p className="text-slate-500 text-xs mt-1">Khuyến nghị: 50-60 ký tự</p>
            </div>

            {/* SEO Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                SEO Description (Mô tả)
              </label>
              <textarea
                value={seoForm.seoDescription}
                onChange={(e) => setSeoForm({ ...seoForm, seoDescription: e.target.value })}
                className="input-field"
                rows="3"
                placeholder="Cung cấp tài khoản game giá rẻ, uy tín, chất lượng..."
              />
              <p className="text-slate-500 text-xs mt-1">Khuyến nghị: 150-160 ký tự</p>
            </div>

            {/* SEO Keywords */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                SEO Keywords (Từ khóa)
              </label>
              <input
                type="text"
                value={seoForm.seoKeywords}
                onChange={(e) => setSeoForm({ ...seoForm, seoKeywords: e.target.value })}
                className="input-field"
                placeholder="mua tai khoan game, tai khoan gia re, lien quan, pubg"
              />
              <p className="text-slate-500 text-xs mt-1">Các từ khóa cách nhau bằng dấu phẩy</p>
            </div>

            {/* Twitter Card */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Twitter Card Type
              </label>
              <select
                value={seoForm.twitterCard}
                onChange={(e) => setSeoForm({ ...seoForm, twitterCard: e.target.value })}
                className="input-field"
              >
                <option value="summary">Summary (Nhỏ)</option>
                <option value="summary_large_image">Summary Large Image (Lớn)</option>
              </select>
            </div>

            {/* SEO Preview */}
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <FiSearch />
                Xem trước kết quả tìm kiếm
              </h3>
              <div className="bg-white rounded-lg p-4 text-black">
                <p className="text-blue-600 text-sm truncate">
                  {seoForm.seoTitle || 'Shop Luan Huynh - Mua Bán Tài Khoản Game Giá Rẻ'}
                </p>
                <p className="text-green-700 text-xs truncate">
                  shopluanhuynh.com
                </p>
                <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                  {seoForm.seoDescription || 'Cung cấp tài khoản game giá rẻ, uy tín, chất lượng. Mua bán tài khoản Liên Quân, PUBG, Free Fire, Genshin Impact.'}
                </p>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={saveSeoMutation.isPending}>
              <FiSave className="inline mr-2" />
              {saveSeoMutation.isPending ? 'Đang lưu...' : 'Lưu cấu hình SEO'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
