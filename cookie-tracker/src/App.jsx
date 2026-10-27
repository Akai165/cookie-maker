import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useProfile } from './hooks/useProfile';
import Navbar from './components/Navbar';
import LoginScreen from './components/LoginScreen';
import GenderPicker from './components/GenderPicker';
import Dashboard from './pages/Dashboard';
import Forno from './pages/Forno';
import Shop from './pages/Shop';

function AppContent() {
  const { user, loading } = useAuth();
  const { sesso, setSesso, loading: profileLoading } = useProfile(user?.uid);

  // Schermata di caricamento iniziale (controlla se è già loggato)
  if (loading || (user && profileLoading)) {
    return (
      <ThemeProvider userId={null}>
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
          <div className="text-center">
            <div className="text-6xl animate-bounce mb-4">🍪</div>
            <p className="font-medium" style={{ color: 'var(--primary)' }}>Caricamento...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Se non è loggato, mostra la schermata di login
  if (!user) {
    return (
      <ThemeProvider userId={null}>
        <LoginScreen />
      </ThemeProvider>
    );
  }

  // Se il sesso non è ancora scelto, mostra la schermata di selezione
  if (!sesso) {
    return (
      <ThemeProvider userId={user.uid}>
        <GenderPicker onSelect={setSesso} />
      </ThemeProvider>
    );
  }

  // App principale
  return (
    <ThemeProvider userId={user.uid}>
      <div className="max-w-md mx-auto min-h-screen relative shadow-2xl" style={{ background: 'var(--bg)' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/forno" element={<Forno />} />
          <Route path="/shop" element={<Shop />} />
        </Routes>
        <Navbar />
      </div>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;