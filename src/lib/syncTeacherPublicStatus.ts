import { doc, getDoc, setDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db, appId } from "./firebase";
import { Teacher } from "../types";

export const syncTeacherPublicStatus = async (phone: string) => {
  // Find ALL applications for this phone number in tc_teachers
  const q = query(
    collection(db, "artifacts", appId, "public", "data", "tc_teachers"),
    where("phone", "==", phone)
  );
  
  const querySnapshot = await getDocs(q);
  
  const publicDocRef = doc(db, "artifacts", appId, "public", "data", "tc_teacher_public_status", phone);
  
  if (querySnapshot.empty) {
    // If no applications exist for this phone, delete the public status doc (if it exists)
    // Actually we can just write an empty applications array or use writeBatch to delete.
    // Let's just set empty array.
    await setDoc(publicDocRef, { phone, applications: [] });
    return;
  }
  
  const applications = querySnapshot.docs.map(d => {
    const data = d.data() as Teacher;
    return {
      id: d.id,
      name: data.name,
      collegeName: data.collegeName,
      status: data.status,
      adminMessage: data.adminMessage || "",
      photoUrl: data.photoUrl || ""
    };
  });
  
  await setDoc(publicDocRef, { phone, applications });
};
