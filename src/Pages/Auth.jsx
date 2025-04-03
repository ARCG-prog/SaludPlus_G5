import { useState } from "react";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'

const Auth = () => {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const isValidFile = (file) => file.name.endsWith(".ayd1");

    const readFileContent = (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const response = await authService.auth2(JSON.parse(localStorage.getItem("user")).id, e.target.result);
            if (response.status === 200) {
                // console.log(response);
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Autenticación exitosa',
                    confirmButtonColor: '#009689',
                }).then(() => {
                    navigate("/administrator");
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Verifique su segundo factor de autenticación',
                    confirmButtonColor: '#009689',
                });
            }
        };
        reader.readAsText(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) {
            const droppedFile = e.dataTransfer.files[0];
            if (isValidFile(droppedFile)) {
                setFile(droppedFile);
                setError("");
                readFileContent(droppedFile);
            } else {
                setFile(null);
                setError("Solo se permiten archivos .ayd1");
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files.length) {
            const selectedFile = e.target.files[0];
            if (isValidFile(selectedFile)) {
                setFile(selectedFile);
                setError("");
                readFileContent(selectedFile);
            } else {
                setFile(null);
                setError("Solo se permiten archivos .ayd1");
            }
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="bg-[#121f3f] p-6 rounded-2xl shadow-lg w-96 text-center">
                <h2 className="text-xl font-semibold mb-4 text-gray-100">Iniciar sesión</h2>
                <div
                    className={`border-2 border-dashed p-6 rounded-xl cursor-pointer transition-all ${dragging ? 'border-blue-500 bg-blue-100' : 'border-gray-400'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <p className="text-gray-400">Arrastra y suelta un archivo aquí</p>
                    <p className="text-sm text-gray-400 mt-2">o</p>
                    <label className="cursor-pointer text-blue-500 hover:underline">
                        Seleccionar archivo
                        <input type="file" className="hidden" onChange={handleFileChange} accept=".ayd1" />
                    </label>
                </div>
                {file && <p className="mt-4 text-sm text-gray-700">Archivo seleccionado: {file.name}</p>}
                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>
        </div>
    );
};

export default Auth;
