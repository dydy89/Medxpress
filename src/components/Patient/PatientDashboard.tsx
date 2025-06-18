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

type TabKey = 'My Prescriptions' | 'My Medication Intake';

interface CreateOrderRequest {
  prescriptionId: number;
  pharmacyId: number;
  patientId: number;
  deliveryDriverId: number;
}

interface Medicament {
  id: number;
  nom: string;
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
  const [activeTab, setActiveTab] = useState<TabKey>('My Prescriptions');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);
  const [orderedPrescriptions, setOrderedPrescriptions] = useState<number[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [activeOrders, setActiveOrders] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const patientId = 2;

  useEffect(() => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");

    axios.get(`http://localhost:8080/api/prescription/getAll/${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      setPrescriptions(response.data);
    })
    .catch(() => {
      setError("");
    })
    .finally(() => {
      setLoading(false);
    });
  }, [patientId]);

  // 🔹 Fetch patient information
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get(`http://localhost:8080/api/user/${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('Error fetching user:', error);
      });
  }, [patientId]);

  useEffect(() => {
    const fetchActiveOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found in localStorage.");
        return;
      }

      const result: Record<number, string> = {};

      await Promise.all(prescriptions.map(async (p) => {
        try {
          const res = await axios.get(
            `http://localhost:8080/api/order/by-prescription/${p.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          result[p.id] = res.data.status;
        } catch (err) {
          // No active order => skip
        }
      }));

      setActiveOrders(result);
    };

    if (prescriptions.length > 0) {
      fetchActiveOrders();
    }
  }, [prescriptions]);

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
    const token = localStorage.getItem("token");

    const request: CreateOrderRequest = {
      prescriptionId,
      patientId,
      pharmacyId: 1,
      deliveryDriverId: 1,
    };

    axios.post(
      'http://localhost:8080/api/patient/createOrder',
      request,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    .then(response => {
      setSuccessMessage("Your order has been successfully placed.");

      setActiveOrders(prev => ({
        ...prev,
        [prescriptionId]: "PENDING_DRIVER_RESPONSE"
      }));

      setOrderedPrescriptions(prev => [...prev, prescriptionId]);

      setTimeout(() => setSuccessMessage(null), 5000);
    })
    .catch(error => {
      console.error('Error creating order:', error);
      alert('Error creating order.');
    });
  };

  const selectedPrescription = prescriptions.find(p => p.id === selectedPrescriptionId);

  const tabContent: Record<TabKey, JSX.Element> = {
    'My Prescriptions': (
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">My Prescriptions</h2>

        {loading && <p>No prescriptions</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && prescriptions.length === 0 && (
          <p>No prescription found.</p>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-md shadow">
            {successMessage}
          </div>
        )}

        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center p-4 border rounded-lg shadow-sm hover:bg-gray-50"
            >
              <div>
                <h3 className="font-semibold text-gray-800">{p.doctorEntity.name}</h3>
                <p className="text-sm text-gray-500">
                  {p.medicaments.map(m => m.nom).join(', ')}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`text-sm px-3 py-1 rounded-full ${getStatusStyle(p.status)}`}>
                  {p.status}
                </span>

                {activeOrders[p.id] ? (
                  <span className="text-sm font-medium text-yellow-600">
                    {activeOrders[p.id]}
                  </span>
                ) : (
                  <button
                    onClick={() => handleOrder(p.id)}
                    className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    'My Medication Intake': (
      <div className="bg-white p-6 rounded-xl shadow text-gray-600">
        <p>Upcoming order history...</p>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Hello, {user ? `${user.firstName} ${user.name}` : 'X'}
          </h1>
          <p className="text-gray-600">Manage your prescriptions and orders</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center text-red-600 hover:text-red-800 font-medium"
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Prescriptions" value={prescriptions.length.toString()} icon={<FaFileMedical size={24} />} />
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
