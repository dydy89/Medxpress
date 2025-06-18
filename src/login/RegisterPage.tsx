import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiLock, FiUser, FiAlertCircle, FiCheckCircle, FiTruck, FiBriefcase } from 'react-icons/fi';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [firstname, setFirstname] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [kbisNumber, setKbisNumber] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      return `Password must contain at least ${minimumLength} characters including 1 number and 1 special character`;
    }
    if (!hasNumber) {
      return 'Password must contain at least 1 number';
    }
    if (!hasSpecialCharacter) {
      return 'Password must contain at least 1 special character';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validatePassword(password);
    setPasswordError(error);

    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    if (!error) {
      setIsLoading(true);
      setMessage(null);
      
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
          role: roleMapping[selectedRole],
          kbisNumber: selectedRole === 'courier' ? kbisNumber : undefined

        });

        setMessage({ text: "Account created successfully! Redirecting to login...", type: 'success' });
        
        // Redirect after showing success message
        setTimeout(() => navigate('/'), 2000);
      } catch (err) {
        console.error(err);
        setMessage({ text: "Error creating account. Please try again.", type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-2">Join our platform today</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.type === 'success' ? (
              <FiCheckCircle className="mr-2" size={20} />
            ) : (
              <FiAlertCircle className="mr-2" size={20} />
            )}
            {message.text}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="pl-10 mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="your@email.com"
              />
            </div>
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

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setPasswordError(validatePassword(e.target.value));
                }}
                required
                className={`pl-10 mt-1 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition ${
                  passwordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="••••••••"
              />
            </div>
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="pl-10 mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Account Type
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <select
                id="role"
                required
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="pl-10 mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">-- Select your role --</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="courier">Delivery Driver</option>
              </select>
            </div>
          </div>

          {selectedRole === 'courier' && (
            <div className="space-y-1">
              <label htmlFor="kbis" className="block text-sm font-medium text-gray-700">
                KBIS Registration Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiBriefcase className="text-gray-400" />
                </div>
                <input
                  id="kbis"
                  type="text"
                  value={kbisNumber}
                  onChange={handleKbisChange}
                  placeholder="XXX XXX XXX"
                  pattern="\d{3} \d{3} \d{3}"
                  required
                  className="pl-10 mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!!passwordError || isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 rounded-lg transition ${
              passwordError || isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-semibold`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              <>
                <FiUser className="mr-2" />
                Register
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/" className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;