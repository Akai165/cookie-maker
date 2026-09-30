import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useRewards } from '../hooks/useRewards';
import { useMilestones } from '../hooks/useMilestones';
import RewardCard from '../components/RewardCard';
import RewardForm from '../components/RewardForm';
import MilestoneForm from '../components/MilestoneForm';

/**
 * Pagina "Negozio" — premi acquistabili + traguardi mensili.
 */
export default function Shop() {
  const { user } = useAuth();
  const { biscotti, spendBiscotti, loading: profileLoading } = useProfile(user?.uid);
  const { rewards, loading: rewardsLoading, addReward, updateReward, deleteReward } = useRewards(user?.uid);
  const { milestones, loading: milestonesLoading, addMilestone, updateMilestone, deleteMilestone } = useMilestones(user?.uid);

  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);

  const loading = profileLoading || rewardsLoading || milestonesLoading;

  // --- Premi ---
  const handleSaveReward = async (data) => {
    if (editingReward) {
      await updateReward(editingReward.id, data);
    } else {
      await addReward(data);
    }
  };

  const handleBuyReward = async (reward) => {
    if (window.confirm(`Comprare "${reward.nome}" per ${reward.costo} 🍪?`)) {
      const success = await spendBiscotti(reward.costo);
      if (!success) {
        alert('Non hai abbastanza biscotti! 🍪');
      }
    }
  };

  const handleEditReward = (reward) => {
    setEditingReward(reward);
    setShowRewardForm(true);
  };

  const handleDeleteReward = async (reward) => {
    if (window.confirm(`Eliminare "${reward.nome}"?`)) {
      await deleteReward(reward.id);
    }
  };

  const handleCloseRewardForm = () => {
    setShowRewardForm(false);
    setEditingReward(null);
  };

  // --- Traguardi ---
  const handleSaveMilestone = async (data) => {
    if (editingMilestone) {
      await updateMilestone(editingMilestone.id, data);
    } else {
      await addMilestone(data);
    }
  };

  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    setShowMilestoneForm(true);
  };

  const handleDeleteMilestone = async (milestone) => {
    if (window.confirm(`Eliminare "${milestone.nome}"?`)) {
      await deleteMilestone(milestone.id);
    }
  };

  const handleCloseMilestoneForm = () => {
    setShowMilestoneForm(false);
    setEditingMilestone(null);
  };

  return (
    <div className="min-h-screen bg-[#FFF8EE] p-4 pb-24 font-sans">
      {/* Header con saldo */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <h1 className="text-2xl font-black text-orange-900">Negozio 🛍️</h1>
        <span className="bg-orange-100 text-orange-700 font-bold px-3 py-1.5 rounded-full text-sm">
          {loading ? '...' : biscotti} 🍪
        </span>
      </div>

      {/* ============ SEZIONE PREMI ============ */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-orange-800 mb-3">🎁 Premi</h2>

        <button
          onClick={() => setShowRewardForm(true)}
          className="w-full bg-white hover:bg-orange-50 text-orange-600 font-bold py-3.5 rounded-2xl border-2 border-dashed border-orange-300 transition-all active:scale-[0.98] mb-4 text-sm"
        >
          + Aggiungi Premio
        </button>

        {loading ? (
          <div className="text-center text-orange-400 py-8">Caricamento... 🍪</div>
        ) : rewards.length === 0 ? (
          <div className="bg-orange-100/50 rounded-2xl p-6 text-center border border-orange-200 shadow-inner">
            <p className="text-3xl mb-2">🎁</p>
            <p className="text-sm font-bold text-orange-800">Nessun premio creato</p>
            <p className="text-xs text-orange-600 mt-1">Crea i tuoi premi e compra con i biscotti!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                biscotti={biscotti}
                onBuy={() => handleBuyReward(reward)}
                onEdit={() => handleEditReward(reward)}
                onDelete={() => handleDeleteReward(reward)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ============ SEZIONE TRAGUARDI MENSILI ============ */}
      <section>
        <h2 className="text-lg font-bold text-amber-800 mb-3">🏆 Traguardi Mensili</h2>
        <p className="text-xs text-amber-600 mb-3">
          Si sbloccano guadagnando abbastanza biscotti nel mese — non servono biscotti per comprarli!
        </p>

        <button
          onClick={() => setShowMilestoneForm(true)}
          className="w-full bg-white hover:bg-amber-50 text-amber-600 font-bold py-3.5 rounded-2xl border-2 border-dashed border-amber-300 transition-all active:scale-[0.98] mb-4 text-sm"
        >
          + Aggiungi Traguardo
        </button>

        {loading ? (
          <div className="text-center text-amber-400 py-8">Caricamento...</div>
        ) : milestones.length === 0 ? (
          <div className="bg-amber-50 rounded-2xl p-6 text-center border border-amber-200 shadow-inner">
            <p className="text-3xl mb-2">🏆</p>
            <p className="text-sm font-bold text-amber-800">Nessun traguardo creato</p>
            <p className="text-xs text-amber-600 mt-1">Crea obiettivi mensili per premi speciali!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="bg-white rounded-2xl border border-amber-100 p-4 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-amber-950">
                    {milestone.emoji || '🏆'} {milestone.nome}
                  </span>
                  <span className="text-sm font-bold text-amber-500">
                    {milestone.soglia} 🍪/mese
                  </span>
                </div>

                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => handleEditMilestone(milestone)}
                    className="text-xs text-amber-400 hover:text-amber-600 font-medium px-2 py-1 rounded-lg hover:bg-amber-50 transition-all"
                  >
                    ✏️ Modifica
                  </button>
                  <button
                    onClick={() => handleDeleteMilestone(milestone)}
                    className="text-xs text-red-300 hover:text-red-500 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
                  >
                    🗑️ Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      {showRewardForm && (
        <RewardForm
          reward={editingReward}
          onSave={handleSaveReward}
          onClose={handleCloseRewardForm}
        />
      )}
      {showMilestoneForm && (
        <MilestoneForm
          milestone={editingMilestone}
          onSave={handleSaveMilestone}
          onClose={handleCloseMilestoneForm}
        />
      )}
    </div>
  );
}
