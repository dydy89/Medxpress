import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

      const decoded: any = jwtDecode(token);
      console.log("🔍 Token décodé COMPLET:", decoded);
      console.log("🔍 Clés disponibles dans le token:", Object.keys(decoded));
      
      const role = decoded?.role?.toUpperCase();
      
      // Check for numeric user ID in token first
      let userId = decoded?.id || decoded?.userId || decoded?.user_id;
      
      console.log("👤 ID brut depuis le token:", userId);
      console.log("👤 Type de l'ID:", typeof userId);
      console.log("🎭 Rôle récupéré:", role);

      // If we don't have a numeric ID or if it's an email, fetch via API
      const isNumericId = (userId && !isNaN(Number(userId)) && typeof userId !== 'string') || (typeof userId === 'string' && /^\d+$/.test(userId));
      
      if (!isNumericId) {
        console.log("❌ Pas d'ID numérique dans le token, récupération via API...");
        console.log("❌ decoded.sub (email):", decoded?.sub);
        
        try {
          // Get user ID via API using the email from the token or form
          const userEmail = decoded?.sub || email;
          const userResponse = await axios.get('http://localhost:8080/api/user/getAll', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log("📋 Tous les utilisateurs:", userResponse.data);
          const currentUser = userResponse.data.find((user: any) => user.email === userEmail);
          
          if (currentUser) {
            console.log("✅ Utilisateur trouvé via API:", currentUser);
            userId = currentUser.id;
            localStorage.setItem('id', currentUser.id.toString());
            console.log("✅ ID numérique stocké depuis l'API:", currentUser.id);
          } else {
            console.error("❌ Utilisateur non trouvé via API avec email:", userEmail);
            alert("Erreur: Utilisateur non trouvé. Contactez l'administrateur.");
            return;
          }
        } catch (apiError) {
          console.error("❌ Erreur lors de la récupération via API:", apiError);
          alert("Erreur: Impossible de récupérer votre ID utilisateur. Contactez l'administrateur.");
          return;
        }
      } else {
        // We have a valid numeric ID from token
        localStorage.setItem('id', userId.toString());
        console.log("✅ ID numérique stocké depuis le token:", userId);
      }

      alert("Connexion réussie !");
      console.log("🚀 Navigation avec role:", role, "et userId:", userId);
      
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
          navigate(`/courier/${userId}`);
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-8 w-full max-w-md bg-white rounded-xl shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">Connexion</h2>

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
              className="px-4 py-2 mt-1 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-4 py-2 mt-1 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 w-full font-semibold text-white bg-blue-600 rounded-lg transition hover:bg-blue-700"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-4 text-center">
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
