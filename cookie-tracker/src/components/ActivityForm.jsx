import { useState, useEffect } from 'react';
import VerticalDigitPicker from './VerticalDigitPicker';
import { toDateString } from '../utils/dateUtils';

const GIORNI_OPTIONS = [
  { value: 'lun', label: 'Lun' },
  { value: 'mar', label: 'Mar' },
  { value: 'mer', label: 'Mer' },
  { value: 'gio', label: 'Gio' },
  { value: 'ven', label: 'Ven' },
  { value: 'sab', label: 'Sab' },
  { value: 'dom', label: 'Dom' },
];

/**
 * Modal per creare o modificare una quest / attività.
 *
 * Props:
 *   - activity: oggetto attività esistente (null per nuova)
 *   - initialDate: data opzionale di default
 *   - onSave: (data) => void
 *   - onClose: () => void
 */
export default function ActivityForm({ activity, initialDate, onSave, onClose }) {
  const [nome, setNome] = useState('');
  const [punti, setPunti] = useState(5);
  const [tipo, setTipo] = useState('oggi'); // Default a 'oggi' o 'giornaliera'
  const [giorni, setGiorni] = useState([]);
  const [hasTimer, setHasTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [saving, setSaving] = useState(false);

  // Pre-compila il form se stiamo modificando
  useEffect(() => {
    if (activity) {
      setNome(activity.nome || '');
      setPunti(activity.punti || 5);
      setTipo(activity.tipo || 'giornaliera');
      setGiorni(activity.giorni || []);
      setHasTimer(!!activity.hasTimer);
      if (activity.timerMinutes !== undefined) {
        setTimerMinutes(activity.timerMinutes);
        setTimerSeconds(activity.timerSeconds || 0);
      } else if (activity.timerDuration) {
        setTimerMinutes(Math.floor(activity.timerDuration / 60));
        setTimerSeconds(activity.timerDuration % 60);
      }
    }
  }, [activity]);

  const toggleGiorno = (g) => {
    setGiorni((prev) =>
      prev.includes(g) ? prev.filter((d) => d !== g) : [...prev, g]
    );
  };

  const totalTimerSeconds = timerMinutes * 60 + timerSeconds;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim() || punti < 1) return;
    if (tipo === 'settimanale' && giorni.length === 0) return;
    if (hasTimer && totalTimerSeconds < 1) return;

    setSaving(true);
    try {
      const targetDate = activity?.data || (initialDate ? toDateString(initialDate) : toDateString(new Date()));

      await onSave({
        nome: nome.trim(),
        punti: Number(punti),
        tipo,
        ...(tipo === 'settimanale' ? { giorni } : { giorni: [] }),
        ...(tipo === 'oggi' ? { data: targetDate } : {}),
        hasTimer: !!hasTimer,
        ...(hasTimer
          ? {
              timerMinutes: Number(timerMinutes),
              timerSeconds: Number(timerSeconds),
              timerDuration: totalTimerSeconds,
            }
          : {
              timerMinutes: 0,
              timerSeconds: 0,
              timerDuration: 0,
            }),
      });
      onClose();
    } catch (error) {
      console.error('Errore salvataggio:', error);
    } finally {
      setSaving(false);
    }
  };

  const isInvalid =
    saving ||
    !nome.trim() ||
    punti < 1 ||
    (tipo === 'settimanale' && giorni.length === 0) ||
    (hasTimer && totalTimerSeconds < 1);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay scuro */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg)' }}
      >
        {/* Pulsante Chiudi X */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all active:scale-90 hover:opacity-80 cursor-pointer shadow-sm z-10"
          style={{
            background: 'var(--bg-subtle)',
            color: 'var(--text-mid)',
            border: '1px solid var(--border)',
          }}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-5 text-center px-8" style={{ color: 'var(--text)' }}>
          {activity ? '✏️ Modifica Quest' : '🍪 Nuova Quest'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nome */}
          <div>
            <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--text-mid)' }}>
              Nome quest / attività
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Es. Leggere 15 pagine, Esercizi..."
              className="w-full p-3 rounded-xl border-2 focus:outline-none transition-colors"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text)',
              }}
              required
              autoFocus
            />
          </div>

          {/* Punti */}
          <div>
            <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--text-mid)' }}>
              Punti biscotto 🍪
            </label>
            <input
              type="number"
              value={punti}
              onChange={(e) => setPunti(e.target.value)}
              min="1"
              max="100"
              className="w-full p-3 rounded-xl border-2 focus:outline-none transition-colors"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text)',
              }}
              required
            />
          </div>

          {/* Tipo / Validità */}
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text-mid)' }}>
              Frequenza e validità
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTipo('oggi')}
                className="py-2.5 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all"
                style={
                  tipo === 'oggi'
                    ? { background: 'var(--primary)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
                    : { background: 'var(--bg-card)', color: 'var(--primary)', border: '2px solid var(--border)' }
                }
              >
                ⚡ Solo oggi
              </button>
              <button
                type="button"
                onClick={() => setTipo('giornaliera')}
                className="py-2.5 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all"
                style={
                  tipo === 'giornaliera'
                    ? { background: 'var(--primary)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
                    : { background: 'var(--bg-card)', color: 'var(--primary)', border: '2px solid var(--border)' }
                }
              >
                📅 Ogni giorno
              </button>
              <button
                type="button"
                onClick={() => setTipo('settimanale')}
                className="py-2.5 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all"
                style={
                  tipo === 'settimanale'
                    ? { background: 'var(--primary)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
                    : { background: 'var(--bg-card)', color: 'var(--primary)', border: '2px solid var(--border)' }
                }
              >
                🗓️ Settimanale
              </button>
            </div>

            {tipo === 'oggi' && (
              <p className="text-xs mt-2 px-1 font-medium" style={{ color: 'var(--text-soft)' }}>
                ⚡ Questa quest sarà valida <strong>solo per oggi</strong> e non si ripeterà nei giorni successivi.
              </p>
            )}
          </div>

          {/* Selezione giorni (solo per settimanale) */}
          {tipo === 'settimanale' && (
            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text-mid)' }}>
                In quali giorni?
              </label>
              <div className="flex gap-2 flex-wrap">
                {GIORNI_OPTIONS.map(({ value, label }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => toggleGiorno(value)}
                    className="py-2 px-3 rounded-xl text-sm font-bold transition-all"
                    style={
                      giorni.includes(value)
                        ? { background: 'var(--primary)', color: '#fff' }
                        : { background: 'var(--bg-card)', color: 'var(--primary)', border: '2px solid var(--border)' }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              {giorni.length === 0 && (
                <p className="text-xs text-red-400 mt-1">Seleziona almeno un giorno</p>
              )}
            </div>
          )}

          {/* Opzione Timer */}
          <div
            className="p-3.5 rounded-2xl border transition-all"
            style={{
              background: 'var(--bg-card)',
              borderColor: hasTimer ? 'var(--primary)' : 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">⏱️</span>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                    Timer per la quest
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-mid)' }}>
                    Attiva conto alla rovescia a schermo intero
                  </div>
                </div>
              </div>

              {/* Switch Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={hasTimer}
                onClick={() => setHasTimer(!hasTimer)}
                className="w-12 h-7 rounded-full p-1 transition-colors relative cursor-pointer"
                style={{
                  background: hasTimer ? 'var(--primary)' : 'var(--border)',
                }}
              >
                <div
                  className="w-5 h-5 rounded-full bg-white transition-transform shadow-md"
                  style={{
                    transform: hasTimer ? 'translateX(20px)' : 'translateX(0)',
                  }}
                />
              </button>
            </div>

            {hasTimer && (
              <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <label
                  className="text-xs font-bold uppercase tracking-wider block mb-2 text-center"
                  style={{ color: 'var(--primary-dark)' }}
                >
                  Imposta minuti e secondi
                </label>
                <VerticalDigitPicker
                  minutes={timerMinutes}
                  seconds={timerSeconds}
                  onChange={({ minutes, seconds }) => {
                    setTimerMinutes(minutes);
                    setTimerSeconds(seconds);
                  }}
                />
                {totalTimerSeconds === 0 && (
                  <p className="text-xs text-red-500 font-semibold text-center mt-2">
                    Imposta un tempo superiore a 0 secondi
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Preview punteggio */}
          <div
            className="rounded-xl p-3 text-center"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
          >
            <span className="text-sm" style={{ color: 'var(--text-mid)' }}>
              Completando guadagni:{' '}
            </span>
            <span className="font-black text-lg" style={{ color: 'var(--primary)' }}>
              +{punti || 0} 🍪
            </span>
          </div>

          {/* Bottoni azione */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold border-2 transition-all"
              style={{
                color: 'var(--primary)',
                background: 'var(--bg-card)',
                borderColor: 'var(--border)',
              }}
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isInvalid}
              className="flex-1 py-3 rounded-xl font-bold text-white transition-all active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--primary)' }}
            >
              {saving ? '...' : activity ? 'Salva ✓' : 'Crea 🍪'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
