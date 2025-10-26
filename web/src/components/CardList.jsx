// web/src/components/CardList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./CardList.css";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function CardList() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/desafios`);
        if (!res.ok) throw new Error("Erro ao carregar os desafios");
        const data = await res.json();
        setCards(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="card-list">
      {loading && <div className="loader"></div>}

      {!loading && cards.length > 0 &&
        cards.map((d) => (
          <Link
            key={d.id}
            to={`/desafio/${d.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="card">
              <h3>{d.title}</h3>
              <p>{d.desc}</p>
            </div>
          </Link>
        ))
      }
    </div>
  );
}

