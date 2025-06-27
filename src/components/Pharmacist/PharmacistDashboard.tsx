import React, { useEffect, useState } from 'react';
import {
  FaBox,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaPills,
  FaShippingFast,
  FaSignOutAlt,
  FaSpinner,
  FaTruck,
  FaUser
} from 'react-icons/fa';
import {
  PharmacistDashboardStats,
  PharmacistOrder,
  pharmacistService,
  User
} from '../../services/api';
import AuthService from '../../services/auth';
import { StatCard } from '../StatCard';
import { Tabs } from '../Tabs';

type TabKey = 'Commandes' | 'En Cours' | 'Historique';

// Order status badge component
const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusStyle = (status: string) => {
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PREPARING':
        return 'bg-blue-100 text-blue-800';
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'DISPATCHED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case 'PENDING':
        return 'En Attente';
      case 'PREPARING':
        return 'En Préparation';
      case 'READY':
        return 'Prêt';
      case 'DISPATCHED':
        return 'Expédié';
      default:
        return status;
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(status)}`}>
      {getStatusText(status)}
    </span>
  );
};

// Order card component
const OrderCard: React.FC<{
  order: PharmacistOrder;
  onStatusUpdate: (orderId: number, status: 'PENDING' | 'PREPARING' | 'READY' | 'DISPATCHED') => void;
  isUpdating: boolean;
}> = ({ order, onStatusUpdate, isUpdating }) => {
  const getNextStatus = (currentStatus: string): 'PENDING' | 'PREPARING' | 'READY' | 'DISPATCHED' | null => {
    const upperStatus = currentStatus.toUpperCase();
    switch (upperStatus) {
      case 'PENDING':
        return 'PREPARING';
      case 'PREPARING':
        return 'READY';
      case 'READY':
        return 'DISPATCHED';
      default:
        return null;
    }
  };

  const getNextStatusText = (currentStatus: string): string => {
    const nextStatus = getNextStatus(currentStatus);
    switch (nextStatus) {
      case 'PREPARING':
        return 'Commencer la préparation';
      case 'READY':
        return 'Marquer comme prêt';
      case 'DISPATCHED':
        return 'Expédier';
      default:
        return 'Terminé';
    }
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <div className="bg-white rounded-lg border shadow-sm transition-shadow hover:shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Commande #{order.code}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(order.date).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mb-4">
          <div className="flex items-center mb-2">
            <FaUser className="mr-2 text-gray-400" size={14} />
            <span className="text-sm font-medium">
              Patient: {order.patient.firstName} ({order.patient.email})
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Médecin: {order.prescription.doctor.email}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium text-gray-700">Médicaments:</h4>
          <div className="flex flex-wrap gap-2">
            {order.prescription.medicaments.map((medicament, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 text-xs text-blue-700 bg-blue-50 rounded-full"
              >
                <FaPills className="mr-1" size={10} />
                {medicament.nom}
              </span>
            ))}
          </div>
        </div>

        {nextStatus && (
          <div className="flex justify-end">
            <button
              onClick={() => onStatusUpdate(order.id, nextStatus)}
              disabled={isUpdating}
              className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <FaSpinner className="mr-2 animate-spin" size={12} />
                  Mise à jour...
                </>
              ) : (
                getNextStatusText(order.status)
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const PharmacistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('Commandes');
  const [stats, setStats] = useState<PharmacistDashboardStats | null>(null);
  const [orders, setOrders] = useState<PharmacistOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pharmacist, setPharmacist] = useState<User | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);

  const handleLogout = () => {
    AuthService.logout();
  };

  // Validate pharmacist access
  const validatePharmacistAccess = (): { isValid: boolean; error?: string } => {
    console.log("🔐 PHARMACIST ACCESS VALIDATION:");
    
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error("❌ No JWT token found");
      return { isValid: false, error: "No authentication token" };
    }

    const authValidation = AuthService.validateRole('PHARMACIST');
    console.log("🔍 AuthService validation:", authValidation);
    
    if (!authValidation.isValid || !authValidation.userId) {
      console.error("❌ AuthService validation failed:", authValidation);
      return { isValid: false, error: "Pharmacist authentication failed" };
    }
    
    console.log("✅ Pharmacist access validated");
    return { isValid: true };
  };

  // Load pharmacist data
  useEffect(() => {
    const loadPharmacistData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Validate access
        const accessValidation = validatePharmacistAccess();
        if (!accessValidation.isValid) {
          setError(`Access denied: ${accessValidation.error}`);
          console.error("🚫 Pharmacist access denied, logging out...");
          AuthService.logout();
          return;
        }

        console.log("🔍 PHARMACIST DASHBOARD - Loading data...");

        // Load all data in parallel
        const [statsData, ordersData, pharmacistProfile] = await Promise.all([
          pharmacistService.getDashboardStats(),
          pharmacistService.getOrders(),
          pharmacistService.getPharmacistProfile()
        ]);

        setStats(statsData);
        setOrders(ordersData);
        setPharmacist(pharmacistProfile);

        console.log("✅ PHARMACIST DASHBOARD - Data loaded successfully:");
        console.log("- Stats:", statsData);
        console.log("- Orders count:", ordersData.length);
        console.log("- Pharmacist:", pharmacistProfile);
        
      } catch (err: any) {
        console.error('Error loading pharmacist data:', err);
        if (err.status === 403) {
          setError('Access denied. Please ensure you have pharmacist privileges.');
          AuthService.logout();
        } else if (err.status === 401) {
          setError('Authentication failed. Please login again.');
          AuthService.logout();
        } else {
          setError(err.message || 'Failed to load pharmacist data');
        }
      } finally {
        setLoading(false);
      }
    };

    loadPharmacistData();
  }, []);

  // Update order status
  const handleStatusUpdate = async (orderId: number, newStatus: 'PENDING' | 'PREPARING' | 'READY' | 'DISPATCHED') => {
    try {
      setUpdatingOrder(orderId);
      
      console.log(`🔄 Updating order ${orderId} to status: ${newStatus}`);
      
      await pharmacistService.updateOrderStatus(orderId, newStatus);
      
      // Refresh orders
      const updatedOrders = await pharmacistService.getOrders();
      const updatedStats = await pharmacistService.getDashboardStats();
      
      setOrders(updatedOrders);
      setStats(updatedStats);
      
      console.log(`✅ Order ${orderId} status updated to: ${newStatus}`);
      
    } catch (err: any) {
      console.error('Error updating order status:', err);
      alert(`Erreur lors de la mise à jour: ${err.message}`);
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Filter orders by status for different tabs
  const getFilteredOrders = (tabKey: TabKey): PharmacistOrder[] => {
    console.log("🔍 FILTERING ORDERS FOR TAB:", tabKey);
    console.log("📋 Total orders loaded:", orders.length);
    
    let filtered: PharmacistOrder[] = [];
    
    switch (tabKey) {
      case 'Commandes':
        filtered = orders.filter(order => order.status.toUpperCase() === 'PENDING');
        console.log("📋 PENDING orders found:", filtered.length);
        break;
      case 'En Cours':
        filtered = orders.filter(order => ['PREPARING', 'READY'].includes(order.status.toUpperCase()));
        console.log("📋 IN_PROGRESS orders found:", filtered.length);
        break;
      case 'Historique':
        filtered = orders.filter(order => order.status.toUpperCase() === 'DISPATCHED');
        console.log("📋 DISPATCHED orders found:", filtered.length);
        break;
      default:
        filtered = orders;
    }
    
    console.log("📋 Filtered orders for", tabKey, ":", filtered);
    return filtered;
  };

  const getUserDisplayName = (): string => {
    if (!pharmacist) return 'Pharmacien';
    
    const firstName = pharmacist.firstName?.trim();
    const lastName = pharmacist.name?.trim();
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName || lastName) {
      return firstName || lastName;
    } else {
      return pharmacist.email;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FaSpinner className="mx-auto mb-4 text-4xl text-blue-500 animate-spin" />
          <p className="text-gray-600">Chargement du tableau de bord pharmacien...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="p-8 max-w-md text-center bg-white rounded-xl shadow-md">
          <FaExclamationTriangle className="mx-auto mb-4 text-4xl text-red-500" />
          <h2 className="mb-4 text-xl font-bold text-red-600">Erreur d'accès</h2>
          <p className="mb-4 text-gray-700">{error}</p>
          <button
            onClick={handleLogout}
            className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  const tabContent: Record<TabKey, JSX.Element> = {
    'Commandes': (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Nouvelles Commandes</h2>
        <p className="text-gray-600">Commandes en attente de traitement</p>
        
        {getFilteredOrders('Commandes').length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <FaPills className="mx-auto mb-4 text-4xl text-gray-300" />
            <p className="text-lg">Aucune nouvelle commande</p>
            <p className="text-sm">Les nouvelles commandes apparaîtront ici</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {getFilteredOrders('Commandes').map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={updatingOrder === order.id}
              />
            ))}
          </div>
        )}
      </div>
    ),

    'En Cours': (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Commandes en Cours</h2>
        <p className="text-gray-600">Commandes en préparation ou prêtes</p>
        
        {getFilteredOrders('En Cours').length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <FaClock className="mx-auto mb-4 text-4xl text-gray-300" />
            <p className="text-lg">Aucune commande en cours</p>
            <p className="text-sm">Les commandes en préparation apparaîtront ici</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {getFilteredOrders('En Cours').map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={updatingOrder === order.id}
              />
            ))}
          </div>
        )}
      </div>
    ),

    'Historique': (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Historique</h2>
        <p className="text-gray-600">Commandes expédiées</p>
        
        {getFilteredOrders('Historique').length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <FaTruck className="mx-auto mb-4 text-4xl text-gray-300" />
            <p className="text-lg">Aucune commande expédiée</p>
            <p className="text-sm">L'historique des expéditions apparaîtra ici</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {getFilteredOrders('Historique').map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={updatingOrder === order.id}
              />
            ))}
          </div>
        )}
      </div>
    ),
  };

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      <div className="mx-auto space-y-8 max-w-6xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="flex justify-center items-center mr-4 w-12 h-12 bg-indigo-100 rounded-full">
              <FaPills className="text-2xl text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Tableau de Bord Pharmacien
              </h1>
              <p className="text-gray-600">
                Connecté comme: PHARMACIST • {getUserDisplayName()}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-gray-600 transition-colors hover:text-red-600"
          >
            <FaSignOutAlt className="mr-2" />
            Déconnexion
          </button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatCard
              title="Total"
              value={stats.totalOrders.toString()}
              icon={<FaBox className="text-xl" />}
            />
            <StatCard
              title="En Attente"
              value={stats.pendingOrders.toString()}
              icon={<FaClock className="text-xl" />}
            />
            <StatCard
              title="En Préparation"
              value={stats.preparingOrders.toString()}
              icon={<FaPills className="text-xl" />}
            />
            <StatCard
              title="Prêtes"
              value={stats.readyOrders.toString()}
              icon={<FaCheckCircle className="text-xl" />}
            />
            <StatCard
              title="Expédiées"
              value={stats.dispatchedOrders.toString()}
              icon={<FaShippingFast className="text-xl" />}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <Tabs
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as TabKey)}
            tabs={['Commandes', 'En Cours', 'Historique']}
          />
          
          <div className="p-6">
            {tabContent[activeTab]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;
