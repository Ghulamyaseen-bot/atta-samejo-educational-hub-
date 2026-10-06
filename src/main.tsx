import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for offline capability & caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('ATTA SAMEJO HUB Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('Service Worker registration skipped/failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
