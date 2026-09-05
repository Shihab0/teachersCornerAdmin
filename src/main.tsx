import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

// Prevent libraries from crashing the app by trying to overwrite window.fetch
try {
  const originalFetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    get: () => originalFetch,
    set: () => {
      console.warn('Prevented attempt to overwrite window.fetch');
    },
    configurable: true
  });
} catch (e) {
  console.error("Could not protect window.fetch", e);
}

import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
