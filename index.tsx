// FIX: This file was created because it was empty.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Assuming a global CSS file exists for Tailwind, etc.
// If not present, create a basic index.css file.
// import './index.css'; 

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
