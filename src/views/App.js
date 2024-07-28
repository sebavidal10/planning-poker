import React, { useState, useEffect, useCallback } from 'react';
import '../assets/styles/main.css';
import io from 'socket.io-client';
import CardList from '../components/CardList';
import CountdownTimer from '../components/CountdownTimer';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';

const socket = io(process.env.REACT_APP_API_URL);

const App = () => {
  const { votingInstanceName } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [participants, setParticipants] = useState([]);
  const [joinedParticipants, setJoinedParticipants] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [joined, setJoined] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [error, setError] = useState('');
  const [roomOpen, setRoomOpen] = useState(true);
  const [roomExists, setRoomExists] = useState(true); // Nuevo estado para verificar si la sala existe
  const [owner, setOwner] = useState(''); // Estado para almacenar el propietario de la sala

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/rooms/${votingInstanceName}`
        );
        if (response.status === 404) {
          setRoomExists(false);
          return;
        }
        if (!response.ok) throw new Error('Failed to fetch room details');
        const data = await response.json();
        setRoomOpen(data.room.open);
        setParticipants(data.participants);
        setJoinedParticipants(data.participants);
        setOwner(data.owner); // Almacena el propietario de la sala
      } catch (err) {
        setError('Error fetching room details: ' + err.message);
      }
    };

    fetchRoomDetails();

    socket.on('timerTick', () => {
      setTimerStarted(true);
    });

    socket.on(
      'updateParticipants',
      ({ votingInstanceName: instance, participants, owner }) => {
        if (instance === votingInstanceName) {
          setJoinedParticipants(participants);
          setOwner(owner);
        }
      }
    );

    socket.on('roomClosed', ({ votingInstanceName: closedRoom }) => {
      if (closedRoom === votingInstanceName) {
        alert('Esta sala ha sido cerrada.');
        navigate('/');
      }
    });

    socket.on('connect_error', (err) => {
      setError('Connection Error: ' + err.message);
    });

    return () => {
      socket.off('timerTick');
      socket.off('updateParticipants');
      socket.off('connect_error');
      socket.off('roomClosed');
    };
  }, [votingInstanceName]);

  const handleJoin = () => {
    if (name) {
      setJoined(true);
      socket.emit('join', { name, votingInstanceName }, (error) => {
        if (error) {
          setError('Error joining: ' + error);
          setJoined(false);
        }
      });
    }
  };

  const handleSelect = (value) => {
    setSelectedValue(value);
    socket.emit(
      'selectVote',
      {
        name,
        vote: value,
        votingInstanceName,
      },
      (error) => {
        if (error) {
          setError('Error voting: ' + error);
        }
      }
    );
  };

  const handleTimerEnd = () => {
    setTimerStarted(false);
    setShowResults(true);
    updateResults();
  };

  const updateResults = useCallback(() => {
    fetch(`${process.env.REACT_APP_API_URL}/rooms/${votingInstanceName}`)
      .then((res) => res.json())
      .then((data) => {
        setParticipants(data.participants);
      })
      .catch((error) => {
        setError('Error fetching results: ' + error.message);
      });
  }, [votingInstanceName]);

  const startTimer = () => {
    socket.emit('startTimer');
  };

  const deleteVotes = () => {
    fetch(`${process.env.REACT_APP_API_URL}/rooms/${votingInstanceName}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete votes');
        setSelectedValue(null); // Desmarcar las cartas
        setParticipants([]);
        setJoinedParticipants(
          joinedParticipants.map((p) => ({ ...p, hasVoted: false }))
        );
      })
      .catch((error) => {
        setError('Error deleting votes: ' + error.message);
      });
  };

  const closeRoom = () => {
    fetch(
      `${process.env.REACT_APP_API_URL}/rooms/${votingInstanceName}/close`,
      {
        method: 'PATCH',
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error('Failed to close room');
      })
      .catch((error) => {
        setError('Error closing room: ' + error.message);
      });
  };

  const calculateAverage = useCallback((votes) => {
    const validVotes = votes.filter((vote) => vote !== null);
    if (validVotes.length === 0) return 0;
    const sum = validVotes.reduce((a, b) => a + b, 0);
    return sum / validVotes.length;
  }, []);

  const calculatePlanningPokerAverage = useCallback((votes) => {
    const sortedVotes = votes
      .filter((vote) => vote !== null)
      .sort((a, b) => a - b);
    if (sortedVotes.length === 0) return 0;

    let trimmedVotes = sortedVotes;
    if (sortedVotes.length >= 4) {
      trimmedVotes = sortedVotes.slice(1, sortedVotes.length - 1);
    }
    const sum = trimmedVotes.reduce((a, b) => a + b, 0);
    return trimmedVotes.length > 0 ? sum / trimmedVotes.length : 0;
  }, []);

  if (!roomExists) {
    return <Navigate to="/404" />;
  }

  return (
    <div className="App">
      <h1>
        <Link to="/">Planning Poker</Link>
      </h1>
      <h2>Voting Instance Name: {votingInstanceName}</h2>
      {error && <p className="error">{error}</p>}
      {!roomOpen ? (
        <>
          <p>This room is closed.</p>
          <button onClick={() => navigate('/')}>Go to Home</button>
        </>
      ) : (
        <>
          {joinedParticipants.length > 0 && (
            <div>
              <h3>Joined Participants:</h3>
              <div className="participant-labels">
                {joinedParticipants.map((participant, index) => (
                  <span
                    key={index}
                    className={`label ${participant.hasVoted ? 'voted' : ''}`}
                  >
                    {participant.name}
                  </span>
                ))}
              </div>
            </div>
          )}
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
              {name === owner && (
                <>
                  <button onClick={startTimer} disabled={timerStarted}>
                    Start Timer
                  </button>
                  &nbsp;
                  <button onClick={deleteVotes}>Delete Votes</button>
                  &nbsp;
                  <button onClick={closeRoom}>Close Room</button>
                </>
              )}
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
        </>
      )}
    </div>
  );
};

export default App;
