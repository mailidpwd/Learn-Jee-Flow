import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Suppress noisy dev-server ping fetch errors caused by proxies/overlays
if (import.meta.env.DEV && typeof window !== 'undefined') {
  const shouldSilence = (reason: any) => {
    try {
      const msg = typeof reason === 'string' ? reason : reason?.message || '';
      const stack = (reason && reason.stack) || '';
      return /Failed to fetch/i.test(String(msg)) && (/@vite\/client/i.test(String(stack)) || /__vite_ping/i.test(String(msg + stack)));
    } catch {
      return false;
    }
  };

  window.addEventListener('unhandledrejection', (e) => {
    if (shouldSilence(e.reason)) e.preventDefault();
  });

  window.addEventListener(
    'error',
    (e) => {
      const errEvent = e as ErrorEvent;
      if (/Failed to fetch/i.test(String(errEvent?.message)) && /@vite\/client/i.test(String(errEvent?.filename))) {
        e.preventDefault();
      }
    },
    true
  );
}

createRoot(document.getElementById("root")!).render(<App />);
