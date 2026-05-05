import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AudioProvider } from './context/AudioContext';

export default function App() {
  useEffect(() => {
    try {
      screen.orientation.lock('portrait').catch(() => {});
    } catch { /* browser desktop — ignore */ }
  }, []);

  return (
    <AudioProvider>
      <RouterProvider router={router} />
    </AudioProvider>
  );
}
