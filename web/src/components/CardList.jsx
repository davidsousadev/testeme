export default function CardList() {
  const mockData = [
    { id: 1, title: "Desafio 1", desc: "Resolver o problema de lógica A" },
    { id: 2, title: "Desafio 2", desc: "Criar um app em React" },
    { id: 3, title: "Desafio 3", desc: "Jogar 1 partida de xadrez" },
  ];

  return (
    <div className="card-list">
      {mockData.map((d) => (
        <div key={d.id} className="card">
          <h3>{d.title}</h3>
          <p>{d.desc}</p>
        </div>
      ))}
    </div>
  );
}