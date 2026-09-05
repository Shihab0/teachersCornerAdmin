import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, initializeFirestore } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = initializeFirestore(app, {}, config.firestoreDatabaseId);
const appId = "tc-admin-panel";

async function run() {
  const q = collection(db, "artifacts", appId, "public", "data", "tc_deals");
  const snap = await getDocs(q);
  let count = 0;
  for (const d of snap.docs) {
    const data = d.data();
    const publicRef = doc(db, "artifacts", appId, "public", "data", "tc_deals_public", d.id);
    if (data.tuitionStatus === "Confirmed" || data.tuitionStatus === "Running") {
      await setDoc(publicRef, {
        tuitionId: data.tuitionId || "",
        tutorName: data.tutorName || "",
        studentClass: data.studentClass || "",
        subjects: data.subjects || data.details || "",
        location: data.location || "",
        tuitionStatus: data.tuitionStatus || "Confirmed",
        selectionDate: data.selectionDate || "",
        updatedAt: Date.now()
      });
      count++;
    } else {
      await deleteDoc(publicRef).catch(() => {});
    }
  }
  console.log(`Migrated ${count} deals.`);
  process.exit(0);
}
run();
