import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./Pages/Home";
import Register from "./Pages/Register";
import Administrator from "./Pages/Administrator";
import Auth from "./Pages/Auth";
import Module from "./Pages/Module";
import Login from "./Pages/Login";
import { useEffect, useState } from "react";

// Componente para rutas protegidas
const ProtectedRoute = ({ children, requiredRole = null }) => {
  // Verificar si el usuario está autenticado
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    // Si no hay usuario, redirigir al login
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene, redirigir
  if (requiredRole && user.rol !== requiredRole) {
    return <Navigate to="/module" replace />;
  }

  return children;
};

function App() {
  // Estado para mantener track de la autenticación y forzar re-renderizado cuando cambia
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar autenticación al cargar
    const user = localStorage.getItem("user");
    setIsAuthenticated(!!user);

    // Escuchar cambios en localStorage para actualizar la UI si el usuario inicia o cierra sesión
    const handleStorageChange = () => {
      const user = localStorage.getItem("user");
      setIsAuthenticated(!!user);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Ruta pública - página de inicio */}
        <Route path="/" element={<Home />} />

        {/* Ruta pública - login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta pública - registro */}
        <Route path="/register" element={<Register />} />

        {/* Ruta protegida - solo para administradores */}
        <Route path="/administrator" element={<Administrator />} />

        <Route path="/auth" element={<Auth />} />

        {/* Ruta protegida - para médicos y pacientes */}
        <Route
          path="/module"
          element={
            <ProtectedRoute>
              <Module />
            </ProtectedRoute>
          }
        />

        {/* Redirigir cualquier otra ruta a Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

