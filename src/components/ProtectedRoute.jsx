// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

function getAuthUser() {
  try {
    const raw = localStorage.getItem("falaCidadao.auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const authUser = getAuthUser();

  if (!authUser) {
    // manda para /entrar e guarda "de onde veio" (pra voltar depois, se você quiser)
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />;
  }

  return children;
}
