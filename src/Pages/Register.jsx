import Swal from "sweetalert2";
import React, { useState, useEffect } from "react";
import {
  AiOutlineUser,
  AiOutlineMail,
  AiOutlineLock,
  AiOutlineIdcard,
  AiOutlineCalendar,
  AiOutlineMedicineBox,
} from "react-icons/ai";
import { FiPhone, FiHome, FiImage } from "react-icons/fi";
import patient from "../assets/patient.jpg";
import defaultAvatar from "../assets/default-avatar.png";
import { useNavigate } from "react-router-dom";
import { patientService } from "../services/patient";
import { doctorService } from "../services/doctor";

export default function Register() {
  const navigate = useNavigate();
  const [isMedico, setIsMedico] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Registro de un paciente
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dpi: "",
    genero: "",
    direccion: "",
    telefono: "",
    fecha_nacimiento: "",
    correo_electronico: "",
    contrasena: "",
    fotografia: "imagen.jpg", // Por el momento imagen default
  });

  // Registro de un médico
  const [doctorData, setDoctorData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    contrasena: "",
    dpi: "",
    fecha_nacimiento: "",
    genero: "",
    direccion: "",
    telefono: "",
    foto: "imagen.jpg", // Por defecto
    num_colegiado: "",
    especialidad: "",
    direccion_clinica: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDoctorInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorData({ ...doctorData, [name]: value });
  };

  // Consumir la api para paciente
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await patientService.createUser(formData);
      Swal.fire({
        title: "Registro Exitoso",
        text: "El paciente ha sido registrado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      navigate("/");
    } catch (err) {
      Swal.fire({
        title: "Error",
        text:
          err.response?.data?.error ||
          "Hubo un error al registrar el paciente.",
        icon: "error",
        confirmButtonText: "Cerrar",
      });
      console.log("Hubo un error al registrar el paciente", err);
    }
  };

  // Consumir la api para médico
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      // Si hay una imagen subida, actualiza el campo foto
      if (avatarUrl && avatarUrl !== defaultAvatar) {
        doctorData.foto = avatarUrl;
      }

      const response = await doctorService.createDoctor(doctorData);
      Swal.fire({
        title: "Registro Exitoso",
        text: "El Medico ha sido registrado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      navigate("/");
    } catch (err) {
      Swal.fire({
        title: "Error",
        text:
          err.response?.data?.error || "Hubo un error al registrar el medico.",
        icon: "error",
        confirmButtonText: "Cerrar",
      });
      console.log("Hubo un error al registrar el médico", err);
    }
  };

  // Subir foto de perfil
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Actualizar nombre y generar avatar automáticamente cuando cambia el nombre
  useEffect(() => {
    if (doctorData.nombre.trim() !== "") {
      setAvatarUrl(
        `https://unavatar.io/${doctorData.nombre.toLowerCase().replace(/\s+/g, "-")}`,
      );
    }
  }, [doctorData.nombre]);

  // Validación de contraseña
  const validatePassword = (value, isDoctor = false) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regex.test(value)) {
      setPasswordError(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
      );
    } else {
      setPasswordError("");
    }

    if (isDoctor) {
      setDoctorData({ ...doctorData, contrasena: value });
    } else {
      setFormData({ ...formData, contrasena: value });
    }
  };

  return (
    <div className="flex max-w-[1200px] mx-auto min-h-screen">
      <div className="flex w-full h-screen p-5">
        <div className="w-1/2 hidden bg-slate-100 md:block">
          <img
            src={patient}
            alt="Registro"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/2 bg-slate-300 flex flex-col justify-center items-center p-8">
          {/* Selector de tipo de usuario */}
          <div className="mb-6 flex items-center bg-gray-200 p-1 rounded-full">
            <div className="relative w-64 h-10">
              <div
                className={`absolute inset-0 bg-teal-600 rounded-full transition-transform duration-300 ease-in-out transform ${isMedico ? "translate-x-32" : "translate-x-0"}`}
                style={{ width: "50%" }}
              ></div>
              <div className="absolute inset-0 flex">
                <button
                  type="button"
                  className={`flex-1 z-10 font-bold transition-colors duration-300 ease-in-out ${!isMedico ? "text-white" : "text-gray-700"}`}
                  onClick={() => setIsMedico(false)}
                >
                  Paciente
                </button>
                <button
                  type="button"
                  className={`flex-1 z-10 font-bold transition-colors duration-300 ease-in-out ${isMedico ? "text-white" : "text-gray-700"}`}
                  onClick={() => setIsMedico(true)}
                >
                  Médico
                </button>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-teal-600 mb-6">
            {isMedico ? "Registro de Médico" : "Registro de Paciente"}
          </h2>
          {/* Formulario condicional */}
          {!isMedico ? (
            // Formulario de Paciente (existente)
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-md space-y-3 overflow-y-auto max-h-[500px] pr-2"
            >
              <div className="flex items-center border rounded-lg p-2 bg-white">
                <AiOutlineUser className="text-gray-500 mr-3" />
                <input
                  type="text"
                  placeholder="Nombre"
                  className="w-full outline-none text-center "
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center border rounded-lg p-2 bg-white">
                <AiOutlineUser className="text-gray-500 mr-3" />
                <input
                  type="text"
                  placeholder="Apellido"
                  className="w-full outline-none text-center "
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center border rounded-lg p-2 bg-white">
                <AiOutlineUser className="text-gray-500 mr-3" />
                <input
                  type="text"
                  placeholder="DPI"
                  className="w-full outline-none text-center"
                  name="dpi"
                  value={formData.dpi}
                  onChange={handleInputChange}
                />
              </div>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-center"
              >
                <option value="">Seleccione Género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
              <div className="flex items-center border rounded-lg p-2 bg-white">
                <FiHome className="text-gray-500 mr-3" />
                <input
                  type="text"
                  placeholder="Dirección"
                  className="w-full outline-none text-center"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center border rounded-lg p-2 bg-white">
                <FiPhone className="text-gray-500 mr-3" />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  className="w-full outline-none text-center"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center border rounded-lg p-2 bg-white">
                <AiOutlineCalendar className="text-gray-500 mr-3" />
                <input
                  type="date"
                  className="w-full outline-none text-center"
                  placeholder="Fecha de nacimiento"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center border rounded-lg p-2 bg-white">
                <AiOutlineMail className="text-gray-500 mr-3" />
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  className="w-full outline-none text-center"
                  name="correo_electronico"
                  value={formData.correo_electronico}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center border rounded-lg p-2 bg-white">
                <AiOutlineLock className="text-gray-500 mr-3" />
                <input
                  type="password"
                  placeholder="Contraseña"
                  className="w-full outline-none text-center"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={(e) => validatePassword(e.target.value)}
                />
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
              <button
                type="submit"
                className="w-full bg-teal-600 text-sm font-bold text-white py-3 rounded-lg hover:bg-teal-700 transition duration-300"
              >
                Registrarse
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full text-sm font-bold bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition duration-300"
              >
                Regresar
              </button>
            </form>
          ) : (
            // Formulario de Médico
            <form
              onSubmit={handleDoctorSubmit}
              className="w-full max-w-md space-y-3 overflow-y-auto max-h-[500px] pr-2"
            >
              {/* Sección de foto de perfil */}
              <div className="flex flex-col items-center mb-4">
                <div className="mb-3">
                  <img
                    src={avatarUrl || defaultAvatar}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full border-4 border-teal-600 object-cover"
                  />
                </div>

                <div className="flex space-x-2 w-full">
                  <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="profilePicture"
                    className="flex-1 bg-teal-600 text-white text-xs md:text-sm py-2 px-3 rounded-lg cursor-pointer flex items-center justify-center"
                  >
                    <FiImage className="mr-2" /> Subir Foto
                  </label>
                </div>
                <p className="text-xs text-gray-600 text-center mt-1">
                  Si no subes una foto, se usará un avatar por defecto
                </p>
              </div>

              <div className="flex items-center border rounded-lg p-2 bg-white">
                <AiOutlineUser className="text-gray-500 mr-3" />
                <input
                  type="text"
                  placeholder="Nombre"
                  className="w-full outline-none text-center"
                  name="nombre"
                  value={doctorData.nombre}
                  onChange={handleDoctorInputChange}
                  required
                />
              </div>
              <div className="flex items-center border rounded-lg p-2 bg-white">
                <AiOutlineUser className="text-gray-500 mr-3" />
                <input
                  type="text"
                  placeholder="Apellido"
                  className="w-full outline-none text-center"
                  name="apellido"
                  value={doctorData.apellido}
                  onChange={handleDoctorInputChange}
                  required
                />
              </div>
              <div className="flex items-center border rounded-lg p-2 bg-white">
                <AiOutlineIdcard className="text-gray-500 mr-3" />
                <input
                  type="text"
                  placeholder="DPI"
                  className="w-full outline-none text-center"
                  name="dpi"
                  value={doctorData.dpi}
                  onChange={handleDoctorInputChange}
                  required
                />
              </div>
              <select
                name="genero"
                value={doctorData.genero}
                onChange={handleDoctorInputChange}
                className="w-full p-2 border rounded-lg text-center"
                required
              >
                <option value="">Seleccione Género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
              <div className="flex items-center border rounded-lg p-2 bg-white">
                <FiHome className="text-gray-500 mr-3" />
                <input
                  type="text"
                  placeholder="Dirección"
                  className="w-full outline-none text-center"
                  name="direccion"
                  value={doctorData.direccion}
                  onChange={handleDoctorInputChange}
                  required
                />
              </div>
              <div className="flex items-center border rounded-lg p-2 bg-white">
                <FiHome className="text-gray-500 mr-3" />
                <input
                  type="text"
                  placeholder="Dirección de Clínica"
                  className="w-full outline-none text-center"
                  name="direccion_clinica"
                  value={doctorData.direccion_clinica}
                  onChange={handleDoctorInputChange}
                  required
                />
              </div>
              <div className="flex items-center border rounded-lg p-2 bg-white">
                <FiPhone className="text-gray-500 mr-3" />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  className="w-full outline-none text-center"
                  name="telefono"
                  value={doctorData.telefono}
                  onChange={handleDoctorInputChange}
                  required
                />
              </div>
              <div className="flex items-center border rounded-lg p-2 bg-white">
                <AiOutlineCalendar className="text-gray-500 mr-3" />
                <input
                  type="date"
                  className="w-full outline-none text-center"
                  placeholder="Fecha de nacimiento"
                  name="fecha_nacimiento"
                  value={doctorData.fecha_nacimiento}
                  onChange={handleDoctorInputChange}
                  required
                />
              </div>
              <div className="flex items-center border rounded-lg p-2 bg-white">
                <AiOutlineMedicineBox className="text-gray-500 mr-3" />
                <input
                  type="text"
                  placeholder="Especialidad"
                  className="w-full outline-none text-center"
                  name="especialidad"
                  value={doctorData.especialidad}
                  onChange={handleDoctorInputChange}
                  required
                />
              </div>
              <div className="flex items-center border rounded-lg p-2 bg-white">
                <AiOutlineIdcard className="text-gray-500 mr-3" />
                <input
                  type="text"
                  placeholder="Número de Colegiado"
                  className="w-full outline-none text-center"
                  name="num_colegiado"
                  value={doctorData.num_colegiado}
                  onChange={handleDoctorInputChange}
                  required
                />
              </div>
              <div className="flex items-center border rounded-lg p-2 bg-white">
                <AiOutlineMail className="text-gray-500 mr-3" />
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  className="w-full outline-none text-center"
                  name="correo"
                  value={doctorData.correo}
                  onChange={handleDoctorInputChange}
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
                  value={doctorData.contrasena}
                  onChange={(e) => validatePassword(e.target.value, true)}
                  required
                />
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
              <button
                type="submit"
                className="w-full bg-teal-600 text-sm font-bold text-white py-3 rounded-lg hover:bg-teal-700 transition duration-300"
              >
                Registrarse como Médico
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full text-sm font-bold bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition duration-300"
              >
                Regresar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
