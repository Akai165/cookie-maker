import { useTheme } from '../contexts/ThemeContext';
import { THEME_LIST } from '../themes';

/**
 * Modale per le impostazioni dell'app.
 * Attualmente gestisce la selezione del tema.
 */
export default function SettingsModal({ onClose }) {
  const { themeId, setTheme } = useTheme();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-t-3xl p-6 pb-10 shadow-2xl"
        style={{ background: 'var(--bg-card)' }}
      >
        {/* Handle + Header */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border)' }} />
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-black" style={{ color: 'var(--text)' }}>
            ⚙️ Impostazioni
          </h2>
          <button
            onClick={onClose}
            className="text-sm font-bold px-3 py-1.5 rounded-xl transition-all"
            style={{ color: 'var(--text-soft)', background: 'var(--bg-subtle)' }}
          >
            Chiudi
          </button>
        </div>

        {/* Sezione tema */}
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-faint)' }}>
          Tema colore
        </p>
        <div className="grid grid-cols-4 gap-3">
          {THEME_LIST.map((theme) => {
            const isActive = theme.id === themeId;
            return (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all active:scale-95"
                style={{
                  background: isActive ? 'var(--primary-light)' : 'var(--bg-subtle)',
                  border: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                }}
              >
                {/* Cerchio colore */}
                <div
                  className="w-9 h-9 rounded-full shadow-sm"
                  style={{
                    background: theme.vars['--primary'],
                    outline: isActive ? `3px solid ${theme.vars['--primary']}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
                <span
                  className="text-[10px] font-bold leading-tight text-center"
                  style={{ color: isActive ? 'var(--primary-dark)' : 'var(--text-faint)' }}
                >
                  {theme.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
