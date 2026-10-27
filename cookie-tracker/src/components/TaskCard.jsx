/**
 * Card per una singola quest/attività nella lista del giorno.
 *
 * Props:
 *   - task: { id, nome, punti, tipo, giorni?, hasTimer?, timerMinutes?, timerSeconds?, timerDuration? }
 *   - isCompleted: boolean
 *   - onComplete: () => void
 *   - onUncomplete: () => void
 *   - onStartTimer: (task) => void
 */
export default function TaskCard({
  task,
  isCompleted,
  onComplete,
  onUncomplete,
  onStartTimer,
}) {
  const hasTimer = !!task.hasTimer && (task.timerDuration > 0 || task.timerMinutes > 0 || task.timerSeconds > 0);
  const totalSecs = task.timerDuration || (task.timerMinutes || 0) * 60 + (task.timerSeconds || 0);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const timerLabel = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div
      className="flex justify-between items-center p-3.5 sm:p-4 rounded-2xl border transition-all"
      style={
        isCompleted
          ? { background: '#f0fdf4', borderColor: '#bbf7d0', opacity: 0.85 }
          : { background: 'var(--bg-card)', borderColor: 'var(--border-card)', boxShadow: 'none' }
      }
    >
      <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
        {/* Indicatore stato */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
          style={
            isCompleted
              ? { background: '#bbf7d0', color: '#15803d' }
              : { background: 'var(--primary-light)', color: 'var(--primary)' }
          }
        >
          {isCompleted ? '✓' : '○'}
        </div>

        {/* Info task */}
        <div className="flex flex-col min-w-0">
          <span
            className="font-semibold text-base truncate"
            style={
              isCompleted
                ? { textDecoration: 'line-through', color: '#16a34a' }
                : { color: 'var(--text)' }
            }
          >
            {task.nome}
          </span>

          {/* Badge informativi */}
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {hasTimer && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: isCompleted ? '#dcfce7' : 'var(--primary-light)',
                  color: isCompleted ? '#166534' : 'var(--primary-dark)',
                }}
              >
                ⏱️ {timerLabel}
              </span>
            )}
            {task.tipo === 'oggi' && (
              <span
                className="inline-flex items-center gap-0.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: isCompleted ? '#dcfce7' : 'var(--bg-subtle)',
                  color: isCompleted ? '#166534' : 'var(--text-soft)',
                }}
              >
                ⚡ Solo oggi
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottone completa/annulla o avvia timer */}
      {isCompleted ? (
        <button
          onClick={onUncomplete}
          className="text-sm text-green-600 hover:text-red-500 font-medium px-3 py-1.5 rounded-xl hover:bg-red-50 transition-all shrink-0"
        >
          Annulla
        </button>
      ) : hasTimer ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onStartTimer && onStartTimer(task)}
            className="text-white font-black py-2 px-3 rounded-xl transition-all active:scale-95 shadow-sm flex items-center gap-1 text-xs sm:text-sm"
            style={{ background: 'var(--primary)' }}
          >
            <span>▶️ Avvia</span>
            <span className="opacity-90 font-normal hidden xs:inline">({timerLabel})</span>
          </button>
          <button
            onClick={onComplete}
            className="text-xs font-bold py-2 px-2.5 rounded-xl border transition-all active:scale-95"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--primary)',
              background: 'var(--bg-card)',
            }}
            title="Completa direttamente senza timer"
          >
            +{task.punti} 🍪
          </button>
        </div>
      ) : (
        <button
          onClick={onComplete}
          className="text-white font-bold py-2 px-4 rounded-xl transition-all active:scale-95 shadow-sm shrink-0 text-sm"
          style={{ background: 'var(--primary)' }}
        >
          +{task.punti} 🍪
        </button>
      )}
    </div>
  );
}
