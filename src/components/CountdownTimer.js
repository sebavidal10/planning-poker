import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ onTimerEnd }) => {
  const [timer, setTimer] = useState(10); // Inicia la cuenta regresiva en 10 segundos
  const [running, setRunning] = useState(false); // Estado para controlar si el contador está corriendo o no
  const [showResults, setShowResults] = useState(false); // Estado para mostrar los resultados de la votación
  const [participants, setParticipants] = useState([]); // Estado para almacenar los participantes
  useEffect(() => {
    let interval;

    setRunning(true); // Inicia el temporizador

    // Iniciar el temporizador cuando running cambie a true
    if (running) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer > 0) {
            return prevTimer - 1; // Decrementa el temporizador
          } else {
            clearInterval(interval); // Detiene el intervalo cuando el temporizador llega a cero
          }
        });
      }, 1000);
    }

    // Limpiar intervalo al desmontar el componente
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (timer === 0) {
      setRunning(false); // Detiene el temporizador
      onTimerEnd(); // Llama a la función onTimerEnd cuando el temporizador llega a cero
    }
  }, [timer, onTimerEnd]);

  return (
    <div>
      <h2>Countdown Timer: {timer || 0}</h2>
    </div>
  );
};

export default CountdownTimer;
