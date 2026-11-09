import { doc, getDoc, setDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db, appId } from "./firebase";
import { Teacher } from "../types";

export const syncTeacherPublicStatus = async (phone: string) => {
  // Find ALL applications for this phone number in tc_teachers (used by Admin)
  const q = query(
    collection(db, "artifacts", appId, "public", "data", "tc_teachers"),
    where("phone", "==", phone)
  );
  
  const querySnapshot = await getDocs(q);
  
  const publicDocRef = doc(db, "artifacts", appId, "public", "data", "tc_teacher_public_status", phone);
  
  if (querySnapshot.empty) {
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

/**
 * Safely updates or inserts a single teacher's entry inside tc_teacher_public_status/{phone}
 * Used when a teacher registers or updates their CV via OTP/Dashboard on the public page.
 */
export const upsertPublicTeacherStatusEntry = async (
  phone: string,
  entry: {
    id: string;
    name: string;
    collegeName: string;
    status: "Pending" | "Approved" | "Rejected";
    adminMessage?: string;
    photoUrl?: string;
  }
) => {
  const cleanPhone = phone.trim();
  if (!cleanPhone) return;

  const publicDocRef = doc(db, "artifacts", appId, "public", "data", "tc_teacher_public_status", cleanPhone);
  const publicSnap = await getDoc(publicDocRef);

  const sanitizedEntry = {
    id: entry.id,
    name: entry.name || "",
    collegeName: entry.collegeName || "",
    status: entry.status,
    adminMessage: entry.adminMessage || "",
    photoUrl: entry.photoUrl || "",
  };

  if (publicSnap.exists()) {
    const existingApps: any[] = Array.isArray(publicSnap.data().applications)
      ? publicSnap.data().applications
      : [];
    const idx = existingApps.findIndex((a) => a.id === entry.id);
    let nextApps: any[];
    if (idx >= 0) {
      nextApps = [...existingApps];
      nextApps[idx] = {
        ...existingApps[idx],
        ...sanitizedEntry,
      };
    } else {
      nextApps = [...existingApps, sanitizedEntry];
    }
    await setDoc(publicDocRef, { phone: cleanPhone, applications: nextApps });
  } else {
    await setDoc(publicDocRef, { phone: cleanPhone, applications: [sanitizedEntry] });
  }
};
