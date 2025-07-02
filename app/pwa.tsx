import { useEffect } from 'react';
import { Workbox } from 'workbox-window';

export default function PWA() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const wb = new Workbox('/sw.js');
      
      wb.addEventListener('installed', (event) => {
        if (event.isUpdate) {
          console.log('New content is available; please refresh.');
        } else {
          console.log('Content is now available offline!');
        }
      });

      wb.register();
    }
  }, []);

  return null;
}
