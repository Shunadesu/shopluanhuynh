import { create } from 'zustand';

export const useDepositCelebrationStore = create((set) => ({
  isOpen: false,
  data: null,
  
  showCelebration: (celebrationData) => {
    console.log('🎉 [depositCelebrationStore] showCelebration called:', celebrationData);
    // Modal sẽ hiển thị cho đến khi user click đóng
    set({ isOpen: true, data: celebrationData });
    console.log('✅ [depositCelebrationStore] State set to isOpen=true');
  },
  
  closeCelebration: () => {
    console.log('❌ [depositCelebrationStore] closeCelebration called');
    set({ isOpen: false, data: null });
  },
}));
