import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../utils/api';

const BANK_TTL = 30 * 60 * 1000; // 30 minutes
const REQUESTS_TTL = 30 * 1000; // 30 seconds
const TOP_TTL = 10 * 60 * 1000; // 10 minutes

export const useDepositStore = create(
  persist(
    (set, get) => ({
      bankAccounts: [],
      lastFetchedBanks: 0,
      banksLoading: false,

      myRequests: [],
      lastFetchedRequests: 0,
      requestsLoading: false,

      topDepositors: [],
      lastFetchedTop: 0,
      topLoading: false,

      error: null,

      fetchBankAccounts: async (force = false) => {
        const state = get();
        if (!force && state.bankAccounts.length > 0 && Date.now() - state.lastFetchedBanks < BANK_TTL) {
          return state.bankAccounts;
        }
        set({ banksLoading: true, error: null });
        try {
          const res = await api.get('/deposits/bank-accounts');
          const data = res.data || [];
          set({ bankAccounts: data, lastFetchedBanks: Date.now(), banksLoading: false });
          return data;
        } catch (err) {
          set({ banksLoading: false, error: err });
          throw err;
        }
      },

      fetchMyRequests: async (force = false) => {
        const state = get();
        if (!force && state.myRequests.length > 0 && Date.now() - state.lastFetchedRequests < REQUESTS_TTL) {
          return state.myRequests;
        }
        set({ requestsLoading: true, error: null });
        try {
          const res = await api.get('/deposits/my-requests');
          const data = res.data || [];
          set({ myRequests: data, lastFetchedRequests: Date.now(), requestsLoading: false });
          return data;
        } catch (err) {
          set({ requestsLoading: false, error: err });
          throw err;
        }
      },

      fetchTopDepositors: async (force = false) => {
        const state = get();
        if (!force && state.topDepositors.length > 0 && Date.now() - state.lastFetchedTop < TOP_TTL) {
          return state.topDepositors;
        }
        set({ topLoading: true, error: null });
        try {
          const res = await api.get('/deposits/top-depositors');
          const data = res.data || [];
          set({ topDepositors: data, lastFetchedTop: Date.now(), topLoading: false });
          return data;
        } catch (err) {
          set({ topLoading: false, error: err });
          throw err;
        }
      },

      addMyRequest: (req) => {
        set((s) => ({ myRequests: [req, ...s.myRequests] }));
      },

      reset: () => set({
        bankAccounts: [],
        lastFetchedBanks: 0,
        banksLoading: false,
        myRequests: [],
        lastFetchedRequests: 0,
        requestsLoading: false,
        topDepositors: [],
        lastFetchedTop: 0,
        topLoading: false,
        error: null,
      }),
    }),
    {
      name: 'deposit-storage',
      partialize: (state) => ({
        bankAccounts: state.bankAccounts,
        lastFetchedBanks: state.lastFetchedBanks,
        topDepositors: state.topDepositors,
        lastFetchedTop: state.lastFetchedTop,
      }),
    }
  )
);
