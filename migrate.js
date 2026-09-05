import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app);
const appId = "tc-admin-panel"; // using the one from firebase.ts

async function run() {
  console.log("Starting migration...");
  try {
    const q = collection(db, "artifacts", appId, "public", "data", "tc_teachers");
    const snapshot = await getDocs(q);
    
    console.log(`Found ${snapshot.size} teachers.`);
    
    // Group by phone
    const byPhone = {};
    snapshot.forEach(d => {
      const data = d.data();
      const phone = data.phone;
      if (!phone) return;
      
      if (!byPhone[phone]) byPhone[phone] = [];
      byPhone[phone].push({
        id: d.id,
        name: data.name || "",
        collegeName: data.collegeName || "",
        status: data.status || "Pending",
        adminMessage: data.adminMessage || "",
        photoUrl: data.photoUrl || ""
      });
    });

    const phones = Object.keys(byPhone);
    console.log(`Grouped into ${phones.length} unique phone numbers.`);
    
    // Write to tc_teacher_public_status
    let count = 0;
    for (const phone of phones) {
      const publicDocRef = doc(db, "artifacts", appId, "public", "data", "tc_teacher_public_status", phone);
      await setDoc(publicDocRef, { phone, applications: byPhone[phone] });
      count++;
      if (count % 10 === 0) console.log(`Migrated ${count} phones...`);
    }
    
    console.log(`Successfully migrated ${count} records!`);
  } catch (e) {
    console.error("Migration failed:", e);
  }
  process.exit(0);
}
run();
