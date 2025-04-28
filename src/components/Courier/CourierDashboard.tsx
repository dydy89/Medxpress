import React, { useState, useEffect } from 'react';

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
    // Simuler appel API pour profil
    setUserProfile({
      name: "Ahmed L.",
      avatar: "/images/avatar-courier.jpg",
      email: "ahmed.livreur@example.com"
    });

    // Simuler appel API pour l'adresse pharmacie
    setPharmacyAddress('Pharmacie Centrale, 123 rue de la Santé, Paris');

    // Simuler info du client
    setClientName('John Doe');
  }, []);

  const goToPharmacy = () => {
    window.open(`https://www.google.com/maps?q=${pharmacyLocation.latitude},${pharmacyLocation.longitude}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto bg-white p-6 rounded-lg shadow-lg">
        
        {/* Profil en haut */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center">
            <div className="text-right mr-4">
              <h1 className="text-xl font-semibold text-gray-800">{userProfile.name}</h1>
              <p className="text-sm text-gray-500">{userProfile.email}</p>
            </div>
            <img 
              src={userProfile.avatar} 
              alt="Profile" 
              className="w-16 h-16 rounded-full border-2 border-gray-300" 
            />
          </div>
        </div>

        {/* Notification du client */}
        {notificationVisible && (
          <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg shadow">
            <p className="text-lg mb-4">Nouvelle commande de <span className="font-semibold">{clientName}</span></p>
            <div className="flex space-x-4">
              <button 
                onClick={() => {
                  setAccepted(true);
                  setNotificationVisible(false);
                }}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded"
              >
                Accepter
              </button>
              <button 
                onClick={() => {
                  alert('Commande refusée.');
                  setNotificationVisible(false);
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded"
              >
                Refuser
              </button>
            </div>
          </div>
        )}

        {/* Si accepté : suite de la mission */}
        {accepted && (
          <>
            {/* Adresse Pharmacie */}
            <section className="mb-8">
              <h3 className="text-xl font-medium text-gray-700 mb-2">Adresse de la Pharmacie</h3>
              <p className="text-gray-600">{pharmacyAddress || "Adresse non disponible"}</p>

              <button 
                onClick={goToPharmacy}
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
              >
                Aller avec GPS
              </button>
            </section>

            {/* Validation des médicaments */}
            <section className="mb-8">
              <h3 className="text-xl font-medium text-gray-700 mb-2">Validation Médicaments</h3>
              {!validated ? (
                <button 
                  onClick={() => {
                    setValidated(true);
                    alert('Tous les médicaments ont été récupérés.');
                  }}
                  className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded"
                >
                  Valider
                </button>
              ) : (
                <p className="text-purple-600 font-semibold">Médicaments validés ✅</p>
              )}
            </section>

            {/* Finalisation de la livraison */}
            {validated && (
              <section className="mt-8">
                <h3 className="text-xl font-medium text-gray-700 mb-4">Finaliser la Livraison</h3>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => alert('Livraison finalisée avec succès ✅')}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
                  >
                    Valider Livraison
                  </button>
                  <button 
                    onClick={() => alert('Livraison annulée ❌')}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded"
                  >
                    Refuser Livraison
                  </button>
                </div>
              </section>
            )}
          </>
        )}
        
      </div>
    </div>
  );
};

export default CourierDashboard;
