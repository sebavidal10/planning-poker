import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const SOCKET_URL =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_SOCKET_URL ||
  'http://localhost:3001';

export const usePlanningPoker = (slug, userName) => {
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [owner, setOwner] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [activeRoundId, setActiveRoundId] = useState(null);
  const [isKicked, setIsKicked] = useState(false);

  useEffect(() => {
    if (!slug || !userName) {
      return;
    }

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join', { name: userName, votingInstanceName: slug });
    });

    newSocket.on('updateParticipants', (data) => {
      setParticipants(data.participants);
      setOwner(data.owner);
    });

    newSocket.on('timerTick', () => {
      setTimer((prev) => (prev ? prev - 1 : 3)); // 3 seconds countdown
    });

    newSocket.on('roomClosed', () => {
      setRoom((prev) => ({ ...prev, open: false }));
    });

    newSocket.on('votesDeleted', () => {
      setIsRevealed(false);
    });

    newSocket.on('votesRevealed', () => {
      setIsRevealed(true);
    });

    newSocket.on('updateRounds', ({ rounds, activeRoundId }) => {
      setRounds(rounds);
      setActiveRoundId(activeRoundId);
    });

    newSocket.on('kicked', () => {
      setIsKicked(true);
      newSocket.disconnect();
    });

    newSocket.on('error', (msg) => {
      setError(msg);
    });

    // Fetch initial room details
    const fetchRoom = async () => {
      try {
        const res = await fetch(`${SOCKET_URL}/rooms/${slug}`);
        const data = await res.json();

        if (res.ok && data.room) {
          setRoom(data.room);
          setParticipants(data.participants || []);
          setOwner(data.owner);
          setRounds(data.room.rounds || []);
          setActiveRoundId(data.room.activeRoundId);
        } else {
          setError(data.message || 'Room not found (404)');
        }
      } catch (err) {
        setError('Failed to connect to server: ' + err.message);
      }
    };

    fetchRoom();

    return () => newSocket.close();
  }, [slug, userName]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setIsRevealed(true);
      setTimer(null);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const selectVote = useCallback(
    (vote) => {
      if (socket) {
        socket.emit('selectVote', {
          name: userName,
          vote,
          votingInstanceName: slug,
        });
      }
    },
    [socket, userName, slug],
  );

  const startTimer = useCallback(() => {
    if (socket) {
      setIsRevealed(false);
      socket.emit('startTimer', { votingInstanceName: slug });
    }
  }, [socket, slug]);

  const deleteVotes = useCallback(() => {
    if (socket) {
      socket.emit('deleteVotes', { votingInstanceName: slug });
      setIsRevealed(false);
    }
  }, [socket, slug]);

  const closeRoom = useCallback(() => {
    if (socket) {
      socket.emit('closeRoom', { votingInstanceName: slug });
    }
  }, [socket, slug]);

  const revealVotes = useCallback(() => {
    if (socket) {
      socket.emit('revealVotes', { votingInstanceName: slug });
    }
  }, [socket, slug]);

  const addRound = useCallback(() => {
    if (socket) {
      socket.emit('addRound', { votingInstanceName: slug });
    }
  }, [socket, slug]);

  const switchRound = useCallback(
    (roundId) => {
      if (socket) {
        socket.emit('switchRound', { votingInstanceName: slug, roundId });
      }
    },
    [socket, slug],
  );

  const updateRound = useCallback(
    (roundId, title, description) => {
      if (socket) {
        socket.emit('updateRound', {
          votingInstanceName: slug,
          roundId,
          title,
          description,
        });
      }
    },
    [socket, slug],
  );

  const leaveRoom = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [socket]);

  const kickParticipant = useCallback(
    (participantName) => {
      if (socket) {
        socket.emit('kickParticipant', {
          votingInstanceName: slug,
          participantName,
        });
      }
    },
    [socket, slug],
  );

  const resetRound = useCallback(() => {
    if (socket) {
      socket.emit('resetRound', { votingInstanceName: slug });
    }
  }, [socket, slug]);

  return {
    participants,
    room,
    owner,
    timer,
    isRevealed,
    error,
    rounds,
    activeRoundId,
    isKicked,
    actions: {
      selectVote,
      startTimer,
      deleteVotes,
      closeRoom,
      revealVotes,
      addRound,
      switchRound,
      updateRound,
      leaveRoom,
      kickParticipant,
      resetRound,
    },
  };
};
