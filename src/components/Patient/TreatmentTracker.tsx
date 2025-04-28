// src/components/Patient/TreatmentTracker.tsx

import React from 'react';

export const TreatmentTracker: React.FC = () => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800">Suivi de traitement</h3>
      <p className="text-gray-700 mt-2">Votre traitement est à jour. N'oubliez pas de prendre vos médicaments à l'heure.</p>
    </div>
  );
};
