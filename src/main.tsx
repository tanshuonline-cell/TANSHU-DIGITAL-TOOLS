import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminPortal from './AdminPortal';
import AdminDashboard from './AdminDashboard';
import './style.css';

const path = window.location.pathname;
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {path === '/admin-login' ? <AdminPortal onBack={() => window.location.assign('/')} /> : path === '/admin' ? <AdminDashboard /> : <App />}
  </React.StrictMode>
);
