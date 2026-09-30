import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Schermata di login con errore visibile per debugging.
 */
export default function LoginScreen() {
  const { loginWithGoogle, error: authError } = useAuth();
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const error = localError || authError;

  const handleLogin = async () => {
    setLocalError(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setLocalError(err.code || err.message || 'Errore sconosciuto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8EE] flex flex-col items-center justify-center p-6">
      {/* Cookie animato */}
      <div className="text-8xl mb-6 animate-bounce drop-shadow-lg">🍪</div>

      <h1 className="text-4xl font-black text-orange-900 mb-2 tracking-tight">
        Cookie Tracker
      </h1>
      <p className="text-orange-700/70 mb-10 text-lg">
        Guadagna biscotti, premiati!
      </p>

      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="flex items-center gap-3 bg-white hover:bg-orange-50 text-orange-900 font-bold py-4 px-8 rounded-2xl shadow-lg border-2 border-orange-200 transition-all active:scale-95 hover:shadow-xl disabled:opacity-50"
      >
        {isLoading ? (
          <span>Caricamento...</span>
        ) : (
          <>
            {/* Google icon SVG */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Accedi con Google
          </>
        )}
      </button>

      {/* Errore visibile */}
      {error && (
        <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 max-w-sm w-full">
          <p className="text-red-800 font-bold text-sm mb-1">⚠️ Errore di login:</p>
          <p className="text-red-600 text-sm font-mono break-all">{error}</p>
          <p className="text-red-400 text-xs mt-2">
            Controlla di aver abilitato Google Sign-In nella console Firebase
          </p>
        </div>
      )}

      <p className="mt-8 text-sm text-orange-400">
        I tuoi dati si sincronizzano su tutti i dispositivi ✨
      </p>
    </div>
  );
}
