import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./index.css";

const Landing = React.lazy(() => import("./pages/Landing"));
const LoginPage = React.lazy(() => import("./pages/Login"));
const RegisterPage = React.lazy(() => import("./pages/Register"));
const GameWorld = React.lazy(() => import("./pages/GameWorld"));
const ProfilePage = React.lazy(() => import("./pages/Profile"));
const RankingPage = React.lazy(() => import("./pages/Ranking"));

function AppRouter() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated && location.pathname === "/") {
      navigate("/game");
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0f172a]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 border-4 border-[#fbbf24] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#fbbf24] font-semibold">TestMe</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9]">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/game" element={user ? <GameWorld /> : <Navigate to="/login" replace />} />
          <Route path="/perfil" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
          <Route path="/ranking" element={user ? <RankingPage /> : <Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

