# 🧠 Teste Me  
### _Seu desafio diário_

![Banner](/web/public/images/banner.png)

---

## 📖 Sobre o projeto

**Teste Me** é uma plataforma **web e mobile** criada para oferecer **desafios diários interativos** aos usuários.  
O objetivo é estimular o aprendizado, foco e raciocínio lógico através de atividades e testes dinâmicos.  

O projeto é **open-source** e foi desenvolvido com foco em **desempenho, escalabilidade e usabilidade**, utilizando as mais modernas tecnologias web e mobile.  

## 🏗️ Estrutura do projeto

```bash
📦testeme
 ┣ 📂api
 ┃ ┣ 📜index.js
 ┃ ┣ 📜package.json
 ┃ ┗ 📜yarn.lock
 ┣ 📂web
 ┃ ┣ 📂public
 ┃ ┃ ┣ 📂images
 ┃ ┃ ┃ ┣ 📜banner.png
 ┃ ┃ ┃ ┣ 📜icon.png
 ┃ ┃ ┃ ┣ 📜loader.gif
 ┃ ┃ ┃ ┣ 📜logo-x.png
 ┃ ┃ ┃ ┗ 📜logo.png
 ┃ ┃ ┣ 📂sounds
 ┃ ┃ ┃ ┣ 📜1.mp3
 ┃ ┃ ┃ ┣ 📜2.mp3
 ┃ ┃ ┃ ┣ 📜3.mp3
 ┃ ┃ ┃ ┗ 📜4.mp3
 ┃ ┃ ┗ 📜vite.svg
 ┃ ┣ 📂src
 ┃ ┃ ┣ 📂components
 ┃ ┃ ┃ ┣ 📜AudioProvider.jsx
 ┃ ┃ ┃ ┣ 📜CardList.css
 ┃ ┃ ┃ ┣ 📜CardList.jsx
 ┃ ┃ ┃ ┣ 📜DesafioPage.jsx
 ┃ ┃ ┃ ┣ 📜Header.jsx
 ┃ ┃ ┃ ┗ 📜Player.jsx
 ┃ ┃ ┣ 📜App.css
 ┃ ┃ ┣ 📜App.jsx
 ┃ ┃ ┣ 📜audio.jsx
 ┃ ┃ ┣ 📜index.css
 ┃ ┃ ┗ 📜main.jsx
 ┃ ┣ 📜.gitignore
 ┃ ┣ 📜README.md
 ┃ ┣ 📜eslint.config.js
 ┃ ┣ 📜favicon.ico
 ┃ ┣ 📜index.html
 ┃ ┣ 📜package-lock.json
 ┃ ┣ 📜package.json
 ┃ ┣ 📜vite.config.js
 ┃ ┗ 📜yarn.lock
 ┣ 📜.gitignore
 ┣ 📜CODE_OF_CONDUCT.md
 ┣ 📜CONTRIBUTING.md
 ┣ 📜README.md
 ┣ 📜SECURITY.md
 ┗ 📜vercel.json
```

<!-- 🔗 **Deploy oficial:** [https://testeme.vercel.app/](https://testeme.vercel.app/)  
📦 **Repositório:** [https://github.com/davidprojetos/testeme](https://github.com/davidprojetos/testeme)

---

## 🚀 Tecnologias utilizadas

### 🧩 **Frontend Web**
- [React.js](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- [React Router DOM](https://reactrouter.com/)

### 📱 **Aplicativo Mobile**
- [React Native](https://reactnative.dev/)
- [React Native CLI](https://github.com/react-native-community/cli)
- [Axios](https://axios-http.com/)
- [Android SDK](https://developer.android.com/studio)

### ⚙️ **Backend / API**
- [FastAPI](https://fastapi.tiangolo.com/)
- [Uvicorn](https://www.uvicorn.org/)
- [SQLite / PostgreSQL](https://www.sqlite.org/)  
- [CORS Middleware](https://fastapi.tiangolo.com/tutorial/cors/)

### 🧰 **Outros**
- [GitHub Actions](https://github.com/features/actions) — CI/CD automatizado para Web e Mobile  
- [Vercel](https://vercel.com/) — Deploy do front-end web  
- [Node.js](https://nodejs.org/) e [Yarn](https://yarnpkg.com/) — Gerenciamento de pacotes  
- [Python 3.11+](https://www.python.org/) — Backend moderno e tipado  

---

## 🏗️ Estrutura do projeto

```bash
apps-github/
│
├── api/                     # Backend (FastAPI)
│   ├── main.py               # Arquivo principal da API
│   ├── models/               # Modelos de dados
│   ├── routes/               # Rotas da API
│   ├── database.py           # Conexão com o banco de dados
│   ├── requirements.txt      # Dependências do backend
│   └── tests/                # Testes automáticos
│
├── web/                     # Frontend Web (React + Tailwind)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── yarn.lock
│
├── mobile/                  # Aplicativo Mobile (React Native)
│   ├── src/
│   ├── android/
│   ├── ios/
│   ├── app.json
│   ├── package.json
│   └── yarn.lock
│
├── shared/                  # Código compartilhado (modelos, utilitários, estilos)
│   ├── types/
│   ├── utils/
│   └── constants/
│
├── .github/
│   └── workflows/
│       ├── build-web.yml     # CI/CD para a versão Web
│       └── build-mobile.yml  # CI/CD para a versão Mobile
│
└── README.md
```

---

## ⚡ Executando localmente

### 1️⃣ Clonar o repositório
```bash
git clone git@github.com:davidprojetos/testeme.git
cd testeme
```

### 2️⃣ Rodar o backend (FastAPI)
```bash
cd api
pip install -r requirements.txt
uvicorn main:app --reload
```

Acesse em: [http://localhost:8000](http://localhost:8000)

### 3️⃣ Rodar o frontend web
```bash
cd web
yarn install
yarn dev
```

Acesse em: [http://localhost:5173](http://localhost:5173)

### 4️⃣ Rodar o aplicativo mobile
```bash
cd mobile
yarn install
npx react-native run-android
```

Para conectar com a API local, use `http://10.0.2.2:8000` no Android Emulator.

---

## 🧪 CI/CD — GitHub Actions

O projeto possui **pipelines automáticos** configurados no diretório `.github/workflows`:

- **build-web.yml** → Gera o build e envia para o deploy da Vercel  
- **build-mobile.yml** → Gera o APK automaticamente via GitHub Actions  

Esses workflows garantem que as versões web e mobile estejam sempre atualizadas e sincronizadas com o código principal (`main`).

---

## 💡 Próximos passos

- [ ] Implementar autenticação com JWT.  
- [ ] Criar sistema de desafios diários dinâmicos.  
- [ ] Adicionar notificações push no app mobile.  
- [ ] Criar painel administrativo para monitorar usuários e estatísticas.  
- [ ] Publicar o aplicativo na Google Play Store.  

--- -->

## 👨‍💻 Autor

**David Sousa**  
Desenvolvedor Full Stack apaixonado por desafios e inovação.  
📬 Contato: [@davidsousadev](https://github.com/davidsousadev)

---

📌 **Teste Me** — _Seu desafio diário._  
🌐 [https://testeme.vercel.app/](https://testeme.vercel.app)
