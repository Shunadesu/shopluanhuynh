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
      <div>
        <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2 group-hover:text-primary transition-colors">
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

        <p className="text-slate-400 text-xs mb-2 line-clamp-2">
          {account.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            {account.originalPrice && account.originalPrice > account.price && (
              <span className="text-slate-500 text-xs line-through mr-1">
                {account.originalPrice.toLocaleString('vi-VN')}đ
              </span>
            )}
            <span className="text-primary text-base font-bold">
              {account.price.toLocaleString('vi-VN')}đ
            </span>
          </div>
          {account.status === 'available' && (
            <button className="btn-primary text-xs px-2 py-1">
              Xem chi tiết
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default AccountCard;
