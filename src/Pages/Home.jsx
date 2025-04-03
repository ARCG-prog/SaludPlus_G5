import { useNavigate } from "react-router-dom";
import hero from "../assets/hero.jpg";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <header className="w-full bg-slate-600 text-white py-5 flex justify-between px-8 shadow-md">
        <h1 className="text-4xl font-bold">
          Salud<span className="text-sky-400">Plus</span>
        </h1>
        <nav className="flex items-center justify-center gap-5">
          <button
            onClick={() => navigate("/login")}
            className="bg-slate-100 text-sm p-2 rounded-lg text-black font-bold transition hover:bg-red-400"
            type="button"
          >
            Iniciar Sesion
          </button>
          <button
            className="bg-sky-400 text-sm p-2 rounded-lg text-black font-bold transition hover:bg-sky-600 hover:text-white"
            type="button"
            onClick={() => navigate("/register")}
          >
            Registrarse
          </button>
        </nav>
      </header>

      <section className="relative w-full h-[550px]">
        <img
          src={hero}
          alt="Image Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-30 flex flex-col justify-center items-center text-white text-center px-6">
          <h2 className="text-4xl font-bold text-white">
            Soluciones Médicas Integrales
          </h2>
          <p className="mt-4 text-2xl text-white font-bold">
            Reserva tu cita con los mejores especialistas de manera rápida y
            sencilla.
          </p>
        </div>
      </section>

      <section className="w-full max-w-6xl mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold text-teal-600">
            Cirugía Cardiaca
          </h3>
          <p className="mt-2 text-gray-600">
            Atención especializada en cirugía de corazón y tratamientos
            cardiovasculares.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold text-yellow-500">
            Atención de Emergencia
          </h3>
          <p className="mt-2 text-gray-600">
            Atención inmediata para emergencias médicas y urgencias críticas.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold text-green-500">
            Cuidado Dental
          </h3>
          <p className="mt-2 text-gray-600">
            Servicios odontológicos para una sonrisa saludable y radiante.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;
