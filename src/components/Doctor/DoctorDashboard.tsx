import React, { useEffect, useState } from 'react';
import { FaUserInjured, FaCalendarAlt, FaPrescriptionBottle, FaQrcode } from 'react-icons/fa';
import { StatCard } from '../../components/StatCard';
import { Tabs } from '../../components/Tabs';

type TabKey = "Mes Patients" | "Nouvelle Ordonnance" | "Ordonnances";

const DoctorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("Nouvelle Ordonnance");
  const [doctor, setDoctor] = useState<{ name: string } | null>(null);

  const [patients, setPatients] = useState<{ nom: string; prenom: string }[]>([]);
  const [newNom, setNewNom] = useState('');
  const [newPrenom, setNewPrenom] = useState('');

  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");

  useEffect(() => {
    const fetchDoctor = async () => {
      const doctorId = localStorage.getItem("id");
      const token = localStorage.getItem("jwt");
      if (!doctorId || !token) return;

      try {
        const res = await fetch(`http://localhost:8080/api/doctor/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDoctor(data);
        }
      } catch (err) {
        console.error("Erreur récupération médecin :", err);
      }
    };

    fetchDoctor();
  }, []);

 useEffect(() => {
  const token = localStorage.getItem("jwt");

  fetch("http://localhost:8080/api/patient/all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Erreur d'accès à la liste des patients");
      return res.json();
    })
    .then(data => {
      console.log("👥 Noms des patients :", data);
      setAllPatients(data);
    })
    .catch(err => console.error("Erreur chargement noms patients:", err));
}, []);
  const tabContent: Record<TabKey, JSX.Element> = {
    "Mes Patients": (
      <div className="bg-white p-6 rounded-xl shadow space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Ajouter un patient</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nom"
              value={newNom}
              onChange={(e) => setNewNom(e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Prénom"
              value={newPrenom}
              onChange={(e) => setNewPrenom(e.target.value)}
              className="input"
            />
          </div>
          <button
            onClick={() => {
              if (newNom && newPrenom) {
                setPatients([...patients, { nom: newNom, prenom: newPrenom }]);
                setNewNom('');
                setNewPrenom('');
              } else {
                alert("Veuillez remplir les deux champs");
              }
            }}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded"
          >
            Ajouter
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Liste des patients</h2>
          <ul className="space-y-2">
            {allPatients.map((patient, idx) => (
              <option key={idx} value={patient.idPatient}>{patient.user?.name || "Nom inconnu"}</option>
            ))}
          </ul>
        </div>
      </div>
    ),

    "Ordonnances": (
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold text-gray-800">Historique des ordonnances</h2>
        <p className="text-gray-500">À venir…</p>
      </div>
    ),

    "Nouvelle Ordonnance": (
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Nouvelle Ordonnance</h2>
        <p className="text-sm text-gray-500 mb-6">Création de l'ordonnance du patient</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <select
              value={selectedPatientId}
               onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
                      >
                 <option value="">-- Sélectionner un patient --</option>
               {allPatients.map((patient) => (
                  <option key={patient.idPatient} value={patient.idPatient}>
                {patient.idPatient}
          </option>
          ))}
        </select>

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
      {/* En-tête médecin */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Bonjour, Dr. {doctor?.name}
        </h1>
        <p className="text-gray-600">Gestion des patients et ordonnances</p>
      </header>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Patients" value={patients.length.toString()} icon={<FaUserInjured size={24} />} />
        <StatCard title="Ordonnances" value="0" icon={<FaPrescriptionBottle size={24} />} />
        <StatCard title="RDV Aujourd'hui" value="12" icon={<FaCalendarAlt size={24} />} />
      </div>

      {/* Navigation par onglets */}
      <Tabs tabs={Object.keys(tabContent)} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as TabKey)} />

      {/* Contenu actif */}
      <div className="mt-6">
        {tabContent[activeTab]}
      </div>
    </div>
  );
};

export default DoctorDashboard;
