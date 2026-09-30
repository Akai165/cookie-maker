import { useState, useEffect } from 'react';

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
 * Modal per creare o modificare un'attività.
 *
 * Props:
 *   - activity: oggetto attività esistente (null per nuova)
 *   - onSave: (data) => void
 *   - onClose: () => void
 */
export default function ActivityForm({ activity, onSave, onClose }) {
  const [nome, setNome] = useState('');
  const [punti, setPunti] = useState(5);
  const [tipo, setTipo] = useState('giornaliera');
  const [giorni, setGiorni] = useState([]);
  const [saving, setSaving] = useState(false);

  // Pre-compila il form se stiamo modificando
  useEffect(() => {
    if (activity) {
      setNome(activity.nome || '');
      setPunti(activity.punti || 5);
      setTipo(activity.tipo || 'giornaliera');
      setGiorni(activity.giorni || []);
    }
  }, [activity]);

  const toggleGiorno = (g) => {
    setGiorni((prev) =>
      prev.includes(g) ? prev.filter((d) => d !== g) : [...prev, g]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim() || punti < 1) return;

    setSaving(true);
    try {
      await onSave({
        nome: nome.trim(),
        punti: Number(punti),
        tipo,
        ...(tipo === 'settimanale' ? { giorni } : { giorni: [] }),
      });
      onClose();
    } catch (error) {
      console.error('Errore salvataggio:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay scuro */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#FFF8EE] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-orange-900 mb-5 text-center">
          {activity ? '✏️ Modifica Attività' : '🍪 Nuova Attività'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nome */}
          <div>
            <label className="text-sm font-semibold text-orange-800 mb-1 block">
              Nome attività
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Es. Rifare il letto"
              className="w-full p-3 rounded-xl border-2 border-orange-200 bg-white focus:border-orange-400 focus:outline-none text-orange-950 placeholder:text-orange-300 transition-colors"
              required
              autoFocus
            />
          </div>

          {/* Punti */}
          <div>
            <label className="text-sm font-semibold text-orange-800 mb-1 block">
              Punti biscotto 🍪
            </label>
            <input
              type="number"
              value={punti}
              onChange={(e) => setPunti(e.target.value)}
              min="1"
              max="100"
              className="w-full p-3 rounded-xl border-2 border-orange-200 bg-white focus:border-orange-400 focus:outline-none text-orange-950 transition-colors"
              required
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="text-sm font-semibold text-orange-800 mb-2 block">
              Frequenza
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTipo('giornaliera')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                  tipo === 'giornaliera'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-orange-700 border-2 border-orange-200 hover:border-orange-300'
                }`}
              >
                📅 Giornaliera
              </button>
              <button
                type="button"
                onClick={() => setTipo('settimanale')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                  tipo === 'settimanale'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-orange-700 border-2 border-orange-200 hover:border-orange-300'
                }`}
              >
                🗓️ Settimanale
              </button>
            </div>
          </div>

          {/* Selezione giorni (solo per settimanale) */}
          {tipo === 'settimanale' && (
            <div>
              <label className="text-sm font-semibold text-orange-800 mb-2 block">
                In quali giorni?
              </label>
              <div className="flex gap-2 flex-wrap">
                {GIORNI_OPTIONS.map(({ value, label }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => toggleGiorno(value)}
                    className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${
                      giorni.includes(value)
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-white text-orange-600 border-2 border-orange-200 hover:border-orange-300'
                    }`}
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

          {/* Preview punteggio */}
          <div className="bg-orange-100/50 rounded-xl p-3 text-center border border-orange-200">
            <span className="text-sm text-orange-700">Completando guadagni: </span>
            <span className="font-black text-orange-600 text-lg">+{punti || 0} 🍪</span>
          </div>

          {/* Bottoni azione */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-orange-600 bg-white border-2 border-orange-200 hover:bg-orange-50 transition-all"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={saving || !nome.trim() || punti < 1 || (tipo === 'settimanale' && giorni.length === 0)}
              className="flex-1 py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '...' : activity ? 'Salva ✓' : 'Crea 🍪'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
