import CardList from "./CardList.jsx";

export default function Player() {
  return (
    <div className="player">
      <button className="start-btn">▶️ Iniciar Desafio</button>
      <CardList />
    </div>
  );
}