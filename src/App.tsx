import React from 'react';
import { Route, Routes } from 'react-router-dom';

import RouteGuard from './components/RouteGuard';
import LoginPage from './login/LoginPage';
import RegisterPage from './login/RegisterPage';

import CourierDashboard from './components/Courier/CourierDashboard';
import DoctorDashboard from './components/Doctor/DoctorDashboard';
import MainPage from './components/MainPage';
import PatientDashboard from './components/Patient/PatientDashboard';
import PharmacistDashboard from './components/Pharmacist/PharmacistDashboard';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route 
        path="/patient" 
        element={
          <RouteGuard 
            requiredRole="PATIENT" 
            redirectMessage="This dashboard is for patients only. Please log in with a patient account."
          >
            <PatientDashboard />
          </RouteGuard>
        } 
      />
      <Route 
        path="/doctor" 
        element={
          <RouteGuard 
            requiredRole="DOCTOR" 
            redirectMessage="This dashboard is for doctors only. Please log in with a doctor account."
          >
            <DoctorDashboard />
          </RouteGuard>
        } 
      />
      <Route 
        path="/pharmacist" 
        element={
          <RouteGuard 
            requiredRole="PHARMACIST" 
            redirectMessage="This dashboard is for pharmacists only. Please log in with a pharmacist account."
          >
            <PharmacistDashboard />
          </RouteGuard>
        } 
      />
      <Route path="/courier/:driverId" element={<CourierDashboard />} />
    </Routes>
  );
};

export default App;
