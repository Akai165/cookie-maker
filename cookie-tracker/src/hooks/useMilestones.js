import { useState, useEffect } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Hook CRUD per i traguardi mensili.
 *
 * Struttura documento traguardo:
 * {
 *   nome: string,        // es. "Serata film"
 *   emoji: string,       // es. "🎬"
 *   soglia: number,      // biscotti da guadagnare nel mese per sbloccare
 *   createdAt: string
 * }
 *
 * I traguardi NON si comprano: si sbloccano automaticamente
 * quando il totale biscotti guadagnati nel mese >= soglia.
 */
export function useMilestones(userId) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', userId, 'milestones'),
      orderBy('soglia', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMilestones(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const addMilestone = async (milestone) => {
    return addDoc(collection(db, 'users', userId, 'milestones'), {
      ...milestone,
      createdAt: new Date().toISOString(),
    });
  };

  const updateMilestone = async (id, data) => {
    return updateDoc(doc(db, 'users', userId, 'milestones', id), data);
  };

  const deleteMilestone = async (id) => {
    return deleteDoc(doc(db, 'users', userId, 'milestones', id));
  };

  return {
    milestones,
    loading,
    addMilestone,
    updateMilestone,
    deleteMilestone,
  };
}
