import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, HelpCircle } from 'lucide-react';

const Card = ({ value, onSelect, isSelected, disabled }) => {
  const renderValue = () => {
    if (value === '☕️' || value === 'Coffee') {
      return <Coffee className="w-8 h-8 sm:w-10 sm:h-10" />;
    }
    if (value === '?') {
      return <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10" />;
    }
    return value;
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05, y: -5 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={() => !disabled && onSelect(value)}
      disabled={disabled}
      className={`
        relative w-16 h-24 sm:w-20 sm:h-32 rounded-xl flex items-center justify-center 
        text-xl sm:text-2xl font-bold transition-colors shadow-lg
        ${
          isSelected
            ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-zinc-900 shadow-indigo-500/50'
            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {renderValue()}
      {isSelected && (
        <motion.div
          layoutId="selection-indicator"
          className="absolute inset-0 rounded-xl ring-2 ring-indigo-400"
        />
      )}
    </motion.button>
  );
};

export default Card;
