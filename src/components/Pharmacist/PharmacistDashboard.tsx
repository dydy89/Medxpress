import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaFilePrescription, FaSignOutAlt, FaQrcode } from 'react-icons/fa';
import { StatCard } from '../../components/StatCard';
import { Tabs } from '../../components/Tabs';

interface Order {
  id: number;
  status: string;
  prescriptionId: number;
}

interface Prescription {
  id: number;
  doctorEntity: { name: string };
  patient: { name: string };
  medicaments: { name: string }[];
  date: string;
  status: string;
}

const pharmacyId = 1; // ID codé en dur pour la pharmacie

const PharmacistDashboard: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'Ordonnances' | 'Commandes'>('Ordonnances');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Token utilisé pour pharmacist:", token);

    setLoading(true);

    // ✅ Appel vers le nouveau backend pour les prescriptions
    axios.get(`http://localhost:8080/api/pharmacy/${pharmacyId}/prescriptions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setPrescriptions(res.data))
      .catch(err => console.error('Erreur prescriptions', err))
      .finally(() => setLoading(false));

    // ✅ Appel vers le nouveau backend pour les commandes
    axios.get(`http://localhost:8080/api/pharmacy/${pharmacyId}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setOrders(res.data))
      .catch(err => console.error('Erreur commandes', err));
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'En cours': return 'bg-orange-100 text-orange-600';
      case 'Livré': return 'bg-green-100 text-green-600';
      case 'Préparé': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const renderQRCode = () => (
    <img
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADIAQAAAACFI5MzAAABeUlEQVR4Xu2WQW6EMAxFP2KRJUfgJnCxkUDiYsxNOALLLBDu/wlimA5d1rQSloiSPBZW7G8b9pPh+8VuN7mJ7G+QCUA5Be0iqp6nypvwGyzbWg1avAk9GiYbUVpsuENzDQnPGXV42nUEhS2w8cQ3B2KKT2BUmCsnkXMgKUdTaLh8Zu/vk2wMTV+j3c+eRKEZ9EQ8FnN3jI8b0XME06XsLT4uJKvTEmnwQCySm45ke44RqGPDcnH02odIID2LxNwpPo8tTVwJ3eqmmCoFa5XFg0qcSBipTltB38DlAhJbW+pUJHhIDjqTKahdmTpGpG/sHd4kx4cCAejgUuOlHyfC5JjLpBIwW/lOrTfRw3SpXOTGdQFhjvJyBCWazJ/IJqlEXZOl671rOhBulaNj0mmlOUq/uhLT7IJNrBLN7psX0fxmbBss2iv9fNUqVyKPel6zaypRryAUayeV5CdyJvw4OWh+y2J9zxAPAs2wpuYdla3+5NxuchPZ/yRfkTNVXCxtElQAAAAASUVORK5CYII="
      alt="QR Code"
      className="w-24 h-24 mt-2"
    />
  );

  const tabContent = {
    'Ordonnances': (
      <div className="space-y-4">
        {prescriptions.map(p => (
          <div key={p.id} className="border p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800">Dr. {p.doctorEntity.name}</h3>
              <p className="text-sm text-gray-500">Patient : {p.patient.name}</p>
              <p className="text-sm text-gray-500">{p.medicaments.length} médicament(s)</p>
            </div>
            <span className={`text-sm px-3 py-1 rounded-full ${getStatusStyle(p.status)}`}>
              {p.status}
            </span>
          </div>
        ))}
      </div>
    ),
    'Commandes': (
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="border p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-gray-800">Commande #{order.id}</h4>
              <p className="text-sm text-gray-500">Prescription ID : {order.prescriptionId}</p>
              <p className="text-sm text-gray-500">Statut : {order.status}</p>
              <button className="mt-2 flex items-center text-sm text-blue-600 hover:underline">
                <FaQrcode className="mr-2" />
                Générer QR Code
              </button>
              {renderQRCode()}
            </div>
          </div>
        ))}
      </div>
    )
  };

  const handleLogout = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Tableau de bord Pharmacien</h1>
        <button onClick={handleLogout} className="flex items-center text-red-600 hover:text-red-800 font-medium">
          <FaSignOutAlt className="mr-2" /> Se déconnecter
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Ordonnances" value={prescriptions.length.toString()} icon={<FaFilePrescription size={24} />} />
        <StatCard title="Commandes" value={orders.length.toString()} icon={<FaQrcode size={24} />} />
      </div>

      <Tabs
        tabs={Object.keys(tabContent)}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as 'Ordonnances' | 'Commandes')}
      />

      <div className="mt-6">{tabContent[activeTab]}</div>
    </div>
  );
};

export default PharmacistDashboard;
