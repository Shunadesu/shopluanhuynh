# 📋 Kế hoạch: Chia trang Deposits Admin thành 2 Tabs

## 🎯 Mục tiêu

Cải tiến trang **Admin Deposits** để phân tách rõ ràng 2 phương thức nạp tiền:
1. **Tab Nạp Ngân hàng** - Tự động với Telegram Bot
2. **Tab Nạp Thẻ cào** - Thủ công, admin check serial/code

---

## 📊 Hiện trạng

### Trang hiện tại (`admin/src/pages/Deposits.jsx`)
- ✅ Hiển thị tất cả deposits trong 1 table
- ✅ Badge phân biệt: bank (blue) vs card (purple)
- ✅ Filter theo status: pending/approved/rejected
- ✅ Modal chi tiết support cả 2 loại
- ✅ Actions: approve/reject cho từng deposit
- ⚠️ **Vấn đề**: Bank và Card deposits trộn lẫn, khó quản lý riêng

### Ví dụ table hiện tại:
```
| Mã GD | User | Phương thức | Số tiền | Thông tin | Status | Thời gian | Actions |
|-------|------|-------------|---------|-----------|--------|-----------|---------|
| #A1B2 | john | 🔵 Ngân hàng | 100K   | Vietcombank | ⏳ Chờ | 10:30   | 👁️ ✅ ❌ |
| #C3D4 | mary | 🟣 Thẻ cào   | 50K    | Viettel     | ⏳ Chờ | 10:25   | 👁️ ✅ ❌ |
| #E5F6 | bob  | 🔵 Ngân hàng | 200K   | Techcombank | ✅ Duyệt| 10:20   | 👁️     |
```

---

## 🎨 Design mới - 2 Tabs

### Layout tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│  Yêu cầu nạp tiền                                           │
│  Quản lý yêu cầu nạp tiền từ người dùng                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ 🏦 Nạp Ngân hàng │  │ 📱 Nạp Thẻ cào   │                │
│  │    (12 chờ)      │  │    (5 chờ)       │                │
│  └──────────────────┘  └──────────────────┘                │
├─────────────────────────────────────────────────────────────┤
│  [🔍 Search] [Filter Status] [🔄 Refresh]                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tab content: Table riêng cho từng loại                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 Chi tiết từng Tab

### Tab 1: Nạp Ngân hàng 🏦

**Đặc điểm:**
- Icon: `FiCreditCard`
- Color: Blue (`bg-blue-500`, `text-blue-400`)
- Badge counter: số lượng pending
- Hiển thị: `depositMethod === 'bank' || depositMethod == null`

**Columns table:**
| Column | Nội dung | Width |
|--------|----------|-------|
| Mã GD | `#A1B2C3D4` (8 chars cuối) | 120px |
| Người dùng | Username + Email/Phone | 200px |
| Ngân hàng | `bankName` + `accountNumber` | 180px |
| Nội dung CK | `transferNote` | 150px |
| Số tiền | `100,000đ` (cyan) | 120px |
| Trạng thái | Badge (pending/approved/rejected) | 120px |
| Thời gian | `dd/MM/yyyy HH:mm` | 140px |
| Thao tác | 👁️ ✅ ❌ | 120px |

**Actions:**
- 👁️ **Xem**: Mở modal chi tiết bank deposit
- ✅ **Duyệt**: Approve → cộng tiền user
- ❌ **Từ chối**: Reject với lý do

**Workflow:**
1. User nạp bank → tạo DepositRequest
2. ✅ Telegram Bot gửi notification tới admin
3. Admin vào tab "Nạp Ngân hàng"
4. Check transferNote/transactionCode
5. Approve/Reject

---

### Tab 2: Nạp Thẻ cào 📱

**Đặc điểm:**
- Icon: `FiPhone`
- Color: Purple (`bg-purple-500`, `text-purple-400`)
- Badge counter: số lượng pending
- Hiển thị: `depositMethod === 'card'`

