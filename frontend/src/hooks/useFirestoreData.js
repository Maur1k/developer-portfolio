import { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

export function useCollectionData(collectionName, fallback = [], options = {}) {
  const stableOptions = useMemo(() => options, [options.orderBy, options.direction]);
  const [items, setItems] = useState(fallback);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setItems(fallback);
      setLoading(false);
      return undefined;
    }

    const ref = stableOptions.orderBy
      ? query(collection(db, collectionName), orderBy(stableOptions.orderBy, stableOptions.direction || 'asc'))
      : collection(db, collectionName);

    return onSnapshot(
      ref,
      (snapshot) => {
        const nextItems = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
        setItems(nextItems.length ? nextItems : fallback);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError);
        setItems(fallback);
        setLoading(false);
      },
    );
  }, [collectionName, fallback, stableOptions]);

  return { items, loading, error };
}

export function useDocumentData(collectionName, documentId, fallback = {}) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setData(fallback);
      setLoading(false);
      return undefined;
    }

    return onSnapshot(
      doc(db, collectionName, documentId),
      (snapshot) => {
        setData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : fallback);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError);
        setData(fallback);
        setLoading(false);
      },
    );
  }, [collectionName, documentId, fallback]);

  return { data, loading, error };
}
