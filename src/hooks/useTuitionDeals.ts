import { useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useStore } from "../store/useStore";
import { COLLECTIONS } from "../constants";
import { Deal } from "../types";

export const useTuitionDeals = () => {
  const { isAdmin, activeTab, deals, setDeals, setPublicDeals, setIsLoading } = useStore();

  const exportToCSV = () => {
    const headers = ["Tuition ID", "Tutor Name", "Tutor Phone", "Guardian Phone", "Class", "Subject/Area", "Management", "Commission", "Tuition Status", "Payment Status", "Collected By", "Selection Date"];
    const rows = deals.map((d) => [d.tuitionId, d.tutorName, d.tutorPhone, d.guardianPhone, d.studentClass, `"${d.details || ""}"`, d.adminName, d.commission, d.tuitionStatus, d.commissionStatus, d.collectedBy || "N/A", d.selectionDate]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TC_Data_Backup_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const baseRef = collection(db, COLLECTIONS.DEALS);
    const qPublicDeals = query(baseRef, orderBy("createdAt", "desc"));
    
    const unsubPublic = onSnapshot(qPublicDeals, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Deal))
        .filter(d => d.tuitionStatus === "Confirmed" || d.tuitionStatus === "Running")
        .slice(0, 5);
      setPublicDeals(data);
    });

    // Only fetch all deals if admin and on a relevant tab
    const relevantTabs = ["dashboard", "revenue", "stats", "add"];
    if (!isAdmin || !relevantTabs.includes(activeTab)) return () => unsubPublic();

    const qDeals = query(baseRef, orderBy("createdAt", "desc"));
    const unsubDeals = onSnapshot(qDeals, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Deal));
      setDeals(data);
      setIsLoading(false);
    }, (err) => {
      console.error("Firestore Error (Deals):", err);
      setIsLoading(false);
    });

    return () => {
      unsubPublic();
      unsubDeals();
    };
  }, [isAdmin, activeTab, setDeals, setPublicDeals, setIsLoading]);

  return { exportToCSV };
};
