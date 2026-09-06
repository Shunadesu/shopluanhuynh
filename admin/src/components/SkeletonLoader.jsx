import ContentLoader from 'react-content-loader';

// Table Skeleton - cho trang dạng bảng (Accounts, Orders, Deposits, Users)
export const TableSkeleton = ({ rows = 5 }) => (
  <div className="table-container">
    <table className="table">
      <thead>
        <tr>
          <th><div className="h-4 bg-slate-700 rounded w-16" /></th>
          <th><div className="h-4 bg-slate-700 rounded w-20" /></th>
          <th><div className="h-4 bg-slate-700 rounded w-24" /></th>
          <th><div className="h-4 bg-slate-700 rounded w-20" /></th>
          <th><div className="h-4 bg-slate-700 rounded w-24" /></th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i}>
            <td><div className="h-4 bg-slate-800 rounded w-32 animate-pulse" /></td>
            <td><div className="h-4 bg-slate-800 rounded w-24 animate-pulse" /></td>
            <td><div className="h-4 bg-slate-800 rounded w-20 animate-pulse" /></td>
            <td><div className="h-4 bg-slate-800 rounded w-16 animate-pulse" /></td>
            <td>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-8 w-8 bg-slate-800 rounded-lg animate-pulse" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Card Skeleton - cho trang dạng card grid (Categories, Sliders)
export const CardSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card">
        <div className="aspect-video bg-slate-700 rounded-lg mb-4 animate-pulse" />
        <div className="h-6 bg-slate-700 rounded w-3/4 mb-2 animate-pulse" />
        <div className="h-4 bg-slate-800 rounded w-full mb-2 animate-pulse" />
        <div className="h-4 bg-slate-800 rounded w-2/3 mb-4 animate-pulse" />
        <div className="flex gap-2 pt-2 border-t border-slate-700">
          <div className="flex-1 h-10 bg-slate-700 rounded-lg animate-pulse" />
          <div className="flex-1 h-10 bg-slate-700 rounded-lg animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

// Stats Skeleton - cho Dashboard stats cards
export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="card bg-cyan-500/10 border-cyan-500/30">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-slate-700 rounded w-24 animate-pulse" />
            <div className="h-8 bg-slate-700 rounded w-20 animate-pulse" />
          </div>
          <div className="w-14 h-14 bg-slate-700 rounded-xl animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

// Table Skeleton with custom columns - cho Dashboard orders table
export const OrderTableSkeleton = ({ rows = 5 }) => (
  <div className="table-container">
    <table className="table">
      <thead>
        <tr>
          <th><div className="h-4 bg-slate-700 rounded w-16" /></th>
          <th><div className="h-4 bg-slate-700 rounded w-24" /></th>
          <th><div className="h-4 bg-slate-700 rounded w-32" /></th>
          <th><div className="h-4 bg-slate-700 rounded w-20" /></th>
          <th><div className="h-4 bg-slate-700 rounded w-24" /></th>
          <th><div className="h-4 bg-slate-700 rounded w-28" /></th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i}>
            <td><div className="h-4 bg-slate-800 rounded w-20 animate-pulse" /></td>
            <td><div className="h-4 bg-slate-800 rounded w-24 animate-pulse" /></td>
            <td><div className="h-4 bg-slate-800 rounded w-40 animate-pulse" /></td>
            <td><div className="h-4 bg-slate-800 rounded w-16 animate-pulse" /></td>
            <td><div className="h-6 bg-slate-800 rounded-full w-20 animate-pulse" /></td>
            <td><div className="h-4 bg-slate-800 rounded w-28 animate-pulse" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Quick Stats Skeleton - cho Dashboard quick stats
export const QuickStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-700 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-700 rounded w-24 animate-pulse" />
            <div className="h-8 bg-slate-700 rounded w-12 animate-pulse" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Form Skeleton - cho Settings page
