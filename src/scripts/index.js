// index.js

import {
    config,
    mostrarNotificacao,
    cookies
} from './main.js';

const access_token = cookies.getCookie('access_token');
const refresh_token = cookies.getCookie('refresh_token');

if (access_token || refresh_token) {
    let login = document.getElementById("login");
    let menu = document.querySelector("nav");
login.style.display = "none";
    menu.innerHTML += '<a href="/dashboard.html">Dashboard</a>';
    
 }