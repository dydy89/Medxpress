import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [firstname, setFirstname] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [kbisNumber, setKbisNumber] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const handleKbisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.substring(0, 3) + ' ' + value.substring(3);
    if (value.length > 7) value = value.substring(0, 7) + ' ' + value.substring(7);
    setKbisNumber(value.substring(0, 11));
  };

  const validatePassword = (value: string) => {
    const minimumLength = 12;
    const hasNumber = /\d/.test(value);
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    if (value.length < minimumLength) {
      return `Le mot de passe doit contenir au moins ${minimumLength} caractères dont 1 chiffre et 1 caractère spécial`;
    }
    if (!hasNumber) {
      return 'Le mot de passe doit contenir au moins 1 chiffre';
    }
    if (!hasSpecialCharacter) {
      return 'Le mot de passe doit contenir au moins 1 caractère spécial';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validatePassword(password);
    setPasswordError(error);

    if (password !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!error) {
      const roleMapping: { [key: string]: string } = {
        patient: 'PATIENT',
        doctor: 'DOCTOR',
        pharmacist: 'PHARMACIST',
        courier: 'DELIVERY_DRIVER',
      };

      try {
        await axios.post('http://localhost:8080/api/auth/signup', {
          email: email,
          password: password,
          role: roleMapping[selectedStatut],
          name,
          firstname,
          kbisNumber: selectedStatut === 'courier' ? kbisNumber : undefined
        });

        alert("Compte créé avec succès !");
        navigate('/'); // Redirection vers la page de connexion
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la création du compte");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Inscription</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
          <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">
          Prénom
         </label>
          <input
          id="firstname"
          type="text"
          value={firstname}
          onChange={e => setFirstname(e.target.value)}
          required
          className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

<div>
  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
    Nom
  </label>
  <input
    id="name"
    type="text"
    value={name}
    onChange={e => setName(e.target.value)}
    required
    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              onChange={e => {
                setPassword(e.target.value);
                setPasswordError(validatePassword(e.target.value));
              }}
              required
              className={`mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                passwordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
              }`}
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="statut" className="block text-sm font-medium text-gray-700">
              Statut
            </label>
            <select
              id="statut"
              name="statut"
              required
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Sélectionnez votre statut --</option>
              <option value="patient">Patient</option>
              <option value="doctor">Médecin</option>
              <option value="pharmacist">Pharmacien</option>
              <option value="courier">Livreur</option>
            </select>
          </div>

          {selectedStatut === 'courier' && (
            <div>
              <label htmlFor="kbis" className="block text-sm font-medium text-gray-700">
                Immatriculation KBIS
              </label>
              <input
                id="kbis"
                type="text"
                value={kbisNumber}
                onChange={handleKbisChange}
                placeholder="XXX XXX XXX"
                pattern="\d{3} \d{3} \d{3}"
                required
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!!passwordError}
            className={`w-full font-semibold py-2 px-4 rounded-lg transition ${
              passwordError
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            S'inscrire
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm">
            Vous avez déjà un compte ?{' '}
            <Link to="/" className="text-green-600 hover:underline">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
