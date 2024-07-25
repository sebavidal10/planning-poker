import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ onTimerEnd }) => {
  const [timer, setTimer] = useState(10);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    let interval;

    setRunning(true);

    if (running) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer > 0) {
            return prevTimer - 1;
          } else {
            clearInterval(interval);
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (timer === 0) {
      setRunning(false);
      onTimerEnd();
    }
  }, [timer, onTimerEnd]);

  return (
    <div>
      <h2>Countdown Timer: {timer || 0}</h2>
    </div>
  );
};

export default CountdownTimer;
