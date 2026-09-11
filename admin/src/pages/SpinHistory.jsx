import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FiSearch, FiFilter, FiChevronLeft, FiChevronRight,
  FiCalendar, FiUser, FiTrendingUp, FiDollarSign, FiGift, FiX
} from 'react-icons/fi';
import { GiSpinningBlades, GiTrophy } from 'react-icons/gi';
import api from '../utils/api';

const ITEMS_PER_PAGE = 20;

export default function SpinHistory() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    rewardType: 'all',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['admin-spin-stats', filters.startDate, filters.endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      const { data } = await api.get(`/admin/spin/stats?${params.toString()}`);
      return data;
    }
  });

  // Fetch history
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-spin-history', page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit: ITEMS_PER_PAGE,
        rewardType: filters.rewardType,
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      if (filters.search) params.append('search', filters.search);
      const { data: res } = await api.get(`/admin/spin/history?${params.toString()}`);
      return res;
    },
    keepPreviousData: true
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRewardBadge = (type) => {
    switch (type) {
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-semibold">
            💰 Tiền mặt
          </span>
        );
      case 'account':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold">
            🎮 Tài khoản
          </span>
        );
      case 'voucher':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-semibold">
            🎫 Voucher
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-500/20 text-slate-400 rounded text-xs font-semibold">
            ❌ Chúc bạn may mắn
          </span>
        );
    }
  };

  const hasActiveFilters = filters.search || filters.rewardType !== 'all' || filters.startDate || filters.endDate;

  const clearFilters = () => {
    setFilters({ search: '', rewardType: 'all', startDate: '', endDate: '' });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-200 flex items-center gap-3">
            <GiSpinningBlades className="text-cyan-400" />
            Lịch sử Vòng quay
          </h1>
          <p className="text-slate-400 mt-1">Xem toàn bộ lịch sử quay thưởng của người dùng</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FiFilter />
          Bộ lọc
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
              <GiSpinningBlades className="text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Tổng lượt quay</p>
              <p className="text-2xl font-bold text-slate-200">{stats?.totalSpins?.toLocaleString('vi-VN') || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <FiDollarSign className="text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Tổng tiền thưởng</p>
              <p className="text-2xl font-bold text-green-400">
                {stats ? `${(stats.cashTotal / 1000000).toFixed(1)}M` : '0đ'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <GiTrophy className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Tài khoản trúng</p>
              <p className="text-2xl font-bold text-slate-200">{stats?.accountCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <FiGift className="text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Voucher trúng</p>
              <p className="text-2xl font-bold text-slate-200">{stats?.voucherCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Tìm theo username</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Nhập username..."
                  value={filters.search}
                  onChange={(e) => {
                    setFilters({ ...filters, search: e.target.value });
                    setPage(1);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Reward Type */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Loại phần thưởng</label>
              <select
                value={filters.rewardType}
                onChange={(e) => {
                  setFilters({ ...filters, rewardType: e.target.value });
                  setPage(1);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Tất cả</option>
                <option value="cash">💰 Tiền mặt</option>
                <option value="account">🎮 Tài khoản</option>
                <option value="voucher">🎫 Voucher</option>
                <option value="nothing">❌ Chúc bạn may mắn</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Từ ngày</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setFilters({ ...filters, startDate: e.target.value });
                  setPage(1);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Đến ngày</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => {
                    setFilters({ ...filters, endDate: e.target.value });
                    setPage(1);
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    title="Xóa bộ lọc"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Top Users */}
          {stats?.topUsers?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-sm text-slate-400 mb-3 flex items-center gap-2">
                <FiTrendingUp className="w-4 h-4" />
                Top người quay nhiều nhất
              </p>
              <div className="flex flex-wrap gap-3">
                {stats.topUsers.map((u, i) => (
                  <div
                    key={u._id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg"
                  >
                    <span className={`text-xs font-bold ${
                      i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-500'
                    }`}>
                      #{i + 1}
                    </span>
                    <span className="text-sm text-slate-200 font-medium">{u.username}</span>
                    <span className="text-xs text-cyan-400 font-semibold">{u.spinCount} lượt</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      {stats?.recentHistory?.length > 0 && !hasActiveFilters && page === 1 && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-400 mb-3 flex items-center gap-2">
            <FiCalendar className="w-4 h-4" />
            Hoạt động gần đây
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {stats.recentHistory.map((h) => (
              <div
                key={h._id}
                className="flex-shrink-0 px-3 py-2 bg-slate-800 rounded-lg min-w-[200px]"
              >
                <div className="flex items-center gap-2 mb-1">
                  {getRewardBadge(h.rewardType)}
                </div>
                <p className="text-sm text-slate-200 font-medium truncate">{h.rewardLabel}</p>
                <p className="text-xs text-slate-500">{formatDate(h.spinAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Người dùng</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Phần thưởng</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Giá trị</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Loại</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    <td className="px-4 py-3">
                      <div className="h-4 w-24 bg-slate-800 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-40 bg-slate-800 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 bg-slate-800 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 bg-slate-800 rounded animate-pulse"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-28 bg-slate-800 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : data?.history?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Không có lịch sử quay nào
                  </td>
                </tr>
              ) : (
                data?.history?.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-cyan-500/10 rounded-full flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-slate-200 font-medium">{item.userId?.username || '—'}</p>
                          <p className="text-xs text-slate-500">{item.userId?.fullName || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-200 font-medium">{item.rewardLabel}</p>
                      {item.voucherCode && (
                        <p className="text-xs text-orange-400 font-mono">Mã: {item.voucherCode}</p>
                      )}
                      {item.accountId && (
                        <p className="text-xs text-purple-400">{item.accountId.title}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.rewardType === 'cash' && item.rewardValue > 0 ? (
                        <span className="text-green-400 font-bold">
                          +{item.rewardValue.toLocaleString('vi-VN')}đ
                        </span>
                      ) : item.rewardType === 'account' && item.accountId ? (
                        <span className="text-purple-400 font-semibold">
                          {item.accountId.price?.toLocaleString('vi-VN')}đ
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getRewardBadge(item.rewardType)}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatDate(item.spinAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <p className="text-sm text-slate-400">
              Trang {data.pagination.page} / {data.pagination.pages} — {data.pagination.total} kết quả
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <FiChevronLeft />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(data.pagination.pages, 5) }, (_, i) => {
                  const totalPages = data.pagination.pages;
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-cyan-500 text-slate-900'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= data.pagination.pages}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
