import { useEffect } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import { trackPageView } from './lib/analytics';
import './index.css';

function AppContent() {
  const { state } = useApp();

  // Track page views on route changes
  useEffect(() => {
    trackPageView(`/${state.currentPage}`);
  }, [state.currentPage]);

  switch (state.currentPage) {
    case 'landing':
      return <LandingPage />;
    case 'profile':
      return <ProfilePage />;
    case 'dashboard':
      return <DashboardPage />;
    case 'quiz':
      return <QuizPage />;
    case 'results':
      return <ResultsPage />;
    default:
      return <LandingPage />;
  }
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
