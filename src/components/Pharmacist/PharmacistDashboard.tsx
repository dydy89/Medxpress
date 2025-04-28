import React, { useState, useEffect } from 'react';

const PharmacistDashboard: React.FC = () => {
  const [patientName, setPatientName] = useState('');
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    // Simuler l'arrivée d'une commande
    setPatientName('John Doe');
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto bg-white p-6 rounded-lg shadow-lg">

        {/* Titre */}
        <header className="mb-6 text-center">
          <h2 className="text-4xl font-bold text-indigo-700">Tableau de bord du Pharmacien</h2>
          <p className="text-lg text-gray-500 mt-2">Gestion des prescriptions et validation des médicaments</p>
        </header>

        {/* Notification de Commande */}
        {notificationVisible && (
          <div className="mb-8 p-5 bg-yellow-100 text-yellow-800 rounded-lg shadow">
            <h3 className="text-xl mb-3 font-semibold">Nouvelle commande de <span className="text-indigo-700">{patientName}</span></h3>
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
                  alert('Commande de médicaments refusée.');
                  setNotificationVisible(false);
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded"
              >
                Refuser
              </button>
            </div>
          </div>
        )}

        {/* Si accepté : Validation des Médicaments */}
        {accepted && (
          <>
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-700 mb-3">Préparation des médicaments</h3>
              <p className="text-gray-600 mb-4">Veuillez vérifier que tous les médicaments pour <span className="font-semibold">{patientName}</span> sont prêts.</p>

              {!validated ? (
                <button
                  onClick={() => {
                    setValidated(true);
                    alert('Médicaments confirmés comme préparés ✅');
                  }}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                >
                  Valider la préparation
                </button>
              ) : (
                <p className="text-green-600 font-semibold">Médicaments validés et prêts ✅</p>
              )}
            </section>

            {/* Option Refuser après validation */}
            {validated && (
              <section className="mt-8">
                <h3 className="text-xl font-medium text-gray-700 mb-4">Finaliser l'envoi</h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => alert('Commande confirmée et envoyée au livreur 🚚')}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
                  >
                    Confirmer l'Envoi
                  </button>
                  <button
                    onClick={() => alert('Envoi annulé ❌')}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded"
                  >
                    Annuler l'Envoi
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

export default PharmacistDashboard;
