// ===============================
// index.js
// ===============================

import {
    config,
    mostrarNotificacao,
    cookies
} from './main.js';

const access_token = cookies.getCookie('access_token');
const refresh_token = cookies.getCookie('refresh_token');

const token = access_token || refresh_token;
const lista = document.getElementById("listaDesafios");
const nav = document.querySelector("nav");

let desafiosCache = [];
let timerGlobal = null;
let cardAberto = null;

// ===============================
// MENU
// ===============================

if (token) {
    nav.innerHTML += '<button id="btn_dash">Dashboard</button>';
    document.getElementById("btn_dash").addEventListener("click", () => {
        window.location.href = "/dashboard.html";
    });
    carregarDesafios();
} else {
    nav.innerHTML += '<button id="btn_dash">Login</button>';
    document.getElementById("btn_dash").addEventListener("click", () => {
        window.location.href = "/login.html";
    });
}

// ===============================
// BUSCAR DESAFIOS
// ===============================

async function carregarDesafios() {

    try {
        const response = await fetch(`${config.API_URL}/desafios`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error();

        desafiosCache = await response.json();

        lista.innerHTML = "";

        desafiosCache.forEach(desafio => {
            criarCardDesafio(desafio);
        });

        iniciarTimerGlobal();

    } catch {
        mostrarNotificacao("Erro ao carregar desafios", "error");
    }
}

// ===============================
// DEFINIR COR
// ===============================

function definirClasseTempo(segundos) {
    if (segundos <= 60) return "verde";
    if (segundos <= 120) return "azul";
    if (segundos <= 180) return "vermelho";
    if (segundos <= 240) return "roxo";
    return "expirado";
}

// ===============================
// CRIAR CARD
// ===============================

function criarCardDesafio(desafio) {

    const li = document.createElement("li");

    li.dataset.id = desafio.id;

    // ✅ Garantir UTC explícito
    li.dataset.created = garantirUTC(desafio.created_at);

    atualizarVisualCard(li, desafio);

    li.addEventListener("click", () => expandirCard(li, desafio.id));

    lista.appendChild(li);
}

// ===============================
// GARANTIR UTC ISO
// ===============================

function garantirUTC(dataString) {
    if (!dataString.endsWith("Z") && !dataString.includes("+")) {
        return dataString + "Z";
    }
    return dataString;
}

// ===============================
// EXPANDIR CARD
// ===============================

function expandirCard(li, id) {

    if (cardAberto && cardAberto !== li) {
        cardAberto.classList.remove("expandido");
        atualizarVisualCard(cardAberto);
    }

    if (li.classList.contains("expandido")) {
        li.classList.remove("expandido");
        atualizarVisualCard(li);
        cardAberto = null;
        return;
    }

    li.classList.add("expandido");

    const desafio = desafiosCache.find(d => d.id === id);

    li.innerHTML += `
        <div class="area-coletar">
            <button class="btn-coletar">Coletar recompensa</button>
        </div>
    `;

    const btn = li.querySelector(".btn-coletar");

    if (desafio.coletado) {
        btn.disabled = true;
        btn.textContent = "Já coletado";
    }

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        coletarRecompensa(id, btn, li);
    });

    cardAberto = li;
}

// ===============================
// COLETAR RECOMPENSA
// ===============================

async function coletarRecompensa(id, botao, li) {

    try {
        const response = await fetch(`${config.API_URL}/desafios/${id}/coletar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (!response.ok) {

            mostrarNotificacao(data.detail || "Erro desconhecido", "error");

            if (data.detail === "Recompensa já coletada.") {
                botao.disabled = true;
                botao.textContent = "Já coletado";
                li.classList.add("expirado");
            }

            return;
        }

        mostrarNotificacao(
            `Você ganhou ${data.pontos_ganhos} pontos!`,
            "success"
        );

        li.classList.add("expirado");
        botao.disabled = true;
        botao.textContent = "Coletado";

        const scoreSpan = document.getElementById("scoreUsuario");
        if (scoreSpan) scoreSpan.textContent = data.novo_score;

    } catch (error) {
        console.error("Erro de conexão:", error);
        mostrarNotificacao("Erro ao coletar recompensa", "error");
    }
}

// ===============================
// ATUALIZAR VISUAL (UTC REAL)
// ===============================

function atualizarVisualCard(li, desafio) {

    const criadoEm = new Date(
        garantirUTC(desafio?.created_at || li.dataset.created)
    ).getTime();

    const agora = Date.now(); // ✅ UTC absoluto

    const segundos = (agora - criadoEm) / 1000;
    const classe = definirClasseTempo(segundos);

    li.className = "";
    li.classList.add(classe);

    const tempoRestante = Math.max(0, 240 - segundos);

    li.innerHTML = `
        <h3>${desafio?.title || li.querySelector("h3")?.innerText}</h3>
        <p>${desafio?.desc || li.querySelector("p")?.innerText}</p>
        <div class="timer">
            ${tempoRestante > 0
            ? `Tempo restante: ${formatarTempo(tempoRestante)}`
            : "Expirado"}
        </div>
    `;
}

// ===============================
// TIMER GLOBAL (UTC REAL)
// ===============================

function iniciarTimerGlobal() {

    if (timerGlobal) clearInterval(timerGlobal);

    timerGlobal = setInterval(() => {

        document.querySelectorAll("#listaDesafios li").forEach(li => {

            const criadoEm = new Date(
                garantirUTC(li.dataset.created)
            ).getTime();

            const agora = Date.now(); // ✅ UTC absoluto

            const segundos = (agora - criadoEm) / 1000;
            const classe = definirClasseTempo(segundos);

            li.className = li.classList.contains("expandido")
                ? `expandido ${classe}`
                : classe;

            const timerDiv = li.querySelector(".timer");
            const tempoRestante = Math.max(0, 240 - segundos);

            if (timerDiv) {
                timerDiv.textContent =
                    tempoRestante > 0
                        ? `Tempo restante: ${formatarTempo(tempoRestante)}`
                        : "Expirado";
            }

        });

    }, 1000);
}

// ===============================
// FORMATAR TEMPO
// ===============================

function formatarTempo(segundos) {

    const minutos = Math.floor(segundos / 60);
    const restoSeg = Math.floor(segundos % 60);

    return `${minutos}:${restoSeg.toString().padStart(2, "0")}`;
}4