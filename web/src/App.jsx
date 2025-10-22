import { AudioProvider } from "./components/AudioProvider.jsx";
import Header from "./components/Header.jsx";
import Player from "./components/Player.jsx";
import "./App.css";

export default function App() {
  return (
    <AudioProvider>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <h1 className="title">🎮 Teste Me</h1>
          <p className="subtitle">Seu desafio diário</p>
          <Player />
        </main>
      </div>
    </AudioProvider>
  );
}