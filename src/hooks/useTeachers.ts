import { useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useStore } from "../store/useStore";
import { COLLECTIONS } from "../constants";
import { Teacher } from "../types";

export const useTeachers = () => {
  const { isAdmin, activeTab, setTeachers } = useStore();

  useEffect(() => {
    const relevantTabs = ["teachers", "admin_pending_teachers", "stats"];
    if (!isAdmin || !relevantTabs.includes(activeTab)) return;

    const teacherRef = collection(db, COLLECTIONS.TEACHERS);
    const qTeacher = query(teacherRef, orderBy("createdAt", "desc"));
    const unsubTeacher = onSnapshot(qTeacher, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Teacher));
      setTeachers(data);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, COLLECTIONS.TEACHERS);
    });

    return () => unsubTeacher();
  }, [isAdmin, activeTab, setTeachers]);
};
