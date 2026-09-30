import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Hook per il profilo utente (saldo biscotti).
 * Il documento users/{userId} contiene { biscotti: number }.
 * Si auto-crea al primo accesso.
 */
export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        // Primo accesso: crea il profilo con 0 biscotti e sesso da scegliere
        const initial = { biscotti: 0, sesso: null, createdAt: new Date().toISOString() };
        setDoc(docRef, initial);
        setProfile(initial);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const addBiscotti = async (amount) => {
    return updateDoc(doc(db, 'users', userId), {
      biscotti: increment(amount),
    });
  };

  const spendBiscotti = async (amount) => {
    if (!profile || profile.biscotti < amount) return false;
    await updateDoc(doc(db, 'users', userId), {
      biscotti: increment(-amount),
    });
    return true;
  };

  const setSesso = async (sesso) => {
    await updateDoc(doc(db, 'users', userId), { sesso });
  };

  return {
    profile,
    loading,
    biscotti: profile?.biscotti ?? 0,
    sesso: profile?.sesso ?? null,
    addBiscotti,
    spendBiscotti,
    setSesso,
  };
}
