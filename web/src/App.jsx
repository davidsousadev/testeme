// web/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AudioProvider } from "./components/AudioProvider.jsx";
import Header from "./components/Header.jsx";

import CardList from "./components/CardList.jsx";
import DesafioPage from "./components/DesafioPage.jsx";
import "./App.css";

export default function App() {
  return (
    <AudioProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<CardList />} />
              <Route path="/desafio/:id" element={<DesafioPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AudioProvider>
  );
}
