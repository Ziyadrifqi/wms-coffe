import { useState, useEffect } from 'react';
import AppRouter from './routes/AppRouter';
import Preloader from './components/common/Preloader';

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // beri jeda sedikit supaya zustand persist selesai hydrate dari localStorage
    const timer = setTimeout(() => setIsReady(true), 400);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <Preloader />;
  }

  return <AppRouter />;
}

export default App;