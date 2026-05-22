// @ts-nocheck
import { motion } from 'framer-motion';

export const Seat = ({ seat, selected, occupied, reserved, onSelect }) => {
  const seatVariants = {
    available: {
      backgroundColor: '#dcfce7',
      border: '2px solid #16a34a',
    },
    selected: {
      backgroundColor: '#2563eb',
      border: '2px solid #1d4ed8',
    },
    reserved: {
      backgroundColor: '#fef3c7',
      border: '2px solid #f59e0b',
    },
    occupied: {
      backgroundColor: '#fee2e2',
      border: '2px solid #dc2626',
    },
  };

  const getStatus = () => {
    if (occupied) return 'occupied';
    if (reserved) return 'reserved';
    if (selected) return 'selected';
    return 'available';
  };
  const disabled = occupied || reserved;

  return (
    <motion.button
      type="button"
      aria-label={`Seat ${seat.number} ${getStatus()}`}
      aria-pressed={selected}
      onClick={() => !disabled && onSelect(seat)}
      disabled={disabled}
      variants={seatVariants}
      animate={getStatus()}
      whileHover={!disabled ? { scale: 1.08 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      className={`w-10 h-10 rounded-md font-semibold text-xs transition-all cursor-pointer dark:bg-gray-700 dark:border-gray-600 ${
        selected ? 'text-white' : 'text-gray-900'
      } ${disabled ? 'cursor-not-allowed opacity-80' : ''}`}
    >
      {seat.number}
    </motion.button>
  );
};

export const SeatMap = ({
  bus,
  selectedSeats = [],
  onSeatSelect,
  lockedSeats = [],
  unavailableSeats = [],
  reservedSeats = []
}) => {
  const rows = bus?.rows || 10;
  const cols = bus?.columns || 4;
  const normalizeSeat = (seat) => (typeof seat === 'string' ? seat : seat?.number || seat?.id);
  const legacyLockedAsOccupied = unavailableSeats.length === 0 && reservedSeats.length === 0;
  const occupiedSet = new Set((legacyLockedAsOccupied ? lockedSeats : unavailableSeats).map(normalizeSeat).filter(Boolean));
  const reservedSet = new Set((reservedSeats.length ? reservedSeats : []).map(normalizeSeat).filter(Boolean));

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
      <div className="flex flex-wrap gap-4 items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 border border-green-600 rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 border border-blue-800 rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-600 rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Occupied</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {seats.map((seat) => (
          <Seat
            key={seat.id}
            seat={seat}
            selected={selectedSeats.some((s) => s.id === seat.id)}
            occupied={occupiedSet.has(seat.number)}
            reserved={reservedSet.has(seat.number) && !occupiedSet.has(seat.number)}
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
