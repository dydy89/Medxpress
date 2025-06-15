import React, { useState } from 'react';
import {
  FaFileMedical,
  FaCube,
  FaClock,
  FaPills,
  FaSignOutAlt,
} from 'react-icons/fa';
import { StatCard } from '../../components/StatCard';
import { Tabs } from '../../components/Tabs';

type TabKey = 'Mes Ordonnances' | 'Mes Commandes' | 'Créer Commande (QR)';

const PatientDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('Mes Ordonnances');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);

  const handleLogout = () => {
    window.location.href = '/login';
  };

  const prescriptions = [
    { id: 1, medication: 'Doliprane 500mg', doctor: 'Dr. Alice', date: '2025-06-12', medicationCount: 3, status: 'En cours' },
    { id: 2, medication: 'Amoxicilline', doctor: 'Dr. Bob', date: '2025-06-14', medicationCount: 2, status: 'Livré' },
    { id: 3, medication: 'Ibuprofène', doctor: 'Dr. Laurent', date: '2025-06-10', medicationCount: 1, status: 'Préparé' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'En cours':
        return 'bg-orange-100 text-orange-600';
      case 'Livré':
        return 'bg-green-100 text-green-600';
      case 'Préparé':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const selectedPrescription = prescriptions.find(p => p.id === selectedPrescriptionId);

  const handleSendToDelivery = () => {
    if (!selectedPrescriptionId) return;
    alert(`Commande envoyée pour l'ordonnance #${selectedPrescriptionId}`);
  };

  const tabContent: Record<TabKey, JSX.Element> = {
    'Mes Ordonnances': (
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Ordonnances Récentes</h2>
        <p className="text-sm text-gray-500 mb-6">Vos prescriptions médicales</p>

        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div key={p.id} className="flex justify-between items-center p-4 border rounded-lg shadow-sm hover:bg-gray-50">
              <div>
                <h3 className="font-semibold text-gray-800">{p.doctor}</h3>
                <p className="text-sm text-gray-500">{p.date}</p>
                <p className="text-sm text-gray-500">{p.medicationCount} médicament(s)</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`text-sm px-3 py-1 rounded-full ${getStatusStyle(p.status)}`}>
                  {p.status}
                </span>
                <button className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm">
                  Commander
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    'Mes Commandes': (
      <div className="bg-white p-6 rounded-xl shadow text-gray-600">
        <p>Historique des commandes à venir...</p>
      </div>
    ),

    'Créer Commande (QR)': (
      <div className="bg-white p-6 rounded-xl shadow text-center">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Créer une commande</h2>
        <p className="text-sm text-gray-500 mb-4">
          Sélectionnez une ordonnance pour générer un QR Code à transmettre au livreur.
        </p>

        <select
          className="border rounded p-2 w-full max-w-sm mb-4"
          value={selectedPrescriptionId || ''}
          onChange={(e) => setSelectedPrescriptionId(Number(e.target.value))}
        >
          <option value="" disabled>Choisissez une ordonnance</option>
          {prescriptions.map(p => (
            <option key={p.id} value={p.id}>
              {p.doctor} - {p.medication} ({p.date})
            </option>
          ))}
        </select>

        {selectedPrescription && (
          <>
            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=Ordonnance-${selectedPrescription.id}`}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>
            <button
              onClick={handleSendToDelivery}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded"
            >
              Envoyer la commande
            </button>
          </>
        )}
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Bonjour, Marie Dupont</h1>
          <p className="text-gray-600">Gérez vos ordonnances et commandes</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center text-red-600 hover:text-red-800 font-medium"
        >
          <FaSignOutAlt className="mr-2" />
          Se déconnecter
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Ordonnances" value="3" icon={<FaFileMedical size={24} />} />
        <StatCard title="Commandes" value="2" icon={<FaCube size={24} />} />
        <StatCard title="En cours" value="1" icon={<FaClock size={24} />} />
        <StatCard title="Médicaments" value="6" icon={<FaPills size={24} />} />
      </div>

      <Tabs
        tabs={Object.keys(tabContent)}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as TabKey)}
      />

      <div className="mt-6">{tabContent[activeTab]}</div>
    </div>
  );
};

export default PatientDashboard;
