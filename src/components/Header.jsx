import { useContext } from "react";
import { AudioContext } from "./AudioProvider.jsx";

export default function Header() {
  const { isOn, toggle } = useContext(AudioContext);

  return (
    <header className="header">
      <div className="header-left">
        <span className="brand">Teste Me</span>
      </div>
      <div className="header-right">
        <span className="score">Score: 0</span>
        <button className="audio-btn" onClick={toggle}>
          {isOn ? "🔊" : "🔇"}
        </button>
        <button className="menu-btn">☰</button>
      </div>
    </header>
  );
}