import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app);
const appId = "d3bf5a45-c218-48bb-b98d-e0fe74d9b20b";

async function run() {
  const q = collection(db, "artifacts", appId, "public", "data", "tc_teachers");
  const snap = await getDocs(q);
  console.log("Total teachers:", snap.size);
  let found = false;
  snap.forEach(doc => {
    const data = doc.data();
    if (data.phone && data.phone.includes("01761992500")) {
      console.log("Found:", doc.id, data.phone, data.name);
      found = true;
    }
  });
  if (!found) console.log("Not found with includes");
  process.exit(0);
}
run();
