import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';




const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      });

          const token = response.data;
    localStorage.setItem('jwt', token);
    alert("Connexion réussie !");

    const decoded: any = jwtDecode(token);
    const role = decoded?.role?.toUpperCase();
    console.log("Rôle récupéré dans le token :", role);
    switch (role) {
        case 'PATIENT':
          navigate('/patient');
          break;
        case 'DOCTOR':
          navigate('/doctor');
          break;
        case 'PHARMACIST':
          navigate('/pharmacist');
          break;
        case 'DELIVERY_DRIVER':
          navigate('/courier');
          break;
        case 'ADMIN':
          navigate('/main');
          break;
        default:
          navigate('/');
      }
   
    } catch (err) {
      console.error(err);
      alert("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Connexion</h2>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Se connecter
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm">
            Vous n'avez pas de compte ?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Créez un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
