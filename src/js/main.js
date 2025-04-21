import * as Notify from 'https://libsme.vercel.app/src/notify/v3/index.js';

import * as API from './api.js';

const loader = document.getElementsByClassName("loader")[0];
const menu = document.getElementsByClassName("menu")[0];
const carregar = document.getElementsByClassName("carregar")[0];
function mostrar(texto) {
    Notify.mostrarNotificacao(`${texto}`, {
        cor: "#0B2B40",
        duracao: 4000,
        posicao: "bottom-right",
    });
}

async function carregarPerguntas() {
    loader.style.display = "flex";
    menu.style.display = "none";
    carregar.style.display = "none";
}


document.addEventListener("DOMContentLoaded", async function () {
   
    
    
    if (await API.teste()==200){
        loader.style.display = "none";
        menu.style.display = "flex";
        const total = await API.totalPerguntas();
        menu.querySelector("span").innerHTML = `${total[0].total_perguntas}`;        
        mostrar("Dados carregados com sucesso");
    }
    else {
        mostrar("Erro ao conectar com a API");
    }

});


window.mostrar = mostrar;
window.carregarPerguntas = carregarPerguntas;