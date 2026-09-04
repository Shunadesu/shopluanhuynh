import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/shop/${category.slug}`}
      className="card hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="flex items-center space-x-2">
        {/* Icon/Thumbnail */}
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center flex-shrink-0">
          {category.thumbnail ? (
            <img
              src={category.thumbnail}
              alt={category.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-2xl font-bold text-white">
              {category.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          <p className="text-slate-400 text-sm line-clamp-2">
            {category.description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
