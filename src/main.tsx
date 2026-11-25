import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminPortal from './AdminPortal';
import './style.css';

const isAdminLogin = window.location.pathname === '/admin-login';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isAdminLogin ? <AdminPortal onBack={() => window.location.assign('/')} /> : <App />}
  </React.StrictMode>
);
