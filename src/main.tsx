import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminPortal from './AdminPortal';
import AdminDashboard from './AdminDashboard';
import './style.css';
import './approved-design.css';
import './mobile-home-nav-preview.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  });
}

const path = window.location.pathname;
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {path === '/admin-login' ? <AdminPortal onBack={() => window.location.assign('/')} /> : path === '/admin' ? <AdminDashboard /> : <div className="approved-app-design"><App /></div>}
  </React.StrictMode>
);
