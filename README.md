# 🧠 TestMe — Plataforma de Aprendizagem Gamificada

> Estudar como parte da experiência de jogar. O TestMe combina referências de **Duolingo** (progressão, XP, níveis, recompensas), **Albion Online** (mundo explorável, mapa, pontos de coleta/spots, respawn, disputa por recursos) e **RPG multiplayer** (rankings, missões, desafios, economia, NPCs e bots).

## 📋 Visão geral

O TestMe é uma aplicação web (com preparação para futuro app mobile / PWA) dividida em duas partes:

| Diretório | Papel | Tecnologia |
|-----------|-------|------------|
| `frontend/` | Interface do jogo (mapa, personagem, spots, atividades, perfil, ranking) | React + TypeScript + Vite + Tailwind CSS + Phaser |
| `apis-me/` | Backend: APIs REST, autenticação, banco de dados, rankings, IA | Python + FastAPI + SQLModel/SQLAlchemy + PostgreSQL (com fallback SQLite) |

### Repositório original
Este repositório já possuía uma estrutura inicial (HTML/CSS/JS vanilla na raiz e pasta `src/`). Essa estrutura foi **preservada** e a nova aplicação gamificada foi organizada em `frontend/`, enquanto o backend `apis-me/` é mantido como aplicação separada (conforme orientação do repositório).

## 🗺️ Conceito do jogo

- **Mundo do Conhecimento**: mapa top-down 2D explorável com câmera que segue o personagem.
- **Personagem**: criado pelo usuário, com nome, avatar, nível, XP e moedas; progresso salvo no banco.
- **Spots**: pontos de atividade espalhados pelo mapa (comum, incomum, raro, épico, lendário) com categorias de conhecimento e **cooldown controlado pelo servidor**.
- **Atividades**: múltipla escolha, verdadeiro/falso, resposta aberta, quebra-cabeças; geradas também por IA (com fallback estático).
- **Progressão**: XP, níveis, moedas, conquistas, missões, streak.
- **Ranking**: geral, semanal e mensal, pontuação validada pelo backend (anti-manipulação).
- **NPCs**: guia, professor, desafiante, explorador (identificados como controlados pelo sistema).
- **Autenticação**: cadastro, login, logout, verificação de e-mail, recuperação de senha, senhas hasheadas (bcrypt), JWT.
- **E-mails**: serviço SMTP independente com templates (confirmação de cadastro, redefinição de senha); modo mock quando SMTP não configurado.
- **IA**: camada independente de integração (`AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`); credenciais só no backend; fallback para atividades pré-cadastradas.

## 🚀 Como executar (local)

### Pré-requisitos
- Node.js ≥ 18 (frontend)
- Python ≥ 3.10 + pip (backend)
- PostgreSQL (recomendado) — o backend aceita `DATABASE_URL` ou variáveis `DB_*`. Sem banco configurado, usa SQLite local (`apisme.db`).

### 1) Backend (apis-me)

```bash
cd /home/david/Documentos/davidsousadev/apisme

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env   # edite DATABASE_URL / DB_* / SECRET_KEY / SMTP_*

uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

O banco é inicializado automaticamente (`create_all`) e dados iniciais (spots, atividades, conquistas, missões, NPCs) são semeados via `src/seed.py`.

Documentação automática da API: `http://127.0.0.1:8000/docs`

### 2) Frontend (frontend/)

```bash
cd /home/david/Documentos/davidsousadev/testeme/frontend

npm install

cp .env.example .env   # ajuste VITE_API_URL se necessário

npm run dev            # http://127.0.0.1:5173

npm run build          # gera a pasta dist/
```

O `VITE_API_URL` deve apontar para o backend (padrão `http://127.0.0.1:8000/testeme`).

### 3) Fluxo de uso
1. Acesse o frontend.
2. Cadastre-se (nome, nick, senha, e-mail opcional).
3. Faça login, crie seu personagem e entre no mapa.
4. Movimente com WASD/setas (desktop) e interaja com os spots (E / Espaço).
5. Responda atividades, ganhe XP/moedas, suba de nível e consulte o ranking e perfil.

## 🧪 Testes

- **Backend**: testes de autenticação, permissões, APIs, persistência, cooldown, recompensas, ranking e validação.
- **Frontend**: testes de componentes, navegação, responsividade, autenticação, interação com o mapa e movimentação.
- **E2E**: fluxos principais (cadastro/login → personagem → atividade → ranking).

### Resultado da validação realizada (este repositório)
- Backend rodando com sucesso em `http://127.0.0.1:8000` (endpoints `/testeme/*` respondendo: cadastro, login, personagem, spots, atividades, submissão, histórico, progresso, conquistas, ranking, NPCs).
- Frontend compilado com TypeScript sem erros e build de produção gerado em `frontend/dist/`.
- Servidor de desenvolvimento frontend disponível em `http://127.0.0.1:5173`.

## 🔐 Segurança

- Senhas hasheadas com bcrypt (não armazenadas em texto puro).
- JWT de acesso/refresh; tokens sensíveis apenas no backend.
- CORS configurado; rate limiting recomendado em produção.
- Validação de entrada no backend; proteção contra SQL Injection (ORM) e XSS.
- Cooldown de spots e validação de recompensa feitos **no servidor** (nunca confiando no cliente).
- `.env` e `.env.*` não são versionados (veja `.gitignore`).

## 📦 Estrutura final (resumo)

```
testeme/                      # repositório (legacy preservado + frontend)
├── index.html / login.html / ...   # legacy (preservado)
├── src/                                        # legacy (preservado)
├── frontend/                                   # NOVO: app React + Vite + Phaser
│   ├── src/
│   │   ├── main.tsx, App.tsx, index.css
│   │   ├── contexts/AuthContext.tsx
│   │   ├── lib/api.ts
│   │   ├── pages/ (Landing, Login, Register, GameWorld, Profile, Ranking)
│   │   └── ...
│   ├── tailwind.config.js, postcss.config.js
│   ├── .env.example
│   ├── package.json
│   └── dist/                                   # build de produção
├── README.md
└── .gitignore

apis-me/                                        # backend separado (irmão)
├── src/
│   ├── main.py, database.py, auth_utils.py, email_service.py, game_logic.py, seed.py
│   ├── models/ (usuários, personagens, spots, atividades, conquistas, NPCs, e-mail, auditoria...)
│   ├── controllers/ (auth, personagens, mundo/spots, atividades, progresso, ranking, IA, NPCs, e-mail)
│   └── ...
├── requirements.txt
├── .env / .env.example
└── vercel.json
```

## 🗺️ Roadmap futura

- Aplicativo mobile Android/iOS e PWA.
- Notificações push (Firebase Cloud Messaging).
- Multijogador em tempo real (personagens simultâneos, chat, grupos, eventos coletivos).
- Novas regiões, raridades de spots, eventos temporários (ex.: "Portal do Conhecimento"), temporadas e desafios entre jogadores.
- IA gerando atividades, puzzles, dicas e diálogos de NPCs contextualizados.

## 🤝 Contribuição

Veja `CONTRIBUTING.md`. Este projeto é open-source (LICENSE).

---

Autor: David Sousa — [@davidsousadev](https://github.com/davidsousadev)
