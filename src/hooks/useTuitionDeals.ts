import { useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useStore } from "../store/useStore";
import { COLLECTIONS } from "../constants";
import { Deal } from "../types";

export const useTuitionDeals = () => {
  const { isAdmin, activeTab, deals, setDeals, setPublicDeals, setIsLoading } = useStore();

  const exportToCSV = (data?: Deal[]) => {
    const exportData = data || deals;
    const headers = ["Tuition ID", "Tutor Name", "Tutor Phone", "Guardian Phone", "Class", "Subject/Area", "Management", "Commission", "Tuition Status", "Payment Status", "Collected By", "Selection Date"];
    const rows = exportData.map((d) => [
      d.tuitionId || "N/A", 
      d.tutorName || "N/A", 
      d.tutorPhone || "N/A", 
      d.guardianPhone || "N/A", 
      d.studentClass || "N/A", 
      `"${(d.details || "").replace(/"/g, '""')}"`, 
      d.adminName || "N/A", 
      d.commission || 0, 
      d.tuitionStatus || "N/A", 
      d.commissionStatus || "N/A", 
      d.collectedBy || "N/A", 
      d.selectionDate || "N/A"
    ]);
    
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TC_Data_Backup_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = async (data?: Deal[]) => {
    const exportData = data || deals;
    console.log("PDF Export started with", exportData.length, "records");
    
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    
    const doc = new jsPDF("l", "mm", "a4");
    let fontName = "helvetica";

    // Load Bangla Font (Hind Siliguri) - Better rendering for Bangla
    try {
      const fontUrl = "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/hindsiliguri/HindSiliguri-Regular.ttf";
      const response = await fetch(fontUrl);
      if (response.ok) {
        const blob = await response.blob();
        const fontBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        
        doc.addFileToVFS("HindSiliguri.ttf", fontBase64);
        doc.addFont("HindSiliguri.ttf", "HindSiliguri", "normal");
        fontName = "HindSiliguri";
        console.log("Bangla font (Hind Siliguri) loaded successfully");
      } else {
        console.warn("Bangla font fetch failed, falling back to helvetica");
      }
    } catch (error) {
      console.error("Failed to load Bangla font for PDF:", error);
    }
    
    const headers = [["ID", "Tutor", "Tutor Phone", "Guardian", "Class", "Subjects", "Comm.", "Status", "Payment", "Date"]];
    const rows = exportData.map((d) => [
      d.tuitionId ? String(d.tuitionId) : "N/A",
      d.tutorName ? String(d.tutorName) : "N/A",
      d.tutorPhone ? String(d.tutorPhone) : "N/A",
      d.guardianPhone ? String(d.guardianPhone) : "N/A",
      d.studentClass ? String(d.studentClass) : "N/A",
      (d.subjects || d.details) ? String(d.subjects || d.details) : "N/A",
      d.commission !== undefined ? String(d.commission) : "0",
      d.tuitionStatus ? String(d.tuitionStatus) : "N/A",
      d.commissionStatus ? String(d.commissionStatus) : "N/A",
      d.selectionDate ? String(d.selectionDate) : "N/A"
    ]);

    doc.setFont(fontName);
    autoTable(doc, {
      head: headers,
      body: rows,
      theme: "grid",
      styles: { 
        fontSize: 9, 
        font: fontName,
        fontStyle: "normal",
        overflow: "linebreak",
        cellPadding: 3,
        textColor: [40, 40, 40],
        halign: "left",
        valign: "middle",
        lineColor: [220, 220, 220],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [16, 185, 129],
        font: "helvetica",
        fontSize: 10,
        fontStyle: "bold",
        textColor: [255, 255, 255],
        halign: "center"
      },
      columnStyles: {
        0: { cellWidth: 20, halign: "center" }, // ID
        2: { cellWidth: 28 }, // Tutor Phone
        3: { cellWidth: 28 }, // Guardian
        4: { cellWidth: 25 }, // Class
        5: { cellWidth: 40 }, // Subjects
        6: { cellWidth: 20, halign: "center" }, // Comm.
        7: { cellWidth: 28, halign: "center" }, // Status
        8: { cellWidth: 28, halign: "center" }, // Payment
        9: { cellWidth: 25, halign: "center" }  // Date
      },
      didParseCell: (cellData) => {
        if (cellData.section === 'body') {
          cellData.cell.styles.font = fontName;
        }
        if (cellData.section === 'head') {
          cellData.cell.styles.font = "helvetica";
        }
      },
      margin: { top: 20 },
      didDrawPage: (pageData) => {
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 185, 129);
        doc.text("Teacher's corner - Data Backup", pageData.settings.margin.left, 12);
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        const dateStr = `Generated on: ${new Date().toLocaleString()}`;
        doc.text(dateStr, doc.internal.pageSize.width - pageData.settings.margin.right - doc.getTextWidth(dateStr), 12);
      }
    });

    doc.save(`TC_Data_Backup_${new Date().toLocaleDateString()}.pdf`);
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
      handleFirestoreError(err, OperationType.LIST, COLLECTIONS.DEALS);
      setIsLoading(false);
    });

    return () => {
      unsubPublic();
      unsubDeals();
    };
  }, [isAdmin, activeTab, setDeals, setPublicDeals, setIsLoading]);

  return { exportToCSV, exportToPDF };
};
