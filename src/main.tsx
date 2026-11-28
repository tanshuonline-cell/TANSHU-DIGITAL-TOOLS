import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminPortal from './AdminPortal';
import AdminDashboard from './AdminDashboard';
import './style.css';
import './design-preview.css';
import DesignPreview from './DesignPreview';

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
    {path === '/design-preview' ? <DesignPreview /> : path === '/admin-login' ? <AdminPortal onBack={() => window.location.assign('/')} /> : path === '/admin' ? <AdminDashboard /> : <App />}
  </React.StrictMode>
);
