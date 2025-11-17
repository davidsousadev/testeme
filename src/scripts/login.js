// login.js

import {
    config,
    mostrarNotificacao,
    cookies
} from './main.js';

const access_token = cookies.getCookie('access_token');
const refresh_token = cookies.getCookie('refresh_token');

if (access_token && refresh_token) {
    // Redirecionar
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1);
 }

document.getElementById("formLogin").addEventListener("submit", async (event) => {
    event.preventDefault();
    const nick = document.getElementById("nick").value;
    const password = document.getElementById("password").value;

    try {
        const resp = await fetch(`${config.API_URL}/logar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nick, password })
        });

        const data = await resp.json();

        if (!data.access_token) {

            mostrarNotificacao(`${data.detail}`, {
                cor: "#ff0000ff",
                duracao: 4000,
                movimentoEntrada: "deslizar",
                movimentoSaida: "esvair",
                posicao: "top-right"
            });
            return;
        }
        else if (data.access_token){
            // Salvar tokens nos cookies
            document.cookie = `access_token=${data.access_token}; path=/; max-age=86400;`;
            document.cookie = `refresh_token=${data.refresh_token}; path=/; max-age=2592000;`;

            mostrarNotificacao(`Logado com sucesso`, {
                cor: "#43af70ff",
                duracao: 4000,
                movimentoEntrada: "deslizar",
                movimentoSaida: "esvair",
                posicao: "top-right"
            });

            // Redirecionar
            setTimeout(() => {
                window.location.href = "index.html";
            }, 800);

        }
        
    } catch (err) {
        console.error(err);
        mostrarNotificacao(`xxx`, {
            cor: "#43af70ff",
            duracao: 4000,
            movimentoEntrada: "deslizar",
            movimentoSaida: "esvair",
            posicao: "top-right"
        });
    }
});
