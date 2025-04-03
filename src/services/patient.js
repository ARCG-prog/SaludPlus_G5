import axios from "axios";

const API = axios.create({
  baseURL: "http://3.133.124.32:80",
  headers: {
    "Content-Type": "application/json",
  },
});

export const patientService = {
  createUser: (userData) => API.post("/pacientes/crear", userData),
  getPatientProfile: (id) => API.get(`/pacientes/perfil/${id}`),
  updatePatientProfile: (id, data) => API.put(`/pacientes/perfil/${id}`, data),
  getDoctorSchedules: () => API.get("/pacientes/horarios-medicos"),
  scheduleAppointment: (appointmentData) =>
    API.post("/pacientes/agendar", appointmentData),
  getActiveAppointments: (pacienteId) =>
    API.get(`/pacientes/citas-activas/${pacienteId}`)
      .then((res) => res.data)
      .catch((error) => {
        // Si el error es "No hay citas activas", devuelve array vacío
        if (error.response?.status === 404) return [];
        throw error;
      }),
  cancelAppointment: (citaId, pacienteId) =>
    API.put(`/pacientes/citas/cancelar/${citaId}`, {
      paciente_id: pacienteId,
    }),
  getAllAppointment: () => API.get("/pacientes/citas-obtener"),
  search: (params) => API.get(`/pacientes/buscar?medico=${params}`),
  getHistory: (pacienteId) => API.get(`/pacientes/historial-citas/${pacienteId}`),
};
