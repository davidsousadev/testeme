export function setCookie(name, value, days) {
    document.cookie =
        `${name}=${value}; path=/; max-age=${days * 86400}`;
}

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(";").shift();
    }
}

export function deleteCookie(name) {
    document.cookie =
        `${name}=; path=/; max-age=0`;
}

// export function notify(msg) {
//     mostrarNotificacao(msg, {
//         cor: "#43af70ff",
//         duracao: 4000,
//         movimentoEntrada: "deslizar",
//         movimentoSaida: "esvair",
//         posicao: "top-right"
//     });
// }
