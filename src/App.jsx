// src/App.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import Topo from "./components/Topo";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home.jsx";
import ComoFunciona from "./pages/ComoFunciona";
import PainelPublico from "./pages/PainelPublico";
import DetalheDemanda from "./pages/DetalheDemanda";
import RegistrarProblema from "./pages/RegistrarProblema";
import Entrar from "./pages/Entrar";
import { useEffect } from "react";
import { resetDemandasMock } from "./storage/demandasStorage";

export default function App() {
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    function handleKeyDown(e) {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "m") {
        e.preventDefault();

        const ok = window.confirm(
          "Deseja restaurar as demandas mock do Fala Cidadão?"
        );

        if (!ok) return;

        resetDemandasMock();
        window.alert("Demandas mock restauradas com sucesso.");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface text-textmain">
      <Topo />

      <main className="flex-1 flex">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/painel" element={<PainelPublico />} />
          <Route path="/painel/:id" element={<DetalheDemanda />} />
          <Route path="/registrar" element={<ProtectedRoute> <RegistrarProblema /> </ProtectedRoute>} />
          <Route path="/entrar" element={<Entrar />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
