import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DigitalizationPage from './pages/DigitalizationPage';
import MachinePage from './pages/MachinePage';
import LayoutPage from './pages/LayoutPage';
import CycleTimePage from './pages/CycleTimePage';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
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
