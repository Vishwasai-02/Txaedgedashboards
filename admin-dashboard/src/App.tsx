import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="tx-app">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}
