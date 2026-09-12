# Card Deposit Query Migration - Complete

## ✅ Hoàn thành

Đã chuyển đổi nạp thẻ cào từ route riêng `/deposit/card` sang query parameter `?view=card-deposit` trong trang Profile, đồng nhất với cấu trúc nạp ATM `?view=deposit`.

---

## 🔄 Những thay đổi đã thực hiện

### 1. **Profile.jsx** - Thêm logic cho card deposit view

```jsx
// Import CardDepositPanel
import CardDepositPanel from '../components/CardDepositPanel';

// Thêm view param check
const isCardDepositView = viewParam === 'card-deposit';

// Reset activeTab khi vào card deposit view
useEffect(() => {
  if (isDepositView || isCardDepositView) setActiveTab('info');
}, [isDepositView, isCardDepositView]);

// SEO title
const seoTitle = isCardDepositView ? 'Nạp thẻ cào' : ...;

// Render CardDepositPanel khi view=card-deposit
{isCardDepositView ? (
  isLoading ? <ContentSkeleton /> : <CardDepositPanel />
) : ...}
```

### 2. **AccountSidebar.jsx** - Cập nhật path và logic active

**Trước:**
```jsx
{
  key: 'deposit-card',
  label: 'Nạp bằng thẻ cào',
  path: '/deposit/card',  // ❌ Route riêng
  icon: FiPhone,
  highlight: true,
}

const isCardDepositView = location.pathname === '/deposit/card';
```

**Sau:**
```jsx
{
  key: 'deposit-card',
  label: 'Nạp bằng thẻ cào',
  path: '/profile?view=card-deposit',  // ✅ Query param
  icon: FiPhone,
  highlight: true,
}

const isCardDepositView = isOnProfile && viewParam === 'card-deposit';
```

### 3. **Header.jsx** - Cập nhật desktop và mobile navigation

**Desktop nav:**
```jsx
<Link
  to="/profile?view=card-deposit"  // ✅ Query param
  className={`px-4 py-2 rounded-lg font-medium transition-colors ${navLinkColor(
    location.pathname === '/profile' && location.search.includes('view=card-deposit')
  )}`}
>
  Nạp thẻ cào
</Link>
```

**Mobile nav:**
```jsx
<Link
  to="/profile?view=card-deposit"  // ✅ Query param
  className={`px-4 py-2 rounded-lg transition-colors ${mobileLinkColor()}`}
  onClick={() => setShowMobileMenu(false)}
>
  Nạp thẻ cào
</Link>
```

---

## 📋 Cấu trúc query views trong Profile

Tất cả các view đều dùng query parameter `?view=xxx`:

| View | Query | Component |
|------|-------|-----------|
| Trang chủ profile | `/profile` | DefaultProfileView |
| Nạp ATM | `/profile?view=deposit` | DepositPanel |
| **Nạp thẻ cào** | `/profile?view=card-deposit` | **CardDepositPanel** |
| Đơn hàng | `/profile?view=orders` | OrdersSection |
| Chi tiết đơn | `/profile?view=order-detail&orderId=xxx` | OrderDetailSection |
| Tài khoản đã mua | `/profile?view=purchased-accounts` | PurchasedAccountsSection |
| Lịch sử nạp | `/profile?view=deposits` | DepositsSection |

---

## 🎯 Benefits

1. **Đồng nhất UX**: Tất cả các chức năng trong profile đều dùng query params
2. **Sidebar active state**: Active state sidebar hoạt động nhất quán
3. **Navigation**: Breadcrumb và back navigation rõ ràng hơn
4. **SEO**: URLs có cấu trúc rõ ràng `/profile?view=card-deposit`
5. **Code consistency**: Pattern giống với deposit, orders, purchased

---

## 🗑️ Routes cũ có thể xóa (optional)

Nếu muốn dọn dẹp code, có thể xóa route này trong `App.jsx`:

```jsx
// ❌ Route cũ không còn dùng
<Route
  path="/deposit/card"
  element={
    <ProtectedRoute>
      <CardDeposit />
    </ProtectedRoute>
  }
/>
```

Và có thể xóa file:
- `frontend/src/pages/CardDeposit.jsx` (nếu không dùng nữa)

---

## ✨ Testing Checklist

- [x] Click "Nạp thẻ cào" trong AccountSidebar → hiển thị CardDepositPanel
- [x] Click "Nạp thẻ cào" trong Header desktop → hiển thị CardDepositPanel
- [x] Click "Nạp thẻ cào" trong Header mobile menu → hiển thị CardDepositPanel
- [x] Active state trong AccountSidebar highlight đúng khi ở view=card-deposit
- [x] Active state trong Header highlight đúng khi ở view=card-deposit
- [x] SEO title hiển thị "Nạp thẻ cào"
- [x] CardDepositPanel submit form hoạt động bình thường
- [x] URL structure đúng `/profile?view=card-deposit`

---

**Status**: ✅ COMPLETE  
**Date**: 2026-09-12  
**Migration**: `/deposit/card` → `/profile?view=card-deposit`
