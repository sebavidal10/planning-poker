// src/NotFound.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="App">
      <h1>404 - Not Found</h1>
      <p>The room you are looking for does not exist.</p>
      <button onClick={() => navigate('/')}>Go to Home</button>
    </div>
  );
};

export default NotFound;
