import React from 'react';

const Card = ({ value, onSelect, isSelected }) => {
  return (
    <div
      className={`card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(value)}
    >
      {value}
    </div>
  );
};

export default Card;
