import { useState, useEffect } from 'react';

const EMOJI_SUGGESTIONS = ['🎮', '🧶', '📖', '🎬', '🍕', '🛋️', '🎵', '🎨', '🏃', '☕', '🍰', '🎭', '🧩', '🎪', '🛍️', '🌸'];

/**
 * Modal per creare o modificare un premio.
 *
 * Props:
 *   - reward: oggetto premio esistente (null per nuovo)
 *   - onSave: (data) => void
 *   - onClose: () => void
 */
export default function RewardForm({ reward, onSave, onClose }) {
  const [nome, setNome] = useState('');
  const [costo, setCosto] = useState(10);
  const [emoji, setEmoji] = useState('🎁');
  const [saving, setSaving] = useState(false);

  // Pre-compila se stiamo modificando
  useEffect(() => {
    if (reward) {
      setNome(reward.nome || '');
      setCosto(reward.costo || 10);
      setEmoji(reward.emoji || '🎁');
    }
  }, [reward]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim() || costo < 1) return;

    setSaving(true);
    try {
      await onSave({
        nome: nome.trim(),
        costo: Number(costo),
        emoji,
      });
      onClose();
    } catch (error) {
      console.error('Errore salvataggio premio:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#FFF8EE] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-orange-900 mb-5 text-center">
          {reward ? '✏️ Modifica Premio' : '🎁 Nuovo Premio'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Emoji */}
          <div>
            <label className="text-sm font-semibold text-orange-800 mb-2 block">
              Scegli un'icona
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
              {EMOJI_SUGGESTIONS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`text-2xl p-2 rounded-xl transition-all ${
                    emoji === e
                      ? 'bg-orange-200 scale-110 shadow-sm'
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
              Nome del premio
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Es. 1h Nintendo Switch"
              className="w-full p-3 rounded-xl border-2 border-orange-200 bg-white focus:border-orange-400 focus:outline-none text-orange-950 placeholder:text-orange-300 transition-colors"
              required
              autoFocus
            />
          </div>

          {/* Costo */}
          <div>
            <label className="text-sm font-semibold text-orange-800 mb-1 block">
              Costo in biscotti 🍪
            </label>
            <input
              type="number"
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              min="1"
              max="1000"
              className="w-full p-3 rounded-xl border-2 border-orange-200 bg-white focus:border-orange-400 focus:outline-none text-orange-950 transition-colors"
              required
            />
          </div>

          {/* Preview */}
          <div className="bg-orange-100/50 rounded-xl p-4 text-center border border-orange-200">
            <div className="text-3xl mb-1">{emoji}</div>
            <div className="font-bold text-orange-900">{nome || '...'}</div>
            <div className="text-sm text-orange-600 font-semibold mt-1">Costa {costo || 0} 🍪</div>
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
              disabled={saving || !nome.trim() || costo < 1}
              className="flex-1 py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '...' : reward ? 'Salva ✓' : 'Crea 🎁'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
