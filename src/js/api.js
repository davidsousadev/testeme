export async function teste() {
    try {
        const response = await fetch(`https://davidsousaplay.pythonanywhere.com`, {
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
        const response = await fetch(`https://davidsousaplay.pythonanywhere.com/total`, {
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

//export {teste, totalPerguntas};