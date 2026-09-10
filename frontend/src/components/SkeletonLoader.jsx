const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-300 dark:bg-slate-700 rounded ${className}`} />
);

// Skeleton cho toàn bộ trang AccountDetail
export const AccountDetailSkeleton = () => (
  <div className="min-h-screen pt-20 pb-4">
    <div className="container-custom">
      {/* Breadcrumb */}
      <div className="flex gap-2 mb-2 text-xs">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-stretch">
        {/* Image side */}
        <div>
          {/* Hero image card */}
          <div className="card p-1 mb-2 relative">
            <Skeleton className="w-full h-72 rounded-lg" />
            {/* Overlay title/category */}
            <div className="absolute bottom-0 left-0 right-0 p-2 rounded-b-lg space-y-1">
              <Skeleton className="h-4 w-20 rounded mb-1" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
          </div>

          {/* Thumbnail grid */}
          <div className="grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative border-2 border-slate-300 dark:border-slate-700 rounded overflow-hidden">
                <Skeleton className="h-16 w-full rounded-none" />
                <Skeleton className="absolute top-0.5 left-0.5 h-3 w-5 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Info side */}
        <div className="card p-3 flex flex-col gap-2">
          {/* Account title (h1) */}
          <Skeleton className="h-5 w-3/4" />

          {/* Price card with discount badge */}
          <div className="relative bg-slate-100 dark:bg-slate-800/80 rounded p-4 border border-slate-200 dark:border-slate-700 space-y-1">
            {/* Discount badge (absolute top-right) */}
            <Skeleton className="absolute -top-2 -right-2 h-5 w-14 rounded-full" />
            {/* Original price struck through */}
            <div className="flex justify-center">
              <Skeleton className="h-3 w-24" />
            </div>
            {/* Label + sale price */}
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-9 w-48" />
            </div>
          </div>

          {/* Stats card (teamValue + BP) */}
          <div className="bg-slate-100 dark:bg-slate-800/50 rounded p-2 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Description block */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>

          {/* Additional info block */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto pt-2">
            <Skeleton className="flex-1 h-12 rounded-lg" />
            <Skeleton className="flex-1 h-12 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Gallery section */}
      <div className="mt-4">
        {/* Toggle header */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        {/* Gallery images */}
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative rounded overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Skeleton className="absolute top-1 left-1 h-4 w-10 rounded z-10" />
              <Skeleton className="w-full h-72 max-h-[500px] rounded-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Related section */}
      <div className="mt-4">
        <Skeleton className="h-5 w-56 mb-2" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-2 space-y-2">
              <Skeleton className="w-full h-24 rounded" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Skeleton riêng cho Gallery (hình ảnh chi tiết) — dùng cho lazy load
export const AccountGallerySkeleton = () => (
  <div className="mt-4">
    {/* Toggle header */}
    <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded mb-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-4 w-4 rounded-full" />
    </div>
    {/* Images */}
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative rounded overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <Skeleton className="absolute top-1 left-1 h-4 w-10 rounded z-10" />
          <Skeleton className="w-full h-72 max-h-[500px] rounded-none" />
        </div>
      ))}
    </div>
  </div>
);

// Skeleton cho Related Accounts
export const RelatedAccountsSkeleton = () => (
  <div className="mt-4">
    <Skeleton className="h-6 w-56 mb-2" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card p-2 space-y-2">
          <Skeleton className="w-full h-24 rounded" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="min-h-screen pt-20 pb-6">
    <div className="container-custom space-y-4">
      {/* Hero */}
      <div className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-16 w-40 rounded-xl" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-4 space-y-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-0">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-t-lg" />
        ))}
      </div>

      {/* Info Card with animated border */}
      <div className="rounded-2xl p-[2px]" style={{ background: 'linear-gradient(90deg, #D84315, #FF6D00, #FFAB40, #D84315)', backgroundSize: '300% 100%', animation: 'border-flow 2s linear infinite' }}>
        <div className="bg-white dark:bg-dark-light rounded-[14px] p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-200 dark:border-slate-700 last:border-0">
              <Skeleton className="h-5 w-5 rounded mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="card p-4 space-y-2 text-center">
            <Skeleton className="h-10 w-10 rounded-full mx-auto" />
            <Skeleton className="h-4 w-28 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const OrdersSkeleton = () => (
  <div className="min-h-screen pt-20 pb-6">
    <div className="container-custom space-y-4">
      {/* Hero */}
      <div className="bg-white dark:bg-dark-light border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-4 space-y-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-10" />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 pb-0 overflow-x-auto">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-36 rounded-t-lg shrink-0" />
        ))}
      </div>

      {/* Order Cards */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-3 w-16 ml-auto" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex gap-2">
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-12 w-36 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const OrderDetailSkeleton = () => (
  <div className="min-h-screen pt-20 pb-6">
    <div className="container-custom">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="lg:col-span-2 space-y-4">
          {/* Status Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
          </div>

          {/* Item Card */}
          <div className="card p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-4">
              <Skeleton className="w-24 h-24 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2 pt-2">
                <Skeleton className="h-5 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            {/* Credentials */}
            <div className="bg-slate-200 dark:bg-slate-800 rounded-lg p-4 space-y-3">
              <Skeleton className="h-4 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 space-y-4 sticky top-24">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-8" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-px w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Skeleton cho Deposit Page
export const DepositSkeleton = () => (
  <div className="min-h-screen pt-20 pb-6">
    <div className="container-custom">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-5 w-36" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Card */}
          <div className="card bg-gradient-to-br from-primary-dark to-primary p-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-10 w-48" />
              </div>
              <Skeleton className="w-16 h-16 rounded-full" />
            </div>
          </div>

          {/* Amount Section */}
          <div className="card p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-14 w-full mb-4 rounded-lg" />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Bank Selection */}
          <div className="card p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-16 h-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Instructions */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Skeleton cho Account Card
export const AccountCardSkeleton = () => (
  <div className="card p-3 space-y-3">
    <Skeleton className="w-full h-40 sm:h-48 rounded-lg" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <div className="flex gap-2">
      <Skeleton className="h-5 w-20 rounded" />
      <Skeleton className="h-5 w-16 rounded" />
    </div>
    <Skeleton className="h-5 w-24 rounded" />
    <div className="space-y-2 mt-auto">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-9 w-full rounded-lg" />
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>
  </div>
);

// Skeleton cho Shop Grid (nhiều AccountCard)
export const AccountGridSkeleton = ({ count = 8 }) => (
  <div className="container-custom">
    {/* Section Header */}
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-5 w-24" />
    </div>
    {/* Grid */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <AccountCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Skeleton cho toàn bộ trang Shop
export const ShopSkeleton = () => (
  <div className="min-h-screen pt-20 pb-6">
    {/* Page Title */}
    <div className="container-custom mb-6 space-y-2">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-4 w-40" />
    </div>

    {/* Filters Bar */}
    <div className="container-custom mb-6">
      <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
          <Skeleton className="h-10 flex-1 min-w-[180px] rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </div>
    </div>

    {/* Categories Bar */}
    <div className="container-custom mb-6">
      <div className="flex gap-2 overflow-x-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-lg shrink-0" />
        ))}
      </div>
    </div>

    {/* Main Content - 2 category sections */}
    <AccountGridSkeleton count={8} />
    <div className="py-6">
      <div className="container-custom">
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <AccountCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Skeleton;
