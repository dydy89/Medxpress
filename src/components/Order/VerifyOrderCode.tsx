import React, { useState, useRef } from 'react';
import axios from 'axios';

const VerifyOrderCode: React.FC = () => {
  const orderId = 53;
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // n'accepte qu'un chiffre

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Passe au champ suivant
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setMessage('');
    setError('');

    const finalCode = code.join('');
    if (finalCode.length !== 6) {
      setError('Veuillez entrer un code à 6 chiffres.');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8080/api/order/verify-code`, null, {
        params: {
          orderId: orderId,
          code: finalCode,
        },
      });
      setMessage(response.data);
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data);
      } else {
        setError('Une erreur est survenue.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Veuillez entrée le code</h1>

        <div className="flex justify-center gap-2 mb-4">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-10 h-12 text-center text-xl border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Valider
        </button>

        {message && <p className="mt-4 text-green-600">{message}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default VerifyOrderCode;
