import React, { useState, useEffect } from 'react';
import { Notification } from './Notifications';
import { PrescriptionView } from './PrescriptionView';
import { TreatmentTracker } from './TreatmentTracker';

const PatientDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [prescription, setPrescription] = useState<any>(null);

  // Simuler les données du profil (dans un vrai cas, cela viendrait d'une API)
  const userProfile = {
    name: "John Doe",
    avatar: "/images/avatar.jpg", // Remplace par l'URL de l'image de profil
    email: "john.doe@example.com"
  };

  useEffect(() => {
    // Simuler l'appel API pour récupérer les notifications et prescriptions
    setNotifications(['Médicament en livraison', 'Rappel de prise de médicament']);
    setPrescription({
      medication: 'Médicament X',
      doctorName: 'Dr. Alice',
      qrCode: '/images/qr-codes/example1.png'
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="container mx-auto bg-white p-6 rounded-lg shadow-lg">
        {/* Profil en haut à gauche */}
        <div className="flex items-center mb-6">
          <img 
            src={userProfile.avatar} 
            alt="Profile" 
            className="w-16 h-16 rounded-full border-2 border-gray-300 mr-4" 
          />
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{userProfile.name}</h1>
            <p className="text-sm text-gray-500">{userProfile.email}</p>
          </div>
        </div>

        {/* Contenu du tableau de bord */}
        <header className="mb-6 text-center">
          <h2 className="text-3xl font-semibold text-gray-800">Tableau de bord du Patient</h2>
          <p className="text-lg text-gray-500 mt-2">Suivi de votre traitement et réception de médicaments</p>
        </header>

        {/* Notifications */}
        <section className="mb-8">
          <h2 className="text-2xl font-medium text-gray-700 mb-3">Notifications</h2>
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <Notification key={index} message={notification} />
            ))}
          </div>
        </section>

        {/* Prescriptions */}
        <section className="mb-8">
          <h2 className="text-2xl font-medium text-gray-700 mb-3">Vos prescriptions</h2>
          {prescription ? (
            <PrescriptionView prescription={prescription} />
          ) : (
            <p className="text-gray-500">Aucune prescription disponible</p>
          )}
        </section>

        {/* Suivi de traitement */}
        <section className="mb-8">
          <h2 className="text-2xl font-medium text-gray-700 mb-3">Suivi de votre traitement</h2>
          <TreatmentTracker />
        </section>
      </div>
    </div>
  );
};

export default PatientDashboard;