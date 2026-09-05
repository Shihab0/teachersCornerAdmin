import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query, where, initializeFirestore } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = initializeFirestore(app, {}, config.firestoreDatabaseId);

async function run() {
  const appId = "tc-admin-panel";
  const rawPhone = "01761992500";
  
  const variations = [
    rawPhone,
    `+88${rawPhone}`,
    `88${rawPhone}`,
    `${rawPhone.slice(0,5)}-${rawPhone.slice(5)}`
  ];
  
  const pubQ = query(collection(db, "artifacts", appId, "public", "data", "tc_teacher_public_status"), where("phone", "in", variations));
  
  try {
    const pubSnap = await getDocs(pubQ);
    console.log(`Matched public statuses: ${pubSnap.size}`);
    let apps = [];
    pubSnap.forEach(doc => {
      const data = doc.data();
      if (data.applications) apps.push(...data.applications);
    });
    console.log("Apps found:", apps.length);
    console.log("App names:", apps.map(a => a.name).join(", "));
  } catch (e) {
    console.error("error", e);
  }
  
  process.exit(0);
}
run();
