import React, { useState, useEffect } from "react";
import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";
import {
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  Image,
  ArrowLeft,
  Home,
  Phone,
  Calendar as CalendarIcon,
  Stethoscope,
  IdCard,
  UserCheck,
  UserCircleIcon,
  ClockIcon,
  CalendarDays,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import { doctorService } from "../services/doctor";
import { patientService } from "../services/patient";
import Swal from "sweetalert2";

function Module() {
  // Estado para guardar la información del usuario
  const [user, setUser] = useState(null);
  // Determinar el tipo de usuario (paciente o médico)
  const [userType, setUserType] = useState(null);
  //const [userType, setUserType] = useState("medical"); // "pacients" o "medical"
  const [activeTab, setActiveTab] = useState("home");
  // const para obtener el perfil del medico

  // Cargar la información del usuario desde localStorage al cargar el componente
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      // Si no hay usuario en localStorage, redirigir al login
      window.location.href = "/";
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Establecer el tipo de usuario basado en el rol
      if (parsedUser.rol === "medico") {
        setUserType("medical");
      } else if (parsedUser.rol === "paciente") {
        setUserType("patient");
      } else if (parsedUser.rol === "admin") {
        // Manejar el caso de administrador si lo implementas después
        setUserType("admin");
      } else {
        // Rol desconocido, redirigir al login
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error parsing user data", error);
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // Tabs específicos para médicos
  const medicalTabs = [
    { id: "appointments", label: "Gestión de Citas", icon: <Calendar /> },
    { id: "attend", label: "Atender Paciente", icon: <CheckCircle /> },
    { id: "schedule", label: "Horarios de Atención", icon: <Clock /> },
    { id: "pacients", label: "Historial Pacientes", icon: <UserCheck /> },
    { id: "prescriptions", label: "Recetas", icon: <FileText /> },
    { id: "profile", label: "Mi Perfil", icon: <User /> },
  ];

  // Tabs específicos para pacientes
  const pacientsTabs = [
    { id: "appointments", label: "Mis Citas", icon: <Calendar /> },
    {
      id: "seeMedicalSchedule",
      label: "Horarios Medicos",
      icon: <Clock />,
    },
    { id: "history", label: "Mi Historial de Citas", icon: <FileText /> },
    { id: "bookappointment", label: "Agendar Cita", icon: <Clock /> },
    { id: "profile", label: "Mi Perfil", icon: <User /> },
  ];

  // Determinar qué tabs mostrar según el tipo de usuario
  const tabs = userType === "medical" ? medicalTabs : pacientsTabs;

  const [inputSearch, setInputSearch] = useState("");
  const [listaBusqueda, setListaBusqueda] = useState([]);
  const handleChange = (e) => {
    const valor = e.target.value;
    setInputSearch(valor);
    search_(valor);
  };

  // === BUSCAR MEDICO ===
  const search_ = async (query) => {
    try {
      const response = await patientService.search(query);
      setListaBusqueda(response.data);
    } catch (error) {
      console.error("Error al buscar médico", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <div className="flex items-center justify-center flex-col w-70 bg-gray-800 p-6 shadow-lg">
        {/* <h1 className="text-2x0 font-bold">¡Hola!, {doctorProfile.nombre} </h1> */}
        <div className="flex items-center mb-6">
          <span className="text-xl font-bold">
            {userType === "medical" ? "Panel Médico" : "Panel Paciente"}
          </span>
        </div>
        <ul className="mt-4 space-y-4 w-full">
          <input
            type="text"
            placeholder="Buscar médico"
            className="h-11 w-full pl-3 py-2 border rounded-lg outline-none text-white border-gray-700"
            onChange={handleChange}
          />
          {tabs.map((tab) => (
            <li
              key={tab.id}
              className={`flex items-center p-3 cursor-pointer rounded-lg transition-all duration-300 ${activeTab === tab.id
                ? "bg-blue-600 text-white shadow-md"
                : "hover:bg-gray-700 text-gray-400"
                }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span className="ml-3 text-sm font-medium">{tab.label}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => handleLogout()}
          className="mt-10 bg-red-600 hover:bg-red-700 text-white text-sm font-bold p-2 rounded-lg transition duration-300 shadow-md w-full"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="flex-1 p-8">
        {inputSearch !== "" && <Search listaBusqueda={listaBusqueda} />}
        {activeTab === "appointments" && <Appointments userType={userType} />}
        {activeTab === "attend" && userType === "medical" && <Attendpacients />}
        {activeTab === "schedule" && userType === "medical" && <SetSchedule />}
        {activeTab === "pacients" && userType === "medical" && <Pacients />}
        {activeTab === "prescriptions" && userType === "medical" && (
          <Prescriptions />
        )}
        {activeTab === "history" && userType === "patient" && <History />}
        {activeTab === "bookappointment" && userType === "patient" && (
          <BookAppointment />
        )}
        {activeTab === "seeMedicalSchedule" && userType === "patient" && (
          <SeeMedicalSchedule />
        )}
        {activeTab === "profile" && <Profile userType={userType} />}
      </div>
    </div>
  );
}

function Search({ listaBusqueda }) {
  return (
    <div className={`p-6 text-colorText`}>
      <h2 className="text-3xl font-bold mb-2">Resultados más relevantes</h2>
      <table className={`min-w-full text-colorText`}>
        <thead>
          <tr className={`w-full text-colorText`}>
            <th className="p-2 text-left text-sm w-10">No.</th>
            <th className="p-2 text-left text-sm w-30">Nombre</th>
            <th className="p-2 text-left text-sm w-30">Teléfono</th>
            <th className="p-2 text-left text-sm w-20">Especialidad</th>
            <th className="p-2 text-left text-sm w-20">Dirección Clínica</th>
          </tr>
        </thead>
        <tbody>
          {listaBusqueda && listaBusqueda.length > 0 ? (
            listaBusqueda.map((valor, index) => (
              <tr key={index}>
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{valor.nombre + " " + valor.apellido}</td>
                <td className="p-2">{valor.telefono}</td>
                <td className="p-2">{valor.especialidad}</td>
                <td className="p-2">{valor.direccion_clinica}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="p-2 text-center">
                No se encontraron resultados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Componente para manejar el perfil tanto de médicos como de pacientes
function Profile({ userType }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dpi: "",
    fecha_nacimiento: "",
    genero: "",
    direccion: "",
    telefono: "",
    especialidad: "",
    num_colegiado: "",
    direccion_clinica: "",
    email: "medical@example.com",
    password: "",
    foto: "",
  });

  const minombre = formData.nombre;

  const [initialData, setInitialData] = useState({});
  const [isChanged, setIsChanged] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [user, setUser] = useState(null);

  // Obtener el id
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      if (parsedUser.rol === "medico") {
        fetchDoctorProfile(parsedUser.id);
      } else if (parsedUser.rol === "paciente") {
        fetchPatientProfile(parsedUser.id); // Nueva función para pacientes
      }
    } catch (error) {
      console.error("Error al parsear los datos del usuario", error);
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  }, []);

  // Nueva función para obtener perfil de paciente
  const fetchPatientProfile = async (id) => {
    try {
      const response = await patientService.getPatientProfile(id);

      if (response.data) {
        setFormData((prevData) => ({
          ...prevData,
          nombre: response.data.nombre || "",
          apellido: response.data.apellido || "",
          dpi: response.data.dpi || "",
          fecha_nacimiento: response.data.fecha_nacimiento || "",
          genero: response.data.genero || "",
          direccion: response.data.direccion || "",
          telefono: response.data.telefono || "",
          foto: response.data.foto || "",
        }));
        setInitialData(response.data);
      }
    } catch (err) {
      console.error("Error al obtener perfil del paciente", err);
    }
  };

  // Extraer los datos del medico
  const fetchDoctorProfile = async (id) => {
    try {
      const response = await doctorService.getDoctorProfile(id);

      if (response.data) {
        setDoctorProfile(response.data);
        // Sincronizando todos los datos del perfil con el estado formData
        setFormData((prevData) => ({
          ...prevData,
          nombre: response.data.nombre || "",
          apellido: response.data.apellido || "",
          dpi: response.data.dpi || "",
          fecha_nacimiento: response.data.fecha_nacimiento || "",
          genero: response.data.genero || "",
          direccion: response.data.direccion || "",
          telefono: response.data.telefono || "",
          especialidad: response.data.especialidad || "",
          num_colegiado: response.data.num_colegiado || "",
          direccion_clinica: response.data.direccion_clinica || "",
          foto: response.data.foto || "",
        }));
        setInitialData(response.data);
      }
    } catch (err) {
      console.error("Hubo un error al obtener el perfil del médico", err);
    }
  };

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "dpi") {
      return;
    }

    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };
      setIsChanged(JSON.stringify(updatedData) !== JSON.stringify(initialData));
      return updatedData;
    });
  };

  // Manejar la subida de archivos (avatar)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData({
          ...formData,
          avatarUrl: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { dpi, email, ...allowedData } = formData;

      if (userType === "medical") {
        await doctorService.updateDoctorProfile(user.id, allowedData);
      } else {
        // Declara la variable correctamente
        const {
          especialidad,
          num_colegiado,
          direccion_clinica,
          password,
          ...patientData
        } = formData;

        await patientService.updatePatientProfile(user.id, patientData); // Usar directamente patientData
      }
      Swal.fire("Éxito", "Perfil Actualizado Correctamente", "success");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error,
        confirmButtonColor: "#009689",
      });
      console.error("Respuesta del servidor:", error.response?.data);
    }
  };

  return (
    <Card>
      <CardContent>
        <h3 className="text-3xl text-center font-bold text-slate-800 mb-6">
          {userType === "medical" ? `Mi Perfil Médico ` : "Mi Perfil"}
          <span className="text-indigo-500 font-extrabold">
            {userType === "medical"
              ? `- ${minombre}`
              : ""}
          </span>
        </h3>
        {userType === "medical" ? (
          // Formulario para médicos
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
            {/* Sección de foto de perfil */}
            <div className="flex flex-col items-center mb-6">
              <div className="mb-3">
                {formData.foto ? (
                  <img
                    src={`https://unavatar.io/${formData.nombre[0]}`}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full border-4 border-blue-600 object-cover"
                  />
                ) : (
                  <img
                    src="https://via.placeholder.com/150"
                    alt="Avatar Placeholder"
                    className="w-24 h-24 rounded-full border-4 border-blue-600 object-cover"
                  />
                )}
              </div>
              <div className="flex space-x-2 w-full max-w-xs">
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="profilePicture"
                  className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-lg cursor-pointer flex items-center justify-center"
                >
                  <Image className="mr-2" size={16} /> Subir Foto
                </label>
              </div>
              <p className="text-xs text-gray-600 text-center mt-1">
                Si no subes una foto, se usará un avatar por defecto
              </p>
            </div>

            {/* Formulario dividido en dos columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center border rounded-lg p-2 bg-white">
                  <User className="text-gray-500 mr-3" size={18} />
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    className="w-full outline-none text-black"
                    value={formData.nombre}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center border rounded-lg p-2 bg-white">
                  <User className="text-gray-500 mr-3" size={18} />
                  <input
                    type="text"
                    name="apellido"
                    placeholder="Apellido"
                    className="w-full outline-none text-black"
                    value={formData.apellido}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center border rounded-lg p-2 bg-white">
                  <IdCard className="text-gray-500 mr-3" size={18} />
                  <input
                    type="text"
                    name="dpi"
                    placeholder="DPI"
                    className="w-full outline-none text-black"
                    value={formData.dpi}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center border rounded-lg p-2 bg-white">
                  <CalendarIcon className="text-gray-500 mr-3" size={18} />
                  <input
                    type="date"
                    name="fechaNacimiento"
                    className="w-full outline-none text-black"
                    value={
                      formData.fecha_nacimiento
                        ? formData.fecha_nacimiento.slice(0, 10)
                        : ""
                    }
                    onChange={handleInputChange}
                  />
                </div>

                <div className="border rounded-lg p-2 bg-white">
                  <select
                    name="genero"
                    className="w-full outline-none text-black"
                    value={formData.genero}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccione Género</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>

                <div className="flex items-center border rounded-lg p-2 bg-white">
                  <Home className="text-gray-500 mr-3" size={18} />
                  <input
                    type="text"
                    name="direccion"
                    placeholder="Dirección"
                    className="w-full outline-none text-black"
                    value={formData.direccion}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center border rounded-lg p-2 bg-white">
                  <Phone className="text-gray-500 mr-3" size={18} />
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Teléfono"
                    className="w-full outline-none text-black"
                    value={formData.telefono}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center border rounded-lg p-2 bg-white">
                  <Stethoscope className="text-gray-500 mr-3" size={18} />
                  <input
                    type="text"
                    name="especialidad"
                    placeholder="Especialidad"
                    className="w-full outline-none text-black"
                    value={formData.especialidad}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center border rounded-lg p-2 bg-white">
                  <IdCard className="text-gray-500 mr-3" size={18} />
                  <input
                    type="text"
                    name="num_colegiado"
                    placeholder="Número de Colegiado"
                    className="w-full outline-none text-black"
                    value={formData.num_colegiado}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center border rounded-lg p-2 bg-white">
                  <Home className="text-gray-500 mr-3" size={18} />
                  <input
                    type="text"
                    name="direccion_clinica"
                    placeholder="Dirección de la Clínica"
                    className="w-full outline-none text-black"
                    value={formData.direccion_clinica}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <Button
                type="submit"
                disabled={!isChanged}
                className={`w-full px-8 py-2 text-white ${isChanged
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-600 opacity-50 cursor-not-allowed"
                  }`}
              >
                Actualizar Perfil
              </Button>
            </div>
          </form>
        ) : (
          // Formulario para pacientes (simplificado)
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
            <div className="flex flex-col items-center mb-6">
              {/* Misma sección de foto de perfil que en médicos */}
              <div className="mb-3">
                {formData.foto ? (
                  <img
                    src={formData.foto}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full border-4 border-blue-600 object-cover"
                  />
                ) : (
                  <img
                    src="https://via.placeholder.com/150"
                    alt="Avatar Placeholder"
                    className="w-24 h-24 rounded-full border-4 border-blue-600 object-cover"
                  />
                )}
              </div>
              <div className="flex space-x-2 w-full max-w-xs">
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="profilePicture"
                  className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-lg cursor-pointer flex items-center justify-center"
                >
                  <Image className="mr-2" size={16} /> Subir Foto
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center border rounded-lg p-2 bg-white">
                  <User className="text-gray-500 mr-3" size={18} />
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    className="w-full outline-none text-black"
                    value={formData.nombre}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center border rounded-lg p-2 bg-white">
                  <User className="text-gray-500 mr-3" size={18} />
                  <input
                    type="text"
                    name="apellido"
                    placeholder="Apellido"
                    className="w-full outline-none text-black"
                    value={formData.apellido}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center border rounded-lg p-2 bg-white">
                  <IdCard className="text-gray-500 mr-3" size={18} />
                  <input
                    type="text"
                    name="dpi"
                    placeholder="DPI"
                    className="w-full outline-none text-black"
                    value={formData.dpi}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>

                <div className="flex items-center border rounded-lg p-2 bg-white">
                  <CalendarIcon className="text-gray-500 mr-3" size={18} />
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    className="w-full outline-none text-black"
                    value={
                      formData.fecha_nacimiento
                        ? formData.fecha_nacimiento.slice(0, 10)
                        : ""
                    }
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="border rounded-lg p-2 bg-white">
                  <select
                    name="genero"
                    className="w-full outline-none text-black"
                    value={formData.genero}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccione Género</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="flex items-center border rounded-lg p-2 bg-white">
                  <Home className="text-gray-500 mr-3" size={18} />
                  <input
                    type="text"
                    name="direccion"
                    placeholder="Dirección"
                    className="w-full outline-none text-black"
                    value={formData.direccion}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center border rounded-lg p-2 bg-white">
                  <Phone className="text-gray-500 mr-3" size={18} />
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Teléfono"
                    className="w-full outline-none text-black"
                    value={formData.telefono}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                type="submit"
                disabled={!isChanged}
                className={`w-full px-8 py-2 text-white ${isChanged
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-600 opacity-50 cursor-not-allowed"
                  }`}
              >
                Actualizar Perfil
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// Componentes para las otras pestañas
function Appointments({ userType }) {
  const [appointments, setAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchAppointments = async () => {
    try {
      setError(null);
      setLoading(true);

      if (userType === "patient") {
        const response = await patientService.getActiveAppointments(user.id);
        setAppointments(response);
      } else if (userType === "medical") {
        const response = await doctorService.pendingAppointments(user.id);
        setPendingAppointments(response.data);
      }
    } catch (error) {
      setError("Error al cargar citas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [userType]);

  const handleCancel = async (citaId) => {

    try {
      await patientService.cancelAppointment(citaId, user.id);
      fetchAppointments();
      Swal.fire("Éxito", "Cita cancelada con exito", "success");
    } catch (error) {
      alert(error.response?.data?.error || "Error al cancelar la cita");
    }

  };

  const handleCancelDoctor = async (citaId) => {
    try {
      await doctorService.cancelAppointmentApp(citaId, user.id);
      fetchAppointments();
      Swal.fire("Éxito", "Cita cancelada con exito por Medico", "success");
    } catch (error) {
      alert(error.response?.data?.error || "Error al cancelar la cita");
    }
  };

  return (
    <Card>
      <CardContent>
        <h3 className="text-3xl text-center font-bold text-slate-800">
          {userType === "medical" ? "Gestión de Citas" : "Mis Citas"}
        </h3>
        <div className="mt-4 space-y-4">
          {userType === "medical" ? (
            pendingAppointments.length === 0 ? (
              <p className="text-center text-gray-600">
                No hay citas pendientes
              </p>
            ) : (
              pendingAppointments.map((appointment) => (
                <div
                  key={appointment.cita_id}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center space-x-3">
                          <UserCircleIcon className="h-8 w-8 text-lime-700" />
                          <h3 className="text-2xl font-bold text-gray-800">
                            {appointment.paciente_nombre}{" "}
                            {appointment.paciente_apellido}
                          </h3>
                        </div>

                        <div className="pl-11 space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Motivo de consulta
                            </p>
                            <p className="text-lg text-gray-700 font-medium">
                              {appointment.motivo}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-5 w-5 text-gray-500" />
                            <p className="text-sm font-medium text-gray-700">
                              {new Date(appointment.fecha).toLocaleDateString(
                                "es-GT",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <ClockIcon className="h-5 w-5 text-gray-500" />
                            <p className="text-sm font-medium text-gray-700">
                              {appointment.hora.slice(0, 5)} hrs
                            </p>
                          </div>

                          <div className="pt-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border border-gray-500 bg-lime-100 text-lime-800">
                              Pendiente
                            </span>
                          </div>
                          <div className="pt-2 flex justify-end space-x-2">
                            {userType === "medical" && (
                              <Button
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() =>
                                  handleCancelDoctor(appointment.cita_id)
                                }
                              >
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : appointments.length === 0 ? (
            <p className="text-center text-gray-600">No hay citas activas</p>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-black">
                        Dr. {appointment.medico_nombre}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.especialidad}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Fecha:</span>{" "}
                        {new Date(appointment.fecha).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Hora:</span>{" "}
                        {appointment.hora.slice(0, 5)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Ubicación:</span>{" "}
                        {appointment.direccion_clinica}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Motivo:</span>{" "}
                        {appointment.motivo}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  className="bg-red-500 hover:bg-red-600 ml-4"
                  onClick={() => handleCancel(appointment.id)}
                >
                  Cancelar
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Funcion para visualizar el horario de los medicos
function SeeMedicalSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedulesRes, appointmentsRes] = await Promise.all([
          patientService.getDoctorSchedules(),
          patientService.getAllAppointment(),
        ]);
        setSchedules(schedulesRes.data);
        setAppointments(appointmentsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedDoctor) {
      calculateAvailableSlots();
    }
  }, [selectedDate, selectedDoctor]);

  const groupSchedulesByDoctor = () => {
    const grouped = {};

    schedules.forEach((schedule) => {
      const key = `${schedule.medico_id}-${schedule.hora_inicio}-${schedule.hora_fin}`;

      if (!grouped[key]) {
        grouped[key] = {
          ...schedule,
          dias: [schedule.dias],
          horario_id: [schedule.horario_id],
        };
      } else {
        grouped[key].dias.push(schedule.dias);
        grouped[key].horario_id.push(schedule.horario_id);
      }
    });

    return Object.values(grouped).map((doctor) => ({
      ...doctor,
      dias: doctor.dias.join(", "),
      horario_id: doctor.horario_id.join(","),
    }));
  };

  const calculateAvailableSlots = () => {
    if (!selectedDoctor || !selectedDate) return;

    const selectedDay = new Date(selectedDate + "T00:00:00").toLocaleDateString(
      "es-GT",
      {
        weekday: "long",
      },
    );

    function normalizeString(str) {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    }

    const normalizedSelectedDay = normalizeString(selectedDay);

    const doctorSchedule = schedules.find(
      (s) =>
        s.medico_id === selectedDoctor.medico_id &&
        s.dias
          .split(",")
          .map((d) => normalizeString(d.trim()))
          .includes(normalizedSelectedDay),
    );

    if (!doctorSchedule) {
      setAvailableSlots([]);
      return;
    }

    const doctorAppointments = appointments.filter(
      (a) =>
        a.medico_id === selectedDoctor.medico_id &&
        a.fecha.split("T")[0] === selectedDate,
    );

    const startTime = new Date(`${selectedDate}T${doctorSchedule.hora_inicio}`);
    const endTime = new Date(`${selectedDate}T${doctorSchedule.hora_fin}`);
    const slotDuration = 30;
    const slots = [];

    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
      const slotTime = currentTime.toTimeString().substring(0, 5);

      const isBooked = doctorAppointments.some(
        (app) => app.hora.substring(0, 5) === slotTime,
      );

      slots.push({
        time: slotTime,
        available: !isBooked,
        start: new Date(currentTime),
        end: new Date(slotEnd),
      });

      currentTime = slotEnd;
    }

    setAvailableSlots(slots);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate("");
    setAvailableSlots([]);
  };

  const groupedDoctors = groupSchedulesByDoctor();

  return (
    <div className="p-6 bg-gray-100 flex items-center justify-center flex-col min-h-screen">
      <h3 className="text-4xl font-bold text-center text-indigo-700 mb-6">
        Horarios Médicos
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h4 className="text-2xl font-semibold text-gray-700 text-center">
            Seleccione un médico:
          </h4>
          {groupedDoctors.map((schedule) => (
            <div
              key={schedule.horario_id}
              className={`p-4 rounded-lg cursor-pointer transition-all ${selectedDoctor?.medico_id === schedule.medico_id
                ? "bg-indigo-100 border-2 border-indigo-400"
                : "bg-white hover:bg-gray-50 border border-gray-200"
                }`}
              onClick={() => handleDoctorSelect(schedule)}
            >
              <h4 className="text-xl font-bold text-gray-800">
                Dr. {schedule.nombre} {schedule.apellido}
              </h4>
              <p className="text-gray-600">
                <strong>Días:</strong> {schedule.dias}
              </p>
              <p className="text-gray-600 text-end">
                <strong>Horario:</strong>{" "}
                <span className="text-sky-500 font-bold">
                  {schedule.hora_inicio.substring(0, 5)} -{" "}
                  {schedule.hora_fin.substring(0, 5)}
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* El resto del componente permanece igual */}
        <div className="space-y-4">
          {selectedDoctor ? (
            <>
              <h4 className="text-2xl text-center font-semibold text-gray-700">
                Disponibilidad del Dr. {selectedDoctor.nombre}{" "}
                {selectedDoctor.apellido}
              </h4>
              <div className="mb-4">
                <label className="block p-1 text-lg font-medium mb-2 bg-black text-center text-white rounded-lg">
                  Seleccione una fecha
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md text-center bg-slate-300 text-black font-bold"
                  min={new Date().toISOString().split("T")[0]}
                  onChange={handleDateChange}
                  value={selectedDate}
                />
              </div>

              {selectedDate && (
                <div>
                  <h5 className="text-xl text-center font-medium text-gray-700 mb-2">
                    Horarios para el{" "}
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                      "es-ES",
                      { weekday: "long", day: "numeric", month: "long" },
                    )}
                  </h5>

                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded text-center font-medium ${slot.available
                            ? "bg-green-100 text-green-800 border border-green-300 hover:bg-green-200"
                            : "bg-red-100 text-red-800 border border-red-300"
                            }`}
                        >
                          {slot.time}
                          <br />
                          <span className="text-xs">
                            {slot.available ? "Disponible" : "Ocupado"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center text-xl">
                      {selectedDate
                        ? "El médico no trabaja este día o no hay horarios disponibles"
                        : "Seleccione una fecha para ver los horarios disponibles"}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-2xl">
                Seleccione un médico para ver su {""}
                <span className="text-indigo-500 font-bold">
                  disponibilidad
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Attendpacients() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [tratamiento, setTratamiento] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  // Obtener citas pendientes
  useEffect(() => {
    const fetchPendingAppointments = async () => {
      try {
        const response = await doctorService.pendingAppointments(user.id);
        setAppointments(response.data);
        setLoading(false);
      } catch (error) {
        setError("Error al cargar citas pendientes");
        setLoading(false);
      }
    };

    if (user && user.rol === "medico") {
      fetchPendingAppointments();
    }
  }, [user]);

  // Manejar envío de tratamiento
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tratamiento.trim()) {
      Swal.fire("Error", "Por favor ingrese el tratamiento", "error");
      return;
    }

    try {
      await doctorService.markAppointmentAsAttended(
        user.id,
        selectedAppointment.cita_id,
        tratamiento,
      );

      // Actualizar lista de citas
      setAppointments((prev) =>
        prev.filter((a) => a.cita_id !== selectedAppointment.cita_id),
      );
      setSelectedAppointment(null);
      setTratamiento("");

      Swal.fire("Éxito", "Cita marcada como atendida", "success");
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar la cita", "error");
    }
  };

  if (loading) {
    return <div className="text-center p-4">Cargando citas...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <Card>
      <CardContent>
        <h3 className="text-3xl text-center font-bold text-slate-800">
          Atender Paciente
        </h3>

        <div className="mt-6 space-y-4">
          {/* Lista de citas pendientes */}
          {appointments.length === 0 ? (
            <p className="text-center text-gray-600">No hay citas pendientes</p>
          ) : (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-600">
                Citas Pendientes:
              </h4>
              {appointments.map((appointment) => (
                <div
                  key={appointment.cita_id}
                  className={`p-4 rounded-lg cursor-pointer ${selectedAppointment?.cita_id === appointment.cita_id
                    ? "bg-blue-50 border-2 border-blue-400"
                    : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-600">
                        {appointment.paciente_nombre}{" "}
                        {appointment.paciente_apellido}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.fecha).toLocaleDateString(
                          "es-GT",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                    <span className="text-sm text-gray-600">
                      {appointment.hora.slice(0, 5)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Motivo: {appointment.motivo}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Formulario de tratamiento */}
          {selectedAppointment && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-4 text-gray-600">
                Atendiendo a: {selectedAppointment.paciente_nombre}{" "}
                {selectedAppointment.paciente_apellido}
              </h4>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tratamiento
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-400"
                    rows="6"
                    placeholder="Describa el tratamiento completo..."
                    value={tratamiento}
                    onChange={(e) => setTratamiento(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    onClick={() => setSelectedAppointment(null)}
                    className="bg-gray-500 hover:bg-gray-600"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Marcar como Atendido
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SetSchedule() {
  const [user, setUser] = useState(null);
  const [schedule, setSchedule] = useState({
    Lunes: { hora_inicio: "", hora_fin: "" },
    Martes: { hora_inicio: "", hora_fin: "" },
    Miércoles: { hora_inicio: "", hora_fin: "" },
    Jueves: { hora_inicio: "", hora_fin: "" },
    Viernes: { hora_inicio: "", hora_fin: "" },
  });

  // Obtener el id
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.rol === "medico") {
        console.log("Usuario Medico Logueado");
      } else if (parsedUser.rol === "paciente") {
        console.log("Usuario Paciendo logueado");
      }
    } catch (error) {
      console.error("Error al parsear los datos del usuario", error);
      localStorage.removeItem("user");
    }
  }, []);

  const saveSchedule = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    try {
      const hours = [
        "08:00:00",
        "09:00:00",
        "10:00:00",
        "11:00:00",
        "12:00:00",
        "13:00:00",
        "14:00:00",
        "15:00:00",
        "16:00:00",
        "17:00:00",
        "18:00:00",
        "19:00:00",
        "20:00:00",
      ];

      const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

      for (let day of days) {
        if (selectedCells[day] && selectedCells[day].length > 0) {
          const selectedRange = selectedCells[day];
          const startCell = selectedRange[0].split("-");
          const endCell = selectedRange[selectedRange.length - 1].split("-");

          const startCol = parseInt(startCell[1]);
          const endCol = parseInt(endCell[1]);

          const startTime = hours[startCol];
          const endTime = hours[endCol + 1];

          const data = {
            dias: day,
            hora_inicio: startTime,
            hora_fin: endTime,
          };

          // Buscar si el horario ya existe en la base de datos
          const existingSchedule = doctorSchedule.find(
            (item) => item.dias === day,
          );

          if (existingSchedule) {
            // Si el horario existe, actualiza el horario
            // console.log("-> Horario existente:", existingSchedule);
            // console.log("-> Horario existente ID:", existingSchedule.id);
            // console.log("-> Nuevo horario:", data);
            await doctorService.updateDoctorSchedule(existingSchedule.id, data);
          } else {
            console.log("Nuevo horario:", data);
            // Si el horario no existe, crea un nuevo horario
            await doctorService.createDoctorSchedule(storedUser.id, data);
          }
        }
      }
      // alert("Horarios guardados correctamente");
      Swal.fire({
        icon: "success",
        title: "Horarios guardados correctamente",
        showConfirmButton: false,
        timer: 2000,
      });
      fetchDoctorSchedule();
    } catch (error) {
      console.error("Error al guardar el horario:", error);
    }
  };

  const [selectedCells, setSelectedCells] = useState({});
  const [startCell, setStartCell] = useState({});
  const [endCell, setEndCell] = useState({});
  const [hoverCells, setHoverCells] = useState({});
  const [doctorSchedule, setDoctorSchedule] = useState([]);

  const fetchDoctorSchedule = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    try {
      const response = await doctorService.getDoctorSchedule(storedUser.id);
      if (response && response.data) {
        console.log("Horarios recibidos:", response.data);
        setDoctorSchedule(response.data);
      }
    } catch (error) {
      console.error("Error al obtener los horarios:", error);
    }
  };

  useEffect(() => {
    fetchDoctorSchedule();
  }, []);

  // Actualiza las celdas basándose en los horarios guardados
  useEffect(() => {
    if (doctorSchedule.length > 0) {
      const updatedCells = {};
      const dayMap = {
        Lunes: 0,
        Martes: 1,
        Miércoles: 2,
        Jueves: 3,
        Viernes: 4,
      };

      const hours = [
        "08:00:00",
        "09:00:00",
        "10:00:00",
        "11:00:00",
        "12:00:00",
        "13:00:00",
        "14:00:00",
        "15:00:00",
        "16:00:00",
        "17:00:00",
        "18:00:00",
        "19:00:00",
        "20:00:00",
      ];

      doctorSchedule.forEach((item) => {
        const { dias, hora_inicio, hora_fin } = item;

        const startIndex = hours.findIndex((h) => h === hora_inicio);
        const endIndex = hours.findIndex((h) => h === hora_fin) - 1;

        const selectedRange = [];
        for (let i = startIndex; i <= endIndex; i++) {
          const rowIndex = dayMap[dias];
          selectedRange.push(`${rowIndex}-${i}`);
        }

        if (selectedRange.length > 0) {
          updatedCells[dias] = selectedRange;
        }
      });
      setSelectedCells(updatedCells);
    }
  }, [doctorSchedule]);

  const handleCellClick = (day, rowIndex, colIndex) => {
    const cell = `${rowIndex}-${colIndex}`;

    // Verificar si la celda ya está seleccionada y si el rango tiene solo una celda
    const isAlreadySelected = selectedCells[day]?.includes(cell);

    if (isAlreadySelected && selectedCells[day].length === 1) {
      // Si solo hay una celda seleccionada y se hace clic en ella nuevamente, des-seleccionarla
      setSelectedCells((prev) => ({
        ...prev,
        [day]: [], // Limpiar las celdas seleccionadas para ese día
      }));
      setStartCell((prev) => ({
        ...prev,
        [day]: null, // Restablecer la celda de inicio
      }));
      setEndCell((prev) => ({
        ...prev,
        [day]: null, // Restablecer la celda de fin
      }));
    } else {
      // Si es la primera celda seleccionada (inicio del intervalo)
      if (!startCell[day]) {
        setStartCell((prev) => ({
          ...prev,
          [day]: cell,
        }));
        setEndCell((prev) => ({
          ...prev,
          [day]: null,
        }));
        setSelectedCells((prev) => ({
          ...prev,
          [day]: [cell], // Solo seleccionamos la celda inicial
        }));
      } else {
        // Si ya hay una celda de inicio, definimos el final
        const startParts = startCell[day].split("-");
        const startRow = parseInt(startParts[0]);
        const startCol = parseInt(startParts[1]);

        // Asegurarnos de que siempre el inicio esté antes que el fin
        const minCol = Math.min(startCol, colIndex);
        const maxCol = Math.max(startCol, colIndex);

        const selectedRange = [];
        for (let i = minCol; i <= maxCol; i++) {
          selectedRange.push(`${startRow}-${i}`);
        }

        setEndCell((prev) => ({
          ...prev,
          [day]: cell,
        }));
        setSelectedCells((prev) => ({
          ...prev,
          [day]: selectedRange, // Marcar todo el rango entre inicio y fin para el día
        }));
      }
    }
  };

  const handleMouseEnter = (day, rowIndex, colIndex) => {
    const cell = `${rowIndex}-${colIndex}`;
    if (startCell[day]) {
      // Si ya se ha seleccionado una celda de inicio, resaltar las celdas del rango
      const startParts = startCell[day].split("-");
      const startCol = parseInt(startParts[1]);

      const minCol = Math.min(startCol, colIndex);
      const maxCol = Math.max(startCol, colIndex);

      const hoverRange = [];
      for (let i = minCol; i <= maxCol; i++) {
        hoverRange.push(`${rowIndex}-${i}`);
      }

      setHoverCells((prev) => ({
        ...prev,
        [day]: hoverRange,
      }));
    }
  };

  const handleMouseLeave = (day) => {
    // Limpiar las celdas de hover cuando el mouse salga
    setHoverCells((prev) => ({
      ...prev,
      [day]: [],
    }));
  };

  return (
    <Card>
      <CardContent>
        <h3 className="text-3xl text-center font-bold text-slate-800">
          Horarios De <span className="text-indigo-500"> Atención</span>
        </h3>
        <div className="mt-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-4">
              Horario Semanal
            </h4>
            <div className="overflow-auto">
              <div className="grid grid-cols-[100px_repeat(12,1fr)] gap-2">
                <div></div>
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className="text-center text-sm font-semibold text-gray-600"
                  >
                    {`${8 + i}:00`}
                  </div>
                ))}

                {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].map(
                  (day, rowIndex) => (
                    <React.Fragment key={day}>
                      <div className="font-medium text-gray-800 flex items-center">
                        {day}
                      </div>
                      {Array.from({ length: 12 }, (_, colIndex) => {
                        const cell = `${rowIndex}-${colIndex}`;
                        return (
                          <div
                            key={colIndex}
                            className={`border border-gray-200 rounded-lg h-12 cursor-pointer ${selectedCells[day]?.includes(cell)
                              ? "bg-blue-500"
                              : hoverCells[day]?.includes(cell)
                                ? "bg-blue-100"
                                : "bg-gray-100"
                              }`}
                            onClick={() =>
                              handleCellClick(day, rowIndex, colIndex)
                            }
                            onMouseEnter={() =>
                              handleMouseEnter(day, rowIndex, colIndex)
                            }
                            onMouseLeave={() => handleMouseLeave(day)}
                          ></div>
                        );
                      })}
                    </React.Fragment>
                  ),
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              className="bg-blue-500 hover:bg-blue-600"
              onClick={saveSchedule}
            >
              Guardar Horarios
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Pacients() {
  const [appointments, setAppointments] = useState([]);
  const getUser = localStorage.getItem("user");
  const user = getUser ? JSON.parse(getUser) : null;

  useEffect(() => {
    if (user && user.rol === "medico") {
      doctorService
        .historialPatients(user.id)
        .then((response) => {
          setAppointments(response.data);
        })
        .catch((error) => {
          console.error("Error al obtener el historial de citas", error);
        });
    }
  }, []);

  if (!user || user.rol !== "medico") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Acceso restringido
          </h2>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center flex-col bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 p-1 shadow-xl rounded-xl overflow-hidden">
          <CardContent className="bg-white rounded-lg p-6">
            <div className="text-center mb-10">
              <h3 className="text-4xl font-bold text-gray-800 mb-2">
                Historial de{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Citas
                </span>
              </h3>
              <p className="text-gray-500">
                Consulta el historial completo de tus citas médicas
              </p>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-xl font-medium text-gray-500">
                  No hay citas registradas
                </h4>
                <p className="text-gray-400">
                  Todavía no tienes citas en tu historial
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {appointments.map((cita) => (
                  <div
                    key={cita.cita_id}
                    className={`border rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md ${cita.cancelado_por
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200 bg-white"
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-3 rounded-lg ${cita.cancelado_por
                            ? "bg-red-100 text-red-600"
                            : "bg-indigo-100 text-indigo-600"
                            }`}
                        >
                          <CalendarDays className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-gray-800">
                            {cita.paciente_nombre} {cita.paciente_apellido}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <span className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              {cita.hora}
                            </span>
                            <span className="flex items-center text-sm text-gray-500">
                              <CalendarDays className="w-4 h-4 mr-1" />
                              {new Date(cita.fecha).toLocaleDateString(
                                "es-GT",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </span>
                            <span
                              className={`text-sm px-2 py-1 rounded-lg border border-black ${cita.cancelado_por
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                                }`}
                            >
                              {cita.estado}
                              {cita.cancelado_por
                                ? ` (Cancelado por: ${cita.cancelado_por})`
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Prescriptions() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user && user.rol === "medico") {
          const response = await doctorService.getAppointmentHistory(user.id);
          setAppointments(response.data);
        }
        setLoading(false);
      } catch (err) {
        setError("Error al cargar las recetas");
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="text-center p-4">Cargando recetas...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <Card>
      <CardContent>
        <h3 className="text-3xl text-center font-bold text-slate-800 mb-6">
          Recetas Médicas
        </h3>

        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay recetas registradas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments
              .filter((app) => app.estado === "atendida" && app.tratamiento)
              .map((appointment) => (
                <div
                  key={appointment.cita_id}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <h4 className="text-lg font-semibold text-gray-600">
                          {appointment.paciente_nombre}{" "}
                          {appointment.paciente_apellido}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">
                            <Calendar className="inline mr-2 w-4 h-4" />
                            {new Date(appointment.fecha).toLocaleDateString(
                              "es-GT",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                          <p className="text-gray-600">
                            <Clock className="inline mr-2 w-4 h-4" />
                            {appointment.hora.slice(0, 5)}
                          </p>
                        </div>

                        <div className="md:border-l md:pl-4">
                          <p className="font-medium text-gray-800 mb-1">
                            Tratamiento:
                          </p>
                          <div className="prose max-w-none text-gray-700">
                            {appointment.tratamiento}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Atendida
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function History() {
  const [listaHistorial, setListaHistorial] = useState([]);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    try {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.rol === "paciente") {
        fetchHistory(parsedUser.id);
      }
    } catch (error) {
      console.error("Error al parsear los datos del usuario", error);
      // localStorage.removeItem("user");
      // window.location.href = "/";
    }
  }, []);

  const fetchHistory = async (pacienteId) => {
    try {
      const response = await patientService.getHistory(pacienteId);
      setListaHistorial(response.data);
    } catch (error) {
      console.error("Error al obtener el historial médico:", error);
    }
  };

  return (
    <Card>
      <CardContent>
        <h3 className="text-3xl text-center font-bold text-slate-800">
          Mi Historial de Citas
        </h3>
        <div className="mt-6 space-y-4">
          {listaHistorial && listaHistorial.length > 0 ? (
            listaHistorial.map((historial) => (
              <div
                key={historial.id}
                className="bg-gray-50 p-4 rounded-lg shadow-sm"
              >
                <p className="font-semibold text-black">
                  Consulta del {new Date(historial.fecha).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Médico: Dr. {historial.medico_nombre}{" "}
                  {historial.medico_apellido}
                </p>
                <p className="text-sm text-gray-600">
                  Motivo: {historial.motivo}
                </p>
                <p className="text-sm text-gray-600">
                  Tratamiento: {historial.tratamiento}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No hay historial médico</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableHours, setAvailableHours] = useState([]);
  const [formData, setFormData] = useState({
    medico_id: "",
    fecha: "",
    hora: "",
    motivo: ""
  });

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const response = await patientService.getDoctorSchedules();
        // Agrupar médicos únicos
        const uniqueDoctors = response.data.reduce((acc, doctor) => {
          if (!acc.some(d => d.medico_id === doctor.medico_id)) {
            acc.push({
              ...doctor,
              horarios: response.data
                .filter(d => d.medico_id === doctor.medico_id)
                .map(({ dias, hora_inicio, hora_fin }) => ({
                  dias,
                  hora_inicio,
                  hora_fin
                }))
            });
          }
          return acc;
        }, []);
        setDoctors(uniqueDoctors);
      } catch (error) {
        console.error("Error cargando médicos:", error);
      }
    };
    loadDoctors();
  }, []);

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({ ...formData, medico_id: doctor.medico_id });
  };

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 28; i++) { // Próximos 14 días
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Función para normalizar nombres de días
  const normalizeDayName = (day) => {
    return day
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const handleDateSelect = (date) => {
    const selectedDay = normalizeDayName(
      date.toLocaleDateString("es-ES", { weekday: "long" })
    );

    const doctorSchedule = selectedDoctor.horarios.find(h =>
      h.dias.split(",").some(d =>
        normalizeDayName(d) === selectedDay
      )
    );

    if (doctorSchedule) {
      const start = new Date(`2000-01-01T${doctorSchedule.hora_inicio}`);
      const end = new Date(`2000-01-01T${doctorSchedule.hora_fin}`);
      const hours = [];

      let current = new Date(start);
      while (current <= end) {
        hours.push(current.toTimeString().substring(0, 5));
        current.setMinutes(current.getMinutes() + 30);
      }

      setAvailableHours(hours);
      setSelectedDate(date.toISOString().split("T")[0]);
      setFormData(prev => ({ ...prev, fecha: date.toISOString().split("T")[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await patientService.scheduleAppointment({
        ...formData,
        paciente_id: JSON.parse(localStorage.getItem("user")).id
      });
      Swal.fire("Éxito", "Cita agendada correctamente", "success");
      setSelectedDoctor(null);
      setFormData({ medico_id: "", fecha: "", hora: "", motivo: "" });
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  // Estilos mejorados
  const getDateButtonStyle = (date, isAvailable) => {
    const baseStyle = "p-2 text-center rounded-lg transition-all";
    const isSelected = selectedDate === date.toISOString().split("T")[0];

    if (!isAvailable) return `${baseStyle} bg-gray-100 text-gray-400 cursor-not-allowed`;
    if (isSelected) return `${baseStyle} bg-blue-600 text-white hover:bg-blue-700`;
    return `${baseStyle} bg-white border border-blue-200 hover:bg-blue-50`;
  };

  const getTimeButtonStyle = (hour) => {
    const baseStyle = "p-2 rounded-lg transition-all";
    return formData.hora === hour
      ? `${baseStyle} bg-blue-600 text-white hover:bg-blue-700`
      : `${baseStyle} bg-white border border-blue-200 hover:bg-blue-50`;
  };

  return (
    <Card>
      <CardContent>
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">
          Agendar Cita Médica
        </h2>

        {!selectedDoctor ? (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Paso 1: Selecciona un médico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map(doctor => (
                <div
                  key={doctor.medico_id}
                  className="p-4 border-2 border-blue-100 rounded-xl cursor-pointer
                    hover:border-blue-300 hover:bg-blue-50 transition-all"
                  onClick={() => handleSelectDoctor(doctor)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-6 h-6 text-blue-600" />
                    <h4 className="font-bold text-gray-800">
                      Dr. {doctor.nombre} {doctor.apellido}
                    </h4>
                  </div>
                  <p className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full w-fit">
                    {doctor.especialidad}
                  </p>
                  <div className="mt-3 space-y-1">
                    {doctor.horarios.map((horario, i) => (
                      <div key={i} className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        {horario.dias}: {horario.hora_inicio.slice(0, 5)} - {horario.hora_fin.slice(0, 5)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              onClick={() => setSelectedDoctor(null)}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a médicos
            </button>

            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-700">
                Paso 2: Selecciona fecha
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {generateAvailableDates().map((date, index) => {
                  const rawDayName = date.toLocaleDateString("es-ES", { weekday: "long" });
                  const dayName = normalizeDayName(rawDayName);

                  const isAvailable = selectedDoctor.horarios.some(h =>
                    h.dias.split(",").some(d => normalizeDayName(d) === dayName)
                  );

                  return (
                    <button
                      key={index}
                      type="button"
                      className={getDateButtonStyle(date, isAvailable)}
                      onClick={() => isAvailable && handleDateSelect(date)}
                      disabled={!isAvailable}
                    >
                      <div className="text-sm font-medium text-gray-800">
                        {date.toLocaleDateString("es-ES", { day: "numeric" })}
                      </div>
                      <div className="text-xs text-gray-600">
                        {rawDayName.slice(0, 3)} {/* Muestra primeras 3 letras del día */}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {availableHours.length > 0 && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-700">
                  Paso 3: Selecciona hora
                </h3>
                <div className="grid grid-cols-3 gap-3 text-gray-600">
                  {availableHours.map((hour, index) => (
                    <button
                      key={index}
                      type="button"
                      className={getTimeButtonStyle(hour)}
                      onClick={() => setFormData({ ...formData, hora: hour })}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-700">
                Paso 4: Motivo de la consulta
              </h3>
              <textarea
                className="w-full p-3 border-2 border-blue-100 rounded-xl text-gray-700
                  focus:border-blue-300 focus:ring-2 focus:ring-blue-100
                  placeholder:text-gray-400"
                rows="3"
                placeholder="Describe el motivo de tu consulta..."
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white
                py-3 rounded-xl font-semibold shadow-lg transition-all"
            >
              Confirmar Cita
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
export default Module;
