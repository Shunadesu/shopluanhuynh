import { Wheel } from 'react-custom-roulette';
import { motion } from 'framer-motion';

const WheelSpinner = ({ data, prizeNumber, onStopSpinning, mustStartSpinning }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-[500px] mx-auto"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-orange-500/20 rounded-full blur-2xl" />
      
      <div className="relative">
        <Wheel
          mustStartSpinning={mustStartSpinning}
          prizeNumber={prizeNumber}
          data={data}
          onStopSpinning={onStopSpinning}
          outerBorderColor="#F97316"
          outerBorderWidth={8}
          innerBorderColor="#0F172A"
          innerBorderWidth={0}
          radiusLineColor="#0F172A"
          radiusLineWidth={2}
          fontSize={14}
          fontWeight="600"
          textDistance={65}
          spinDuration={0.5}
          perpendicularText={false}
          pointerProps={{
            style: {
              transform: 'rotate(90deg)',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }
          }}
        />
      </div>

      {/* Center decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-lg flex items-center justify-center pointer-events-none">
        <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
          <span className="text-2xl">🎰</span>
        </div>
      </div>
    </motion.div>
  );
};

export default WheelSpinner;
