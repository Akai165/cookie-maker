import { useState, useEffect } from 'react';

const EMOJI_SUGGESTIONS = ['🎬', '🎮', '🧶', '📖', '🍕', '🏖️', '🎉', '🎂', '🛋️', '🎵', '🏆', '⭐', '🌟', '💎', '👑', '🎯'];

/**
 * Modal per creare o modificare un traguardo mensile.
 *
 * Props:
 *   - milestone: oggetto esistente (null per nuovo)
 *   - onSave: (data) => void
 *   - onClose: () => void
 */
export default function MilestoneForm({ milestone, onSave, onClose }) {
  const [nome, setNome] = useState('');
  const [soglia, setSoglia] = useState(100);
  const [emoji, setEmoji] = useState('🏆');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (milestone) {
      setNome(milestone.nome || '');
      setSoglia(milestone.soglia || 100);
      setEmoji(milestone.emoji || '🏆');
    }
  }, [milestone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim() || soglia < 1) return;

    setSaving(true);
    try {
      await onSave({
        nome: nome.trim(),
        soglia: Number(soglia),
        emoji,
      });
      onClose();
    } catch (error) {
      console.error('Errore salvataggio traguardo:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#FFF8EE] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-orange-900 mb-5 text-center">
          {milestone ? '✏️ Modifica Traguardo' : '🏆 Nuovo Traguardo'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Emoji */}
          <div>
            <label className="text-sm font-semibold text-orange-800 mb-2 block">
              Scegli un'icona
            </label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_SUGGESTIONS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`text-2xl p-2 rounded-xl transition-all ${
                    emoji === e
                      ? 'bg-amber-200 scale-110 shadow-sm'
                      : 'bg-white hover:bg-orange-50 border border-orange-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="text-sm font-semibold text-orange-800 mb-1 block">
              Nome del traguardo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Es. Serata film"
              className="w-full p-3 rounded-xl border-2 border-orange-200 bg-white focus:border-orange-400 focus:outline-none text-orange-950 placeholder:text-orange-300 transition-colors"
              required
              autoFocus
            />
          </div>

          {/* Soglia */}
          <div>
            <label className="text-sm font-semibold text-orange-800 mb-1 block">
              Biscotti necessari nel mese 🍪
            </label>
            <input
              type="number"
              value={soglia}
              onChange={(e) => setSoglia(e.target.value)}
              min="1"
              max="10000"
              className="w-full p-3 rounded-xl border-2 border-orange-200 bg-white focus:border-orange-400 focus:outline-none text-orange-950 transition-colors"
              required
            />
          </div>

          {/* Preview */}
          <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-200">
            <div className="text-3xl mb-1">{emoji}</div>
            <div className="font-bold text-orange-900">{nome || '...'}</div>
            <div className="text-sm text-amber-700 font-semibold mt-1">
              Si sblocca con {soglia || 0} 🍪 guadagnati nel mese
            </div>
          </div>

          {/* Bottoni */}
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
              disabled={saving || !nome.trim() || soglia < 1}
              className="flex-1 py-3 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '...' : milestone ? 'Salva ✓' : 'Crea 🏆'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
