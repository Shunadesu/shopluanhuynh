import { Link } from 'react-router-dom';

const AccountCard = ({ account }) => {
  return (
    <Link
      to={`/account/${account._id}`}
      className="card hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 group"
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img
          src={account.images?.[0] || '/placeholder.jpg'}
          alt={account.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {account.status === 'sold' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
              ĐÃ BÁN
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {account.title}
        </h3>
        
        {account.rank && (
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
              {account.rank}
            </span>
            {account.server && (
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                {account.server}
              </span>
            )}
          </div>
        )}

        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          {account.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            {account.originalPrice && account.originalPrice > account.price && (
              <span className="text-slate-500 text-sm line-through mr-2">
                {account.originalPrice.toLocaleString('vi-VN')}đ
              </span>
            )}
            <span className="text-primary text-xl font-bold">
              {account.price.toLocaleString('vi-VN')}đ
            </span>
          </div>
          {account.status === 'available' && (
            <button className="btn-primary text-sm px-4 py-2">
              Xem chi tiết
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default AccountCard;
