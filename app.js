// app.js

const resultDiv = document.getElementById("resultado");

async function loadScore() {
    try {
        resultDiv.innerHTML = "<em>Carregando score...</em>";

        const API_URL = "https://apisme.vercel.app/testeme/score";

        const res = await fetch(API_URL);
        const data = await res.json();

        resultDiv.innerHTML = `
            <strong>GET:</strong><br>
            <pre>${API_URL}</pre>
            <br>

            <strong>Resposta da API:</strong><br>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
    } catch (err) {
        console.error(err);
        resultDiv.innerHTML = `
            <span class="badge error">Erro</span><br><br>
            Não foi possível carregar os dados.
        `;
    }
}

loadScore();
