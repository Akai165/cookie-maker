import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActivities } from '../hooks/useActivities';
import ActivityForm from '../components/ActivityForm';

const GIORNI_LABEL = {
  lun: 'Lun', mar: 'Mar', mer: 'Mer',
  gio: 'Gio', ven: 'Ven', sab: 'Sab', dom: 'Dom',
};

/**
 * Pagina "Il Forno" — dove si creano e gestiscono le attività.
 */
export default function Forno() {
  const { user } = useAuth();
  const { activities, loading, addActivity, updateActivity, deleteActivity } = useActivities(user?.uid);

  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  // Separa giornaliere e settimanali
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
    <div className="min-h-screen bg-[#FFF8EE] p-4 pb-24 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <h1 className="text-2xl font-black text-orange-900">Il Forno 📝</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl transition-all active:scale-95 shadow-md text-sm"
        >
          + Nuova
        </button>
      </div>

      {loading ? (
        <div className="text-center text-orange-400 py-12">Caricamento... 🍪</div>
      ) : activities.length === 0 ? (
        <div className="bg-orange-100/50 rounded-2xl p-10 text-center border border-orange-200 shadow-inner">
          <p className="text-4xl mb-3">🍪</p>
          <p className="text-lg font-bold text-orange-800 mb-2">Nessuna attività creata</p>
          <p className="text-orange-600">Premi "+ Nuova" per iniziare a guadagnare biscotti!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Attività Giornaliere */}
          {giornaliere.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-orange-800 mb-3 flex items-center gap-2">
                📅 Giornaliere
                <span className="text-sm font-normal text-orange-400">
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
              <h2 className="text-lg font-bold text-orange-800 mb-3 flex items-center gap-2">
                🗓️ Settimanali
                <span className="text-sm font-normal text-orange-400">
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
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-orange-100 hover:shadow-sm transition-all">
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-orange-950 truncate">{activity.nome}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold text-orange-500">+{activity.punti} 🍪</span>
          {activity.tipo === 'settimanale' && activity.giorni && (
            <span className="text-xs text-orange-400">
              {activity.giorni.map((g) => GIORNI_LABEL[g] || g).join(', ')}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-1 shrink-0 ml-2">
        <button
          onClick={onEdit}
          className="p-2 rounded-xl hover:bg-orange-50 text-orange-400 hover:text-orange-600 transition-all"
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
