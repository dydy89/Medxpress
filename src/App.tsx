import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LoginPage from './login/LoginPage';
import RegisterPage from './login/RegisterPage';

import MainPage from './components/MainPage';
import PatientDashboard from './components/Patient/PatientDashboard';
import DoctorDashboard from './components/Doctor/DoctorDashboard';
import PharmacistDashboard from './components/Pharmacist/PharmacistDashboard';
import CourierDashboard from './components/Courier/CourierDashboard';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/patient" element={<PatientDashboard />} />
      <Route path="/doctor" element={<DoctorDashboard />} />
      <Route path="/pharmacist" element={<PharmacistDashboard />} />
      <Route path="/courier/:driverId" element={<CourierDashboard />} />
    </Routes>
  );
};

export default App;
