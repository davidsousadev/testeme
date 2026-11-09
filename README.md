# TestMe — Mundo do Conhecimento

Plataforma web de aprendizagem gamificada. O frontend usa **HTML5, CSS3 e JavaScript nativo**, sem React, TypeScript, Vite, Tailwind ou bundler. O backend FastAPI existente foi preservado.

## Estrutura

```text
projeto/
├── testeme-main/              # frontend estático (HTML, CSS e JS nativo)
│   ├── index.html
│   ├── login.html             # compatibilidade: redireciona para a tela de login
│   ├── cadastrar.html         # compatibilidade: redireciona para o cadastro
│   ├── dashboard.html         # compatibilidade: redireciona para o histórico
│   ├── styles/game.css
│   └── src/scripts/game.js
└── apisme-main/               # backend FastAPI e serviços existentes
    ├── src/
    ├── requirements.txt
    └── .env.example
```

## O que está funcional no frontend

- Cadastro e login usando `/testeme/cadastrar` e `/testeme/logar`.
- Sessão mantida na aba do navegador (`sessionStorage`), com logout.
- Carregamento do usuário, personagem, progresso, mapa, spots e NPCs pela API.
- Mapa 2D com personagem, câmera que acompanha a movimentação, limites do cenário e controles WASD/setas.
- Controles direcionais para dispositivos móveis.
- Interação com spots próximos e NPCs; o spot só inicia atividade quando está disponível no retorno do servidor.
- Seleção de resposta, envio para `/activities/{id}/submit` e exibição de XP, moedas, evolução e explicação retornados pelo servidor.
- Atualização de personagem/progresso/tempo de regeneração após concluir corretamente.
- Ranking global e histórico de atividades.
- Layout responsivo para desktop e celular.

As recompensas e os tempos de regeneração não são calculados pelo frontend: a interface apresenta o resultado devolvido pelo backend.

## Executar localmente

### 1. Backend

Requer Python 3.10 ou superior.

```bash
cd apisme-main
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env             # Windows: copy .env.example .env
```

Edite `.env` e defina uma `SECRET_KEY` própria. O exemplo é apenas para desenvolvimento local. Sem `DATABASE_URL`, o projeto usa SQLite local.

```bash
uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

A API e a documentação ficam disponíveis em:

- API: `http://127.0.0.1:8000/`
- Swagger: `http://127.0.0.1:8000/docs`

O backend inicializa as tabelas e chama `src/seed.py` ao iniciar a aplicação.

### 2. Frontend

Em outro terminal:

```bash
cd testeme-main
python -m http.server 5500
```

Abra `http://127.0.0.1:5500`.

Por padrão, o frontend aponta para a API publicada em `https://apisme.vercel.app/testeme`. Para usar o backend local, troque o valor de `content` na meta `testme-api` de `index.html` para `http://127.0.0.1:8000/testeme`, ou informe a API na URL:

```text
http://127.0.0.1:5500/?api=http://127.0.0.1:8000/testeme
```

A opção por query string é útil para desenvolvimento; em produção, configure a meta `testme-api` para a URL real da API.

## Fluxo principal de jogo

1. Criar uma conta ou entrar com nick e senha.
2. A API carrega o personagem, o progresso, os spots e os NPCs.
3. Mover o personagem com WASD/setas (ou controles direcionais em telas touch).
4. Aproximar-se de um spot disponível e usar `E` ou o botão de interação.
5. Responder à atividade e enviar a resposta ao backend.
6. Receber o resultado validado pelo servidor e atualizar XP, nível, moedas e cooldown.

## Testes

Validação estática do frontend:

```bash
node --check src/scripts/game.js
python tests/test_frontend_static.py
```

Os testes estáticos verificam o carregamento do JavaScript clássico, referências do DOM, páginas legadas e a existência das rotas de API consumidas no backend.

Testes do backend (após instalar dependências):

```bash
cd ../apisme-main
pytest -q
```

O teste E2E do fluxo de jogo deve ser executado com backend e banco de dados disponíveis. Não considere o fluxo validado apenas pela compilação/sintaxe do JavaScript.

## Configuração da API em produção

O frontend é estático e não precisa de processo de build nem instalação de dependências npm. Para apontá-lo a outro backend, altere `meta[name="testme-api"]` em `index.html`. Configure CORS no backend para a origem do frontend e restrinja `allow_origins`/`allowed_hosts` no ambiente de produção.

## Observações sobre o estado atual

- O backend foi mantido separado e não foi reescrito nesta migração.
- Os endpoints do TestMe já existentes são reutilizados; recursos de autenticação ainda não implementados no backend (por exemplo, refresh token efetivo) não são simulados pelo frontend.
- A sessão frontend usa `sessionStorage` para evitar persistir o token depois que a sessão da aba termina. Isso não substitui cookies `HttpOnly` nem corrige a estratégia de sessão do backend.
- Ranking semanal/mensal, multiplayer em tempo real e geração de conteúdo por provedor externo continuam fora do MVP.
