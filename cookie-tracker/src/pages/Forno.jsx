import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActivities } from '../hooks/useActivities';
import ActivityForm from '../components/ActivityForm';
import { toDateString } from '../utils/dateUtils';

const GIORNI_LABEL = {
  lun: 'Lun', mar: 'Mar', mer: 'Mer',
  gio: 'Gio', ven: 'Ven', sab: 'Sab', dom: 'Dom',
};

/**
 * Pagina "Il Forno" — dove si creano e gestiscono le quest e attività.
 */
export default function Forno() {
  const { user } = useAuth();
  const { activities, loading, addActivity, updateActivity, deleteActivity } = useActivities(user?.uid);

  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  // Separa per tipologia
  const soloOggi = activities.filter((a) => a.tipo === 'oggi');
  const giornaliere = activities.filter((a) => a.tipo === 'giornaliera');
  const settimanali = activities.filter((a) => a.tipo === 'settimanale');

  const handleSave = async (data) => {
    if (editingActivity) {
      await updateActivity(editingActivity.id, data);
    } else {
      await addActivity(data);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setShowForm(true);
  };

  const handleDelete = async (activity) => {
    if (window.confirm(`Eliminare "${activity.nome}"?`)) {
      await deleteActivity(activity.id);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingActivity(null);
  };

  return (
    <div className="min-h-screen p-4 pb-24 font-sans" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Il Forno 📝</h1>
        <button
          onClick={() => setShowForm(true)}
          className="text-white font-bold py-2.5 px-5 rounded-xl transition-all active:scale-95 shadow-md text-sm"
          style={{ background: 'var(--primary)' }}
        >
          + Nuova Quest
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--primary-muted)' }}>Caricamento... 🍪</div>
      ) : activities.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center shadow-inner"
          style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
        >
          <p className="text-4xl mb-3">🍪</p>
          <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-mid)' }}>Nessuna quest creata</p>
          <p style={{ color: 'var(--text-soft)' }}>Premi "+ Nuova Quest" per iniziare a guadagnare biscotti!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Quest Solo Oggi */}
          {soloOggi.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-mid)' }}>
                ⚡ Solo Oggi
                <span className="text-sm font-normal" style={{ color: 'var(--text-faint)' }}>
                  ({soloOggi.length})
                </span>
              </h2>
              <div className="flex flex-col gap-2">
                {soloOggi.map((activity) => (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    onEdit={() => handleEdit(activity)}
                    onDelete={() => handleDelete(activity)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Attività Giornaliere */}
          {giornaliere.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-mid)' }}>
                📅 Giornaliere
                <span className="text-sm font-normal" style={{ color: 'var(--text-faint)' }}>
                  ({giornaliere.length})
                </span>
              </h2>
              <div className="flex flex-col gap-2">
                {giornaliere.map((activity) => (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    onEdit={() => handleEdit(activity)}
                    onDelete={() => handleDelete(activity)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Attività Settimanali */}
          {settimanali.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-mid)' }}>
                🗓️ Settimanali
                <span className="text-sm font-normal" style={{ color: 'var(--text-faint)' }}>
                  ({settimanali.length})
                </span>
              </h2>
              <div className="flex flex-col gap-2">
                {settimanali.map((activity) => (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    onEdit={() => handleEdit(activity)}
                    onDelete={() => handleDelete(activity)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <ActivityForm
          activity={editingActivity}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

/**
 * Riga singola per un'attività nel Forno.
 */
function ActivityRow({ activity, onEdit, onDelete }) {
  const isTodayTask = activity.tipo === 'oggi';
  const todayStr = toDateString(new Date());
  const isCreatedToday = !activity.data || activity.data === todayStr;

  const totalSecs = activity.timerDuration || (activity.timerMinutes || 0) * 60 + (activity.timerSeconds || 0);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const timerLabel = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div
      className="flex justify-between items-center p-4 rounded-2xl hover:shadow-sm transition-all"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate" style={{ color: 'var(--text)' }}>{activity.nome}</div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>+{activity.punti} 🍪</span>

          {/* Badge frequenza o giorno */}
          {isTodayTask && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-soft)' }}
            >
              {isCreatedToday ? '⚡ Solo oggi' : `⚡ Data: ${activity.data}`}
            </span>
          )}

          {activity.tipo === 'settimanale' && activity.giorni && (
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
              {activity.giorni.map((g) => GIORNI_LABEL[g] || g).join(', ')}
            </span>
          )}

          {/* Badge timer */}
          {activity.hasTimer && totalSecs > 0 && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}
            >
              ⏱️ {timerLabel}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-1 shrink-0 ml-2">
        <button
          onClick={onEdit}
          className="p-2 rounded-xl transition-all"
          style={{ color: 'var(--text-faint)' }}
          aria-label="Modifica"
        >
          ✏️
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-xl hover:bg-red-50 text-red-300 hover:text-red-500 transition-all"
          aria-label="Elimina"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
