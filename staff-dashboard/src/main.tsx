import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './core/styles/fonts.css';
import './core/styles/variables.css';
import './core/styles/reset.css';
import './core/styles/forms.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

