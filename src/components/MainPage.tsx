// src/components/MainPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaStethoscope, FaTruck, FaFlask } from 'react-icons/fa';

const MainPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4"> {/* pt-20 pour laisser la place à la navbar */}
      {/* Navbar noire */}
      <nav className="fixed top-0 left-0 w-full bg-black text-white flex items-center justify-center h-16 shadow-md z-10">
        <h1 className="text-xl font-bold">MedExpress</h1>
      </nav>

      {/* Cartes */}
      <div className="container mx-auto grid grid-cols-2 gap-8 mt-8">
        <Link to="/patient" className="flex flex-col justify-center items-center bg-blue-500 hover:bg-blue-600 text-white p-10 rounded-xl shadow-xl cursor-pointer transform hover:scale-105 transition-all">
          <FaUser size={60} />
          <p className="mt-4 text-lg">Patient</p>
        </Link>

        <Link to="/doctor" className="flex flex-col justify-center items-center bg-green-500 hover:bg-green-600 text-white p-10 rounded-xl shadow-xl cursor-pointer transform hover:scale-105 transition-all">
          <FaStethoscope size={60} />
          <p className="mt-4 text-lg">Docteur</p>
        </Link>



        <Link to="/courier" className="flex flex-col justify-center items-center bg-red-500 hover:bg-red-600 text-white p-10 rounded-xl shadow-xl cursor-pointer transform hover:scale-105 transition-all">
          <FaTruck size={60} />
          <p className="mt-4 text-lg">Livreur</p>
        </Link>

        <Link to="/pharmacist" className="flex flex-col justify-center items-center bg-yellow-500 hover:bg-yellow-600 text-white p-10 rounded-xl shadow-xl cursor-pointer transform hover:scale-105 transition-all">
          <FaFlask size={60} />
          <p className="mt-4 text-lg">Pharmacien</p>
        </Link>
      </div>
    </div>
  );
};

export default MainPage;