**Columns table:**
| Column | Nội dung | Width |
|--------|----------|-------|
| Mã GD | `#A1B2C3D4` (8 chars cuối) | 120px |
| Người dùng | Username + Email/Phone | 200px |
| Loại thẻ | Viettel/Mobifone/Vinaphone (có màu) | 120px |
| Serial | `12345678***` (masked) | 140px |
| Số tiền | `100,000đ` (cyan) | 120px |
| Trạng thái | Badge (pending/approved/rejected) | 120px |
| Thời gian | `dd/MM/yyyy HH:mm` | 140px |
| Thao tác | 👁️ ✅ ❌ | 120px |

**Actions:**
- 👁️ **Xem**: Mở modal chi tiết card deposit
  - Hiển thị **full serial + code** (không mask)
  - Button copy serial
  - Button copy code
- ✅ **Duyệt**: Approve sau khi check thẻ OK
- ❌ **Từ chối**: Reject nếu thẻ lỗi/đã dùng

**Workflow:**
1. User nạp card → tạo DepositRequest
2. ❌ KHÔNG gửi Telegram (theo yêu cầu)
3. Admin tự vào tab "Nạp Thẻ cào" để check
4. Click modal → copy serial + code
5. Check thẻ external (website nhà mạng)
6. Approve nếu OK / Reject nếu lỗi

---

## 🔧 Implementation Plan

### 1. State Management

```javascript
// Thêm state cho active tab
const [activeTab, setActiveTab] = useState('bank'); // 'bank' | 'card'

// Query riêng cho mỗi tab
const { data: bankDeposits, isLoading: bankLoading } = useQuery({
  queryKey: ['admin-deposits', 'bank', statusFilter, searchTerm],
  queryFn: async () => {
    const { data } = await api.get('/admin/deposits', {
      params: {
        depositMethod: 'bank',
        status: statusFilter,
        search: searchTerm,
      }
    });
    return data;
  },
  enabled: activeTab === 'bank',
});

const { data: cardDeposits, isLoading: cardLoading } = useQuery({
  queryKey: ['admin-deposits', 'card', statusFilter, searchTerm],
  queryFn: async () => {
    const { data } = await api.get('/admin/deposits', {
      params: {
        depositMethod: 'card',
        status: statusFilter,
        search: searchTerm,
      }
    });
    return data;
  },
  enabled: activeTab === 'card',
});

// Pending counters
const { data: pendingCounts } = useQuery({
  queryKey: ['admin-deposits-pending-counts'],
  queryFn: async () => {
    const { data } = await api.get('/admin/deposits/pending-count');
    return data; // { bank: 12, card: 5 }
  },
  refetchInterval: 30000, // Auto refresh 30s
});
```

### 2. Tab Navigation Component

```jsx
<div className="flex gap-2 mb-6">
  {/* Bank Tab */}
  <button
    onClick={() => setActiveTab('bank')}
    className={`
      flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all
      ${activeTab === 'bank'
        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
      }
    `}
  >
    <FiCreditCard className="w-5 h-5" />
    <span>Nạp Ngân hàng</span>
    {pendingCounts?.bank > 0 && (
      <span className={`
        px-2 py-0.5 rounded-full text-xs font-bold
        ${activeTab === 'bank' ? 'bg-white text-blue-600' : 'bg-blue-500/20 text-blue-400'}
      `}>
        {pendingCounts.bank}
      </span>
    )}
  </button>

  {/* Card Tab */}
  <button
    onClick={() => setActiveTab('card')}
    className={`
      flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all
      ${activeTab === 'card'
        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
      }
    `}
  >
    <FiPhone className="w-5 h-5" />
    <span>Nạp Thẻ cào</span>
    {pendingCounts?.card > 0 && (
      <span className={`
        px-2 py-0.5 rounded-full text-xs font-bold
        ${activeTab === 'card' ? 'bg-white text-purple-600' : 'bg-purple-500/20 text-purple-400'}
      `}>
        {pendingCounts.card}
      </span>
    )}
  </button>
</div>
```

