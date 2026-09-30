import { useState, useEffect } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { getDayName } from '../utils/dateUtils';

/**
 * Hook CRUD per le attività (giornaliere e settimanali).
 *
 * Struttura documento attività:
 * {
 *   nome: string,
 *   punti: number,
 *   tipo: 'giornaliera' | 'settimanale',
 *   giorni: string[]   // solo per settimanali, es. ['lun', 'mer', 'ven']
 *   createdAt: string   // ISO timestamp
 * }
 */
export function useActivities(userId) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', userId, 'activities'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActivities(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const addActivity = async (activity) => {
    return addDoc(collection(db, 'users', userId, 'activities'), {
      ...activity,
      createdAt: new Date().toISOString(),
    });
  };

  const updateActivity = async (id, data) => {
    return updateDoc(doc(db, 'users', userId, 'activities', id), data);
  };

  const deleteActivity = async (id) => {
    return deleteDoc(doc(db, 'users', userId, 'activities', id));
  };

  /**
   * Filtra le attività per un giorno specifico:
   * - Le giornaliere appaiono sempre
   * - Le settimanali solo se il giorno è nell'array `giorni`
   */
  const getActivitiesForDay = (date) => {
    const dayName = getDayName(date);

    return activities.filter((activity) => {
      if (activity.tipo === 'giornaliera') return true;
      if (activity.tipo === 'settimanale') {
        return activity.giorni && activity.giorni.includes(dayName);
      }
      return false;
    });
  };

  return {
    activities,
    loading,
    addActivity,
    updateActivity,
    deleteActivity,
    getActivitiesForDay,
  };
}
