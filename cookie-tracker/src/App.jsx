import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
      <div className="min-h-screen bg-[#FFF8EE] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🍪</div>
          <p className="text-orange-400 font-medium">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Se non è loggato, mostra la schermata di login
  if (!user) {
    return <LoginScreen />;
  }

  // Se il sesso non è ancora scelto, mostra la schermata di selezione
  if (!sesso) {
    return <GenderPicker onSelect={setSesso} />;
  }

  // App principale
  return (
    <div className="max-w-md mx-auto bg-[#FFF8EE] min-h-screen relative shadow-2xl">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/forno" element={<Forno />} />
        <Route path="/shop" element={<Shop />} />
      </Routes>
      <Navbar />
    </div>
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