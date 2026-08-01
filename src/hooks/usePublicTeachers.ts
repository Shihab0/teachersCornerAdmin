import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { COLLECTIONS } from "../constants";
import { Teacher } from "../types";

export const usePublicTeachers = (): Teacher[] => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    const baseRef = collection(db, COLLECTIONS.TEACHERS);
    // Note: Querying with both `where` and `orderBy` on different fields requires a composite index in Firestore.
    // On first execution, Firebase console will provide an automated link to create the index if it doesn't exist yet.
    const qPublic = query(
      baseRef,
      where("status", "==", "Approved"),
      orderBy("createdAt", "desc"),
      limit(8)
    );

    const unsubscribe = onSnapshot(
      qPublic,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Teacher[];
        setTeachers(data);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLLECTIONS.TEACHERS);
      }
    );

    return () => unsubscribe();
  }, []);

  return teachers;
};
