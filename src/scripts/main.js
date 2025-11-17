// main.js

// import variáveis de ambiente
import * as config from './consts.js';

// import de libsme > notify
import { mostrarNotificacao } from "https://libsme.vercel.app/src/notify/v3/index.js";

// Utils
import * as cookies from "./utils.js";

export {
    config,
    mostrarNotificacao,
    cookies
}