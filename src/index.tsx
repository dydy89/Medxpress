// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom'; // ✅ Ajout important

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter> {/* ✅ Place ici ton routeur global */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Pour mesurer les performances (optionnel)
reportWebVitals();
