import { create } from 'zustand';

const useSpinStore = create((set) => ({
  // Current spin state
  isSpinning: false,
  spinResult: null,
  showResultModal: false,

  // Spin actions
  setSpinning: (spinning) => set({ isSpinning: spinning }),
  
  setSpinResult: (result) => set({ 
    spinResult: result,
    showResultModal: true,
    isSpinning: false
  }),
  
  closeResultModal: () => set({ 
    showResultModal: false,
    spinResult: null
  }),

  // Reset all
  reset: () => set({
    isSpinning: false,
    spinResult: null,
    showResultModal: false
  })
}));

export default useSpinStore;
