import { useEffect, useRef, useState } from "react";
import "./styles.css";

export default function App() {
  // start with numeric controlled inputs
  const [values, setValues] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [active, setActive] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [pause, setPause] = useState(false);
  const timeRef = useRef(null);

  useEffect(() => {
    // Derive values from totalTime (always run when totalTime changes)
    setValues({
      hours: Math.floor(totalTime / 3600),
      minutes: Math.floor((totalTime % 3600) / 60),
      seconds: totalTime % 60,
    });

    // Manage interval lifecycle
    if (!active || pause || totalTime <= 0) {
      if (timeRef.current) {
        clearInterval(timeRef.current);
        timeRef.current = null;
      }
      return;
    }

    // active && !pause && totalTime > 0
    if (!timeRef.current) {
      timeRef.current = setInterval(() => {
        setTotalTime((prev) => {
          // log the latest value (helpful for debugging)
          console.log("seconds left:", prev);
          if (prev <= 1) {
            clearInterval(timeRef.current);
            timeRef.current = null;
            setActive(false);
            setPause(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current);
        timeRef.current = null;
      }
    };
  }, [active, pause, totalTime]);

  // Start: compute seconds defensively and set totalTime
  const handleStart = () => {
    const h = Number(values.hours) || 0;
    const m = Number(values.minutes) || 0;
    const s = Number(values.seconds) || 0;
    const seconds = h * 3600 + m * 60 + s;
    if (seconds <= 0) return;
    setTotalTime(seconds);
    setActive(true);
    setPause(false);
  };

  // Toggle pause/resume
  const handlePause = () => {
    if (!active) return;
    setPause((p) => !p);
  };

  // Reset everything and clear interval
  const handleReset = () => {
    if (timeRef.current) {
      clearInterval(timeRef.current);
      timeRef.current = null;
    }
    setActive(false);
    setPause(false);
    setTotalTime(0);
    setValues({ hours: 0, minutes: 0, seconds: 0 });
  };

  // Input handler: allow empty string while typing, otherwise store numbers
  const handleChange = (e) => {
    const { name, value } = e.target;
    // allow empty string (so user can delete to type), otherwise coerce to number >= 0
    const next = value === "" ? "" : Math.max(0, Number(value));
    setValues((prev) => ({ ...prev, [name]: next }));
  };

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="App">
      <h1>CountDown-Timer</h1>
      <div className="time">
        <div className="hour">
          <h3>Hours</h3>
          <input
            type="number"
            name="hours"
            min="0"
            value={values.hours === "" ? "" : values.hours}
            onChange={handleChange}
            disabled={active}
          />
        </div>
        <div className="minutes">
          <h3>Minutes</h3>
          <input
            type="number"
            name="minutes"
            min="0"
            max="59"
            value={values.minutes === "" ? "" : values.minutes}
            onChange={handleChange}
            disabled={active}
          />
        </div>
        <div className="second">
          <h3>Seconds</h3>
          <input
            type="number"
            name="seconds"
            min="0"
            max="59"
            value={values.seconds === "" ? "" : values.seconds}
            onChange={handleChange}
            disabled={active}
          />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={handleStart} disabled={active && !pause}>
          Start
        </button>
        <button onClick={handlePause} disabled={!active}>
          {pause ? "Resume" : "Pause"}
        </button>
        <button onClick={handleReset}>Reset</button>
      </div>

      <h2 style={{ marginTop: 12 }}>
        {pad(Math.floor(totalTime / 3600))}:
        {pad(Math.floor((totalTime % 3600) / 60))}:{pad(totalTime % 60)}
      </h2>
    </div>
  );
}
