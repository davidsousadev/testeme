// dashboard.js

import {
    config,
    mostrarNotificacao,
    cookies
} from './main.js';

const access_token = cookies.getCookie('access_token');
const refresh_token = cookies.getCookie('refresh_token');

document.addEventListener("DOMContentLoaded", async () => {
    // 1 — Valida token
    const token = cookies.getCookie("access_token");
    if (!token) {
        window.location.href = "/login.html";
        return;
    }

    // 2 — Buscar dados do usuário logado
    const response = await fetch(`${config.API_URL}/autenticar`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token || refresh_token}`,
        },
    });
    const user = await response.json();
    if (!user) {
        logout();
        return;
    }

    document.getElementById("userNick").innerText = user.nome;

    // 3 — Carrega o score
    carregarScore(user);

    // 4 — Carrega a lista de operações
    carregarOperacoes(user);

    // 5 — Logout
    document.getElementById("logoutBtn").addEventListener("click", () => {
        cookies.deleteCookie("access_token");
        cookies.deleteCookie("refresh_token");
        window.location.href = "/login.html";
    });
});

async function carregarScore(user) {
    document.getElementById("scoreValue").innerText = user.score;
}

async function carregarOperacoes(user) {
    const tbody = document.getElementById("operacoesLista");
    tbody.innerHTML = "<tr><td colspan='4'>Carregando...</td></tr>";

    try {
        const resp = await fetch(`${config.API_URL}/operacoes?nick=${user.nick}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token || refresh_token}`,
            },
        });

        const data = await resp.json();

        // ---------------------
        // CASO 1: veio { detail: ... }
        // ---------------------
        if (!Array.isArray(data)) {
            tbody.innerHTML = `<tr><td colspan='4'>${data.detail || "Erro inesperado"}</td></tr>`;

            mostrarNotificacao(data.detail || "Erro inesperado na API", {
                cor: "#ff0000ff",
                duracao: 4000,
                movimentoEntrada: "deslizar",
                movimentoSaida: "esvair",
                posicao: "top-right"
            });

            return;
        }

        // ---------------------
        // CASO 2: veio []
        // ---------------------
        if (data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='4'>Nenhuma operação encontrada</td></tr>";
            return;
        }

        // ---------------------
        // CASO 3: veio lista de operações
        // ---------------------
        tbody.innerHTML = "";

        data.forEach(op => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${op.tipo}</td>
                <td>${op.valor}</td>
                <td>${op.descricao ?? "-"}</td>
                <td>${op.created_at}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        tbody.innerHTML = "<tr><td colspan='4'>Erro ao carregar</td></tr>";

        mostrarNotificacao(`Erro ao carregar operações`, {
            cor: "#ff0000ff",
            duracao: 4000,
            movimentoEntrada: "deslizar",
            movimentoSaida: "esvair",
            posicao: "top-right"
        });
    }
}

