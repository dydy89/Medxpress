// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';  // Page principale avec les cartes
import PatientDashboard from './components/Patient/PatientDashboard';  // Page Patient
import DoctorDashboard from './components/Doctor/DoctorDashboard';  // Page Doctor
import PharmacistDashboard from './components/Pharmacist/PharmacistDashboard';  // Page Pharmacien
import CourierDashboard from './components/Courier/CourierDashboard';  // Page Livreur


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Route principale */}
        <Route path="/" element={<MainPage />} />

        {/* Routes pour chaque tableau de bord */}
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/pharmacist" element={<PharmacistDashboard />} />
        <Route path="/courier" element={<CourierDashboard />} />


      </Routes>
    </Router>
  );
};

export default App;
