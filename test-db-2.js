import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app);
const appId = "d3bf5a45-c218-48bb-b98d-e0fe74d9b20b";

async function run() {
  console.log("Checking tc_teacher_public_status...");
  const pubQ = query(collection(db, "artifacts", appId, "public", "data", "tc_teacher_public_status"), limit(5));
  const pubSnap = await getDocs(pubQ);
  console.log("Public records found:", pubSnap.size);
  pubSnap.forEach(doc => console.log(doc.id, doc.data().phone));

  console.log("Checking tc_teachers...");
  const tcQ = query(collection(db, "artifacts", appId, "public", "data", "tc_teachers"), limit(5));
  const tcSnap = await getDocs(tcQ);
  console.log("Teacher records found:", tcSnap.size);
  tcSnap.forEach(doc => console.log(doc.id, doc.data().phone, doc.data().name));
  
  process.exit(0);
}
run();
