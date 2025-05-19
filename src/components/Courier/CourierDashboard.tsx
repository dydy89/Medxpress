import React, { useState, useEffect } from 'react';
import { FaMapMarkedAlt, FaCheckCircle, FaTimesCircle, FaBoxOpen, FaTruck } from 'react-icons/fa';

const CourierDashboard: React.FC = () => {
  const [userProfile, setUserProfile] = useState({
    name: '',
    avatar: '',
    email: ''
  });

  const [pharmacyAddress, setPharmacyAddress] = useState('');
  const [pharmacyLocation, setPharmacyLocation] = useState({ latitude: 48.8566, longitude: 2.3522 });

  const [accepted, setAccepted] = useState(false);
  const [validated, setValidated] = useState(false);

  const [clientName, setClientName] = useState('');
  const [notificationVisible, setNotificationVisible] = useState(true);

  useEffect(() => {
    setUserProfile({
      name: "Ahmed L.",
      avatar: "/images/avatar-courier.jpg",
      email: "ahmed.livreur@example.com"
    });

    setPharmacyAddress('Pharmacie Centrale, 123 rue de la Santé, Paris');
    setClientName('John Doe');
  }, []);

  const goToPharmacy = () => {
    window.open(`https://www.google.com/maps?q=${pharmacyLocation.latitude},${pharmacyLocation.longitude}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-8">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header profil */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bienvenue, {userProfile.name}</h1>
            <p className="text-gray-500">{userProfile.email}</p>
          </div>
          <img
            src={userProfile.avatar}
            alt="Profil"
            className="w-16 h-16 rounded-full border-4 border-blue-300 shadow-md"
          />
        </div>

        {/* Notification de commande */}
        {notificationVisible && (
          <div className="bg-yellow-100 border-l-4 border-yellow-400 p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">
              📦 Nouvelle commande de {clientName}
            </h2>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => {
                  setAccepted(true);
                  setNotificationVisible(false);
                }}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
              >
                Accepter
              </button>
              <button
                onClick={() => {
                  alert('Commande refusée.');
                  setNotificationVisible(false);
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
              >
                Refuser
              </button>
            </div>
          </div>
        )}

        {/* Étapes de la mission */}
        {accepted && (
          <div className="space-y-6">
            {/* Étape 1 : Aller à la pharmacie */}
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-center mb-3 text-blue-600">
                <FaMapMarkedAlt className="mr-2" />
                <h3 className="text-lg font-semibold">Étape 1 : Aller à la Pharmacie</h3>
              </div>
              <p className="text-gray-700">{pharmacyAddress}</p>
              <button
                onClick={goToPharmacy}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg transition"
              >
                Ouvrir avec Google Maps
              </button>
            </div>

            {/* Étape 2 : Valider les médicaments */}
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-center mb-3 text-purple-600">
                <FaBoxOpen className="mr-2" />
                <h3 className="text-lg font-semibold">Étape 2 : Récupérer les Médicaments</h3>
              </div>
              {!validated ? (
                <button
                  onClick={() => {
                    setValidated(true);
                    alert('Tous les médicaments ont été récupérés.');
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-5 py-2 rounded-lg transition"
                >
                  Valider les médicaments
                </button>
              ) : (
                <p className="text-green-600 font-semibold">✅ Médicaments validés</p>
              )}
            </div>

            {/* Étape 3 : Livraison */}
            {validated && (
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center mb-3 text-green-600">
                  <FaTruck className="mr-2" />
                  <h3 className="text-lg font-semibold">Étape 3 : Livraison</h3>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => alert('Livraison finalisée avec succès ✅')}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition"
                  >
                    Valider la Livraison
                  </button>
                  <button
                    onClick={() => alert('Livraison annulée ❌')}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourierDashboard;
