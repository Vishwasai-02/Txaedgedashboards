import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './core/components/ErrorBoundary/ErrorBoundary';
import './App.css';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="tx-app">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
