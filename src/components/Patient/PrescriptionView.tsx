// src/components/Patient/PrescriptionView.tsx

import React from 'react';

interface PrescriptionProps {
  prescription: {
    medication: string;
    doctorName: string;
    qrCode: string;
  };
}

export const PrescriptionView: React.FC<PrescriptionProps> = ({ prescription }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800">Médicament : {prescription.medication}</h3>
      <p className="text-gray-700">Prescrit par : {prescription.doctorName}</p>
      <img src="/images/medexpres.jpg" alt="QR Code" className="mt-4 w-40 h-40" />
    </div>
  );
};
