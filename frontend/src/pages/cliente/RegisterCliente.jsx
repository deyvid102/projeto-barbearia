import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';

export default function RegisterCliente() {
  const [formData, setFormData] = useState({ nome: '', numero: '', email: '', senha: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clientes', formData);
      alert('Registro criado com sucesso!');
      navigate('/cliente/login');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-medium text-center">Registro de cliente</h2>
        <input type="text" placeholder="Nome" required className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, nome: e.target.value})} />
        <input type="text" placeholder="Número" className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, numero: e.target.value})} />
        <input type="email" placeholder="E-mail" required className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Senha" required className="w-full p-2 border rounded"
          onChange={e => setFormData({...formData, senha: e.target.value})} />
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">Registrar</button>
      </form>
    </div>
  );
}