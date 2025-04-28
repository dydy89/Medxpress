import React, { useState, useEffect } from 'react';
import { FaUserEdit } from 'react-icons/fa';

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
      setFileURL(URL.createObjectURL(file)); // prévisualisation locale
  
      // Envoyer au back Spring Boot
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const response = await fetch('http://localhost:8080/api/ordonnances/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          const text = await response.text();
          alert(text); // message du serveur
        } else {
          alert('Erreur lors de l\'upload de l\'ordonnance ❌');
        }
      } catch (error) {
        console.error(error);
        alert('Erreur réseau ❌');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="container mx-auto bg-white p-6 rounded-lg shadow-lg flex">
        
        {/* Profil médecin */}
        <div className="w-1/4 pr-6">
          <div className="flex items-center mb-6">
            <img 
              src={doctorProfile.avatar} 
              alt="Doctor Profile" 
              className="w-16 h-16 rounded-full border-2 border-gray-300 mr-4" 
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-800">{doctorProfile.name}</h1>
              <p className="text-sm text-gray-500">{doctorProfile.email}</p>
            </div>
          </div>

          <div className="text-center mt-4">
            <FaUserEdit className="text-blue-500 cursor-pointer hover:text-blue-700" size={24} />
          </div>
        </div>

        {/* Contenu médecin */}
        <div className="w-3/4">
          <header className="mb-6 text-center">
            <h2 className="text-3xl font-semibold text-gray-800">Tableau de bord du Médecin</h2>
            <p className="text-lg text-gray-500 mt-2">Gestion des patients et des prescriptions</p>
          </header>

          {/* Liste patients */}
          <section className="mb-8">
            <h2 className="text-2xl font-medium text-gray-700 mb-3">Liste des Patients</h2>
            <div className="space-y-3">
              {patients.map((patient, index) => (
                <div key={index} className="border p-4 rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-800">{patient.name}</h3>
                  <p className="text-sm text-gray-500">{patient.email}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Upload d'une ordonnance */}
          <section className="mb-8">
            <h2 className="text-2xl font-medium text-indigo-700 mb-3">Uploader une Ordonnance</h2>
            <div className="bg-indigo-50 p-4 rounded-lg shadow-inner space-y-4">
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={handleFileUpload}
                className="w-full"
              />
              {fileURL && (
                <div className="mt-4">
                  <p className="font-semibold text-gray-700 mb-2">Aperçu du fichier :</p>
                  <iframe src={fileURL} className="w-full h-64 rounded-lg border" title="Ordonnance Preview" />
                </div>
              )}
            </div>
          </section>

          {/* Historique des prescriptions */}
          <section className="mb-8">
            <h2 className="text-2xl font-medium text-gray-700 mb-3">Historique des Prescriptions</h2>
            <div className="space-y-3">
              {prescriptions.map((prescription, index) => (
                <div key={index} className="border p-4 rounded-lg shadow-sm hover:bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800">{prescription.patientName}</h3>
                  <p className="text-sm text-gray-500">Médicament : {prescription.medication}</p>
                  <p className="text-sm text-gray-500">Date : {prescription.date}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
