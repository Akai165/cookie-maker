import { useState, useEffect } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Hook CRUD per i premi dello shop.
 *
 * Struttura documento premio:
 * {
 *   nome: string,
 *   costo: number,
 *   emoji: string,
 *   createdAt: string
 * }
 */
export function useRewards(userId) {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', userId, 'rewards'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRewards(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const addReward = async (reward) => {
    return addDoc(collection(db, 'users', userId, 'rewards'), {
      ...reward,
      createdAt: new Date().toISOString(),
    });
  };

  const updateReward = async (id, data) => {
    return updateDoc(doc(db, 'users', userId, 'rewards', id), data);
  };

  const deleteReward = async (id) => {
    return deleteDoc(doc(db, 'users', userId, 'rewards', id));
  };

  return {
    rewards,
    loading,
    addReward,
    updateReward,
    deleteReward,
  };
}
