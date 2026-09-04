const HeroBanner = ({ settings }) => {
  const title = settings?.hero_banner_title || 'Mua Bán Tài Khoản Game Uy Tín';
  const subtitle = settings?.hero_banner_subtitle || 'Giá rẻ - An toàn - Bảo hành 1 đổi 1';

  return (
    <div className="relative bg-gradient-to-r from-primary-dark via-primary to-primary-light rounded-xl overflow-hidden mb-8">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,.05) 2px, rgba(255,255,255,.05) 4px)',
        }}></div>
      </div>
      
      <div className="relative container-custom py-16 md:py-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-2">
            <a href="/shop" className="bg-white text-primary font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
              Xem cửa hàng
            </a>
            <a href="/deposit" className="bg-transparent border-2 border-white text-white font-semibold px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
              Nạp tiền ngay
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
