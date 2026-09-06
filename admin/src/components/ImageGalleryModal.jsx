import { useState, useEffect, useCallback } from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function ImageGalleryModal({ urls = [], startIndex = 0, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  // Reset current when startIndex changes
  useEffect(() => {
    setCurrent(startIndex);
  }, [startIndex]);

  const prev = useCallback(() => {
    setCurrent((c) => (c > 0 ? c - 1 : urls.length - 1));
  }, [urls.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c < urls.length - 1 ? c + 1 : 0));
  }, [urls.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!urls.length) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm">
        <span className="text-slate-300 text-sm font-medium">
          {current + 1} / {urls.length}
        </span>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-all"
        >
          <FiX />
        </button>
      </div>

      {/* Main image */}
      <div
        className="relative z-10 flex items-center justify-center w-full h-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={current}
          src={urls[current]}
          alt={`Hình ${current + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-fade-in"
        />

        {/* Prev button */}
        {urls.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all backdrop-blur-sm"
          >
            <FiChevronLeft className="text-2xl" />
          </button>
        )}

        {/* Next button */}
        {urls.length > 1 && (
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all backdrop-blur-sm"
          >
            <FiChevronRight className="text-2xl" />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {urls.length > 1 && (
        <div
          className="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-2 p-4 overflow-x-auto bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {urls.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === current
                  ? 'border-cyan-400 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-90'
              }`}
            >
              <img
                src={url}
                alt={`Thumb ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
