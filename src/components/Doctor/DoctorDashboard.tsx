import React, { useState } from 'react';
import { FaUserInjured, FaCalendarAlt, FaPrescriptionBottle, FaQrcode } from 'react-icons/fa';
import { StatCard } from '../../components/StatCard';
import { Tabs } from '../../components/Tabs';

type TabKey = "Mes Patients" | "Ordonnances" | "Nouvelle Ordonnance";

const DoctorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("Nouvelle Ordonnance");

  

  const tabContent: Record<TabKey, JSX.Element> = {
    "Mes Patients": <div>Liste de patients ici</div>,
    "Ordonnances": <div>Historique des ordonnances ici</div>,
    "Nouvelle Ordonnance": (
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Nouvelle Ordonnance</h2>
        <p className="text-sm text-gray-500 mb-6">Création de l'ordonnace du patient</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <input type="text" placeholder="Nom du patient" className="input" />
          <input type="date" className="input" />
        </div>
        <input type="text" placeholder="Médicaments prescrits" className="input mt-4" />
        <input type="text" placeholder="Instructions de prise" className="input mt-4" />

        <button className="mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded flex items-center">
          <FaQrcode className="mr-2" /> Générer Ordonnance 
        </button>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dr. Martin Leroy</h1>
        <p className="text-gray-600">Gestion des patients et ordonnances</p>
      </header>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Patients" value="127" icon={<FaUserInjured size={24} />} />
        <StatCard title="Ordonnances" value="89" icon={<FaPrescriptionBottle size={24} />} />
        <StatCard title="RDV Aujourd'hui" value="12" icon={<FaCalendarAlt size={24} />} />
       
      </div>

      {/* Onglets */}
      <Tabs tabs={Object.keys(tabContent)} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as TabKey)} />

      <div className="mt-6">
        {tabContent[activeTab]}
      </div>
    </div>
  );
};

export default DoctorDashboard;
