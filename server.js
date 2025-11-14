import express from "express";
import dotenv from "dotenv";
import path from "path";
import handler from "./api/env.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();

app.use(express.json());

app.get("/api/env", (req, res) => handler(req, res));

app.use(express.static(__dirname));

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