export const FormSkeleton = () => (
  <div className="card space-y-4">
    <div className="h-6 bg-slate-700 rounded w-1/4 animate-pulse" />
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-slate-700 rounded w-24 animate-pulse" />
        <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-700 rounded w-20 animate-pulse" />
        <div className="h-24 bg-slate-800 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded w-16 animate-pulse" />
          <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded w-20 animate-pulse" />
          <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
    <div className="h-10 bg-slate-700 rounded-lg w-1/4 animate-pulse" />
  </div>
);

// Search Filter Skeleton
export const FilterSkeleton = () => (
  <div className="flex gap-4">
    <div className="flex-1 h-10 bg-slate-800 rounded-lg animate-pulse" />
    <div className="w-64 h-10 bg-slate-800 rounded-lg animate-pulse" />
  </div>
);

// Sliders Grid Skeleton - aspect ratio 21/9 for sliders
export const SliderCardSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card">
        <div className="aspect-[21/9] bg-slate-700 rounded-lg mb-4 animate-pulse" />
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-slate-700 rounded w-1/2 animate-pulse" />
            <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-slate-700 rounded-full w-16 animate-pulse" />
            <div className="h-6 bg-slate-700 rounded-full w-12 animate-pulse" />
          </div>
        </div>
        <div className="h-4 bg-slate-800 rounded w-full mb-3 animate-pulse" />
        <div className="flex gap-2 pt-3 border-t border-slate-700">
          <div className="flex-1 h-10 bg-slate-700 rounded-lg animate-pulse" />
          <div className="flex-1 h-10 bg-slate-700 rounded-lg animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

// AccountForm Skeleton - cho trang tạo/sửa tài khoản game
export const AccountFormSkeleton = () => (
  <div className="space-y-2">
    {/* Header */}
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 bg-slate-700 rounded-lg animate-pulse" />
      <div className="space-y-2">
        <div className="h-8 bg-slate-700 rounded w-48 animate-pulse" />
        <div className="h-4 bg-slate-800 rounded w-36 animate-pulse" />
      </div>
    </div>

    {/* Form card */}
    <div className="card space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tiêu đề - full width */}
        <div className="md:col-span-2 space-y-2">
          <div className="h-4 bg-slate-700 rounded w-24 animate-pulse" />
          <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
        </div>

        {/* Danh mục + Giá */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded w-20 animate-pulse" />
          <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded w-24 animate-pulse" />
          <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
        </div>

        {/* Trạng thái + Hot toggle */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded w-20 animate-pulse" />
          <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded w-28 animate-pulse" />
          <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
        </div>

        {/* Hàng đợi + BP */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded w-28 animate-pulse" />
          <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded w-16 animate-pulse" />
          <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
        </div>

        {/* Điện thoại + Email */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded w-24 animate-pulse" />
          <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded w-16 animate-pulse" />
          <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
        </div>

        {/* CCCD */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded w-20 animate-pulse" />
          <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Mô tả */}
      <div className="space-y-2">
        <div className="h-4 bg-slate-700 rounded w-16 animate-pulse" />
        <div className="h-24 bg-slate-800 rounded-lg animate-pulse" />
      </div>

      {/* Thông tin đăng nhập */}
      <div className="space-y-2">
        <div className="h-4 bg-slate-700 rounded w-36 animate-pulse" />
        <div className="h-20 bg-slate-800 rounded-lg animate-pulse" />
      </div>

      {/* Ảnh */}
      <div className="space-y-2">
        <div className="h-4 bg-slate-700 rounded w-32 animate-pulse" />
        <div className="h-32 bg-slate-800 rounded-lg animate-pulse" />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t border-slate-700">
        <div className="flex-1 h-10 bg-slate-700 rounded-lg animate-pulse" />
        <div className="flex-1 h-10 bg-slate-800 rounded-lg animate-pulse" />
      </div>
    </div>
  </div>
);
