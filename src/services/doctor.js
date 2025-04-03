import axios from "axios";

const API = axios.create({
  baseURL: "http://3.133.124.32:80",
  headers: {
    "Content-Type": "application/json",
  },
});

export const doctorService = {
  createDoctor: (doctorData) => API.post("/doctores/crear", doctorData),
  getDoctorProfile: (id) => API.get(`/doctores/perfil/${id}`),
  updateDoctorProfile: (id, data) => API.put(`/doctores/perfil/${id}`, data),
  getDoctorSchedule: (id) => API.get(`/doctores/horario/${id}`),
  createDoctorSchedule: (id, data) => API.post(`/doctores/horario/${id}`, data),
  updateDoctorSchedule: (id, data) => API.put(`/doctores/horario/${id}`, data),
  pendingAppointments: (id) => API.get(`/doctores/citas/pendientes/${id}`),
  historialPatients: (id) => API.get(`/doctores/historial-citas/${id}`),
  cancelAppointmentApp: (cita_id, medic_id) =>
    API.put(`/doctores/citas/cancelar/${cita_id}`, { medico_id: medic_id }),
  markAppointmentAsAttended: (medico_id, cita_id, tratamiento) => 
    API.post(`/doctores/marcar-cita-atendida/${medico_id}`, { cita_id, tratamiento }),
  getAppointmentHistory: (medico_id) => API.get(`/doctores/historial-citas/${medico_id}`),
};
