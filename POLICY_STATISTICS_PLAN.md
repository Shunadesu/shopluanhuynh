# Kế hoạch phát triển trang "Thống kê chính sách"

## 📋 Tổng quan

**Trang hiện tại**: Disabled (chưa triển khai)  
**Vị trí**: `/profile?view=policies`  
**Menu item**: AccountSidebar line 28-33  
**Mục đích**: Dashboard thống kê về policies, user behavior, và insights cho admin/user

---

## 🚫 Nguyên nhân không truy cập được

```jsx
// AccountSidebar.jsx:28-33
{
  key: 'policies',
  label: 'Thống kê chính sách',
  path: '/profile?view=policies',
  icon: FiTrendingUp,
  disabled: true,  // ⚠️ Bị disabled
}
```

**Vấn đề**:
1. ✅ Menu item đã được định nghĩa trong `MENU_ITEMS`
2. ❌ Thuộc tính `disabled: true` khiến không thể click
3. ❌ Không có route handler cho `view=policies` trong Profile.jsx
4. ❌ Chưa có component `PoliciesSection`
5. ❌ Chưa có API endpoint để lấy dữ liệu thống kê

---

## 🎯 Mục tiêu phát triển

### Phase 1: Basic Statistics (MVP) ⭐
Thống kê cơ bản về hoạt động của user và hệ thống

**Metrics hiển thị**:
- 📊 Tổng số đơn hàng theo trạng thái (completed/pending/cancelled)
- 💰 Tổng số tiền đã nạp/đã chi tiêu
- 🎮 Số lượng tài khoản game đã mua theo category
- 📈 Xu hướng mua hàng (7 ngày, 30 ngày, 90 ngày)
- 🎰 Lịch sử vòng quay (nếu có tính năng spin)
- 💳 Phương thức nạp tiền được sử dụng nhiều nhất

### Phase 2: Advanced Analytics 🚀
Dashboard nâng cao với charts và insights

**Tính năng**:
- 📉 Biểu đồ line chart: xu hướng chi tiêu theo thời gian
- 🥧 Pie chart: phân bố theo category game
- 📊 Bar chart: so sánh nạp tiền vs chi tiêu
- 🏆 Top 5 sản phẩm đã mua
- 📅 Calendar heatmap: hoạt động theo ngày
- 🎯 Achievement badges (loyal customer, big spender, etc.)

### Phase 3: Policy Documents 📄
Hiển thị chính sách và điều khoản

**Nội dung**:
- 📜 Chính sách hoàn tiền
- 🔒 Chính sách bảo mật
- ⚖️ Điều khoản sử dụng
- 🎁 Chương trình khuyến mãi
- 📞 Chính sách hỗ trợ

---

## 🛠️ Kế hoạch triển khai

### Step 1: Enable menu và tạo route ✅

**File**: `frontend/src/components/AccountSidebar.jsx`
```jsx
{
  key: 'policies',
  label: 'Thống kê chính sách',
  path: '/profile?view=policies',
  icon: FiTrendingUp,
  disabled: false,  // ✅ Bật lại
}
```

**File**: `frontend/src/pages/Profile.jsx`
```jsx
// Thêm constant
const isPoliciesView = viewParam === 'policies';

// Thêm vào routing logic
{isPoliciesView ? (
  <PoliciesSection user={user} />
) : ...}
```

### Step 2: Tạo PoliciesSection Component 📦

**File**: `frontend/src/components/PoliciesSection.jsx`

**Structure**:
```jsx
const PoliciesSection = ({ user }) => {
  return (
    <>
      {/* Hero Section */}
      <HeroCard />
      
      {/* Stats Grid - 4 cards */}
      <StatsGrid stats={statistics} />
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SpendingTrendChart />
        <CategoryDistributionChart />
      </div>
      
      {/* Activity Timeline */}
      <ActivityTimeline activities={recentActivities} />
      
      {/* Policy Links */}
      <PolicyLinksGrid />
    </>
  );
};
```

