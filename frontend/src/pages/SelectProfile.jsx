import { useNavigate } from 'react-router-dom';

export default function SelectProfile() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center text-gray-800">Selecione seu perfil</h1>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/cliente/login')}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Sou cliente
          </button>
          <button
            onClick={() => navigate('/barbeiro/login')}
            className="w-full py-3 px-4 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
          >
            Sou barbeiro
          </button>
        </div>
      </div>
    </div>
  );
}