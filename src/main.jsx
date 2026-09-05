import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import BackgroundManager from './components/BackgroundManager';
import './index.css';

/**
 * Root Application Entry Point.
 * Mounts global background canvas manager, React Router provider, and main application layout.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Top-level background visualizer with floating theme switcher */}
      <BackgroundManager />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);