import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Apply persisted theme + accent before React renders so there is no flash of wrong theme.
try {
  const persisted = JSON.parse(localStorage.getItem('ai-resume-analyzer-store') || '{}');
  const settings = persisted?.state?.settings || {};
  const mode = settings.theme || localStorage.getItem('rb-theme') || 'system';
  const accent = settings.accent || 'brand';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = mode === 'dark' || (mode === 'system' && prefersDark);
  if (dark) document.documentElement.classList.add('dark');
  document.documentElement.setAttribute('data-accent', accent);
} catch {
  /* ignore - first load */
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
