const resultDiv = document.getElementById("resultado");

async function loadScore() {
    try {
        resultDiv.innerHTML = "<em>Carregando variáveis...</em>";
       
        const envRes = await fetch("/api/env");
        const envData = await envRes.json();

        const API_URL = envData.API_URL;
        
        resultDiv.innerHTML = `
            <strong>API_URL carregada:</strong><br>
            <pre>${API_URL}</pre>
            <br>
            <strong>Carregando Score...</strong>
        `;
       
        const scoreRes = await fetch(`${API_URL}/testeme/score`);
        const scoreData = await scoreRes.json();

        resultDiv.innerHTML = `
            <strong>Resposta da API:</strong><br>
            <pre>${JSON.stringify(scoreData, null, 2)}</pre>
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