### Step 3: Tạo Backend API 🔌

**File**: `server/routes/statistics.js`

```js
// GET /api/statistics/user/:userId
router.get('/user/:userId', auth, async (req, res) => {
  // Aggregate data from:
  // - Orders collection
  // - DepositRequests collection
  // - SpinHistory collection
  // - GameAccounts collection
  
  const stats = {
    totalOrders: 0,
    totalSpent: 0,
    totalDeposited: 0,
    accountsByCategory: [],
    ordersByStatus: { pending: 0, completed: 0, cancelled: 0 },
    spendingTrend: [], // Last 30 days
    depositMethods: { bank: 0, card: 0 },
    recentActivity: [],
  };
  
  res.json(stats);
});
```

### Step 4: Tạo Custom Hook 🎣

**File**: `frontend/src/hooks/useStatistics.js`

```js
export const useStatistics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStatistics();
  }, []);
  
  const fetchStatistics = async () => {
    const res = await api.get('/statistics/user/me');
    setData(res.data);
    setLoading(false);
  };
  
  return { data, loading, refresh: fetchStatistics };
};
```

### Step 5: Chart Components 📊

**Libraries cần cài**:
```bash
npm install recharts
# or
npm install chart.js react-chartjs-2
```

**Components**:
- `SpendingTrendChart.jsx` - Line chart
- `CategoryPieChart.jsx` - Pie chart
- `DepositVsSpendingChart.jsx` - Bar chart comparison

---

## 🎨 UI/UX Design

### Color Scheme
- **Primary**: `#FF6D00` (Orange gradient)
- **Success**: `#10B981` (Green)
- **Warning**: `#F59E0B` (Yellow)
- **Info**: `#3B82F6` (Blue)
- **Purple**: `#A855F7` (Charts accent)

### Layout Structure
```
┌─────────────────────────────────────────┐
│ 🏆 Hero: Thống kê chính sách           │
│    "Xem insights về hoạt động của bạn"  │
└─────────────────────────────────────────┘

┌────────┬────────┬────────┬────────┐
│ 📦 Đơn │ 💰 Chi │ 💳 Nạp │ 🎮 TK  │
│   25   │  2.5M  │  3.0M  │   12   │
└────────┴────────┴────────┴────────┘

┌──────────────────┬──────────────────┐
│  📈 Xu hướng     │  🥧 Phân bố      │
│  chi tiêu        │  theo category   │
│  [Line Chart]    │  [Pie Chart]     │
└──────────────────┴──────────────────┘

┌─────────────────────────────────────┐
│  ⏱️ Hoạt động gần đây                │
│  • Mua tài khoản Liên Quân - 2h     │
│  • Nạp 500k qua ngân hàng - 1d      │
│  • Hoàn thành đơn #12345 - 3d       │
└─────────────────────────────────────┘

┌──────────────────┬──────────────────┐
│ 📜 Chính sách    │ 🔒 Bảo mật       │
│    hoàn tiền     │    thông tin     │
└──────────────────┴──────────────────┘
```

---

## 📊 Database Queries

### 1. Aggregate Orders Statistics
```js
const orderStats = await Order.aggregate([
  { $match: { userId: req.user.id } },
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      total: { $sum: '$totalAmount' },
    },
  },
]);
```

### 2. Category Distribution
```js
const categoryStats = await Order.aggregate([
  { $match: { userId: req.user.id, status: 'completed' } },
  { $unwind: '$items' },
  {
    $lookup: {
      from: 'gameaccounts',
      localField: 'items.accountId',
      foreignField: '_id',
      as: 'account',
    },
  },
  { $unwind: '$account' },
  {
    $group: {
      _id: '$account.category',
      count: { $sum: 1 },
      spent: { $sum: '$items.price' },
    },
  },
]);
```

