import { useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useStore } from "../store/useStore";
import { COLLECTIONS } from "../constants";
import { TuitionRequest } from "../types";

export const useTuitionRequests = () => {
  const { isAdmin, activeTab, setTuitionRequests } = useStore();

  useEffect(() => {
    if (!isAdmin || activeTab !== "admin_requests") return;

    const reqRef = collection(db, COLLECTIONS.REQUESTS);
    const qReq = query(reqRef, orderBy("createdAt", "desc"));
    const unsubReq = onSnapshot(qReq, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as TuitionRequest));
      setTuitionRequests(data);
    }, (err) => {
      console.error("Firestore Error (Requests):", err);
    });

    return () => unsubReq();
  }, [isAdmin, activeTab, setTuitionRequests]);
};
