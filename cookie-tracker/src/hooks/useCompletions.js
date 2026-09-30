import { useState, useEffect } from 'react';
import {
  collection, addDoc, deleteDoc, doc, onSnapshot, query
} from 'firebase/firestore';
import { db } from '../firebase';
import { toDateString } from '../utils/dateUtils';

/**
 * Hook per i completamenti delle attività.
 *
 * Struttura documento completamento:
 * {
 *   activityId: string,
 *   punti: number,
 *   data: string,         // "YYYY-MM-DD"
 *   completedAt: string   // ISO timestamp
 * }
 */
export function useCompletions(userId) {
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users', userId, 'completions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCompletions(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  /**
   * Segna un'attività come completata per una data specifica.
   * Non aggiorna i biscotti qui — quello va fatto dal componente chiamante
   * usando useProfile.addBiscotti() per mantenere atomicità.
   */
  const completeActivity = async (activityId, punti, date) => {
    const dateStr = toDateString(date);
    return addDoc(collection(db, 'users', userId, 'completions'), {
      activityId,
      punti,
      data: dateStr,
      completedAt: new Date().toISOString(),
    });
  };

  /**
   * Annulla un completamento (per sbaglio o undo).
   */
  const uncompleteActivity = async (completionId) => {
    return deleteDoc(doc(db, 'users', userId, 'completions', completionId));
  };

  /**
   * Restituisce i completamenti per un giorno specifico.
   */
  const getCompletionsForDay = (date) => {
    const dateStr = toDateString(date);
    return completions.filter((c) => c.data === dateStr);
  };

  /**
   * Restituisce un Set di date (stringhe "YYYY-MM-DD") con almeno un completamento.
   * Usato dal Calendario per mostrare i pallini/biscotti.
   */
  const getCompletedDays = () => {
    const days = new Set();
    completions.forEach((c) => days.add(c.data));
    return days;
  };

  /**
   * Controlla se una specifica attività è stata completata in un giorno.
   * Restituisce l'oggetto completamento se trovato, altrimenti null.
   */
  const findCompletion = (activityId, date) => {
    const dateStr = toDateString(date);
    return completions.find(
      (c) => c.activityId === activityId && c.data === dateStr
    ) || null;
  };

  /**
   * Calcola il totale biscotti guadagnati in un mese specifico.
   * Usato per i traguardi mensili.
   */
  const getMonthlyTotal = (year, month) => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return completions
      .filter((c) => c.data && c.data.startsWith(prefix))
      .reduce((sum, c) => sum + (c.punti || 0), 0);
  };

  return {
    completions,
    loading,
    completeActivity,
    uncompleteActivity,
    getCompletionsForDay,
    getCompletedDays,
    findCompletion,
    getMonthlyTotal,
  };
}
