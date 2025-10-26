// src/components/DesafioPage.jsx
import { useParams } from "react-router-dom";
import Player from "./Player.jsx";

export default function DesafioPage() {
    const { id } = useParams();

    return (
        <div style={{ padding: "20px" }}>
            <h1>Desafio {id}</h1>
            <p>Aqui vai o conteúdo do desafio {id}.</p>
            <Player />
        </div>
    );
}
