// index.js

// import variáveis de ambiente
import * as config from './consts.js';

// import de libsme > notify
import { mostrarNotificacao } from "https://libsme.vercel.app/src/notify/v3/index.js";

import { loadScore } from  './teste.js';

loadScore(config, mostrarNotificacao);