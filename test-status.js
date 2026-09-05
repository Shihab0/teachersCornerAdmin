import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app);
const appId = "d3bf5a45-c218-48bb-b98d-e0fe74d9b20b";

async function run() {
  try {
    const q = collection(db, "artifacts", appId, "public", "data", "tc_teacher_public_status");
    const snap = await getDocs(q);
    console.log("Total public statuses:", snap.size);
    snap.forEach(doc => {
      console.log("ID:", doc.id);
    });
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
