import { useState, useEffect } from "react";
import "../styles/countdownTimer.css"

const CountdownTimer = ({ duration, onExpire }) => {
  const [time, setTime] = useState(duration);

  useEffect(() => {
    if (time <= 0) {
      if (onExpire) onExpire();  
      return;
    }

    const timer = setTimeout(() => {
      setTime((prevTime) => prevTime - 1000);
    }, 1000);

    return () => clearTimeout(timer); 
  }, [time, onExpire]);

  const getFormattedTime = (milliseconds) => {
    let totalSeconds = parseInt(Math.floor(milliseconds / 1000));
    let totalMinutes = parseInt(Math.floor(totalSeconds / 60));
    // let totalHours = parseInt(Math.floor(totalMinutes / 60));

    let seconds = parseInt(totalSeconds % 60);
    let minutes = parseInt(totalMinutes % 60);
    // let hours = parseInt(totalHours % 24);

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return <div className="displayDiv">{getFormattedTime(time)}</div>;
};

export default CountdownTimer;