import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useActivities } from '../hooks/useActivities';
import { useCompletions } from '../hooks/useCompletions';
import { useMilestones } from '../hooks/useMilestones';
import Calendar from '../components/Calendar';
import TaskCard from '../components/TaskCard';
import FullScreenTimer from '../components/FullScreenTimer';
import ActivityForm from '../components/ActivityForm';
import { isToday, MESI } from '../utils/dateUtils';

const GIORNI_LABEL_FULL = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { biscotti, loading: profileLoading } = useProfile(user?.uid);
  const { getActivitiesForDay, addActivity, loading: actLoading } = useActivities(user?.uid);
  const {
    completeActivity, uncompleteActivity, findCompletion,
    getCompletedDays, getMonthlyTotal, loading: compLoading,
  } = useCompletionsWithProfile(user?.uid);
  const { milestones, loading: milestonesLoading } = useMilestones(user?.uid);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTimerTask, setActiveTimerTask] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const loading = profileLoading || actLoading || compLoading || milestonesLoading;

  // Attività del giorno selezionato
  const dayActivities = getActivitiesForDay(selectedDate);
  const completedDays = getCompletedDays();

  // Conta completamenti del giorno
  const completedCount = dayActivities.filter((t) => findCompletion(t.id, selectedDate)).length;
  const totalCount = dayActivities.length;
  const allDone = totalCount > 0 && completedCount === totalCount;

  // Totale mensile (basato sul mese della data selezionata)
  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();
  const monthlyTotal = getMonthlyTotal(selectedYear, selectedMonth);

  // Formattazione data
  const isTodaySelected = isToday(selectedDate);
  const dateLabel = isTodaySelected
    ? 'Oggi'
    : `${GIORNI_LABEL_FULL[selectedDate.getDay()]} ${selectedDate.getDate()} ${MESI[selectedDate.getMonth()]}`;

  const handleComplete = async (task) => {
    await completeActivity(task.id, task.punti, selectedDate);
  };

  const handleUncomplete = async (task) => {
    const completion = findCompletion(task.id, selectedDate);
    if (completion) {
      await uncompleteActivity(completion.id, completion.punti);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-24 font-sans" style={{ background: 'var(--bg)' }}>
      {/* Header con logout */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium truncate" style={{ color: 'var(--text-faint)' }}>
          {user?.displayName?.split(' ')[0] || 'Ciao'} 👋
        </span>
        <button
          onClick={logout}
          className="text-xs font-medium px-2 py-1 rounded-lg transition-all"
          style={{ color: 'var(--text-faint)' }}
        >
          Esci
        </button>
      </div>

      {/* Barattolo biscotti */}
      <div
        className="flex flex-col items-center justify-center p-6 rounded-3xl shadow-md mb-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
      >
        <h1 className="text-lg font-extrabold mb-2 tracking-wide" style={{ color: 'var(--text)' }}>
          Il tuo barattolo:
        </h1>
        <div className="text-5xl font-black flex items-center gap-2 drop-shadow-sm" style={{ color: 'var(--primary)' }}>
          {loading ? '...' : biscotti}
          <span className="text-4xl animate-bounce">🍪</span>
        </div>
      </div>

      {/* Traguardi mensili */}
      {milestones.length > 0 && (
        <div
          className="rounded-2xl shadow-sm p-4 mb-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>
              🏆 {MESI[selectedMonth]}
            </h2>
            <span
              className="text-sm font-bold px-2.5 py-1 rounded-full"
              style={{ color: 'var(--primary-dark)', background: 'var(--primary-light)' }}
            >
              {monthlyTotal} 🍪
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {milestones.map((m) => {
              const progress = Math.min(monthlyTotal / m.soglia, 1);
              const unlocked = monthlyTotal >= m.soglia;

              return (
                <div key={m.id} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      {m.emoji} {m.nome}
                    </span>
                    {unlocked ? (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        ✅ Sbloccato!
                      </span>
                    ) : (
                      <span className="text-xs font-medium" style={{ color: 'var(--primary-muted)' }}>
                        {monthlyTotal}/{m.soglia} 🍪
                      </span>
                    )}
                  </div>
                  <div className="w-full rounded-full h-2.5" style={{ background: 'var(--primary-light)' }}>
                    <div
                      className="h-2.5 rounded-full transition-all duration-700"
                      style={{
                        width: `${progress * 100}%`,
                        background: unlocked ? '#4ade80' : 'var(--primary)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendario */}
      <Calendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        completedDays={completedDays}
      />

      {/* Titolo giorno + bottone rapido + progress */}
      <div className="flex justify-between items-center mb-3 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            {dateLabel}
          </h2>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="text-xs font-bold px-2.5 py-1 rounded-xl transition-all active:scale-95 shadow-sm text-white flex items-center gap-1"
            style={{ background: 'var(--primary)' }}
            title="Aggiungi quest per questo giorno"
          >
            <span>+ Quest</span>
          </button>
        </div>
        {totalCount > 0 && (
          <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
            {completedCount}/{totalCount} ✓
          </span>
        )}
      </div>

      {/* Barra di progresso giornaliera */}
      {totalCount > 0 && (
        <div className="w-full rounded-full h-2 mb-4" style={{ background: 'var(--primary-light)' }}>
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${(completedCount / totalCount) * 100}%`,
              background: 'var(--primary)',
            }}
          />
        </div>
      )}

      {/* Lista attività */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-8" style={{ color: 'var(--primary-muted)' }}>Caricamento... 🍪</div>
        ) : dayActivities.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center shadow-inner"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
          >
            <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-mid)' }}>
              {isTodaySelected ? 'Nessuna quest per oggi' : 'Nessuna quest per questo giorno'}
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-soft)' }}>
              Aggiungi una quest con o senza timer per iniziare!
            </p>
            <button
              onClick={() => setShowQuickAdd(true)}
              className="text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all active:scale-95 text-sm"
              style={{ background: 'var(--primary)' }}
            >
              + Crea Quest per {isTodaySelected ? 'Oggi' : 'questo giorno'} 🍪
            </button>
          </div>
        ) : (
          <>
            {dayActivities.map((task) => {
              const completion = findCompletion(task.id, selectedDate);
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  isCompleted={!!completion}
                  onComplete={() => handleComplete(task)}
                  onUncomplete={() => handleUncomplete(task)}
                  onStartTimer={(t) => setActiveTimerTask(t)}
                />
              );
            })}

            {allDone && (
              <div className="bg-green-50 rounded-2xl p-6 text-center border border-green-200 shadow-inner mt-2">
                <p className="text-lg font-bold text-green-800 mb-1">Tutto fatto!</p>
                <p className="text-3xl">Bravissim*! 🎉🍪</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Timer a schermo intero */}
      {activeTimerTask && (
        <FullScreenTimer
          task={activeTimerTask}
          onComplete={async (task) => {
            await handleComplete(task);
          }}
          onClose={() => setActiveTimerTask(null)}
        />
      )}

      {/* Modal creazione rapida */}
      {showQuickAdd && (
        <ActivityForm
          initialDate={selectedDate}
          onSave={async (data) => {
            await addActivity(data);
          }}
          onClose={() => setShowQuickAdd(false)}
        />
      )}
    </div>
  );
}

/**
 * Hook wrapper che combina useCompletions con useProfile
 * per aggiornare i biscotti atomicamente con i completamenti.
 */
function useCompletionsWithProfile(userId) {
  const { completeActivity: rawComplete, uncompleteActivity: rawUncomplete, ...rest } = useCompletions(userId);
  const { addBiscotti, spendBiscotti } = useProfile(userId);

  const completeActivity = async (activityId, punti, date) => {
    await rawComplete(activityId, punti, date);
    await addBiscotti(punti);
  };

  const uncompleteActivity = async (completionId, punti) => {
    await rawUncomplete(completionId);
    await spendBiscotti(punti);
  };

  return { completeActivity, uncompleteActivity, addBiscotti, spendBiscotti, ...rest };
}