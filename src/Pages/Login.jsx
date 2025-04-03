import React, { useState } from "react";
import { AiOutlineMail, AiOutlineLock } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import login from "../assets/login.jpg";
import Swal from 'sweetalert2'

// Crea un servicio para manejar la autenticación
const authService = {
  login: async (credentials) => {
    try {
      const response = await fetch("http://3.133.124.32:80/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        // throw new Error(error.error);
        // alert(error.error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error,
          confirmButtonColor: '#009689',
        })
        return;
      }

      return await response.json();
    } catch (error) {
      console.log("Hubo un error", error);
    }
  },
};

export default function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    correo: "",
    contrasena: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validar campos vacíos
      if (!credentials.correo || !credentials.contrasena) {
        setError("Por favor ingresa correo y contraseña");
        setLoading(false);
        return;
      }

      // Llamar al servicio de autenticación
      const result = await authService.login(credentials);

      // Determinar el tipo de usuario basado en la respuesta
      // Suponiendo que el servidor devuelve un campo que indica el rol
      const userRole = result.usuario.rol || determineUserRole(result.usuario);

      // Guardar información relevante en localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: result.usuario.id,
          nombre: result.usuario.nombre,
          apellido: result.usuario.apellido,
          correo: result.usuario.correo || result.usuario.correo_electronico,
          rol: userRole,
          // No almacenar la contraseña por seguridad
        }),
      );

      // Redireccionar al módulo principal
      if (userRole === "administrador") {
        navigate("/auth");
      } else {
        navigate("/module");
      }
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // Función para determinar el rol basado en los campos del usuario
  const determineUserRole = (usuario) => {
    // Si tiene num_colegiado, es un médico
    if (usuario.num_colegiado || usuario.especialidad) {
      return "medico";
    }
    // Si no tiene campos específicos de médico, asumimos que es paciente
    return "paciente";
  };

  return (
    <div className="flex max-w-[1200px] mx-auto min-h-screen">
      <div className="flex w-full h-screen p-5">
        <div className="w-1/2 hidden bg-slate-100 md:block">
          <img src={login} alt="Login" className="w-full h-full object-cover" />
        </div>
        <div className="w-full md:w-1/2 bg-slate-300 flex flex-col justify-center items-center p-8">
          <h2 className="text-3xl font-bold text-teal-600 mb-6">
            Iniciar Sesión
          </h2>

          {/* {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 w-full max-w-md">
              {error}
            </div>
          )} */}

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <div className="flex items-center border rounded-lg p-2 bg-white">
              <AiOutlineMail className="text-gray-500 mr-3" />
              <input
                type="email"
                placeholder="Correo Electrónico"
                className="w-full outline-none text-center"
                name="correo"
                value={credentials.correo}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex items-center border rounded-lg p-2 bg-white">
              <AiOutlineLock className="text-gray-500 mr-3" />
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full outline-none text-center"
                name="contrasena"
                value={credentials.contrasena}
                onChange={handleInputChange}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition duration-300 font-bold"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
            <button
              type="button"
              className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition duration-300 font-bold"
              onClick={() => navigate("/")}
            >
              Regresar
            </button>
            <p className="text-center text-gray-600">
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-teal-600 hover:underline font-semibold"
              >
                Regístrate aquí
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
