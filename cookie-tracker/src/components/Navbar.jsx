import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SettingsModal from './SettingsModal';

export default function Navbar() {
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Vetrina', emoji: '🍪' },
    { path: '/forno', label: 'Forno', emoji: '📝' },
    { path: '/shop', label: 'Negozio', emoji: '🛍️' },
  ];

  return (
    <>
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md backdrop-blur-md flex justify-around py-3 pb-5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40"
        style={{
          background: 'color-mix(in srgb, var(--bg-card) 90%, transparent)',
          borderTop: '2px solid var(--navbar-border)',
        }}
      >
        {navItems.map(({ path, label, emoji }) => (
          <Link
            key={path}
            to={path}
            className="flex flex-col items-center gap-0.5 transition-all"
            style={{
              color: isActive(path) ? 'var(--primary)' : 'color-mix(in srgb, var(--text) 35%, transparent)',
              transform: isActive(path) ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <span className="text-xl">{emoji}</span>
            <span className="text-xs font-bold">{label}</span>
          </Link>
        ))}

        {/* Bottone impostazioni */}
        <button
          onClick={() => setShowSettings(true)}
          className="flex flex-col items-center gap-0.5 transition-all"
          style={{ color: 'color-mix(in srgb, var(--text) 35%, transparent)' }}
        >
          <span className="text-xl">⚙️</span>
          <span className="text-xs font-bold">Tema</span>
        </button>
      </nav>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}