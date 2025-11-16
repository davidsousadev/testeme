// teste.js

async function loadScore(config, mostrarNotificacao) {
    try {
        const res = await fetch(`${config.API_URL}/score`);
        const data = await res.json();
        if (data) {
            mostrarNotificacao(`Score: ${data.value} ME's`, {
                cor: "#43af70ff",
                duracao: 4000,
                movimentoEntrada: "deslizar",
                movimentoSaida: "esvair",
                posicao: "top-right"
            });
        }
    } catch (err) {
        console.error(err);
    }
}

export { loadScore };