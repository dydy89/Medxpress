import React, { useCallback, useEffect, useState } from 'react';
import { FaCalendarAlt, FaPills, FaPlus, FaPrescriptionBottle, FaSearch, FaSignOutAlt, FaSpinner, FaTimes, FaUser } from 'react-icons/fa';
import { Tabs } from '../../components/Tabs';

type TabKey = "Recherche Patients" | "Nouvelle Ordonnance" | "Ordonnances";

interface Patient {
  patientId: string;
  fullName: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface Doctor {
  id: string;
  name: string;
  firstName: string;
  email: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  category: string;
}

const DoctorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("Recherche Patients");
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  // États pour la recherche de patients
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedPatientForSearch, setSelectedPatientForSearch] = useState<Patient | null>(null);

  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  
  // États pour la création d'ordonnances
  const [prescriptionDate, setPrescriptionDate] = useState("");
  const [selectedMedications, setSelectedMedications] = useState<Medication[]>([]);
  const [medicationSearch, setMedicationSearch] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isCreatingPrescription, setIsCreatingPrescription] = useState(false);

  // Liste des médicaments disponibles
  const availableMedications: Medication[] = [
    { id: '1', name: 'Doliprane', dosage: '500mg', category: 'Antalgique' },
    { id: '2', name: 'Amoxicilline', dosage: '1g', category: 'Antibiotique' },
    { id: '3', name: 'Ibuprofène', dosage: '400mg', category: 'Anti-inflammatoire' },
    { id: '4', name: 'Paracétamol', dosage: '1000mg', category: 'Antalgique' },
    { id: '5', name: 'Aspirine', dosage: '500mg', category: 'Antalgique' },
    { id: '6', name: 'Smecta', dosage: '3g', category: 'Antidiarrhéique' },
    { id: '7', name: 'Ventoline', dosage: '100μg', category: 'Bronchodilatateur' },
    { id: '8', name: 'Efferalgan', dosage: '500mg', category: 'Antalgique' },
    { id: '9', name: 'Augmentin', dosage: '1g/125mg', category: 'Antibiotique' },
    { id: '10', name: 'Voltarène', dosage: '50mg', category: 'Anti-inflammatoire' },
    { id: '11', name: 'Lexomil', dosage: '1.5mg', category: 'Anxiolytique' },
    { id: '12', name: 'Seroplex', dosage: '10mg', category: 'Antidépresseur' }
  ];

  // Filtrer les médicaments selon la recherche
  const filteredMedications = availableMedications.filter(med =>
    med.name.toLowerCase().includes(medicationSearch.toLowerCase()) &&
    !selectedMedications.some(selected => selected.id === med.id)
  );

  // Ajouter un médicament à la sélection
  const addMedication = (medication: Medication) => {
    setSelectedMedications([...selectedMedications, medication]);
    setMedicationSearch("");
  };

  // Retirer un médicament de la sélection
  const removeMedication = (medicationId: string) => {
    setSelectedMedications(selectedMedications.filter(med => med.id !== medicationId));
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('id');
    window.location.href = '/';
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      const token = localStorage.getItem("jwt");
      let doctorId = localStorage.getItem("id");
      
      console.log("🔍 Debug initial DoctorDashboard:");
      console.log("- Token présent:", !!token);
      console.log("- Doctor ID dans localStorage:", doctorId);

      if (!token) {
        console.error("❌ Pas de token, redirection vers login");
        window.location.href = '/';
        return;
      }

      // Si pas d'ID, essayer de le récupérer via l'API
      if (!doctorId || doctorId === "undefined" || doctorId === "null") {
        console.log("🔍 ID manquant, tentative de récupération via token...");
        
        try {
          // Décoder le token pour essayer de récupérer l'ID
          const { jwtDecode } = await import('jwt-decode');
          const decoded: any = jwtDecode(token);
          console.log("🔍 Token décodé dans DoctorDashboard:", decoded);
          
          const tokenId = decoded?.id || decoded?.userId || decoded?.sub || decoded?.user_id;
          if (tokenId && !isNaN(parseInt(tokenId))) {
            doctorId = tokenId.toString();
            localStorage.setItem("id", doctorId ?? '');
            console.log("✅ ID récupéré du token et stocké:", doctorId ?? '');
          } else {
            // Si toujours pas d'ID numérique, essayer via l'API getAllUsers pour trouver le docteur
            console.log("🔍 Tentative via API getAllUsers...");
            const usersResponse = await fetch("http://localhost:8080/api/user/getAll", {
              headers: { Authorization: `Bearer ${token || ''}` },
            });
            
            if (usersResponse.ok) {
              const users = await usersResponse.json();
              console.log("👥 Tous les utilisateurs:", users);
              
              // Trouver l'utilisateur avec le rôle DOCTOR qui correspond au token
              const currentUserEmail = decoded?.sub || decoded?.email;
              const doctorUser = users.find((user: any) => 
                user.role === 'DOCTOR' && (user.email === currentUserEmail || user.id.toString() === (decoded?.sub || ''))
              );
              
              if (doctorUser) {
                doctorId = doctorUser.id.toString();
                localStorage.setItem("id", doctorId ?? '');
                console.log("✅ ID docteur récupéré de getAllUsers:", doctorId);
              }
            }
          }
        } catch (error) {
          console.error("❌ Erreur récupération ID:", error);
        }
      }

      // Maintenant récupérer les infos du docteur depuis la table user
      if (doctorId && doctorId !== "undefined" && doctorId !== "null") {
        try {
          console.log("🔍 Tentative récupération docteur via /api/user/" + doctorId);
          
          // Utiliser l'endpoint user au lieu de doctor
          const res = await fetch(`http://localhost:8080/api/user/${doctorId}`, {
            headers: { Authorization: `Bearer ${token || ''}` },
          });
          
          if (res.ok) {
            const userData = await res.json();
            console.log("✅ Données utilisateur récupérées:", userData);
            
                         // Valider que c'est bien un docteur
             if (userData.role === 'DOCTOR') {
               // Adapter les données du format user vers le format doctor attendu
               const doctorData = {
                 id: userData.id.toString(),
                 name: userData.name || 'Docteur', // Fallback si nom manquant
                 firstName: userData.firstName || '', 
                 email: userData.email
               };
               
               console.log("✅ Données docteur adaptées:", doctorData);
               console.log("✅ Email du docteur:", doctorData.email);
               setDoctor(doctorData);
            } else {
              console.error("❌ L'utilisateur n'est pas un docteur. Rôle:", userData.role);
              alert("Erreur: Vous n'avez pas les permissions de docteur. Veuillez vous connecter avec un compte docteur.");
              handleLogout();
            }
          } else {
            console.error("❌ Erreur récupération utilisateur:", res.status);
            
            // Fallback: essayer l'ancien endpoint doctor
            console.log("🔄 Fallback: tentative via /api/doctor/" + doctorId);
            const doctorRes = await fetch(`http://localhost:8080/api/doctor/${doctorId}`, {
              headers: { Authorization: `Bearer ${token || ''}` },
            });
            
            if (doctorRes.ok) {
              const doctorData = await doctorRes.json();
              console.log("✅ Données docteur (fallback) récupérées:", doctorData);
              setDoctor(doctorData);
            } else {
              console.error("❌ Erreur récupération docteur (fallback):", doctorRes.status);
              alert("Erreur: Impossible de récupérer votre profil docteur. Veuillez vous reconnecter.");
            }
          }
        } catch (err) {
          console.error("❌ Erreur récupération médecin :", err);
          alert("Erreur de connexion lors de la récupération du profil docteur.");
        }
      } else {
        console.error("❌ Impossible de récupérer l'ID du docteur");
        alert("Erreur: Impossible de récupérer votre ID de docteur. Veuillez vous reconnecter.");
      }
    };

    fetchDoctor();
  }, []);

  // Fonction pour charger tous les patients
  const fetchAllPatients = () => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    fetch("http://localhost:8080/api/doctor/patients/secure", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        console.log("👥 Patients sécurisés:", data);
        setAllPatients(data);
      })
      .catch(err => console.error("Erreur chargement patients sécurisés:", err));
  };

  useEffect(() => {
    fetchAllPatients();
  }, []);

  // Fonction de recherche avec debouncing
  const searchPatients = useCallback(async (term: string) => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    setIsSearching(true);
    setSearchError('');

    try {
      const endpoint = term.trim() 
        ? `http://localhost:8080/api/doctor/patients/search/secure?q=${encodeURIComponent(term)}`
        : `http://localhost:8080/api/doctor/patients/secure`;
        
      const response = await fetch(endpoint, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("🔍 Résultats recherche sécurisée:", data);
        setSearchResults(data);
      } else {
        setSearchError('Erreur lors de la recherche');
        setSearchResults([]);
      }
    } catch (error) {
      console.error("❌ Erreur recherche patients sécurisée:", error);
      setSearchError('Erreur de connexion');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debouncing pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchPatients(searchTerm);
      } else {
        // Si la recherche est vide, charger tous les patients
        searchPatients('');
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchPatients]);

  // Fonction pour sélectionner un patient
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatientForSearch(patient);
    // Debug: log both IDs to see what we have
    console.log("🔍 Patient sélectionné - DEBUG:");
    console.log("- patient.patientId:", patient.patientId);
    console.log("- patient.userId:", patient.userId);
    console.log("- Patient complet:", patient);
    
    // Utiliser patient.patientId pour les ordonnances (might need to change to userId)
    setSelectedPatientId(patient.patientId);
  };

  // Fonction pour créer une nouvelle ordonnance
  const handleCreatePrescription = async () => {
    console.log("🔍 Validation ordonnance - DEBUG COMPLET:");
    console.log("- Patient ID (patientId):", selectedPatientId, "(type:", typeof selectedPatientId, ")");
    console.log("- Date:", prescriptionDate, "(type:", typeof prescriptionDate, ")");
    console.log("- Médicaments sélectionnés:", selectedMedications, "(length:", selectedMedications.length, ")");
    console.log("- Instructions:", instructions, "(type:", typeof instructions, ")");
    
    // Vérification détaillée de chaque condition
    const hasPatient = !!selectedPatientId;
    const hasDate = !!prescriptionDate;
    const hasMedications = selectedMedications.length > 0;
    const hasInstructions = !!instructions;
    
    console.log("🧪 Tests de validation:");
    console.log("- Patient sélectionné:", hasPatient, selectedPatientId ? "✅" : "❌");
    console.log("- Date renseignée:", hasDate, prescriptionDate ? "✅" : "❌");
    console.log("- Médicaments présents:", hasMedications, selectedMedications.length > 0 ? "✅" : "❌");
    console.log("- Instructions présentes:", hasInstructions, instructions ? "✅" : "❌");

    if (!hasPatient || !hasDate || !hasMedications || !hasInstructions) {
      console.error("❌ Validation échouée - détails:");
      if (!hasPatient) console.error("  - Patient manquant");
      if (!hasDate) console.error("  - Date manquante");  
      if (!hasMedications) console.error("  - Médicaments manquants");
      if (!hasInstructions) console.error("  - Instructions manquantes");
      
      alert("Veuillez remplir tous les champs de l'ordonnance");
      return;
    }

    console.log("✅ Validation réussie, création de l'ordonnance...");

    setIsCreatingPrescription(true);
    const token = localStorage.getItem("jwt");
    const doctorId = localStorage.getItem("id");
    
    // Debug du localStorage et doctor state
    console.log("🔧 Debug localStorage et doctor state:");
    console.log("- Token:", token ? "✅ Présent" : "❌ Manquant");
    console.log("- Doctor ID brut:", doctorId);
    console.log("- Type of Doctor ID:", typeof doctorId);
    console.log("- Doctor state complet:", doctor);
    console.log("- Doctor email:", doctor?.email);

    // Vérifier que l'ID du docteur existe
    if (!doctorId || doctorId === "undefined" || doctorId === "null") {
      alert("Erreur: ID du docteur non trouvé. Veuillez vous reconnecter.");
      setIsCreatingPrescription(false);
      return;
    }

    // Vérifier que les infos du docteur sont disponibles
    console.log("🔍 Validation des informations docteur:");
    console.log("- Doctor object:", doctor);
    console.log("- Doctor email:", doctor?.email);
    console.log("- Doctor exists:", !!doctor);
    console.log("- Email exists:", !!doctor?.email);
    
    if (!doctor || !doctor.email) {
      console.error("❌ Validation docteur échouée:");
      console.error("- Doctor object present:", !!doctor);
      console.error("- Doctor email present:", !!doctor?.email);
      console.error("- Doctor object full:", doctor);
      alert("Erreur: Informations du docteur non chargées. Veuillez actualiser la page.");
      setIsCreatingPrescription(false);
      return;
    }
    
    console.log("✅ Informations docteur validées avec succès!");

    // Debug: check what patient IDs we have available
    const selectedPatient = selectedPatientForSearch;
    console.log("🔍 Debug patient IDs disponibles:");
    console.log("- selectedPatientId (actuel):", selectedPatientId);
    console.log("- selectedPatient?.patientId:", selectedPatient?.patientId);
    console.log("- selectedPatient?.userId:", selectedPatient?.userId);

    // Préparer les données de l'ordonnance - format correct selon le backend
    const prescriptionDataCorrect = {
      patientId: parseInt(selectedPatientId), // Number, not string
      doctorId: doctor.email, // "doctorId", not "doctorEmail"
      date: prescriptionDate,
      medications: selectedMedications.map(med => ({ // Array of objects, not string
        name: `${med.name} ${med.dosage}`
      })),
      instructions: instructions,
      status: "ACTIVE"
    };

    console.log("📦 Données CORRECTES selon le backend:", prescriptionDataCorrect);

    try {
      // Use the correct format directly
      console.log("🔄 Tentative 1: Avec patient.patientId...");
      const response = await fetch("http://localhost:8080/api/prescription/addPrescription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify(prescriptionDataCorrect),
      });

      console.log("📡 Réponse du serveur - Status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Ordonnance créée avec succès:", result);
        
        // Réinitialiser le formulaire
        setSelectedPatientId("");
        setPrescriptionDate("");
        setSelectedMedications([]);
        setMedicationSearch("");
        setInstructions("");
        
        alert("Ordonnance créée avec succès !");
      } else {
        const errorData = await response.text();
        console.error("❌ Erreur avec patient.patientId:");
        console.error("- Status:", response.status);
        console.error("- Error Data:", errorData);
        
        // If patient not found and we have userId, try with userId
        if (response.status === 400 && selectedPatient?.userId && selectedPatient.userId !== selectedPatientId) {
          console.log("🔄 Tentative 2: Avec patient.userId...");
          
          const prescriptionDataWithUserId = {
            ...prescriptionDataCorrect,
            patientId: parseInt(selectedPatient.userId) // Try with userId instead
          };
          
          console.log("📦 Données avec userId:", prescriptionDataWithUserId);
          
          const response2 = await fetch("http://localhost:8080/api/prescription/addPrescription", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token || ''}`,
            },
            body: JSON.stringify(prescriptionDataWithUserId),
          });

          if (response2.ok) {
            const result2 = await response2.json();
            console.log("✅ Ordonnance créée avec userId:", result2);
            
            // Réinitialiser le formulaire
            setSelectedPatientId("");
            setPrescriptionDate("");
            setSelectedMedications([]);
            setMedicationSearch("");
            setInstructions("");
            
            alert("Ordonnance créée avec succès !");
          } else {
            const errorData2 = await response2.text();
            console.error("❌ Erreur avec userId aussi:");
            console.error("- Status:", response2.status);
            console.error("- Error Data:", errorData2);
            
            alert(`Erreur lors de la création de l'ordonnance:\n\nTentative 1 (patientId): ${response.status} - ${errorData}\n\nTentative 2 (userId): ${response2.status} - ${errorData2}`);
          }
        } else {
          alert(`Erreur lors de la création de l'ordonnance: ${response.status} - ${errorData}`);
        }
      }
    } catch (error) {
      console.error("❌ Erreur réseau:", error);
      alert("Erreur de connexion lors de la création de l'ordonnance");
    } finally {
      setIsCreatingPrescription(false);
    }
  };

  // Helper function to format patient display name with fallbacks
  const getPatientDisplayName = (patient: Patient): string => {
    // Primary: use fullName if available
    if (patient.fullName && patient.fullName.trim()) {
      return patient.fullName;
    }
    
    // Fallback: construct from firstName/lastName
    if (patient.firstName || patient.lastName) {
      const firstName = patient.firstName || '';
      const lastName = patient.lastName || '';
      return `${firstName} ${lastName}`.trim();
    }
    
    // Last resort: use email
    return patient.email || 'Nom inconnu';
  };

  const tabContent: Record<TabKey, JSX.Element> = {
    "Recherche Patients": (
      <div className="space-y-6">
        {/* Barre de recherche */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 text-gray-400 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un patient (nom, prénom, email)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-3 pr-4 pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <FaSpinner className="text-blue-500 animate-spin" />
            </div>
          )}
        </div>

        {/* Messages d'état */}
        <div className="p-6 bg-white rounded-xl shadow">
          {searchError && (
            <div className="py-8 text-center text-red-600">
              <p>{searchError}</p>
            </div>
          )}

          {!isSearching && !searchError && searchResults.length === 0 && searchTerm && (
            <div className="py-8 text-center text-gray-500">
              <FaUser className="mx-auto mb-4 w-12 h-12 text-gray-300" />
              <p>Aucun patient trouvé</p>
              <p className="text-sm">Essayez une autre recherche</p>
            </div>
          )}

          <div className="overflow-y-auto space-y-3 max-h-96">
            {searchResults.map((patient) => (
              <div
                key={patient.patientId}
                onClick={() => handleSelectPatient(patient)}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedPatientForSearch?.patientId === patient.patientId
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedPatientForSearch?.patientId === patient.patientId ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <FaUser />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {getPatientDisplayName(patient)}
                      </h4>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                      <p className="text-xs text-gray-400">ID: {patient.patientId}</p>
                    </div>
                  </div>
                  
                  {selectedPatientForSearch?.patientId === patient.patientId && (
                    <div className="flex items-center text-blue-600">
                      <span className="text-sm font-medium">Sélectionné</span>
                      <div className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patient sélectionné */}
        {selectedPatientForSearch && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="mb-2 font-medium text-blue-900">Patient sélectionné</h3>
            <div className="flex items-center space-x-3">
              <div className="flex justify-center items-center w-8 h-8 text-white bg-blue-500 rounded-full">
                <FaUser size={14} />
              </div>
              <div>
                <p className="font-medium text-blue-900">
                  {getPatientDisplayName(selectedPatientForSearch)}
                </p>
                <p className="text-sm text-blue-700">{selectedPatientForSearch.email}</p>
                <p className="text-xs text-blue-600">Patient ID: {selectedPatientForSearch.patientId}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    ),

    "Ordonnances": (
      <div className="p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-semibold text-gray-800">Historique des ordonnances</h2>
        <p className="text-gray-500">À venir…</p>
      </div>
    ),

    "Nouvelle Ordonnance": (
      <div className="overflow-hidden bg-white rounded-xl shadow-lg">
        {/* En-tête */}
        <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600">
          <h2 className="flex items-center text-xl font-bold text-white">
            <FaPrescriptionBottle className="mr-2" />
            Nouvelle Ordonnance
          </h2>
          <p className="mt-1 text-sm text-green-100">Création d'une prescription médicale</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Sélection Patient et Date */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                <FaUser className="inline mr-2" />
                Patient
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="px-4 py-3 w-full bg-white rounded-lg border border-gray-300 transition-all focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isCreatingPrescription}
              >
                <option value="">-- Sélectionner un patient --</option>
                {searchResults.length > 0 ? 
                  searchResults.map((patient) => (
                    <option key={patient.patientId} value={patient.patientId}>
                      {getPatientDisplayName(patient)} (ID: {patient.patientId})
                    </option>
                  )) :
                  allPatients.map((patient) => (
                    <option key={patient.patientId} value={patient.patientId}>
                      {getPatientDisplayName(patient)} (ID: {patient.patientId})
                    </option>
                  ))
                }
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                <FaCalendarAlt className="inline mr-2" />
                Date de prescription
              </label>
              <input 
                type="date" 
                className="px-4 py-3 w-full rounded-lg border border-gray-300 transition-all focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={prescriptionDate}
                onChange={(e) => setPrescriptionDate(e.target.value)}
                disabled={isCreatingPrescription}
              />
            </div>
          </div>

          {/* Sélection des médicaments */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              <FaPills className="inline mr-2" />
              Médicaments prescrits
            </label>
            
            {/* Barre de recherche de médicaments */}
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-1/2 text-gray-400 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un médicament..."
                value={medicationSearch}
                onChange={(e) => setMedicationSearch(e.target.value)}
                className="py-3 pr-4 pl-10 w-full rounded-lg border border-gray-300 transition-all focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isCreatingPrescription}
              />
            </div>

            {/* Liste des médicaments suggérés */}
            {medicationSearch && (
              <div className="overflow-y-auto mb-4 max-h-48 rounded-lg border border-gray-200">
                {filteredMedications.length > 0 ? (
                  filteredMedications.map((medication) => (
                    <div
                      key={medication.id}
                      onClick={() => addMedication(medication)}
                      className="p-3 border-b border-gray-100 transition-colors cursor-pointer last:border-b-0 hover:bg-green-50"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{medication.name}</p>
                          <p className="text-sm text-gray-500">{medication.dosage} • {medication.category}</p>
                        </div>
                        <FaPlus className="text-green-500" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Aucun médicament trouvé
                  </div>
                )}
              </div>
            )}

            {/* Médicaments sélectionnés */}
            {selectedMedications.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Médicaments sélectionnés ({selectedMedications.length}) :
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedMedications.map((medication) => (
                    <div
                      key={medication.id}
                      className="flex items-center px-3 py-2 text-sm text-green-800 bg-green-100 rounded-full"
                    >
                      <FaPills className="mr-2" />
                      <span className="font-medium">{medication.name}</span>
                      <span className="ml-1 text-green-600">({medication.dosage})</span>
                      <button
                        onClick={() => removeMedication(medication.id)}
                        className="ml-2 text-green-600 transition-colors hover:text-red-500"
                        disabled={isCreatingPrescription}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Instructions et posologie
            </label>
            <textarea
              placeholder="Entrez les instructions détaillées pour le patient..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={4}
              className="px-4 py-3 w-full rounded-lg border border-gray-300 transition-all resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isCreatingPrescription}
            />
          </div>

          {/* Bouton de création */}
          <div className="pt-4">
            <button
              onClick={handleCreatePrescription}
              disabled={isCreatingPrescription || !selectedPatientId || !prescriptionDate || selectedMedications.length === 0 || !instructions}
              className="flex justify-center items-center px-6 py-3 w-full font-semibold text-white bg-green-600 rounded-lg transition-all hover:bg-green-700 disabled:bg-gray-400"
            >
              {isCreatingPrescription ? (
                <>
                  <FaSpinner className="mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <FaPrescriptionBottle className="mr-2" />
                  Créer l'ordonnance
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Bonjour, Dr. {doctor?.firstName} {doctor?.name}
          </h1>
          <p className="text-gray-600">Dashboard Médecin - Gestion des patients et ordonnances</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center font-medium text-red-600 hover:text-red-800"
        >
          <FaSignOutAlt className="mr-2" />
          Se déconnecter
        </button>
      </header>

      <Tabs
        tabs={Object.keys(tabContent)}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as TabKey)}
      />

      <div className="mt-6">{tabContent[activeTab]}</div>
    </div>
  );
};

export default DoctorDashboard;