### 3. Table Components

**BankDepositsTable.jsx** - Riêng cho Bank
```jsx
function BankDepositsTable({ deposits, onViewDetail, onApprove, onReject }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Mã GD</th>
          <th>Người dùng</th>
          <th>Ngân hàng</th>
          <th>Nội dung CK</th>
          <th>Số tiền</th>
          <th>Trạng thái</th>
          <th>Thời gian</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {deposits.map(deposit => (
          <tr key={deposit._id}>
            <td className="font-mono text-cyan-400">
              #{deposit._id.slice(-8).toUpperCase()}
            </td>
            <td>
              <div>
                <p className="font-medium">{deposit.userId?.username}</p>
                <p className="text-xs text-slate-400">
                  {deposit.userId?.email || deposit.userId?.phone}
                </p>
              </div>
            </td>
            <td>
              <div>
                <p className="font-medium">{deposit.bankAccountId?.bankName}</p>
                <p className="text-xs text-slate-400">
                  {deposit.bankAccountId?.accountNumber}
                </p>
              </div>
            </td>
            <td className="font-mono text-sm text-slate-300">
              {deposit.transferNote || 'N/A'}
            </td>
            <td className="font-semibold text-cyan-400">
              {deposit.amount?.toLocaleString('vi-VN')}đ
            </td>
            <td>
              <StatusBadge status={deposit.status} />
            </td>
            <td className="text-slate-400 text-sm">
              {format(new Date(deposit.createdAt), 'dd/MM/yyyy HH:mm')}
            </td>
            <td>
              <ActionButtons
                deposit={deposit}
                onView={() => onViewDetail(deposit)}
                onApprove={() => onApprove(deposit._id)}
                onReject={() => onReject(deposit._id)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**CardDepositsTable.jsx** - Riêng cho Card
```jsx
function CardDepositsTable({ deposits, onViewDetail, onApprove, onReject }) {
  const getCardTypeStyle = (cardType) => {
    const styles = {
      viettel: 'text-red-400',
      mobifone: 'text-blue-400',
      vinaphone: 'text-purple-400',
    };
    return styles[cardType] || 'text-slate-400';
  };

  const getCardTypeName = (cardType) => {
    const names = {
      viettel: 'Viettel',
      mobifone: 'Mobifone',
      vinaphone: 'Vinaphone',
    };
    return names[cardType] || cardType;
  };

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Mã GD</th>
          <th>Người dùng</th>
          <th>Loại thẻ</th>
          <th>Serial</th>
          <th>Số tiền</th>
          <th>Trạng thái</th>
          <th>Thời gian</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {deposits.map(deposit => (
          <tr key={deposit._id}>
            <td className="font-mono text-cyan-400">
              #{deposit._id.slice(-8).toUpperCase()}
            </td>
            <td>
              <div>
                <p className="font-medium">{deposit.userId?.username}</p>
                <p className="text-xs text-slate-400">
                  {deposit.userId?.email || deposit.userId?.phone}
                </p>
              </div>
            </td>
            <td>
              <span className={`font-semibold ${getCardTypeStyle(deposit.cardType)}`}>
                {getCardTypeName(deposit.cardType)}
              </span>
            </td>
            <td className="font-mono text-sm text-slate-300">
              {deposit.cardSerial?.substring(0, 8)}***
            </td>
            <td className="font-semibold text-cyan-400">
              {deposit.amount?.toLocaleString('vi-VN')}đ
            </td>
            <td>
              <StatusBadge status={deposit.status} />
            </td>
            <td className="text-slate-400 text-sm">
              {format(new Date(deposit.createdAt), 'dd/MM/yyyy HH:mm')}
            </td>
            <td>
              <ActionButtons
                deposit={deposit}
                onView={() => onViewDetail(deposit)}
                onApprove={() => onApprove(deposit._id)}
                onReject={() => onReject(deposit._id)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 4. Enhanced Modal - Card Deposit

Thêm buttons copy cho serial + code:

```jsx
{selectedDeposit.depositMethod === 'card' && (
  <div className="space-y-3">
    {/* Serial với button copy */}
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <p className="text-sm text-slate-400 mb-1">Số serial</p>
        <p className="font-mono text-slate-100 bg-slate-800 px-3 py-2 rounded">
          {selectedDeposit.cardSerial}
        </p>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(selectedDeposit.cardSerial);
          toast.success('Đã copy serial');
        }}
        className="btn-secondary px-3 py-2 mt-6"
        title="Copy serial"
      >
        <FiCopy className="w-4 h-4" />
      </button>
    </div>

    {/* Code với button copy */}
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <p className="text-sm text-slate-400 mb-1">Mã thẻ</p>
        <p className="font-mono text-slate-100 bg-slate-800 px-3 py-2 rounded">
          {selectedDeposit.cardCode}
        </p>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(selectedDeposit.cardCode);
          toast.success('Đã copy mã thẻ');
        }}
        className="btn-secondary px-3 py-2 mt-6"
        title="Copy mã thẻ"
      >
        <FiCopy className="w-4 h-4" />
      </button>
    </div>

    {/* Button check thẻ nhanh */}
    <a
      href={`https://doithe.vn/check?serial=${selectedDeposit.cardSerial}&code=${selectedDeposit.cardCode}`}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-secondary w-full flex items-center justify-center gap-2"
    >
      <FiExternalLink className="w-4 h-4" />
      Check thẻ (external)
    </a>
  </div>
)}
```

### 5. Backend API Update

Cần thêm endpoint GET `/admin/deposits/pending-count`:

```javascript
// server/routes/adminDeposits.js
router.get('/pending-count', adminAuth, async (req, res) => {
  try {
    const [bankCount, cardCount] = await Promise.all([
      DepositRequest.countDocuments({
        depositMethod: { $in: ['bank', null] },
        status: 'pending'
      }),
      DepositRequest.countDocuments({
        depositMethod: 'card',
        status: 'pending'
      })
    ]);

    res.json({ bank: bankCount, card: cardCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

Update endpoint GET `/admin/deposits` để support filter:

```javascript
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status, search, depositMethod } = req.query;
    
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (depositMethod) {
      if (depositMethod === 'bank') {
        filter.depositMethod = { $in: ['bank', null] };
      } else {
        filter.depositMethod = depositMethod;
      }
    }
    
    if (search) {
      // Search by username, email, transferNote, cardSerial
      const users = await User.find({
        $or: [
          { username: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') }
        ]
      }).select('_id');
      
      filter.$or = [
        { userId: { $in: users.map(u => u._id) } },
        { transferNote: new RegExp(search, 'i') },
        { cardSerial: new RegExp(search, 'i') }
      ];
    }

    const deposits = await DepositRequest.find(filter)
      .populate('userId', 'username email phone fullName')
      .populate('bankAccountId')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ deposits });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

---

## 📱 Responsive Design

### Desktop (≥1024px)
- Tabs ngang: 2 buttons cạnh nhau
- Table full width
- Modal max-w-2xl

### Tablet (768-1023px)
- Tabs giữ nguyên
- Table scroll horizontal nếu cần
- Modal max-w-xl

### Mobile (<768px)
- Tabs stack vertical hoặc scroll horizontal
- Table responsive: hide columns ít quan trọng
- Modal full screen

---

## 🎯 Benefits

### Cho Admin
✅ **Tổ chức rõ ràng**: Không còn trộn lẫn bank vs card  
✅ **Workflow riêng**: Bank (check Telegram) vs Card (check thủ công)  
✅ **Counter realtime**: Biết ngay có bao nhiêu yêu cầu pending  
✅ **Copy nhanh**: Serial + code 1 click copy  
✅ **Filter hiệu quả**: Search + status filter riêng từng tab  

### Cho Hệ thống
✅ **Query tối ưu**: Chỉ load data của tab active  
✅ **Cache hiệu quả**: React Query cache riêng từng tab  
✅ **Scalable**: Dễ thêm tab mới (VD: Nạp MoMo) sau này  
✅ **Analytics**: Track riêng conversion rate bank vs card  

---

## 📝 Implementation Checklist

### Phase 1: Backend API
- [ ] Tạo endpoint `/admin/deposits/pending-count`
- [ ] Update `/admin/deposits` thêm filter `depositMethod`
- [ ] Test API với Postman
- [ ] Deploy backend

### Phase 2: Frontend Components
- [ ] Tạo component `TabNavigation`
- [ ] Tạo component `BankDepositsTable`
- [ ] Tạo component `CardDepositsTable`
- [ ] Tạo component `ActionButtons` (reusable)
- [ ] Tạo component `StatusBadge` (reusable)

### Phase 3: Deposits Page Refactor
- [ ] Update `Deposits.jsx` với tabs state
- [ ] Implement 2 React Query cho bank + card
- [ ] Implement pending counts query
- [ ] Conditional render table theo active tab
- [ ] Update modal với copy buttons
- [ ] Test filter + search cho cả 2 tabs

### Phase 4: Styling & UX
- [ ] Tab active states với animations
- [ ] Loading skeletons riêng từng tab
- [ ] Empty states riêng (bank vs card)
- [ ] Toast notifications khi copy
- [ ] Responsive breakpoints
- [ ] Dark mode adjustments

### Phase 5: Testing
- [ ] Test switch tabs nhanh
- [ ] Test filter + search
- [ ] Test approve/reject từ cả 2 tabs
- [ ] Test modal với cả 2 loại deposits
- [ ] Test copy serial + code
- [ ] Test pending counter realtime
- [ ] Test responsive mobile

### Phase 6: Documentation
- [ ] Update ADMIN_GUIDE.md
- [ ] Screenshots cho mỗi tab
- [ ] Video demo workflow
- [ ] Deploy production

---

## ⏱️ Timeline Estimate

| Phase | Tasks | Time |
|-------|-------|------|
| Phase 1 | Backend API | 1-2 hours |
| Phase 2 | Components | 2-3 hours |
| Phase 3 | Page Refactor | 2-3 hours |
| Phase 4 | Styling | 1-2 hours |
| Phase 5 | Testing | 1-2 hours |
| Phase 6 | Docs | 1 hour |
| **Total** | | **8-13 hours** |

---

## 🔮 Future Enhancements

### Phase 2 (Optional)
- [ ] Tab 3: "Nạp MoMo" khi có tích hợp
- [ ] Tab 4: "Lịch sử giao dịch" (approved/rejected)
- [ ] Export Excel riêng từng tab
- [ ] Statistics chart: Bank vs Card trends
- [ ] Bulk approve cho multiple deposits
- [ ] Notifications khi có pending mới

### Phase 3 (Advanced)
- [ ] Real-time updates với WebSocket
- [ ] Admin notes history
- [ ] Proof image upload cho bank deposits
- [ ] Auto-reject after 24h no action
- [ ] Integration với bank API check auto

---

## 💯 Success Metrics

### KPIs
- ✅ Admin check time giảm 50%
- ✅ Error rate giảm (ít reject nhầm)
- ✅ Response time < 5 phút cho pending
- ✅ User satisfaction tăng (nạp nhanh hơn)

### Monitoring
- Track pending count theo giờ
- Track approve/reject ratio
- Track average processing time
- Track tab switch frequency

---

**Kế hoạch này sẵn sàng implement!** 🚀

Bạn muốn tôi bắt đầu implement ngay không? Hoặc cần điều chỉnh gì trong kế hoạch?
