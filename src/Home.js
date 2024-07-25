import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const Home = () => {
  const [instanceName, setInstanceName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    if (!instanceName) {
      setError('Please enter a name for the voting instance.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: instanceName,
          open: true,
          create_at: new Date(),
        }),
      });

      if (response.ok) {
        navigate(`/${instanceName}`);
      } else {
        const errorData = await response.json();
        setError(`Error: ${errorData.message}`);
      }
    } catch (err) {
      setError('Error creating the room. Please try again.');
    }
  };

  return (
    <div className="App">
      <h1>Welcome to Planning Poker</h1>
      <p>Enter the name for a voting instance to create one:</p>
      {error && <p className="error">{error}</p>}
      <input
        type="text"
        value={instanceName}
        onChange={(e) => setInstanceName(e.target.value)}
        placeholder="Enter instance name"
      />
      <button onClick={handleCreateRoom}>Create Room</button>
    </div>
  );
};

export default Home;
