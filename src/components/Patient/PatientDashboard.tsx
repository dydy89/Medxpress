import React, { useState, useEffect } from 'react';
import { Notification } from './Notifications';
import { PrescriptionView } from './PrescriptionView';
import { TreatmentTracker } from './TreatmentTracker';
import { FaBell, FaFilePrescription, FaHeartbeat } from 'react-icons/fa';

const PatientDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [prescription, setPrescription] = useState<any>(null);

  const userProfile = {
    name: "John Doe",
    avatar: "/images/avatar.jpg",
    email: "john.doe@example.com"
  };

  useEffect(() => {
    setNotifications(['📦 Médicament en livraison', '⏰ Rappel de prise de médicament']);
    setPrescription({
      medication: 'Médicament X',
      doctorName: 'Dr. Alice',
      qrCode: '/images/qr-codes/example1.png'
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-green-50 py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header profil */}
        <div className="flex items-center bg-white rounded-xl shadow-md p-6 mb-8">
          <img 
            src={userProfile.avatar}
            alt="Profil"
            className="w-20 h-20 rounded-full border-4 border-blue-300 shadow-md mr-6"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{userProfile.name}</h1>
            <p className="text-gray-500">{userProfile.email}</p>
          </div>
        </div>

        {/* Sections principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <FaBell className="text-blue-500 mr-2" size={22} />
              <h2 className="text-xl font-semibold text-gray-700">Notifications</h2>
            </div>
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <Notification key={index} message={notification} />
              ))}
            </div>
          </div>

          {/* Prescriptions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <FaFilePrescription className="text-green-600 mr-2" size={22} />
              <h2 className="text-xl font-semibold text-gray-700">Vos prescriptions</h2>
            </div>
            {prescription ? (
              <PrescriptionView prescription={prescription} />
            ) : (
              <p className="text-gray-500">Aucune prescription disponible</p>
            )}
          </div>
        </div>

        {/* Traitement */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <div className="flex items-center mb-4">
            <FaHeartbeat className="text-red-500 mr-2" size={22} />
            <h2 className="text-xl font-semibold text-gray-700">Suivi de votre traitement</h2>
          </div>
          <TreatmentTracker />
        </div>
      </div>
    </div>
  );
};




export default PatientDashboard;

