import { API_URL } from "./consts.js";
import { mostrarNotificacao } from "https://libsme.vercel.app/src/notify/v3/index.js";

document.getElementById("formCadastrar").addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const nick = document.getElementById("nick").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        mostrarNotificacao("As senhas não conferem!", { cor: "#c93030" });
        return;
    }

    try {
        const resp = await fetch(`${API_URL}/cadastrar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, nick, password })
        });

        const data = await resp.json();

        // API retorna 200 mesmo para erros
        if (resp.status !== 201) {
            mostrarNotificacao(data.detail || "Erro ao cadastrar", { cor: "#c93030" });
            return;
        }

        mostrarNotificacao("Cadastro realizado com sucesso!", { cor: "#43af70" });

        // Redireciona ao login
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);

    } catch (err) {
        console.error(err);
        mostrarNotificacao("Erro ao conectar ao servidor", { cor: "#c93030" });
    }
});
