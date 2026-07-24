import { useEffect, useState } from 'react';
import DemoHeader from './components/DemoHeader.jsx';
import RoleHub from './pages/RoleHub.jsx';
import ClientPortal from './pages/ClientPortal.jsx';
import EngineerPortal from './pages/EngineerPortal.jsx';
import OperatorPortal from './pages/OperatorPortal.jsx';
import PresentationDeck from './pages/Presentation.jsx';

const VALID_ROUTES = new Set(['home', 'client', 'engineer', 'operator', 'slides']);

function routeFromHash() {
  const route = window.location.hash.replace('#/', '') || 'home';
  return VALID_ROUTES.has(route) ? route : 'home';
}

export default function App() {
  const [route, setRouteState] = useState(routeFromHash);

  useEffect(() => {
    const handler = () => setRouteState(routeFromHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const setRoute = (nextRoute) => {
    window.location.hash = `/${nextRoute}`;
    setRouteState(nextRoute);
  };

  // Hide the app header on the slide page (since PresentationDeck has its own header)
  const showAppHeader = route !== 'slides';

  return (
    <div className="app-shell">
      {showAppHeader && <DemoHeader route={route} setRoute={setRoute} />}

      <main className={route === 'slides' ? 'h-screen w-screen' : undefined}>
        {route === 'home' && <RoleHub setRoute={setRoute} />}
        {route === 'client' && <ClientPortal setRoute={setRoute} />}
        {route === 'engineer' && <EngineerPortal setRoute={setRoute} />}
        {route === 'operator' && <OperatorPortal setRoute={setRoute} />}

        {/* Slides page */}
        {route === 'slides' && <PresentationDeck />}
      </main>
    </div>
  );
}