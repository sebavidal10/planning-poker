import React, { useState, useEffect } from 'react';
import './App.css';
import io from 'socket.io-client';
import CardList from './components/CardList';
import CountdownTimer from './components/CountdownTimer';

const socket = io(process.env.REACT_APP_API_URL);

const App = () => {
  const [name, setName] = useState('');
  const [participants, setParticipants] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [joined, setJoined] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [votingInstanceName, setVotingInstanceName] = useState('A001'); // Aquí defines el identificador de instancia de votación

  useEffect(() => {
    console.log('useEffect');
    socket.on('timerTick', () => {
      // Lógica para manejar cada tick del temporizador si es necesario
      console.log('Timer tick');
      setTimerStarted(true);
    });
    // Cleanup
    return () => {
      socket.off('timerTick');
    };
  }, []);

  const handleJoin = () => {
    if (name) {
      setJoined(true);
    }
  };

  const handleSelect = (value) => {
    setSelectedValue(value);
    socket.emit('selectVote', {
      name,
      vote: value,
      votingInstanceName,
    });
  };

  const handleTimerEnd = () => {
    console.log('handleTimerEnd');
    setTimerStarted(false);
    setShowResults(true);
    updateResults();
  };

  const updateResults = () => {
    fetch(`${process.env.REACT_APP_API_URL}/results/${votingInstanceName}`)
      .then((res) => res.json())
      .then((data) => {
        setParticipants(data);
      });
  };

  const startTimer = () => {
    console.log('startTimer');
    socket.emit('startTimer');
  };

  const calculateAverage = (votes) => {
    const validVotes = votes.filter((vote) => vote !== null);
    if (validVotes.length === 0) return 0;
    const sum = validVotes.reduce((a, b) => a + b, 0);
    return sum / validVotes.length;
  };

  const calculatePlanningPokerAverage = (votes) => {
    const sortedVotes = votes
      .filter((vote) => vote !== null)
      .sort((a, b) => a - b);
    if (sortedVotes.length === 0) return 0;
    const trimmedVotes = sortedVotes.slice(1, sortedVotes.length - 1); // Remove the highest and lowest votes
    const sum = trimmedVotes.reduce((a, b) => a + b, 0);
    return trimmedVotes.length > 0 ? sum / trimmedVotes.length : 0;
  };

  return (
    <div className="App">
      <h1>Planning Poker</h1>
      <h2>Voting Instance Name: {votingInstanceName}</h2>{' '}
      {/* Mostrar el identificador de instancia */}
      {!joined ? (
        <div>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleJoin}>Join</button>
        </div>
      ) : (
        <div>
          <CardList
            values={[1, 2, 3, 5, 8, 13, 21]}
            onSelect={handleSelect}
            selectedValue={selectedValue}
          />
          <button onClick={startTimer} disabled={timerStarted}>
            Start Timer
          </button>
          {timerStarted && <CountdownTimer onTimerEnd={handleTimerEnd} />}
          {showResults && (
            <table className="text-left margin-auto">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Opción</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.name}>
                    <td>{participant.name}</td>
                    <td className="text-right">
                      {participant.vote !== null
                        ? participant.vote
                        : 'No selection'}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <b>Promedio Real</b>
                  </td>
                  <td className="text-right">
                    <b>
                      {calculateAverage(
                        participants.map((p) => p.vote)
                      ).toFixed(2)}
                    </b>
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>Promedio Planning Poker</b>
                  </td>
                  <td className="text-right">
                    <b>
                      {calculatePlanningPokerAverage(
                        participants.map((p) => p.vote)
                      ).toFixed(2)}
                    </b>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
