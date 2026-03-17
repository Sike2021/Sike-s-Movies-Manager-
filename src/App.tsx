import { useState } from 'react';
import { GameProvider } from '@/context/GameContext';
import { Dashboard } from '@/sections/Dashboard';
import { Movies } from '@/sections/Movies';
import { Talent } from '@/sections/Talent';
import { Stats } from '@/sections/Stats';
import { Settings } from '@/sections/Settings';
import { CreateMovie } from '@/sections/CreateMovie';
import { SimulationControl } from '@/sections/SimulationControl';
import { SetupScreen } from '@/sections/SetupScreen';
import { Toaster } from '@/components/ui/sonner';
import { Home, Film, Users, BarChart3, Settings as SettingsIcon } from 'lucide-react';

type Screen = 'setup' | 'dashboard' | 'movies' | 'talent' | 'stats' | 'settings' | 'create-movie' | 'simulation';

function GameContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('setup');
  const [previousScreen, setPreviousScreen] = useState<Screen>('setup');

  const navigateTo = (screen: Screen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };
  const goBack = () => setCurrentScreen(previousScreen);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'setup': return <SetupScreen onComplete={() => navigateTo('dashboard')} />;
      case 'dashboard': return <Dashboard onNavigate={navigateTo} />;
      case 'movies': return <Movies onNavigate={navigateTo} />;
      case 'talent': return <Talent onNavigate={navigateTo} />;
      case 'stats': return <Stats onNavigate={navigateTo} />;
      case 'settings': return <Settings onNavigate={navigateTo} />;
      case 'create-movie': return <CreateMovie onBack={goBack} />;
      case 'simulation': return <SimulationControl onBack={goBack} />;
      default: return <Dashboard onNavigate={navigateTo} />;
    }
  };

  const showNav = ['dashboard', 'movies', 'talent', 'stats', 'settings'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-24">
      <main className="animate-fade-in">{renderScreen()}</main>
      
      {showNav && (
        <nav className="bottom-nav">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <button onClick={() => navigateTo('dashboard')} className={`nav-item ${currentScreen === 'dashboard' ? 'active' : ''}`}>
              <Home className="w-6 h-6" /><span className="text-xs">Studio</span>
            </button>
            <button onClick={() => navigateTo('movies')} className={`nav-item ${currentScreen === 'movies' ? 'active' : ''}`}>
              <Film className="w-6 h-6" /><span className="text-xs">Movies</span>
            </button>
            <button onClick={() => navigateTo('talent')} className={`nav-item ${currentScreen === 'talent' ? 'active' : ''}`}>
              <Users className="w-6 h-6" /><span className="text-xs">Talent</span>
            </button>
            <button onClick={() => navigateTo('stats')} className={`nav-item ${currentScreen === 'stats' ? 'active' : ''}`}>
              <BarChart3 className="w-6 h-6" /><span className="text-xs">Stats</span>
            </button>
            <button onClick={() => navigateTo('settings')} className={`nav-item ${currentScreen === 'settings' ? 'active' : ''}`}>
              <SettingsIcon className="w-6 h-6" /><span className="text-xs">Settings</span>
            </button>
          </div>
        </nav>
      )}
      
      <Toaster position="top-center" toastOptions={{ style: { background: '#2d2920', color: '#fff', border: '1px solid #3d3828' } }} />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
