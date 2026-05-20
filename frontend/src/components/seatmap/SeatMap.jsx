// @ts-nocheck
import { motion } from 'framer-motion';

export const Seat = ({ seat, selected, locked, onSelect }) => {
  const seatVariants = {
    available: {
      backgroundColor: '#f3f4f6',
      border: '2px solid #d1d5db',
    },
    selected: {
      backgroundColor: '#4f94f7',
      border: '2px solid #3b6be8',
    },
    locked: {
      backgroundColor: '#e5e7eb',
      border: '2px solid #9ca3af',
    },
  };

  const getStatus = () => {
    if (locked) return 'locked';
    if (selected) return 'selected';
    return 'available';
  };

  return (
    <motion.button
      onClick={() => !locked && onSelect(seat)}
      disabled={locked}
      variants={seatVariants}
      animate={getStatus()}
      whileHover={!locked ? { scale: 1.1 } : {}}
      whileTap={!locked ? { scale: 0.95 } : {}}
      className={`w-10 h-10 rounded-md font-semibold text-xs transition-all cursor-pointer dark:bg-gray-700 dark:border-gray-600 ${
        selected ? 'text-white' : 'text-gray-900 dark:text-white'
      } ${locked ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      {seat.number}
    </motion.button>
  );
};

export const SeatMap = ({ bus, selectedSeats = [], onSeatSelect, lockedSeats = [] }) => {
  const rows = bus?.rows || 10;
  const cols = bus?.columns || 4;

  const generateSeats = () => {
    const seats = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const seatNumber = `${String.fromCharCode(65 + i)}${j + 1}`;
        seats.push({
          number: seatNumber,
          id: seatNumber,
        });
      }
    }
    return seats;
  };

  const seats = generateSeats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-8 p-6 bg-white dark:bg-gray-800 rounded-lg"
    >
      {/* Legend */}
      <div className="flex gap-6 items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 border border-gray-400 rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary-500 border border-primary-700 rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 dark:bg-gray-500 border border-gray-500 rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Locked</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {seats.map((seat) => (
          <Seat
            key={seat.id}
            seat={seat}
            selected={selectedSeats.some((s) => s.id === seat.id)}
            locked={lockedSeats.some((s) => s.id === seat.id || s.number === seat.number)}
            onSelect={onSeatSelect}
          />
        ))}
      </div>

      {/* Screen Indicator */}
      <div className="w-full mt-4">
        <div className="relative h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-full" />
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
          Screen / Front
        </p>
      </div>
    </motion.div>
  );
};

export default SeatMap;
