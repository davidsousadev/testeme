import express, { json } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(json());

// dados de exemplo
const desafios = [
    { id: 1, title: "Desafio 1", desc: "Resolver o problema de lógica A" },
    { id: 2, title: "Desafio 2", desc: "Criar um app em React" },
    { id: 3, title: "Desafio 3", desc: "Jogar 1 partida de xadrez" },
    { id: 4, title: "Desafio 4", desc: "Ler um capítulo de livro" },
    { id: 5, title: "Desafio 5", desc: "Fazer 30 minutos de exercício" },
];

let score = 123;

app.get("/desafios", (req, res) => {
    res.json(desafios);
});

app.get("/desafios/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const desafio = desafios.find(d => d.id === id);
    if (!desafio) return res.status(404).json({ error: "Desafio não encontrado" });
    res.json(desafio);
});

app.get("/score", (req, res) => {
    res.json({ score });
});

app.listen(PORT, () => {
    console.log(`API rodando na porta ${PORT}`);
});
