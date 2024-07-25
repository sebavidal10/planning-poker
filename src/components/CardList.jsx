import React from 'react';
import './CardList.css';

const CardList = ({ values, onSelect, selectedValue }) => {
  return (
    <div className="card-list">
      {values.map((value) => (
        <div
          key={value}
          className={`card ${selectedValue === value ? 'selected' : ''}`}
          onClick={() => onSelect(value)}
        >
          <div className="card-content">{value}</div>
        </div>
      ))}
    </div>
  );
};

export default CardList;
