import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { FaUserInjured, FaPrescriptionBottle } from 'react-icons/fa';
import { StatCard } from '../../components/StatCard';
import { Tabs } from '../../components/Tabs';

type TabKey = "My Patients" | "Prescriptions" | "New Prescription";

const token = localStorage.getItem("token");

type MedicamentItem = {
  medicament: string;
  quantity: number;
};

const DoctorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("My Patients");
  const [doctorName, setDoctorName] = useState("Doctor");

  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedMedicament, setSelectedMedicament] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [prescriptions, setPrescriptions] = useState<MedicamentItem[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const patients = [
    { id: 2, name: "John Smith" },
    { id: 3, name: "Marie Curie" },
  ];

  const medicaments = ["Paracetamol", "Ibuprofen", "Doliprane", "Amoxicillin"];

  useEffect(() => {
    if (!token) {
      console.warn("Missing token in localStorage.");
      return;
    }

    axios.get("http://localhost:8080/api/user/3", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res) => {
      const fullName = `${res.data.name} ${res.data.firstName}`;
      setDoctorName(fullName);
    })
    .catch((error) => {
      console.error("Failed to fetch doctor:", error);
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
      setMessage({ type: 'error', text: 'Please select a patient and add at least one medication.' });
      return;
    }

    const payload = {
      doctorEntity: { id: 2 },
      patient: { id: 3 },
      medicaments: prescriptions.map((item) => ({
        nom: item.medicament
      })),
    };

    console.log("Payload envoyé:", JSON.stringify(payload));

    try {
      const response = await fetch("http://localhost:8080/api/prescription/addPrescription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create prescription");
      }

      const text = await response.text();
      setMessage({ type: 'success', text });
      setPrescriptions([]);
      setSelectedPatient("");
    } catch (error) {
      console.error("API Error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create the prescription.';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const tabContent: Record<TabKey, JSX.Element> = {
    "My Patients": <div>Patient list goes here</div>,
    "Prescriptions": <div>Prescription history goes here</div>,
    "New Prescription": (
      <div className="flex justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg space-y-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-center text-blue-800">Create a New Prescription</h2>

          {message && (
            <div className={`p-3 rounded text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div>
            <label className="block mb-1 font-semibold">Patient</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="">-- Select a patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex space-x-4 items-end">
            <div className="flex-1">
              <label className="block mb-1 font-semibold">Medication</label>
              <select
                value={selectedMedicament}
                onChange={(e) => setSelectedMedicament(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">-- Select a medication --</option>
                {medicaments.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold">Quantity</label>
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
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Add
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Added Medications:</h3>
            {prescriptions.length === 0 ? (
              <p className="text-gray-500 italic">No medication added yet</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {prescriptions.map((item, index) => (
                  <li key={index}>
                    {item.medicament} — Quantity: {item.quantity}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={handleCreatePrescription}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Submit Prescription
          </button>
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* En-tête médecin */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dr. {doctorName}</h1>
        <p className="text-gray-600">Patient and Prescription Management</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Patients" value="127" icon={<FaUserInjured size={24} />} />
        <StatCard title="Prescriptions" value="89" icon={<FaPrescriptionBottle size={24} />} />
      </div>

      <Tabs
        tabs={Object.keys(tabContent) as TabKey[]}
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
