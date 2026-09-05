export const KISHOREGANJ_AREAS = [
  "Kharampotti (খরমপট্টি)", "Harua (হারুয়া)", 
  "Rathkhola (রথখোলা)", 
  "Gaital (গাইট্যাল)", 
  "Botrish (বত্রিশ)", 
  "Akhrakhabazar (আখড়াবাজার)", 
  "Boro Bazar (বড় বাজার)", 
  "Nilganj (নীলগঞ্জ)", 
  "Puran Thana (পুরান থানা)", 
  "Tarapasha (তারা পাশা)", 
  "Yashodal (যশোদল)", 
  "Haybatnagar (হায়বতনগর)", 
  "Ukilpara (উকিলপাড়া)", 
  "Shikkok Polli (শিক্ষক পল্লী)", 
  "Borpul (বড়পুল)", 
  "Newtown (নিউটাউন)", 
  "Others (অন্যান্য)"
];

export function getParentArea(location: string): string {
  if (!location) return "Others (অন্যান্য)";
  const normalized = location.toLowerCase();
  
  for (const area of KISHOREGANJ_AREAS) {
    // exact match check
    if (area === location) return area;
    
    // basic substring check to catch variations like "Gaital" matching "Gaital (গাইট্যাল)"
    const englishPart = area.split(' (')[0].toLowerCase();
    const banglaPart = area.match(/\((.*?)\)/)?.[1] || '';
    
    if (normalized.includes(englishPart) || (banglaPart && normalized.includes(banglaPart))) {
      return area;
    }
  }
  
  return "Others (অন্যান্য)";
}

import { db } from "./firebase";
import { doc, runTransaction } from "firebase/firestore";
import { COLLECTIONS } from "../constants";

export async function updateAreaStat(area: string, incrementValue: number) {
  if (!area) return;
  const parentArea = getParentArea(area);
  const statRef = doc(db, COLLECTIONS.AREA_STATS, parentArea);
  
  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(statRef);
      if (!docSnap.exists()) {
        transaction.set(statRef, { count: incrementValue > 0 ? incrementValue : 0, area: parentArea });
      } else {
        const newCount = (docSnap.data().count || 0) + incrementValue;
        transaction.update(statRef, { count: newCount >= 0 ? newCount : 0 });
      }
    });
  } catch (error) {
    console.error("Failed to update area stats:", error);
  }
}
