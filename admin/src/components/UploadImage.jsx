import { useState, useRef, useEffect } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api, { getImageUrl } from '../utils/api';

export default function UploadImage({ value, onChange, label = 'Hình ảnh' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value ? getImageUrl(value) : '');
  const fileInputRef = useRef(null);

  // Sync preview when value changes from outside
  useEffect(() => {
    if (value) {
      setPreview(getImageUrl(value));
    } else {
      setPreview('');
    }
  }, [value]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    // Upload to server
    setUploading(true);
    try {
      const { data } = await api.uploadImage(file);
      const imageUrl = data.url;
      
      // Update with server URL
      setPreview(imageUrl);
      onChange(imageUrl);
      toast.success('Upload ảnh thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload ảnh thất bại');
      setPreview('');
      onChange('');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const dt = new DataTransfer();
      dt.items.add(file);
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
      </label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-600">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
              disabled={uploading}
            >
              <FiUpload className="text-sm" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-slate-800/90 hover:bg-red-500/80 text-slate-300 hover:text-white rounded-lg transition-all"
              disabled={uploading}
            >
              <FiX className="text-sm" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-600 hover:border-cyan-500/50 rounded-lg p-6 cursor-pointer transition-all text-center"
        >
          <FiImage className="mx-auto text-4xl text-slate-500 mb-2" />
          <p className="text-slate-400 text-sm">
            Kéo thả hình ảnh hoặc nhấn để chọn
          </p>
          <p className="text-slate-500 text-xs mt-1">
            PNG, JPG, GIF (tối đa 5MB)
          </p>
        </div>
      )}
    </div>
  );
}
