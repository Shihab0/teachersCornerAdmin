import { useState, useEffect } from "react";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants";

export interface AreaStat {
  area: string;
  count: number;
}

export function useAreaStats(realtime: boolean = true) {
  const [stats, setStats] = useState<AreaStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const colRef = collection(db, COLLECTIONS.AREA_STATS);

    if (realtime) {
      const unsubscribe = onSnapshot(colRef, (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as AreaStat);
        setStats(data.sort((a, b) => b.count - a.count));
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      getDocs(colRef).then((snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as AreaStat);
        setStats(data.sort((a, b) => b.count - a.count));
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [realtime]);

  return { stats, loading };
}
