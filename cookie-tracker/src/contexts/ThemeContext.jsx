import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { THEMES, DEFAULT_THEME } from '../themes';

const ThemeContext = createContext(null);

/**
 * Provider del tema. Si occupa di:
 * - Leggere il tema da Firestore (se l'utente è loggato)
 * - Applicare le variabili CSS al documento
 * - Salvare le modifiche su Firestore e localStorage
 */
export function ThemeProvider({ userId, children }) {
  const [themeId, setThemeId] = useState(
    () => localStorage.getItem('theme') || DEFAULT_THEME
  );

  // Ascolta il tema da Firestore quando l'utente è loggato
  useEffect(() => {
    if (!userId) return;
    const docRef = doc(db, 'users', userId);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists() && snap.data().tema) {
        const remoteTheme = snap.data().tema;
        setThemeId(remoteTheme);
        localStorage.setItem('theme', remoteTheme);
      }
    });
    return unsub;
  }, [userId]);

  // Applica variabili CSS al <html> ogni volta che il tema cambia
  useEffect(() => {
    const theme = THEMES[themeId] || THEMES[DEFAULT_THEME];
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    // Aggiorna anche il background del body
    document.body.style.background = theme.vars['--bg'];
  }, [themeId]);

  const setTheme = useCallback(async (id) => {
    setThemeId(id);
    localStorage.setItem('theme', id);
    if (userId) {
      try {
        await updateDoc(doc(db, 'users', userId), { tema: id });
      } catch {
        // Silenzioso se fallisce
      }
    }
  }, [userId]);

  return (
    <ThemeContext.Provider value={{ themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve essere usato dentro ThemeProvider');
  return ctx;
}
