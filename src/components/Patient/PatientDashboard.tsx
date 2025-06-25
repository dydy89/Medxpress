import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
  FaClock,
  FaCube,
  FaExclamationTriangle,
  FaFileMedical,
  FaPills,
  FaSignOutAlt,
  FaSpinner,
} from 'react-icons/fa';
import { StatCard } from '../../components/StatCard';
import { Tabs } from '../../components/Tabs';
import { Doctor, PrescriptionResponse, prescriptionService, User, userService } from '../../services/api';
import AuthService from '../../services/auth';

type TabKey = 'Mes Ordonnances' | 'Mes Commandes' | 'Créer Commande (QR)';

// Debug component to show current authentication state
const AuthDebugInfo: React.FC = () => {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const userId = localStorage.getItem('id');
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setTokenInfo({
          token: token.substring(0, 20) + '...',
          decoded,
          userId,
          authValidation: AuthService.validateRole('PATIENT')
        });
      } catch (err) {
        setTokenInfo({ error: 'Invalid token', userId });
      }
    } else {
      setTokenInfo({ error: 'No token found', userId });
    }
  }, []);

  if (!tokenInfo) return null;

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-semibold text-blue-800 mb-2">🔐 Authentication Debug Info</h3>
      <div className="text-sm text-blue-700 space-y-1">
        <p><strong>Token:</strong> {tokenInfo.token || 'None'}</p>
        <p><strong>User ID (localStorage):</strong> {tokenInfo.userId || 'None'}</p>
        {tokenInfo.decoded && (
          <>
            <p><strong>Token Role:</strong> {tokenInfo.decoded.role || 'Not found'}</p>
            <p><strong>Token Email:</strong> {tokenInfo.decoded.sub || 'Not found'}</p>
            <p><strong>Token Exp:</strong> {new Date((tokenInfo.decoded.exp || 0) * 1000).toLocaleString()}</p>
          </>
        )}
        {tokenInfo.authValidation && (
          <>
            <p><strong>Auth Valid:</strong> {tokenInfo.authValidation.isValid ? '✅' : '❌'}</p>
            <p><strong>Auth Role:</strong> {tokenInfo.authValidation.tokenRole || 'None'}</p>
            <p><strong>Auth User ID:</strong> {tokenInfo.authValidation.userId || 'None'}</p>
          </>
        )}
        {tokenInfo.error && <p className="text-red-600"><strong>Error:</strong> {tokenInfo.error}</p>}
      </div>
    </div>
  );
};

const PatientDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('Mes Ordonnances');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [creatingOrder, setCreatingOrder] = useState<number | null>(null);

  const handleLogout = () => {
    AuthService.logout();
  };

  // Comprehensive token validation
  const validatePatientAccess = (): { isValid: boolean; userId: number; error?: string } => {
    console.log("🔐 COMPREHENSIVE PATIENT ACCESS VALIDATION:");
    
    // Step 1: Check if token exists
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error("❌ No JWT token found");
      return { isValid: false, userId: 0, error: "No authentication token" };
    }
    
    // Step 2: Decode and validate token
    let decoded: any;
    try {
      decoded = jwtDecode(token);
      console.log("🔍 Token decoded:", decoded);
    } catch (err) {
      console.error("❌ Invalid token format:", err);
      return { isValid: false, userId: 0, error: "Invalid token format" };
    }
    
    // Step 3: Check token role
    const tokenRole = decoded?.role?.toUpperCase();
    console.log("🎭 Token role:", tokenRole);
    
    if (tokenRole !== 'PATIENT') {
      console.error(`❌ Wrong role. Expected PATIENT, got: ${tokenRole}`);
      return { isValid: false, userId: 0, error: `Access denied. Role: ${tokenRole}` };
    }
    
    // Step 4: Validate using AuthService
    const authValidation = AuthService.validateRole('PATIENT');
    console.log("🔍 AuthService validation:", authValidation);
    
    if (!authValidation.isValid || !authValidation.userId) {
      console.error("❌ AuthService validation failed:", authValidation);
      return { isValid: false, userId: 0, error: "AuthService validation failed" };
    }
    
    console.log("✅ All validations passed. Patient access granted.");
    return { isValid: true, userId: authValidation.userId };
  };

  // Get patient info and prescriptions
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Comprehensive validation
        const accessValidation = validatePatientAccess();
        
        if (!accessValidation.isValid) {
          setError(`Access denied: ${accessValidation.error}`);
          console.error("🚫 Patient access denied, logging out...");
          AuthService.logout();
          return;
        }

        const userId = accessValidation.userId;

        console.log("🔍 PATIENT DASHBOARD - Final validation:");
        console.log("- Access granted for user ID:", userId);

        // Load user info and triple-check role from backend
        const userInfo = await userService.getCurrentUser(userId);
        
        // Final backend validation
        if (userInfo.role !== 'PATIENT') {
          setError(`Backend role mismatch. Expected PATIENT, got: ${userInfo.role}. Please contact support.`);
          console.error("🚫 Backend role mismatch, logging out...");
          AuthService.logout();
          return;
        }

        // Load prescriptions for this patient
        const prescriptionsData = await prescriptionService.getEnhancedPrescriptions(userId);

        setUser(userInfo);
        setPrescriptions(prescriptionsData);

        console.log("✅ PATIENT DASHBOARD - Data loaded successfully:");
        console.log("- User:", userInfo);
        console.log("- Prescriptions count:", prescriptionsData.length);
        
      } catch (err: any) {
        console.error('Error loading patient data:', err);
        if (err.status === 403) {
          setError('Access denied. Please ensure you have patient privileges and are logged in correctly.');
          AuthService.logout();
        } else if (err.status === 401) {
          setError('Authentication failed. Please login again.');
          AuthService.logout();
        } else {
          setError(err.message || 'Failed to load patient data');
        }
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, []);

  const formatDoctorName = (doctor: Doctor): string => {
    const firstName = doctor.firstName || '';
    const lastName = doctor.name || '';
    
    if (firstName && lastName) {
      return `Dr. ${firstName} ${lastName}`;
    } else if (firstName || lastName) {
      return `Dr. ${firstName}${lastName}`;
    } else {
      return doctor.email; // Fallback to email if no name available
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-600';
      case 'PENDING':
        return 'bg-orange-100 text-orange-600';
      case 'DELIVERED':
        return 'bg-blue-100 text-blue-600';
      case 'CANCELLED':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getOrderStatusStyle = (status: string | null) => {
    if (!status) return '';
    
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-600';
      case 'PREPARING':
        return 'bg-blue-100 text-blue-600';
      case 'READY':
        return 'bg-purple-100 text-purple-600';
      case 'DELIVERED':
        return 'bg-green-100 text-green-600';
      case 'CANCELLED':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleCreateOrder = async (prescriptionId: number) => {
    console.log("🚀 ORDER CREATION - Starting comprehensive validation...");
    
    // Re-validate patient access before order creation
    const accessValidation = validatePatientAccess();
    
    if (!accessValidation.isValid) {
      alert(`Authentication error: ${accessValidation.error}`);
      console.error("🚫 Order creation blocked - authentication failed");
      AuthService.logout();
      return;
    }

    const userId = accessValidation.userId;

    try {
      setCreatingOrder(prescriptionId);
      
      console.log("🔍 ORDER CREATION - Final debug info:");
      console.log("- Validation result:", accessValidation);
      console.log("- User ID (PATIENT):", userId);
      console.log("- Prescription ID:", prescriptionId);
      console.log("- JWT token exists:", !!localStorage.getItem('jwt'));
      console.log("- Token is for PATIENT role: ✅");
      
      // Create order with validated PATIENT token
      await prescriptionService.createOrder(prescriptionId, userId);
      
      // Refresh prescriptions to get updated order status
      const updatedPrescriptions = await prescriptionService.getEnhancedPrescriptions(userId);
      setPrescriptions(updatedPrescriptions);
      
      alert('Order created successfully!');
      console.log("✅ Order creation successful");
      
    } catch (err: any) {
      console.error('❌ Error creating order - COMPREHENSIVE DEBUG:', err);
      console.error('- Error message:', err.message);
      console.error('- Error status:', err.status);
      console.error('- Access validation:', accessValidation);
      console.error('- Current token role:', localStorage.getItem('jwt') ? jwtDecode(localStorage.getItem('jwt')!) : 'No token');
      
      // Handle specific error cases
      if (err.status === 403) {
        // This should not happen with our validation, but if it does:
        console.error("🚨 CRITICAL: 403 error despite PATIENT token validation!");
        console.error("🚨 This indicates a backend configuration issue!");
        
        alert('Order creation failed: Access denied despite valid patient authentication. This is a backend configuration issue - please contact support.');
      } else if (err.status === 401) {
        alert('Authentication failed. Please log in again.');
        AuthService.logout();
        return;
      } else {
        const errorMessage = err.message || 'Failed to create order';
        const statusInfo = err.status ? ` (Status: ${err.status})` : '';
        alert(`${errorMessage}${statusInfo}`);
      }
    } finally {
      setCreatingOrder(null);
    }
  };

  const selectedPrescription = prescriptions.find(p => p.id === selectedPrescriptionId);

  const handleSendToDelivery = () => {
    if (!selectedPrescriptionId) return;
    alert(`Commande envoyée pour l'ordonnance #${selectedPrescriptionId}`);
  };

  // Calculate stats from real data
  const totalPrescriptions = prescriptions.length;
  const activeOrders = prescriptions.filter(p => p.hasOrder && p.orderStatus && p.orderStatus.toUpperCase() !== 'DELIVERED').length;
  const totalMedications = prescriptions.reduce((total, p) => total + p.medications.length, 0);

  const tabContent: Record<TabKey, JSX.Element> = {
    'Mes Ordonnances': (
      <div className="p-6 bg-white rounded-xl shadow">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">Ordonnances Récentes</h2>
        <p className="mb-6 text-sm text-gray-500">Vos prescriptions médicales</p>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="mr-2 text-2xl text-blue-500 animate-spin" />
            <span className="text-gray-600">Chargement des ordonnances...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-8 text-red-600">
            <FaExclamationTriangle className="mr-2" />
            <div className="text-left">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <FaFileMedical className="mx-auto mb-4 text-4xl text-gray-300" />
            <p className="mb-2 text-lg">Aucune ordonnance trouvée</p>
            <p className="text-sm">Vos ordonnances apparaîtront ici une fois prescrites par votre médecin.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="overflow-hidden rounded-lg border shadow-sm hover:bg-gray-50">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{formatDoctorName(prescription.doctor)}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(prescription.date).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {prescription.medications.length} médicament(s)
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(prescription.status)}`}>
                        {prescription.status}
                      </span>
                      {prescription.hasOrder && prescription.orderStatus && (
                        <span className={`text-xs px-2 py-1 rounded-full ${getOrderStatusStyle(prescription.orderStatus)}`}>
                          Commande: {prescription.orderStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Medications list */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {prescription.medications.map((medication) => (
                        <span
                          key={medication.id}
                          className="inline-flex items-center px-2 py-1 text-xs text-blue-700 bg-blue-50 rounded-full"
                        >
                          <FaPills className="mr-1" size={10} />
                          {medication.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end">
                    {prescription.hasOrder ? (
                      <div className="text-sm text-gray-600">
                        Commande #{prescription.orderId} • {prescription.orderStatus}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCreateOrder(prescription.id)}
                        disabled={creatingOrder === prescription.id}
                        className="flex items-center px-4 py-2 text-sm text-white bg-gray-900 rounded hover:bg-gray-700 disabled:bg-gray-400"
                      >
                        {creatingOrder === prescription.id ? (
                          <>
                            <FaSpinner className="mr-2 animate-spin" size={12} />
                            Création...
                          </>
                        ) : (
                          'Commander'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),

    'Mes Commandes': (
      <div className="p-6 bg-white rounded-xl shadow">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">Mes Commandes</h2>
        <p className="mb-6 text-sm text-gray-500">Historique de vos commandes</p>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="mr-2 text-2xl text-blue-500 animate-spin" />
            <span className="text-gray-600">Chargement des commandes...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions
              .filter(p => p.hasOrder)
              .map((prescription) => (
                <div key={prescription.id} className="flex justify-between items-center p-4 rounded-lg border shadow-sm">
                  <div>
                    <h3 className="font-semibold text-gray-800">Commande #{prescription.orderId}</h3>
                    <p className="text-sm text-gray-500">{formatDoctorName(prescription.doctor)}</p>
                    <p className="text-sm text-gray-500">
                      {prescription.medications.length} médicament(s) • {new Date(prescription.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className={`text-sm px-3 py-1 rounded-full ${getOrderStatusStyle(prescription.orderStatus)}`}>
                    {prescription.orderStatus}
                  </span>
                </div>
              ))}
            {prescriptions.filter(p => p.hasOrder).length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <FaCube className="mx-auto mb-4 text-4xl text-gray-300" />
                <p className="mb-2 text-lg">Aucune commande trouvée</p>
                <p className="text-sm">Vos commandes apparaîtront ici une fois créées.</p>
              </div>
            )}
          </div>
        )}
      </div>
    ),

    'Créer Commande (QR)': (
      <div className="p-6 text-center bg-white rounded-xl shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Créer une commande</h2>
        <p className="mb-4 text-sm text-gray-500">
          Sélectionnez une ordonnance pour générer un QR Code à transmettre au livreur.
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="mr-2 text-2xl text-blue-500 animate-spin" />
            <span className="text-gray-600">Chargement...</span>
          </div>
        ) : (
          <>
            <select
              className="p-2 mb-4 w-full max-w-sm rounded border"
              value={selectedPrescriptionId || ''}
              onChange={(e) => setSelectedPrescriptionId(Number(e.target.value))}
            >
              <option value="" disabled>Choisissez une ordonnance</option>
              {prescriptions
                .filter(p => p.hasOrder) // Only show prescriptions with orders
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {formatDoctorName(p.doctor)} - {p.medications.map(m => m.name).join(', ')} ({new Date(p.date).toLocaleDateString('fr-FR')})
                  </option>
                ))}
            </select>

            {selectedPrescription && (
              <>
                <div className="flex justify-center mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=Commande-${selectedPrescription.orderId || selectedPrescription.id}`}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <button
                  onClick={handleSendToDelivery}
                  className="px-6 py-3 text-white bg-green-600 rounded hover:bg-green-700"
                >
                  Envoyer la commande
                </button>
              </>
            )}

            {prescriptions.filter(p => p.hasOrder).length === 0 && (
              <div className="py-4 text-gray-500">
                <p>Aucune commande disponible pour générer un QR Code.</p>
                <p className="mt-2 text-sm">Créez d'abord une commande depuis l'onglet "Mes Ordonnances".</p>
              </div>
            )}
          </>
        )}
      </div>
    ),
  };

  const getUserDisplayName = (): string => {
    if (!user) return 'Patient';
    
    const firstName = user.firstName || '';
    const lastName = user.name || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName || lastName) {
      return firstName || lastName;
    } else {
      return user.email;
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      {/* Debug component - remove this in production */}
      <AuthDebugInfo />
      
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Bonjour, {getUserDisplayName()}
          </h1>
          <p className="text-gray-600">Gérez vos ordonnances et commandes</p>
          {user && (
            <p className="text-sm text-gray-500">
              Connecté comme: {user.role} • {user.email}
            </p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center font-medium text-red-600 hover:text-red-800"
        >
          <FaSignOutAlt className="mr-2" />
          Se déconnecter
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 mb-10 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ordonnances" value={totalPrescriptions.toString()} icon={<FaFileMedical size={24} />} />
        <StatCard title="Commandes" value={prescriptions.filter(p => p.hasOrder).length.toString()} icon={<FaCube size={24} />} />
        <StatCard title="En cours" value={activeOrders.toString()} icon={<FaClock size={24} />} />
        <StatCard title="Médicaments" value={totalMedications.toString()} icon={<FaPills size={24} />} />
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
