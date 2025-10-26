// web/src/components/Header.jsx
import { useContext, useState, useEffect, useRef } from "react";
import { AudioContext } from "./AudioProvider.jsx";
import { Link, useNavigate } from "react-router-dom";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Header() {
  const { isOn, toggle } = useContext(AudioContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [score, setScore] = useState(null); 
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Fecha o menu se clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Fetch do score da API
  useEffect(() => {
    const fetchScore = async () => {
      try {
        const res = await fetch(`${API_BASE}/score`);
        if (!res.ok) throw new Error("Erro ao carregar o score");
        const data = await res.json();
        setScore(data.score);
      } catch (err) {
        console.error(err);
        setScore(0);
      }
    };
    fetchScore();
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <Link
          to="/"
          style={{ textDecoration: "none", color: "#00bfff", fontWeight: "bold", fontSize: "1.4rem" }}
        >
          🎮 Teste Me - Seu desafio diário
        </Link>
      </div>

      <div className="header-right" ref={menuRef}>
        <span className="score">Score: {score !== null ? score : ""} ME's</span>
        <button className="menu-btn" onClick={toggleMenu}>☰</button>

        {menuOpen && (
          <div className="menu-dropdown">
            <button className="menu-item" onClick={() => navigate("/")}>
              🏠 Início
            </button>
            <button onClick={toggle} className="menu-item">
              {isOn ? "🔊 Som Ligado" : "🔇 Som Desligado"}
            </button>
            <button className="menu-item">❓ Ajuda</button>
          </div>
        )}
      </div>
    </header>
  );
}
