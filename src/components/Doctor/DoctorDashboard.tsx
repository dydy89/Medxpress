import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserInjured, FaPrescriptionBottle } from 'react-icons/fa';
import { StatCard } from '../../components/StatCard';
import { Tabs } from '../../components/Tabs';

type TabKey = "Mes Patients" | "Ordonnances" | "Nouvelle Ordonnance";

type MedicamentItem = {
  medicament: string;
  quantity: number;
};

const DoctorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("Mes Patients");
  const [doctorName, setDoctorName] = useState("Docteur"); // Nom dynamique du médecin

  // États pour l’onglet “Nouvelle Ordonnance”
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedMedicament, setSelectedMedicament] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [prescriptions, setPrescriptions] = useState<MedicamentItem[]>([]);

  const patients = [
    { id: 2, name: "Jean Dupont" },
    { id: 3, name: "Marie Curie" },
  ];

  const medicaments = ["Déphéralgan", "Ibuprofène", "Doliprane", "Amoxicilline"];

  // 🔁 Appel API pour récupérer le nom du médecin
  useEffect(() => {
    axios.get("http://localhost:8080/api/user/1")
      .then((res) => {
        const fullName = `${res.data.name} ${res.data.firstname}`;
        setDoctorName(fullName);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération du médecin :", error);
      });
  }, []);

  const handleAdd = () => {
    if (!selectedMedicament) return;
    setPrescriptions([...prescriptions, { medicament: selectedMedicament, quantity: selectedQuantity }]);
    setSelectedMedicament("");
    setSelectedQuantity(1);
  };

  const handleCreatePrescription = async () => {
    const patient = patients.find((p) => p.id.toString() === selectedPatient);
    if (!patient || prescriptions.length === 0) {
      alert("Veuillez sélectionner un patient et ajouter au moins un médicament.");
      return;
    }

    const payload = {
      doctorEntity: { id: 1 },
      patient: { id: patient.id },
      medicaments: prescriptions.map((item) => ({ nom: item.medicament })),
    };

    try {
      const response = await fetch("http://localhost:8080/api/prescription/addPrescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erreur lors de la création de l'ordonnance");
      const text = await response.text();
      alert(text);
      console.log("Réponse brute de l'API :", text);
      setPrescriptions([]);
    } catch (error) {
      console.error("Erreur API :", error);
      alert("Échec de la création de l'ordonnance");
    }
  };

  const tabContent: Record<TabKey, JSX.Element> = {
    "Mes Patients": <div>Liste de patients ici</div>,
    "Ordonnances": <div>Historique des ordonnances ici</div>,
    "Nouvelle Ordonnance": (
      <div className="flex justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg space-y-6">
          <h2 className="text-2xl font-bold text-center">Créer une prescription</h2>

          <div>
            <label className="block mb-1 font-medium">Patient</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="">-- Sélectionnez un patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex space-x-4 items-end">
            <div className="flex-1">
              <label className="block mb-1 font-medium">Médicament</label>
              <select
                value={selectedMedicament}
                onChange={(e) => setSelectedMedicament(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">-- Sélectionnez un médicament --</option>
                {medicaments.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Quantité</label>
              <select
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                className="border border-gray-300 rounded-lg p-2"
              >
                {[1, 2, 3].map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAdd}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Ajouter
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Médicaments ajoutés :</h3>
            {prescriptions.length === 0 ? (
              <p className="text-gray-500">Aucun médicament ajouté</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {prescriptions.map((item, index) => (
                  <li key={index}>
                    {item.medicament} — Quantité : {item.quantity}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={handleCreatePrescription}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Créer l’ordonnance
          </button>
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dr. {doctorName}</h1>
        <p className="text-gray-600">Gestion des patients et ordonnances</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Patients" value="127" icon={<FaUserInjured size={24} />} />
        <StatCard title="Ordonnances" value="89" icon={<FaPrescriptionBottle size={24} />} />
      </div>

      <Tabs
        tabs={Object.keys(tabContent)}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as TabKey)}
      />

      <div className="mt-6">
        {tabContent[activeTab]}
      </div>
    </div>
  );
};

export default DoctorDashboard;
