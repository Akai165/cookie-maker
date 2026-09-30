/**
 * Card per un premio nello shop.
 *
 * Props:
 *   - reward: { id, nome, costo, emoji }
 *   - biscotti: number — saldo attuale
 *   - onBuy: () => void
 *   - onEdit: () => void
 *   - onDelete: () => void
 */
export default function RewardCard({ reward, biscotti, onBuy, onEdit, onDelete }) {
  const canAfford = biscotti >= reward.costo;
  const deficit = reward.costo - biscotti;

  return (
    <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm hover:shadow-md transition-all">
      {/* Emoji e nome */}
      <div className="text-center mb-3">
        <div className="text-4xl mb-2">{reward.emoji || '🎁'}</div>
        <h3 className="font-bold text-orange-950 text-lg">{reward.nome}</h3>
      </div>

      {/* Costo */}
      <div className="text-center mb-4">
        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full text-sm">
          {reward.costo} 🍪
        </span>
      </div>

      {/* Bottone Compra */}
      <button
        onClick={onBuy}
        disabled={!canAfford}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
          canAfford
            ? 'bg-green-500 hover:bg-green-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {canAfford ? '🛒 Compra!' : `Ti servono ${deficit} 🍪 in più`}
      </button>

      {/* Bottoni modifica/elimina */}
      <div className="flex gap-2 mt-3 justify-center">
        <button
          onClick={onEdit}
          className="text-xs text-orange-400 hover:text-orange-600 font-medium px-2 py-1 rounded-lg hover:bg-orange-50 transition-all"
        >
          ✏️ Modifica
        </button>
        <button
          onClick={onDelete}
          className="text-xs text-red-300 hover:text-red-500 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
        >
          🗑️ Elimina
        </button>
      </div>
    </div>
  );
}
