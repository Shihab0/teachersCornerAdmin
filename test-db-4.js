import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query, initializeFirestore } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
// Important: use the exact databaseId that the app is using!
const db = initializeFirestore(app, {}, config.firestoreDatabaseId);

async function run() {
  const appId1 = "tc-admin-panel";
  const tcQ1 = query(collection(db, "artifacts", appId1, "public", "data", "tc_teachers"), limit(5));
  
  try {
    const tcSnap1 = await getDocs(tcQ1);
    console.log(`tc-admin-panel teachers: ${tcSnap1.size}`);
  } catch (e) {
    console.error("error1", e.message);
  }

  const appId2 = "d3bf5a45-c218-48bb-b98d-e0fe74d9b20b";
  const tcQ2 = query(collection(db, "artifacts", appId2, "public", "data", "tc_teachers"), limit(5));
  
  try {
    const tcSnap2 = await getDocs(tcQ2);
    console.log(`original app id teachers: ${tcSnap2.size}`);
  } catch (e) {
    console.error("error2", e.message);
  }
  
  process.exit(0);
}
run();
