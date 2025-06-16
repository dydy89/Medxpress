import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaFileMedical,
  FaCube,
  FaClock,
  FaPills,
  FaSignOutAlt,
} from 'react-icons/fa';
import { StatCard } from '../../components/StatCard';
import { Tabs } from '../../components/Tabs';

type TabKey = 'Mes Ordonnances' | 'Ma prise de médicaments';

interface CreateOrderRequest {
  prescriptionId: number;
  pharmacyId: number;
  patientId: number;
  deliveryDriverId: number;
}


interface Medicament {
  id: number;
  name: string;
}

interface User {
  id: number;
  firstName: string;
  name: string;
}

interface Prescription {
  id: number;
  doctorEntity: {
    name: string;
  };
  patient: {
    name: string;
  };
  medicaments: Medicament[];
  status: string;
  date: string;
}

const PatientDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('Mes Ordonnances');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);

  const patientId = 1; // À remplacer dynamiquement si besoin

  // 🔹 Récupère les prescriptions du patient
  useEffect(() => {
    setLoading(true);
    setError(null);

    axios.get(`http://localhost:8080/api/prescription/getAll/${patientId}`)
      .then(response => {
        setPrescriptions(response.data);
      })
      .catch(() => {
        setError("Impossible de charger les ordonnances.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [patientId]);

  // 🔹 Récupère les infos de l'utilisateur (nom + prénom)
  useEffect(() => {
    axios.get(`http://localhost:8080/api/user/${patientId}`)
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
      });
  }, [patientId]);

  const handleLogout = () => {
    window.location.href = '/login';
  };

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

  const handleOrder = (prescriptionId: number) => {
    const request: CreateOrderRequest = {
      prescriptionId,
      patientId,
      pharmacyId: 1, // ⚠️ À adapter selon ton cas réel
      deliveryDriverId: 1, // ⚠️ À adapter selon ton cas réel
    };

    axios.post('http://localhost:8080/api/order/createOrder', request)
      .then(response => {
        alert('Commande créée avec succès !');
        console.log('Commande créée :', response.data);
      })
      .catch(error => {
        console.error('Erreur lors de la commande :', error);
        alert('Erreur lors de la création de la commande.');
      });
  };


  const selectedPrescription = prescriptions.find(p => p.id === selectedPrescriptionId);

  const handleSendToDelivery = () => {
    if (!selectedPrescriptionId) return;
    // TODO : Logique d'envoi en livraison
  };

  const tabContent: Record<TabKey, JSX.Element> = {
    'Mes Ordonnances': (
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Mes Ordonnances</h2>

        {loading && <p>Chargement des ordonnances...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && prescriptions.length === 0 && (
          <p>Aucune ordonnance trouvée.</p>
        )}

        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center p-4 border rounded-lg shadow-sm hover:bg-gray-50"
            >
              <div>
                <h3 className="font-semibold text-gray-800">{p.doctorEntity.name}</h3>
                <p className="text-sm text-gray-500">{new Date(p.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">{p.medicaments.length} médicament(s)</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`text-sm px-3 py-1 rounded-full ${getStatusStyle(p.status)}`}>
                  {p.status}
                </span>
                <button
                  onClick={() => handleOrder(p.id)}
                  className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
                >
                  Commander
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    'Ma prise de médicaments': (
      <div className="bg-white p-6 rounded-xl shadow text-gray-600">
        <p>Historique des commandes à venir...</p>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Bonjour, {user ? `${user.firstName} ${user.name}` : 'X'}
          </h1>
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
        <StatCard title="Ordonnances" value={prescriptions.length.toString()} icon={<FaFileMedical size={24} />} />
        <StatCard title="?notif?" value="nb?" icon={<FaCube size={24} />} />
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
