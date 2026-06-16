import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for offline/PWA capabilities
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[LENS.AR] ServiceWorker registration successful with scope: ", reg.scope);
      })
      .catch((err) => {
        console.warn("[LENS.AR] ServiceWorker registration failed: ", err);
      });
  });
}

