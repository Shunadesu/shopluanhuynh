import { useState, useRef } from 'react';
import { FiX, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function UploadImages({ value = [], onChange, label = 'Hình ảnh', maxImages = 10 }) {
  const [uploading, setUploading] = useState(false);
  // pending: các ảnh đang upload, chỉ giữ localUrl để hiển thị tạm
  const [pending, setPending] = useState([]);
  const fileInputRef = useRef(null);

  // Chuẩn hoá value về mảng string URL
  const urls = Array.isArray(value)
    ? value
        .map((v) => (typeof v === 'object' && v !== null ? v.url || v.localUrl || '' : v))
        .filter(Boolean)
    : [];

  const totalCount = urls.length + pending.length;

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (totalCount + files.length > maxImages) {
      toast.error(`Tối đa ${maxImages} hình ảnh`);
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 5MB');
        return;
      }
    }

    // Hiển thị preview local ngay lập tức
    const newPending = files.map((file) => ({
      localUrl: URL.createObjectURL(file),
    }));
    setPending((prev) => [...prev, ...newPending]);
    setUploading(true);

    try {
      const { data } = await api.uploadImages(files);
      const serverUrls = (data && data.urls) || [];

      // Upload xong: bỏ pending tương ứng, đẩy URL server lên parent
      setPending((prev) => prev.slice(files.length));
      onChange([...urls, ...serverUrls]);
      toast.success('Upload ảnh thành công');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload ảnh thất bại');
      // Upload lỗi: gỡ các pending tương ứng
      setPending((prev) => prev.slice(files.length));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index) => {
    if (index < urls.length) {
      // Xoá 1 URL đã có
      const newUrls = urls.filter((_, i) => i !== index);
      onChange(newUrls);
    } else {
      // Xoá 1 ảnh đang pending (chưa upload xong)
      const pendingIndex = index - urls.length;
      setPending((prev) => prev.filter((_, i) => i !== pendingIndex));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length > 0) {
      const dt = new DataTransfer();
      files.forEach((file) => dt.items.add(file));
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
        fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
        <span className="text-slate-500 font-normal ml-2">
          ({totalCount}/{maxImages})
        </span>
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={totalCount >= maxImages}
      />

      {/* Preview Grid */}
      {totalCount > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-3">
          {/* URL đã upload xong */}
          {urls.map((url, index) => (
            <div
              key={`url-${index}`}
              className="relative rounded-lg overflow-hidden border border-slate-600 aspect-square bg-slate-800"
            >
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1.5 bg-slate-800/90 hover:bg-red-500/80 text-slate-300 hover:text-white rounded-lg transition-all"
                disabled={uploading}
              >
                <FiX className="text-sm" />
              </button>
            </div>
          ))}

          {/* Ảnh đang upload (local preview) */}
          {pending.map((p, i) => (
            <div
              key={`pending-${i}`}
              className="relative rounded-lg overflow-hidden border border-slate-600 aspect-square bg-slate-800"
            >
              <img
                src={p.localUrl}
                alt={`Uploading ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-500 border-t-transparent"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {totalCount < maxImages && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-600 hover:border-cyan-500/50 rounded-lg p-4 cursor-pointer transition-all text-center"
        >
          <FiImage className="mx-auto text-3xl text-slate-500 mb-1" />
          <p className="text-slate-400 text-sm">
            Kéo thả hoặc nhấn để chọn nhiều ảnh
          </p>
          <p className="text-slate-500 text-xs mt-1">
            PNG, JPG, GIF (tối đa 5MB mỗi ảnh)
          </p>
        </div>
      )}

      {uploading && (
        <p className="text-sm text-cyan-400 mt-2 text-center">
          Đang upload ảnh...
        </p>
      )}
    </div>
  );
}
