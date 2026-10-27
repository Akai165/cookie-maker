import { useState, useEffect, useRef } from 'react';
import { playCelebrationSound, playTimerFinishSound } from '../utils/soundUtils';

/**
 * Timer a schermo intero per una quest.
 *
 * Props:
 *   - task: { id, nome, punti, timerDuration, timerMinutes, timerSeconds }
 *   - onComplete: () => Promise<void> | void
 *   - onClose: () => void
 */
export default function FullScreenTimer({ task, onComplete, onClose }) {
  const totalSeconds = Math.max(
    1,
    task.timerDuration || (task.timerMinutes || 0) * 60 + (task.timerSeconds || 0) || 60
  );

  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  const targetEndTimeRef = useRef(null);

  // Inizializza targetEndTime al montaggio
  useEffect(() => {
    targetEndTimeRef.current = Date.now() + totalSeconds * 1000;
  }, [totalSeconds]);

  // Gestione timer ad alta precisione con timestamp
  useEffect(() => {
    if (!isRunning || isFinished) return;

    if (!targetEndTimeRef.current) {
      targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((targetEndTimeRef.current - now) / 1000));

      setRemainingSeconds(diff);

      if (diff <= 0) {
        clearInterval(interval);
        setIsRunning(false);
        setIsFinished(true);
        if (soundEnabled) {
          playTimerFinishSound();
        }
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate([200, 100, 200, 100, 400]);
          } catch {
            // ignora
          }
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isRunning, isFinished, soundEnabled, remainingSeconds]);

  const togglePause = () => {
    if (isFinished) return;
    if (isRunning) {
      setIsRunning(false);
    } else {
      targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsFinished(false);
    setRemainingSeconds(totalSeconds);
    targetEndTimeRef.current = Date.now() + totalSeconds * 1000;
  };

  const handleFinishEarlyOrComplete = async () => {
    if (completing) return;
    setCompleting(true);
    if (soundEnabled) {
      playCelebrationSound();
    }
    setShowCelebration(true);

    try {
      await onComplete(task);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (e) {
      console.error('Errore completamento quest con timer:', e);
      setCompleting(false);
      setShowCelebration(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Vuoi annullare il timer? La quest non verrà completata.')) {
      onClose();
    }
  };

  // Formatta mm:ss
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Calcolo progresso circolare (0 = inizio, 1 = completato)
  const progress = 1 - remainingSeconds / totalSeconds;
  const radius = 105;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between p-6 select-none overflow-y-auto"
      style={{
        background: 'var(--bg)',
        color: 'var(--text)',
      }}
    >
      {/* Overlay celebrazione animata al completamento */}
      {showCelebration && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in text-white p-6">
          <div className="text-7xl animate-bounce mb-4">🍪🎉</div>
          <h2 className="text-3xl font-black mb-2 text-center">Quest Completata!</h2>
          <p className="text-xl font-bold text-yellow-300">+{task.punti} Biscotti guadagnati!</p>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-md mx-auto">
        <button
          type="button"
          onClick={handleCancel}
          className="text-xs font-bold px-3 py-1.5 rounded-xl border transition-all active:scale-95"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-mid)',
          }}
        >
          ✕ Annulla
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-red-500 animate-ping' : 'bg-yellow-500'}`} />
          {isFinished ? 'TEMPO COMPLETATO' : isRunning ? 'QUEST IN CORSO' : 'IN PAUSA'}
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-base p-1.5 rounded-xl border transition-all"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-mid)',
          }}
          title={soundEnabled ? 'Disattiva suoni' : 'Attiva suoni'}
        >
          {soundEnabled ? '🔔' : '🔕'}
        </button>
      </div>

      {/* Corpo centrale con anello circolare e timer */}
      <div className="flex flex-col items-center justify-center my-auto w-full max-w-md mx-auto">
        {/* Titolo quest */}
        <div className="text-center mb-6 px-4">
          <span
            className="text-xs font-bold uppercase tracking-wider block mb-1"
            style={{ color: 'var(--primary)' }}
          >
            Obiettivo
          </span>
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight line-clamp-2"
            style={{ color: 'var(--text)' }}
          >
            {task.nome}
          </h1>
          <div
            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-sm font-black shadow-sm"
            style={{ background: 'var(--bg-card)', color: 'var(--primary)' }}
          >
            Premio: +{task.punti} 🍪
          </div>
        </div>

        {/* Cerchio SVG del conto alla rovescia */}
        <div className="relative flex items-center justify-center my-4">
          <svg className="w-64 h-64 -rotate-90 transform" viewBox="0 0 240 240">
            {/* Traccia di sfondo */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="transparent"
              stroke="var(--bg-subtle)"
              strokeWidth="14"
            />
            {/* Traccia di avanzamento */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="transparent"
              stroke={isFinished ? '#22c55e' : 'var(--primary)'}
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>

          {/* Testo centrale con orologio */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl mb-1 animate-pulse">🍪</span>
            <span
              className="font-black tracking-tight"
              style={{
                fontSize: mins >= 100 ? '2.5rem' : '3.25rem',
                color: isFinished ? '#16a34a' : 'var(--primary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {timeFormatted}
            </span>
            <span
              className="text-xs font-bold uppercase tracking-wider mt-1"
              style={{ color: 'var(--text-faint)' }}
            >
              {isFinished ? 'Ottimo lavoro!' : isRunning ? 'Rimani concentrato' : 'In pausa'}
            </span>
          </div>
        </div>

        {/* Controlli Pausa / Riavvia */}
        <div className="flex items-center gap-3 mt-4">
          {!isFinished && (
            <button
              type="button"
              onClick={togglePause}
              className="px-5 py-2.5 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
            >
              {isRunning ? '⏸️ Pausa' : '▶️ Riprendi'}
            </button>
          )}

          <button
            type="button"
            onClick={resetTimer}
            className="px-4 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center gap-1.5"
            style={{
              background: 'var(--bg-subtle)',
              color: 'var(--text-mid)',
            }}
          >
            🔄 Riavvia
          </button>
        </div>
      </div>

      {/* Azione inferiore: Bottone per finire prima o completare */}
      <div className="w-full max-w-md mx-auto pt-4 flex flex-col gap-2.5">
        {isFinished ? (
          <button
            type="button"
            disabled={completing}
            onClick={handleFinishEarlyOrComplete}
            className="w-full py-4 rounded-2xl font-black text-white text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 animate-pulse"
          >
            🎉 Completa Quest (+{task.punti} 🍪)
          </button>
        ) : (
          <button
            type="button"
            disabled={completing}
            onClick={handleFinishEarlyOrComplete}
            className="w-full py-4 rounded-2xl font-black text-white text-base sm:text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            style={{
              background: 'var(--primary)',
            }}
          >
            Finito!
          </button>
        )}

        <p className="text-center text-xs font-semibold" style={{ color: 'var(--text-faint)' }}>
          {isFinished
            ? 'Tempo scaduto! Clicca per incassare i biscotti 🍪'
            : 'Puoi completare la quest in qualunque momento se finisci prima'}
        </p>
      </div>
    </div>
  );
}
