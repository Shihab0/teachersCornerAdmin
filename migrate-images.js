import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, initializeFirestore } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = initializeFirestore(app, {}, config.firestoreDatabaseId);
const storage = getStorage(app);
const appId = "tc-admin-panel";

async function run() {
  const q = collection(db, "artifacts", appId, "public", "data", "tc_teachers");
  const snap = await getDocs(q);
  let count = 0;
  for (const d of snap.docs) {
    const data = d.data();
    const updates = {};
    if (data.photoUrl && data.photoUrl.startsWith("data:image/")) {
      const ext = data.photoUrl.substring("data:image/".length, data.photoUrl.indexOf(";"));
      const path = `teachers/${d.id}/photo.${ext}`;
      const storageRef = ref(storage, path);
      console.log(`Uploading photo for ${d.id}...`);
      try {
        await uploadString(storageRef, data.photoUrl, "data_url");
        const url = await getDownloadURL(storageRef);
        updates.photoUrl = url;
      } catch (e) { console.error(e.message); }
    }
    if (data.studentIdUrl && data.studentIdUrl.startsWith("data:image/")) {
      const ext = data.studentIdUrl.substring("data:image/".length, data.studentIdUrl.indexOf(";"));
      const path = `teachers/${d.id}/id-card.${ext}`;
      const storageRef = ref(storage, path);
      console.log(`Uploading id card for ${d.id}...`);
      try {
        await uploadString(storageRef, data.studentIdUrl, "data_url");
        const url = await getDownloadURL(storageRef);
        updates.studentIdUrl = url;
      } catch(e) { console.error(e.message); }
    }
    
    if (Object.keys(updates).length > 0) {
      console.log(`Updating document ${d.id} with new image URLs...`);
      await updateDoc(d.ref, updates);
      count++;
    }
  }
  console.log(`Migrated images for ${count} teachers.`);
  process.exit(0);
}
run();
