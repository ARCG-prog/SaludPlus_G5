// services/authService.js
import axios from "axios";

const API_URL = axios.create({
  baseURL: "http://3.133.124.32:80",
});

export const authService = {
  // Iniciar sesión
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al iniciar sesión");
      }

      const data = await response.json();

      // Determinar tipo de usuario basado en la respuesta
      const userRole = determineUserRole(data.usuario);

      // Guardar en localStorage
      const userData = {
        id: data.usuario.id,
        nombre: data.usuario.nombre,
        apellido: data.usuario.apellido,
        correo: data.usuario.correo || data.usuario.correo_electronico,
        rol: userRole,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      return { user: userData, success: true };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  auth2: async (id, token) => {
    try {
      const response = await API_URL.get(`/admin/segundo-factor?id=${id}&token=${token}`);
      return response;
    } catch (error) {
      return error;
    }
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem("user");
    return true;
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem("user");
  },
};

// Función auxiliar para determinar el rol del usuario
function determineUserRole(usuario) {
  // Si tiene propiedades específicas de médico
  if (usuario.num_colegiado || usuario.especialidad) {
    return "medico";
  }
  // Si tiene propiedades específicas de admin (añadir si es necesario)
  if (usuario.es_admin) {
    return "admin";
  }
  // Por defecto, asumimos que es paciente
  return "paciente";
}

export default authService;

