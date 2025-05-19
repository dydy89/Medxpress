import React, { useState, useEffect } from 'react';
import { FaUserEdit, FaUserInjured, FaPrescriptionBottle, FaUpload } from 'react-icons/fa';

const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileURL, setFileURL] = useState<string>('');

  const doctorProfile = {
    name: "Dr. Alice",
    avatar: "/images/doctor-avatar.jpg",
    email: "alice.doctor@example.com"
  };

  useEffect(() => {
    setPatients([
      { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' }
    ]);
    setPrescriptions([
      { patientName: 'John Doe', medication: 'Médicament X', date: '2025-04-10' },
      { patientName: 'Jane Smith', medication: 'Médicament Y', date: '2025-04-12' }
    ]);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setFileURL(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://localhost:8080/api/ordonnances/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const text = await response.text();
          alert(text);
        } else {
          alert('Erreur lors de l\'upload de l\'ordonnance');
        }
      } catch (error) {
        console.error(error);
        alert('Erreur réseau');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-10 px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header médecin */}
        <div className="flex items-center bg-white p-6 rounded-xl shadow-md">
          <img
            src={doctorProfile.avatar}
            alt="Doctor"
            className="w-20 h-20 rounded-full border-4 border-indigo-300 shadow mr-6"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{doctorProfile.name}</h1>
            <p className="text-gray-600">{doctorProfile.email}</p>
          </div>
          <div className="ml-auto text-indigo-600 hover:text-indigo-800 cursor-pointer">
            <FaUserEdit size={24} />
          </div>
        </div>

        {/* Liste des patients */}
        <section className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center text-indigo-600 mb-4">
            <FaUserInjured className="mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Liste des Patients</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {patients.map((patient, index) => (
              <div key={index} className="border p-4 rounded-lg shadow-sm hover:bg-gray-50">
                <h3 className="font-semibold text-gray-800">{patient.name}</h3>
                <p className="text-sm text-gray-500">{patient.email}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Upload ordonnance */}
        <section className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center text-indigo-600 mb-4">
            <FaUpload className="mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Uploader une Ordonnance</h2>
          </div>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={handleFileUpload}
            className="w-full"
          />
          {fileURL && (
            <div className="mt-4">
              <p className="font-semibold text-gray-700 mb-2">Aperçu :</p>
              <iframe src={fileURL} className="w-full h-64 rounded-lg border" />
            </div>
          )}
        </section>

        {/* Historique des prescriptions */}
        <section className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center text-indigo-600 mb-4">
            <FaPrescriptionBottle className="mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Historique des Prescriptions</h2>
          </div>
          <div className="space-y-3">
            {prescriptions.map((prescription, index) => (
              <div key={index} className="border p-4 rounded-lg shadow-sm hover:bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">{prescription.patientName}</h3>
                <p className="text-sm text-gray-600">💊 {prescription.medication}</p>
                <p className="text-sm text-gray-400">🗓️ {prescription.date}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DoctorDashboard;
