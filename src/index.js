// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext'; // Import the AuthProvider

// Suppress benign Chrome ResizeObserver errors that can trigger CRA error overlay
// Ref: common Chromium issue where ResizeObserver callbacks cause loop warnings
const ignoreResizeObserverError = (event) => {
  const msg = event?.message || '';
  if (
    msg.includes('ResizeObserver loop limit exceeded') ||
    msg.includes('ResizeObserver loop completed with undelivered notifications')
  ) {
    event.stopImmediatePropagation();
  }
};
window.addEventListener('error', ignoreResizeObserverError);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* Wrap the App with AuthProvider */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);