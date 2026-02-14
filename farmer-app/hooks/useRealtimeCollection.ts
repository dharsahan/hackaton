import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, QueryConstraint, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useRealtimeCollection<T>(collectionName: string, constraints: QueryConstraint[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), ...constraints);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as T);
      });
      setData(items);
      setLoading(false);
    }, (err) => {
      console.error(`Error in realtime collection ${collectionName}:`, err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(constraints)]); // Simple way to track constraint changes

  return { data, loading, error };
}
