/**
 * Card per una singola attività nella lista del giorno.
 *
 * Props:
 *   - task: { id, nome, punti, tipo, giorni? }
 *   - isCompleted: boolean
 *   - onComplete: () => void
 *   - onUncomplete: () => void
 */
export default function TaskCard({ task, isCompleted, onComplete, onUncomplete }) {
  return (
    <div
      className={`
        flex justify-between items-center p-4 rounded-2xl border transition-all
        ${isCompleted
          ? 'bg-green-50 border-green-200 opacity-75'
          : 'bg-white border-orange-100 hover:shadow-md'
        }
      `}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Indicatore stato */}
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0
            ${isCompleted
              ? 'bg-green-200 text-green-700'
              : 'bg-orange-100 text-orange-500'
            }
          `}
        >
          {isCompleted ? '✓' : '○'}
        </div>

        {/* Nome task */}
        <span
          className={`
            font-semibold text-base truncate
            ${isCompleted ? 'line-through text-green-700' : 'text-amber-950'}
          `}
        >
          {task.nome}
        </span>
      </div>

      {/* Bottone completa/annulla */}
      {isCompleted ? (
        <button
          onClick={onUncomplete}
          className="text-sm text-green-600 hover:text-red-500 font-medium px-3 py-1.5 rounded-xl hover:bg-red-50 transition-all shrink-0"
        >
          Annulla
        </button>
      ) : (
        <button
          onClick={onComplete}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl transition-all active:scale-95 shadow-sm shrink-0 text-sm"
        >
          +{task.punti} 🍪
        </button>
      )}
    </div>
  );
}