### 3. Spending Trend (Last 30 days)
```js
const spendingTrend = await Order.aggregate([
  {
    $match: {
      userId: req.user.id,
      status: 'completed',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  },
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      total: { $sum: '$totalAmount' },
      count: { $sum: 1 },
    },
  },
  { $sort: { _id: 1 } },
]);
```

---

## 🔐 Security & Permissions

### Authorization
- ✅ User chỉ xem được statistics của chính mình
- ✅ Admin có thể xem statistics của tất cả users
- ✅ Sử dụng middleware `auth` để verify token
- ✅ Rate limiting: 100 requests/15 minutes

### Data Privacy
- ❌ Không expose sensitive data (passwords, card info)
- ✅ Chỉ hiển thị aggregated numbers
- ✅ Mask partial card numbers: `**** **** **** 1234`

---

## 📱 Responsive Design

### Desktop (lg+)
- 2-column layout cho charts
- 4-column stats grid
- Full-width timeline

### Tablet (md)
- 2-column stats grid
- Stacked charts
- Compact timeline

### Mobile (sm)
- 2-column stats grid (smaller cards)
- Horizontal scroll cho charts
- Minimal timeline items

---

## ⚡ Performance Optimization

1. **Caching**: Cache statistics data for 5 minutes
2. **Pagination**: Limit activity timeline to 20 recent items
3. **Lazy Loading**: Load charts only when scrolled into view
4. **Debouncing**: Debounce refresh button clicks
5. **Memoization**: Use `useMemo` for expensive calculations

---

## 🧪 Testing Plan

### Unit Tests
- ✅ Test statistics API endpoint
- ✅ Test data aggregation logic
- ✅ Test PoliciesSection component rendering

### Integration Tests
- ✅ Test complete flow: fetch → display → refresh
- ✅ Test error handling (network failure, invalid data)

### E2E Tests
- ✅ User navigates to policies page
- ✅ Charts load correctly
- ✅ Activity timeline displays recent actions

---

## 📅 Timeline Estimate

| Phase | Tasks | Duration | Priority |
|-------|-------|----------|----------|
| **Phase 1** | Enable route, basic stats, API | 2-3 days | ⭐⭐⭐ High |
| **Phase 2** | Charts, advanced analytics | 3-4 days | ⭐⭐ Medium |
| **Phase 3** | Policy documents, polish | 1-2 days | ⭐ Low |

**Total**: 6-9 days

---

## 🚀 Quick Start Implementation

### Minimal MVP (1-2 hours)

1. Bỏ `disabled: true` trong AccountSidebar
2. Thêm route handler trong Profile.jsx
3. Tạo component đơn giản:

```jsx
const PoliciesSection = ({ user }) => {
  const { data: orders } = useOrders();
  const { data: deposits } = useMyDepositRequests();
  
  const totalOrders = orders?.length || 0;
  const totalSpent = orders
    ?.filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalAmount, 0) || 0;
  const totalDeposited = deposits
    ?.filter(d => d.status === 'approved')
    .reduce((sum, d) => sum + d.amount, 0) || 0;
  
  return (
    <>
      <HeroCard title="Thống kê chính sách" />
      <StatsGrid stats={{ totalOrders, totalSpent, totalDeposited }} />
      <div className="card p-8 text-center">
        <p>Biểu đồ và phân tích chi tiết đang được phát triển...</p>
      </div>
    </>
  );
};
```

---

## 📝 Notes

- Cân nhắc đổi tên từ "Thống kê chính sách" → "Dashboard" hoặc "Thống kê tài khoản" (dễ hiểu hơn)
- Icon `FiTrendingUp` phù hợp với statistics/analytics
- Có thể tích hợp thêm tính năng export PDF report
- Cân nhắc thêm date range picker để filter theo khoảng thời gian

---

**Status**: 🔨 Chưa triển khai (disabled)  
**Next Action**: Bật menu item và tạo basic MVP component
