import { useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useStore } from "../store/useStore";
import { COLLECTIONS } from "../constants";
import { Expense } from "../types";

export const useExpenses = () => {
  const { isAdmin, activeTab, setExpenses } = useStore();

  useEffect(() => {
    if (!isAdmin || activeTab !== "revenue") return;

    const expRef = collection(db, COLLECTIONS.EXPENSES);
    const qExp = query(expRef, orderBy("createdAt", "desc"));
    const unsubExp = onSnapshot(qExp, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Expense));
      setExpenses(data);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, COLLECTIONS.EXPENSES);
    });

    return () => unsubExp();
  }, [isAdmin, activeTab, setExpenses]);
};
