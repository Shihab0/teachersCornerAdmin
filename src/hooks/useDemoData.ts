import { useEffect, useRef } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useStore } from "../store/useStore";
import { COLLECTIONS } from "../constants";
import { DEMO_TEACHERS, DEMO_DEALS, DEMO_EXPENSES } from "../lib/demoData";

export const useDemoData = () => {
  const { isAdmin, authLoading, isLoading, deals, teachers, expenses } = useStore();
  const isInjecting = useRef(false);

  useEffect(() => {
    if (!isAdmin || authLoading || isLoading || isInjecting.current) return;

    const injectIfEmpty = async () => {
      isInjecting.current = true;
      try {
        const tCol = collection(db, COLLECTIONS.TEACHERS);
        const dCol = collection(db, COLLECTIONS.DEALS);
        const eCol = collection(db, COLLECTIONS.EXPENSES);

        if (teachers.length === 0) {
          console.log("Injecting Teachers...");
          for (const t of DEMO_TEACHERS) await addDoc(tCol, t);
        }
        if (deals.length === 0) {
          console.log("Injecting Deals...");
          for (const d of DEMO_DEALS) await addDoc(dCol, d);
        }
        if (expenses.length === 0) {
          console.log("Injecting Expenses...");
          for (const e of DEMO_EXPENSES) await addDoc(eCol, e);
        }
        console.log("Demo data injection check complete.");
      } catch (e) {
        console.error("Demo injection error:", e);
      } finally {
        isInjecting.current = false;
      }
    };

    if (teachers.length === 0 || deals.length === 0 || expenses.length === 0) {
      injectIfEmpty();
    }
  }, [isAdmin, authLoading, isLoading, deals.length, teachers.length, expenses.length]);
};
