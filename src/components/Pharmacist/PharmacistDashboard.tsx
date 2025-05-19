import React, { useState, useEffect } from 'react';
import { FaPills, FaCheckCircle, FaTimesCircle, FaTruck } from 'react-icons/fa';

const PharmacistDashboard: React.FC = () => {
  const [patientName, setPatientName] = useState('');
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    setPatientName('John Doe');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-10 px-6">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header pharmacien */}
        <div className="flex items-center bg-white p-6 rounded-xl shadow-md">
          <img
            src="/images/avatar-pharmacist.jpg"
            alt="Pharmacien"
            className="w-20 h-20 rounded-full border-4 border-indigo-300 shadow mr-6"
          />
          <div>
            <h1 className="text-2xl font-bold text-indigo-700">Bonjour, Pharmacien</h1>
            <p className="text-gray-600">Gestion des prescriptions à livrer</p>
          </div>
        </div>

        {/* Notification commande */}
        {notificationVisible && (
          <div className="bg-yellow-100 border-l-4 border-yellow-400 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-yellow-800">
              📦 Nouvelle commande de <span className="text-indigo-700">{patientName}</span>
            </h2>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => {
                  setAccepted(true);
                  setNotificationVisible(false);
                }}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                Accepter
              </button>
              <button
                onClick={() => {
                  alert('Commande de médicaments refusée.');
                  setNotificationVisible(false);
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                Refuser
              </button>
            </div>
          </div>
        )}

        {/* Étapes après acceptation */}
        {accepted && (
          <>
            {/* Étape 1 : Préparation */}
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-center text-indigo-600 mb-3">
                <FaPills className="mr-2" />
                <h3 className="text-lg font-semibold">Préparation des Médicaments</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Vérifiez que tous les médicaments pour <span className="font-semibold">{patientName}</span> sont prêts.
              </p>
              {!validated ? (
                <button
                  onClick={() => {
                    setValidated(true);
                    alert('Médicaments confirmés comme préparés ✅');
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg transition"
                >
                  Valider la préparation
                </button>
              ) : (
                <p className="text-green-600 font-semibold flex items-center">
                  <FaCheckCircle className="mr-2" /> Médicaments validés et prêts
                </p>
              )}
            </div>

            {/* Étape 2 : Envoi */}
            {validated && (
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center text-green-600 mb-3">
                  <FaTruck className="mr-2" />
                  <h3 className="text-lg font-semibold">Finaliser l'Envoi</h3>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => alert('Commande confirmée et envoyée au livreur 🚚')}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition"
                  >
                    Confirmer l'Envoi
                  </button>
                  <button
                    onClick={() => alert('Envoi annulé ❌')}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition"
                  >
                    Annuler l'Envoi
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PharmacistDashboard;
