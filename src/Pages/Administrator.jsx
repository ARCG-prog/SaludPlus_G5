import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/card";
import { Button } from "../components/button";
import { User, UserCheck, BarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Administrator() {
  const [activeTab, setActiveTab] = useState("pacientes");
  const [pendingPatients, setPendingPatients] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const tabs = [
    { id: "pacientes", label: "Aceptar Pacientes", icon: <UserCheck /> },
    { id: "medicos", label: "Aceptar Médicos", icon: <UserCheck /> },
    { id: "ver_pacientes", label: "Ver Pacientes", icon: <User /> },
    { id: "ver_medicos", label: "Ver Médicos", icon: <User /> },
    { id: "reportes", label: "Generar Reportes", icon: <BarChart /> },
  ];

  // Función para cargar usuarios pendientes
  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://3.133.124.32:80/login");
      if (!response.ok) {
        throw new Error("Error al cargar los usuarios");
      }
      const data = await response.json();

      // Filtrar usuarios pendientes según su rol
      const pendPatients = data.filter(
        (user) => user.rol === "paciente" && user.estado === "pendiente",
      );
      const pendDoctors = data.filter(
        (user) => user.rol === "medico" && user.estado === "pendiente",
      );

      setPendingPatients(pendPatients);
      setPendingDoctors(pendDoctors);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error al cargar usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para aceptar o rechazar un usuario
  const handleAcceptReject = async (id, estado, rol) => {
    try {
      const response = await fetch(
        "http://3.133.124.32:80/admin/aceptar-rechazar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, estado, rol }),
        },
      );

      if (!response.ok) {
        throw new Error("Error al procesar la solicitud");
      }

      // Recargar la lista de usuarios después de aceptar/rechazar
      await fetchPendingUsers();
    } catch (err) {
      setError(err.message);
      console.error("Error al aceptar/rechazar usuario:", err);
    }
  };

  // Cargar usuarios al iniciar el componente
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <div className="flex items-center justify-center flex-col w-64 bg-gray-800 p-6 shadow-lg">
        <ul className="mt-4 space-y-10">
          {tabs.map((tab) => (
            <li
              key={tab.id}
              className={`flex items-center p-3 cursor-pointer rounded-lg transition-all duration-300 ${
                activeTab === tab.id
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
          onClick={() => navigate("/")}
          className="mt-10 bg-red-600 hover:bg-red-700 text-white text-sm font-bold p-2 rounded-lg transition duration-300 shadow-md w-full"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="flex-1 p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {activeTab === "pacientes" && (
          <Pacientes
            pacientes={pendingPatients}
            onAcceptReject={handleAcceptReject}
            loading={loading}
          />
        )}
        {activeTab === "medicos" && (
          <Medicos
            medicos={pendingDoctors}
            onAcceptReject={handleAcceptReject}
            loading={loading}
          />
        )}
        {activeTab === "ver_pacientes" && <VerPacientes />}
        {activeTab === "ver_medicos" && <VerMedicos />}
        {activeTab === "reportes" && <Reportes />}
      </div>
    </div>
  );
}

function Pacientes({ pacientes, onAcceptReject, loading }) {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <h3 className="text-4xl text-center font-bold text-slate-800">
            Lista de Pacientes Pendientes
          </h3>
          <p className="text-center text-gray-600 mt-4">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <h3 className="text-4xl text-center font-bold text-slate-800">
          Lista de Pacientes Pendientes
        </h3>
        {pacientes.length === 0 ? (
          <p className="text-center text-gray-600 mt-4">
            No hay pacientes pendientes de aprobación
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {pacientes.map((paciente) => (
              <div
                key={paciente.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm"
              >
                <div className="flex-1 ml-4">
                  <p className="font-semibold text-black">{paciente.correo}</p>
                  <p className="text-sm text-gray-600">ID: {paciente.id}</p>
                  <p className="text-sm text-gray-600">
                    Fecha de registro:{" "}
                    {new Date(paciente.fecha_registro).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() =>
                      onAcceptReject(paciente.id, "aprobado", "paciente")
                    }
                  >
                    Aceptar
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() =>
                      onAcceptReject(paciente.id, "rechazado", "paciente")
                    }
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Medicos({ medicos, onAcceptReject, loading }) {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <h3 className="text-4xl text-slate-800 text-center font-bold">
            Lista de Médicos Pendientes
          </h3>
          <p className="text-center text-gray-600 mt-4">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <h3 className="text-4xl text-slate-800 text-center font-bold">
          Lista de Médicos Pendientes
        </h3>
        {medicos.length === 0 ? (
          <p className="text-center text-gray-600 mt-4">
            No hay médicos pendientes de aprobación
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {medicos.map((medico) => (
              <div
                key={medico.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm"
              >
                <div className="flex-1 ml-4">
                  <p className="font-semibold text-black">{medico.correo}</p>
                  <p className="text-sm text-gray-600">ID: {medico.id}</p>
                  <p className="text-sm text-gray-600">
                    Fecha de registro:{" "}
                    {new Date(medico.fecha_registro).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() =>
                      onAcceptReject(medico.id, "aprobado", "medico")
                    }
                  >
                    Aceptar
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() =>
                      onAcceptReject(medico.id, "rechazado", "medico")
                    }
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function VerPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPacientesAceptados = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://3.133.124.32:80/login");
        if (!response.ok) {
          throw new Error("Error al cargar los pacientes");
        }
        const data = await response.json();

        // Filtrar solo pacientes aceptados
        const pacientesAceptados = data.filter(
          (user) => user.rol === "paciente" && user.estado === "aprobado",
        );

        setPacientes(pacientesAceptados);
      } catch (err) {
        setError(err.message);
        console.error("Error al cargar pacientes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPacientesAceptados();
  }, []);

  return (
    <Card>
      <CardContent>
        <h3 className="text-4xl font-bold mb-4 text-slate-800 text-center">
          Pacientes Aceptados
        </h3>

        {loading ? (
          <p className="text-center text-gray-600">Cargando...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : pacientes.length === 0 ? (
          <p className="text-center text-gray-600">
            No hay pacientes aprobados
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {pacientes.map((paciente) => (
              <div
                key={paciente.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm"
              >
                <div className="flex-1 ml-4">
                  <p className="font-semibold text-black">{paciente.correo}</p>
                  <p className="text-sm text-gray-600">ID: {paciente.id}</p>
                  <p className="text-sm text-gray-600">
                    Fecha de registro:{" "}
                    {new Date(paciente.fecha_registro).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function VerMedicos() {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedicosAceptados = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://3.133.124.32:80/login");
        if (!response.ok) {
          throw new Error("Error al cargar los médicos");
        }
        const data = await response.json();

        // Filtrar solo médicos aceptados
        const medicosAceptados = data.filter(
          (user) => user.rol === "medico" && user.estado === "aprobado",
        );

        setMedicos(medicosAceptados);
      } catch (err) {
        setError(err.message);
        console.error("Error al cargar médicos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicosAceptados();
  }, []);

  return (
    <Card>
      <CardContent>
        <h3 className="text-4xl font-bold mb-4 text-slate-800 text-center">
          Médicos Aceptados
        </h3>

        {loading ? (
          <p className="text-center text-gray-600">Cargando...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : medicos.length === 0 ? (
          <p className="text-center text-gray-600">No hay médicos aprobados</p>
        ) : (
          <div className="mt-4 space-y-4">
            {medicos.map((medico) => (
              <div
                key={medico.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm"
              >
                <div className="flex-1 ml-4">
                  <p className="font-semibold text-black">{medico.correo}</p>
                  <p className="text-sm text-gray-600">ID: {medico.id}</p>
                  <p className="text-sm text-gray-600">
                    Fecha de registro:{" "}
                    {new Date(medico.fecha_registro).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Reportes() {
  const [topMedicos, setTopMedicos] = useState([]);
  const [topEspecialidades, setTopEspecialidades] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const [resMedicos, resEspecialidades, resStats] = await Promise.all([
          fetch('http://3.133.124.32:80/reportes/top-medicos'),
          fetch('http://3.133.124.32:80/reportes/top-especialidades'),
          fetch('http://3.133.124.32:80/reportes/estadisticas-citas')
        ]);

        if (!resMedicos.ok || !resEspecialidades.ok || !resStats.ok) {
          throw new Error('Error al cargar los reportes');
        }

        const dataMedicos = await resMedicos.json();
        const dataEspecialidades = await resEspecialidades.json();
        const dataStats = await resStats.json();

        setTopMedicos(dataMedicos);
        setTopEspecialidades(dataEspecialidades);
        setEstadisticas(dataStats);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportes();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <p className="text-center text-gray-600">Cargando reportes...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <p className="text-center text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <h4 className="text-2xl font-bold mb-4 text-black">Médicos más activos</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-600 text-white">
                  <th className="p-2 text-left">Médico</th>
                  <th className="p-2 text-left">Especialidad</th>
                  <th className="p-2 text-left">Citas atendidas</th>
                </tr>
              </thead>
              <tbody>
                {topMedicos.map((medico) => (
                  <tr key={medico.id} className="border-b border-gray-600 text-gray-800">
                    <td className="p-2">{medico.nombre}</td>
                    <td className="p-2">{medico.especialidad}</td>
                    <td className="p-2">{medico.total_citas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <h4 className="text-2xl font-bold mb-4 text-black">Especialidades más solicitadas</h4>
          <div className="grid grid-cols-2 gap-4">
            {topEspecialidades.map((especialidad) => (
              <div key={especialidad.especialidad} className="bg-gray-600 text-white p-4 rounded-lg">
                <h5 className="font-semibold">{especialidad.especialidad}</h5>
                <p>Citas totales: {especialidad.total_citas}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <h4 className="text-2xl font-bold mb-4 text-black">Estadísticas de citas</h4>
          <div className="flex flex-wrap gap-4">
            {estadisticas.map((stat) => (
              <div key={stat.estado} className="bg-blue-600 text-white p-4 rounded-lg flex-1 min-w-[200px]">
                <h5 className="font-semibold capitalize">{stat.estado}</h5>
                <p className="text-2xl font-bold">{stat.cantidad}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Administrator;
