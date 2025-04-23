import React, { useEffect, useState } from 'react';
import { IonProgressBar } from '@ionic/react';

interface TimerProps {
    duration: number;
    onTimeout: () => void;
    isActive: boolean;
    onTick?: (remaining: number) => void;  // ← lo añadimos
}

const Timer: React.FC<TimerProps> = ({ duration, onTimeout, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    // Reiniciar temporizador al activarse
    if (isActive) {
      setTimeLeft(duration);
      setProgress(1);
    }
  }, [isActive, duration]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      timer = setTimeout(() => {
        const newTime = timeLeft - 1;
        setTimeLeft(newTime);
        setProgress(newTime / duration);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      onTimeout();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, isActive, onTimeout, duration]);

  return (
    <div className="timer-container">
      <div className="timer-text">{timeLeft}s</div>
      <IonProgressBar 
        value={progress} 
        color={timeLeft < 10 ? "danger" : timeLeft < 20 ? "warning" : "success"}
      />
    </div>
  );
};

export default Timer;