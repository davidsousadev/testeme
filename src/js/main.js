import * as Notify from 'https://libsme.vercel.app/src/notify/v3/index.js';

//import * as API from './api.js';

var totalPerguntas = 0;

const loader = document.getElementsByClassName("loader")[0];
const menu = document.getElementsByClassName("menu")[0];

const pergunta = document.getElementsByClassName("pergunta")[0];

function mostrar(texto) {
    Notify.mostrarNotificacao(`${texto}`, {
        cor: "#0B2B40",
        duracao: 4000,
        posicao: "bottom-right",
    });
}

async function carregarPerguntas() {
    mostrar("Carregando questão!");
    loader.style.display = "flex";
    menu.style.display = "none";
    if (totalPerguntas>=1) {
        loader.style.display = "none";
        pergunta.style.display = "flex";
        var perguntas = await API.carregarPerguntas();
        
        if (perguntas.length == 0) {
            mostrar("Nenhuma pergunta encontrada");
            return;
        }
        else{
            // for (var i = 0; i < 9; i++) {
            //     var perguntaAtual = perguntas[i];
            //     var perguntaTexto = pergunta.querySelector("h5");
            // }

            /* alternativa_a: "Criar e editar planilhas."
               alternativa_b: "Gerenciar bancos de dados."
               alternativa_c: "Criar apresentações."
               alternativa_d: "Editar textos."
               alternativa_e: "Gerenciar e-mails."
               area_assunto_id: 5
               dificuldade: "medio"
               id: 909
               pergunta: "Qual é a função principal do Microsoft Access?"
               resolucao: "Não disponível"
               resposta_correta: "b"
               status_resposta: "n" 
               */

            var perguntaAtual = perguntas["perguntas"];
            pergunta.querySelector("h5").style.display = "flex";
            pergunta.querySelector("h5").innerHTML = `Questão: ${perguntaAtual[0].id} - ${perguntaAtual[0].pergunta}`;
            
            /* pergunta.querySelector(".alternativa_a").innerHTML = `a) ${perguntaAtual[0].alternativa_a}`;
            pergunta.querySelector(".alternativa_b").innerHTML = `b) ${perguntaAtual[0].alternativa_b}`;
            pergunta.querySelector(".alternativa_c").innerHTML = `c) ${perguntaAtual[0].alternativa_c}`;
            pergunta.querySelector(".alternativa_d").innerHTML = `d) ${perguntaAtual[0].alternativa_d}`;
            pergunta.querySelector(".alternativa_e").innerHTML = `e) ${perguntaAtual[0].alternativa_e}`; */
        }
        
    }
}

document.addEventListener("DOMContentLoaded", async function () {

    if (await API.teste() == 200) {
        loader.style.display = "none";
        menu.style.display = "flex";
        var total = await API.totalPerguntas();
        totalPerguntas = total[0].total_perguntas;
        menu.querySelector("span").innerHTML = `${total[0].total_perguntas}`;
        mostrar("Dados carregados com sucesso");
    }
    else {
        mostrar("Erro ao conectar com a API");
    }

});


window.mostrar = mostrar;
window.carregarPerguntas = carregarPerguntas;