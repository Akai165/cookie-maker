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
    <div className="min-h-screen p-4 pb-24 font-sans" style={{ background: 'var(--bg)' }}>
      {/* Header con saldo */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Negozio 🛍️</h1>
        <span
          className="font-bold px-3 py-1.5 rounded-full text-sm"
          style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}
        >
          {loading ? '...' : biscotti} 🍪
        </span>
      </div>

      {/* ============ SEZIONE PREMI ============ */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-mid)' }}>🎁 Premi</h2>

        <button
          onClick={() => setShowRewardForm(true)}
          className="w-full font-bold py-3.5 rounded-2xl border-2 border-dashed transition-all active:scale-[0.98] mb-4 text-sm"
          style={{
            background: 'var(--bg-card)',
            color: 'var(--primary)',
            borderColor: 'var(--border)',
          }}
        >
          + Aggiungi Premio
        </button>

        {loading ? (
          <div className="text-center py-8" style={{ color: 'var(--primary-muted)' }}>Caricamento... 🍪</div>
        ) : rewards.length === 0 ? (
          <div
            className="rounded-2xl p-6 text-center shadow-inner"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
          >
            <p className="text-3xl mb-2">🎁</p>
            <p className="text-sm font-bold" style={{ color: 'var(--text-mid)' }}>Nessun premio creato</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>Crea i tuoi premi e compra con i biscotti!</p>
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
        <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-mid)' }}>🏆 Traguardi Mensili</h2>
        <p className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>
          Si sbloccano guadagnando abbastanza biscotti nel mese — non servono biscotti per comprarli!
        </p>

        <button
          onClick={() => setShowMilestoneForm(true)}
          className="w-full font-bold py-3.5 rounded-2xl border-2 border-dashed transition-all active:scale-[0.98] mb-4 text-sm"
          style={{
            background: 'var(--bg-card)',
            color: 'var(--primary)',
            borderColor: 'var(--border)',
          }}
        >
          + Aggiungi Traguardo
        </button>

        {loading ? (
          <div className="text-center py-8" style={{ color: 'var(--primary-muted)' }}>Caricamento...</div>
        ) : milestones.length === 0 ? (
          <div
            className="rounded-2xl p-6 text-center shadow-inner"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
          >
            <p className="text-3xl mb-2">🏆</p>
            <p className="text-sm font-bold" style={{ color: 'var(--text-mid)' }}>Nessun traguardo creato</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>Crea obiettivi mensili per premi speciali!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="rounded-2xl p-4 hover:shadow-sm transition-all"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>
                    {milestone.emoji || '🏆'} {milestone.nome}
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
                    {milestone.soglia} 🍪/mese
                  </span>
                </div>

                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => handleEditMilestone(milestone)}
                    className="text-xs font-medium px-2 py-1 rounded-lg transition-all"
                    style={{ color: 'var(--text-faint)' }}
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
