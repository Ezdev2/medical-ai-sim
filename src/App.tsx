import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DigitalizationPage from './pages/DigitalizationPage';
import MachinePage from './pages/MachinePage';
import LayoutPage from './pages/LayoutPage';
import CycleTimePage from './pages/CycleTimePage';
import Footer from './components/Footer';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    setTheme(stored === 'dark' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar theme={theme} toggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/solutions/digitalization" element={<DigitalizationPage />} />
          <Route path="/solutions/machine" element={<MachinePage />} />
          <Route path="/solutions/layout" element={<LayoutPage />} />
          <Route path="/solutions/cycle-time" element={<CycleTimePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
