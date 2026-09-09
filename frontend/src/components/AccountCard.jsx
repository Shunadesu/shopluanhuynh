import { Link } from 'react-router-dom';

const AccountCard = ({ account }) => {
  return (
    <Link
      to={`/account/${account._id}`}
      className="card hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 group"
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg mb-2">
        <img
          src={account.images?.[0] || '/placeholder.jpg'}
          alt={account.title}
          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {account.status === 'sold' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              ĐÃ BÁN
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {account.title}
        </h3>

        {/* Account Code */}
        {account.code && (
          <div className="mb-1">
            <span className="text-xs bg-slate-700/70 text-slate-300 px-2 py-0.5 rounded">
              Mã: {account.code}
            </span>
          </div>
        )}

        {/* Rank / Server */}
        {account.rank && (
          <div className="flex items-center space-x-1 mb-1">
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
              {account.rank}
            </span>
            {account.server && (
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                {account.server}
              </span>
            )}
          </div>
        )}

        <p className="text-slate-400 text-xs mb-2 line-clamp-2 min-h-[1rem]">
          {account.description}
        </p>

        {/* Price section */}
        <div className="space-y-1 mt-auto">
          {/* Original price — struck through above */}
          <div className="min-h-[1rem]">
            {account.originalPrice > 0 && account.originalPrice > account.price && (
              <span className="text-slate-400 text-xs line-through">
                {account.originalPrice.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          {/* Sale price — orange */}
          <div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300 font-black text-xl">
              {account.price.toLocaleString('vi-VN')}đ
            </span>
          </div>

          <div className="flex flex-col gap-1.5 min-h-[3.25rem]">
            {account.status === 'available' && (
              <>
                <button className="btn-primary text-xs w-full py-1.5">
                  Xem chi tiết
                </button>
                <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors w-full">
                  Mua ngay
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AccountCard;
