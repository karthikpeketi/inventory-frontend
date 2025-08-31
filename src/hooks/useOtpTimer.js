import { useState, useEffect, useCallback } from 'react';

const COOLDOWN_DURATION = 60; // seconds

const useOtpTimer = (storageKey) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const storedEndTime = localStorage.getItem(storageKey);
    if (storedEndTime) {
      const remaining = Math.max(0, Math.floor((parseInt(storedEndTime) - Date.now()) / 1000));
      return remaining;
    }
    return 0;
  });

  useEffect(() => {
    let timerInterval;
    if (timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerInterval);
            localStorage.removeItem(storageKey);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      localStorage.removeItem(storageKey);
    }

    return () => clearInterval(timerInterval);
  }, [timeLeft, storageKey]);

  const startTimer = useCallback(() => {
    const endTime = Date.now() + COOLDOWN_DURATION * 1000;
    localStorage.setItem(storageKey, endTime.toString());
    setTimeLeft(COOLDOWN_DURATION);
  }, [storageKey]);

  const resetTimer = useCallback(() => {
    localStorage.removeItem(storageKey);
    setTimeLeft(0);
  }, [storageKey]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return { timeLeft, isTimerActive: timeLeft > 0, startTimer, resetTimer, formatTime };
};

export default useOtpTimer;
