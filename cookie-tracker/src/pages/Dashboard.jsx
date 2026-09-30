import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useActivities } from '../hooks/useActivities';
import { useCompletions } from '../hooks/useCompletions';
import { useMilestones } from '../hooks/useMilestones';
import Calendar from '../components/Calendar';
import TaskCard from '../components/TaskCard';
import { isToday, toDateString, MESI, GIORNI } from '../utils/dateUtils';

const GIORNI_LABEL_FULL = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { biscotti, sesso, loading: profileLoading } = useProfile(user?.uid);
  const { getActivitiesForDay, loading: actLoading } = useActivities(user?.uid);
  const {
    completeActivity, uncompleteActivity, findCompletion,
    getCompletedDays, getMonthlyTotal, loading: compLoading,
  } = useCompletionsWithProfile(user?.uid);
  const { milestones, loading: milestonesLoading } = useMilestones(user?.uid);

  const [selectedDate, setSelectedDate] = useState(new Date());

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
    <div className="min-h-screen bg-[#FFF8EE] p-4 pb-24 font-sans">
      {/* Header con logout */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-orange-400 truncate">
          {user?.displayName?.split(' ')[0] || 'Ciao'} 👋
        </span>
        <button
          onClick={logout}
          className="text-xs text-orange-300 hover:text-orange-600 font-medium px-2 py-1 rounded-lg hover:bg-orange-50 transition-all"
        >
          Esci
        </button>
      </div>

      {/* Barattolo biscotti */}
      <div className="flex flex-col items-center justify-center bg-white p-6 rounded-3xl shadow-md border border-orange-100 mb-6">
        <h1 className="text-lg font-extrabold text-orange-900 mb-2 tracking-wide">
          Il tuo barattolo:
        </h1>
        <div className="text-5xl font-black text-orange-500 flex items-center gap-2 drop-shadow-sm">
          {loading ? '...' : biscotti}
          <span className="text-4xl animate-bounce">🍪</span>
        </div>
      </div>

      {/* Traguardi mensili */}
      {milestones.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-amber-900">
              🏆 {MESI[selectedMonth]}
            </h2>
            <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
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
                    <span className="text-sm font-semibold text-amber-950">
                      {m.emoji} {m.nome}
                    </span>
                    {unlocked ? (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        ✅ Sbloccato!
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-500">
                        {monthlyTotal}/{m.soglia} 🍪
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-amber-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-700 ${
                        unlocked ? 'bg-green-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${progress * 100}%` }}
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

      {/* Titolo giorno + progress */}
      <div className="flex justify-between items-center mb-3 px-1">
        <h2 className="text-xl font-bold text-orange-950">
          {dateLabel}
        </h2>
        {totalCount > 0 && (
          <span className="text-sm font-semibold text-orange-500">
            {completedCount}/{totalCount} ✓
          </span>
        )}
      </div>

      {/* Barra di progresso giornaliera */}
      {totalCount > 0 && (
        <div className="w-full bg-orange-100 rounded-full h-2 mb-4">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      {/* Lista attività */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-center text-orange-400 py-8">Caricamento... 🍪</div>
        ) : dayActivities.length === 0 ? (
          <div className="bg-orange-100/50 rounded-2xl p-8 text-center border border-orange-200 shadow-inner">
            <p className="text-lg font-bold text-orange-800 mb-2">
              {isTodaySelected ? 'Nessuna attività per oggi' : 'Nessuna attività per questo giorno'}
            </p>
            <p className="text-2xl">
              {isTodaySelected ? 'Vai al Forno per crearne una! 📝' : '📅'}
            </p>
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