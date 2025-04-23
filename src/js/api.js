const API_URL = 'https://davidsousaplay.pythonanywhere.com';

export async function teste() {
    try {
        const response = await fetch(`${API_URL}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Erro na api: ${response.status}`);
        }
        return response.status;

    }
    catch (error) {
        console.error('Erro:', error);
    }
}

export async function totalPerguntas() {
    try {
        const response = await fetch(`${API_URL}/total`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Erro na api: ${response.status}`);
        }
        return response.json();

    }
    catch (error) {
        console.error('Erro:', error);
    }
}

export async function carregarPerguntas() {
    try {
        const response = await fetch(`${API_URL}/perguntas`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Erro na api: ${response.status}`);
        }
        return response.json();

    }
    catch (error) {
        console.error('Erro:', error);
    }
}