import { create } from 'zustand';

export const useDepositCelebrationStore = create((set) => ({
  isOpen: false,
  data: null,
  
  showCelebration: (celebrationData) => {
    set({ isOpen: true, data: celebrationData });
    
    setTimeout(() => {
      set({ isOpen: false });
    }, 5000);
  },
  
  closeCelebration: () => {
    set({ isOpen: false, data: null });
  },
}));
