import React, { useState, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import { doc, addDoc, updateDoc, deleteDoc, collection, getDocs, getDocFromServer } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import { Toaster, toast } from "sonner";
import { cn } from "./lib/utils";
import { Deal, Expense, HistoryEntry, Teacher } from "./types";
import { Header } from "./components/layout/Header";
import { Dashboard } from "./components/dashboard/Dashboard";
import { AddDeal } from "./components/add/AddDeal";
import { Revenue } from "./components/revenue/Revenue";
import { Stats } from "./components/stats/Stats";
import { TeacherList } from "./components/teachers/TeacherList";
import { RequestsList } from "./components/admin/RequestsList";
import { PendingTeachersList } from "./components/admin/PendingTeachersList";
import { HistoryModal } from "./components/modals/HistoryModal";
import { ConfirmDialog } from "./components/modals/ConfirmDialog";
import { PaymentModal } from "./components/modals/PaymentModal";
import { Login } from "./components/auth/Login";
import { TeacherModal } from "./components/modals/TeacherModal";
import { Loader2 } from "lucide-react";
import { useStore } from "./store/useStore";
import { useAuth } from "./hooks/useAuth";
import { useTuitionDeals } from "./hooks/useTuitionDeals";
import { useExpenses } from "./hooks/useExpenses";
import { useTeachers } from "./hooks/useTeachers";
import { useTuitionRequests } from "./hooks/useTuitionRequests";
import { useDemoData } from "./hooks/useDemoData";
import { COLLECTIONS } from "./constants";
import { DEMO_TEACHERS, DEMO_DEALS, DEMO_EXPENSES } from "./lib/demoData";
import { Footer } from "./components/layout/Footer";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export default function App() {
  const {
    user, isAdmin, authLoading, activeTab, isDarkMode, 
    deals, publicDeals, expenses, teachers, tuitionRequests, isLoading,
    setActiveTab, toggleDarkMode, setIsLoading,
    filterTuitionStatus, setFilterTuitionStatus,
    filterCommissionStatus, setFilterCommissionStatus,
    revYear, setRevYear,
    revMonth, setRevMonth,
    searchQuery, setSearchQuery,
    isProcessing, setIsProcessing,
    paymentModalDealId, setPaymentModalDealId,
    historyModalData, setHistoryModalData,
    isTeacherModalOpen, setIsTeacherModalOpen
  } = useStore();

  const { handleLogin, handleLogout } = useAuth();
  useTuitionDeals();
  useExpenses();
  useTeachers();
  useTuitionRequests();
  useDemoData();

  // App Install States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // UI States
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
    isDanger: true,
  });

  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tuitionId: "",
    tutorName: "",
    tutorPhone: "",
    guardianPhone: "",
    studentClass: "",
    details: "",
    referrerName: "",
    adminName: "",
    selectionDate: "",
    confirmDate: "",
    commission: "",
    tuitionStatus: "Processing",
    commissionStatus: "Pending",
    isTutorNotSelected: false,
  });
  const [idError, setIdError] = useState("");

  // Connection Test & PWA Prompt
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, COLLECTIONS.CONNECTION_TEST, "test"));
        console.log("Firebase connection test successful.");
      } catch (error) {
        if (error instanceof Error && error.message.includes("the client is offline")) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    };
    testConnection();

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleFirestoreError = (error: unknown, operationType: string, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  };

  const handleResetDemoData = async () => {
    setConfirmDialog({
      isOpen: true,
      title: "ডেমো ডাটা রিসেট",
      message: "আপনি কি নিশ্চিত যে আপনি সব ডাটা মুছে ডেমো ডাটা রিসেট করতে চান? এটি বর্তমান সব ডাটা মুছে ফেলবে।",
      isDanger: true,
      onCancel: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setIsLoading(true);
        try {
          const tCol = collection(db, COLLECTIONS.TEACHERS);
          const dCol = collection(db, COLLECTIONS.DEALS);
          const eCol = collection(db, COLLECTIONS.EXPENSES);
          
          const [tSnap, dSnap, eSnap] = await Promise.all([
            getDocs(tCol),
            getDocs(dCol),
            getDocs(eCol)
          ]);
          
          const deletePromises = [
            ...tSnap.docs.map(d => deleteDoc(d.ref)),
            ...dSnap.docs.map(d => deleteDoc(d.ref)),
            ...eSnap.docs.map(d => deleteDoc(d.ref))
          ];
          
          await Promise.all(deletePromises);
          
          const injectPromises = [
            ...DEMO_TEACHERS.map(t => addDoc(tCol, t)),
            ...DEMO_DEALS.map(d => addDoc(dCol, d)),
            ...DEMO_EXPENSES.map(e => addDoc(eCol, e))
          ];
          
          await Promise.all(injectPromises);
          toast.success("ডেমো ডাটা সফলভাবে রিসেট করা হয়েছে!");
        } catch (e) {
          handleFirestoreError(e, "write", "demo_reset");
          toast.error("ডেমো ডাটা রিসেট করতে সমস্যা হয়েছে। কনসোল চেক করুন।");
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
    } else {
      toast.info("অ্যাপটি ইনস্টল করতে ব্রাউজারের 'Add to Home Screen' অপশন ব্যবহার করুন।");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const requestConfirm = (title: string, message: string, onConfirm: () => void, isDanger = true) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
      isDanger,
    });
  };

  const handleAddDeal = async (e: FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const rawId = formData.tuitionId.trim();
    const finalTuitionId = rawId.startsWith("TC-") ? rawId : `TC-${rawId}`;

    const isDuplicate = deals.some((d) => d.tuitionId === finalTuitionId && d.id !== editId);
    if (isDuplicate) {
      setIdError("এই আইডিটি আগেই ব্যবহার করা হয়েছে!");
      setIsProcessing(false);
      return;
    }
    setIdError("");

    const payload = {
      ...formData,
      tuitionId: finalTuitionId,
      tutorName: formData.isTutorNotSelected ? "এখনো সিলেক্ট হয়নি" : formData.tutorName,
      tutorPhone: formData.isTutorNotSelected ? "" : formData.tutorPhone,
      commission: Number(formData.commission),
      updatedAt: Date.now(),
    };

    try {
      const colRef = collection(db, COLLECTIONS.DEALS);
      if (isEditing && editId) {
        const old = deals.find((d) => d.id === editId);
        const history = [
          ...(old?.history || []),
          { date: new Date().toISOString(), log: "তথ্য আপডেট করা হয়েছে" },
        ];
        await updateDoc(doc(colRef, editId), { ...payload, history });
        toast.success("টিউশন সফলভাবে আপডেট করা হয়েছে!");
      } else {
        await addDoc(colRef, {
          ...payload,
          collectedBy: null,
          createdAt: Date.now(),
          history: [{ date: new Date().toISOString(), log: "নতুন এন্ট্রি তৈরি করা হয়েছে" }],
        });
        toast.success("নতুন টিউশন সফলভাবে যোগ করা হয়েছে!");
      }
      setFormData({
        tuitionId: "",
        tutorName: "",
        tutorPhone: "",
        guardianPhone: "",
        studentClass: "",
        details: "",
        referrerName: "",
        adminName: "",
        selectionDate: "",
        confirmDate: "",
        commission: "",
        tuitionStatus: "Processing",
        commissionStatus: "Pending",
        isTutorNotSelected: false,
      });
      setIsEditing(false);
      setEditId(null);
      setActiveTab("dashboard");
    } catch (err) {
      handleFirestoreError(err, isEditing ? OperationType.UPDATE : OperationType.CREATE, COLLECTIONS.DEALS);
      toast.error("তথ্য সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditClick = (deal: Deal) => {
    setFormData({
      tuitionId: deal.tuitionId ? deal.tuitionId.replace("TC-", "") : "",
      tutorName: deal.tutorName === "এখনো সিলেক্ট হয়নি" ? "" : deal.tutorName || "",
      tutorPhone: deal.tutorPhone || "",
      guardianPhone: deal.guardianPhone || "",
      studentClass: deal.studentClass || "",
      details: deal.details || "",
      referrerName: deal.referrerName || "",
      adminName: deal.adminName || "",
      selectionDate: deal.selectionDate || "",
      confirmDate: deal.confirmDate || "",
      commission: deal.commission.toString() || "",
      tuitionStatus: deal.tuitionStatus || "Processing",
      commissionStatus: deal.commissionStatus || "Pending",
      isTutorNotSelected: deal.tutorName === "এখনো সিলেক্ট হয়নি",
    });
    setIdError("");
    setIsEditing(true);
    setEditId(deal.id);
    setActiveTab("add");
  };

  const changeTuitionStatus = async (id: string, newStatus: any) => {
    const updates: any = { tuitionStatus: newStatus };
    if (newStatus === "Rejected") {
      updates.commissionStatus = "Rejected";
    }
    await updateDoc(doc(db, COLLECTIONS.DEALS, id), updates);
  };

  const deleteDeal = (id: string) => {
    requestConfirm("নিশ্চিত ডিলিট?", "এই রেকর্ডটি চিরতরে মুছে যাবে।", async () => {
      await deleteDoc(doc(db, COLLECTIONS.DEALS, id));
    });
  };

  const handleDeleteFromEdit = () => {
    if (!editId) return;
    requestConfirm("নিশ্চিত ডিলিট?", "এই রেকর্ডটি চিরতরে মুছে যাবে।", async () => {
      await deleteDoc(doc(db, COLLECTIONS.DEALS, editId));
      setIsEditing(false);
      setEditId(null);
      setIdError("");
      setActiveTab("dashboard");
    });
  };

  const processPayment = async (collector: string) => {
    if (!paymentModalDealId) return;
    const deal = deals.find((d) => d.id === paymentModalDealId);
    if (!deal) return;
    const history = [
      ...(deal.history || []),
      { date: new Date().toISOString(), log: `৳${deal.commission} আদায় করেছেন ${collector}` },
    ];
    await updateDoc(doc(db, COLLECTIONS.DEALS, deal.id), {
      commissionStatus: "Paid",
      collectedBy: collector,
      history,
    });
    setPaymentModalDealId(null);
  };

  const handleUndoPayment = (deal: Deal) => {
    requestConfirm(
      "পেমেন্ট বাতিল (Undo)?",
      "পেমেন্ট স্ট্যাটাস পুনরায় পেন্ডিং করা হবে।",
      async () => {
        const history = [
          ...(deal.history || []),
          { date: new Date().toISOString(), log: "পেমেন্ট বাতিল (Undo) করা হয়েছে" },
        ];
        await updateDoc(doc(db, COLLECTIONS.DEALS, deal.id), {
          commissionStatus: "Pending",
          collectedBy: null,
          history,
        });
      },
      false
    );
  };

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

  const handleAddTeacher = async (teacherData: Partial<Teacher>) => {
    try {
      const teacherRef = collection(db, COLLECTIONS.TEACHERS);
      await addDoc(teacherRef, { ...teacherData, status: "Approved", createdAt: Date.now() });
      toast.success("শিক্ষক সফলভাবে যুক্ত করা হয়েছে");
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast.error("শিক্ষক যুক্ত করতে সমস্যা হয়েছে");
    }
  };

  const handleUpdateTuitionRequestStatus = async (id: string, status: "Approved" | "Rejected") => {
    try {
      await updateDoc(doc(db, COLLECTIONS.REQUESTS, id), { status, updatedAt: Date.now() });
    } catch (error) {
      console.error("Error updating request status:", error);
      throw error;
    }
  };

  const handleDeleteTuitionRequest = async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.REQUESTS, id));
    } catch (error) {
      console.error("Error deleting request:", error);
      throw error;
    }
  };

  const handleUpdateTeacherStatus = async (id: string, status: "Approved" | "Rejected") => {
    try {
      await updateDoc(doc(db, COLLECTIONS.TEACHERS, id), { status, updatedAt: Date.now() });
    } catch (error) {
      console.error("Error updating teacher status:", error);
      throw error;
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.TEACHERS, id));
    } catch (error) {
      console.error("Error deleting teacher:", error);
      throw error;
    }
  };

  if (authLoading || (isAdmin && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-emerald-200 font-black text-sm uppercase tracking-widest animate-pulse">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Login 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        deals={publicDeals} 
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  return (
    <div className={cn("flex flex-col h-screen max-w-md mx-auto bg-gray-50 dark:bg-slate-950 overflow-hidden shadow-2xl transition-colors duration-500", isDarkMode && "dark")}>
      <Toaster position="top-center" richColors />
      <Header 
        onLogout={handleLogout} 
        onInstall={handleInstallClick} 
      />
      
      <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {activeTab === "dashboard" && (
          <Dashboard 
            onEdit={handleEditClick} 
            onDelete={deleteDeal} 
            onStatusChange={changeTuitionStatus} 
            onHistoryClick={(data) => setHistoryModalData(data)}
            onPayment={(id) => setPaymentModalDealId(id)} 
            onUndoPayment={handleUndoPayment}
            onResetDemo={handleResetDemoData}
          />
        )}
        {activeTab === "add" && (
          <AddDeal 
            formData={formData} 
            onInputChange={handleInputChange} 
            onSubmit={handleAddDeal} 
            isEditing={isEditing} 
            idError={idError} 
            onCancel={() => { setIsEditing(false); setEditId(null); setActiveTab("dashboard"); }} 
            onDelete={handleDeleteFromEdit}
            setFormData={setFormData}
            setIdError={setIdError}
          />
        )}
        {activeTab === "revenue" && (
          <Revenue 
            onResetDemo={handleResetDemoData}
          />
        )}
        {activeTab === "stats" && (
          <Stats 
            deals={deals} 
            teachers={teachers} 
            onResetDemo={handleResetDemoData} 
          />
        )}
        {activeTab === "teachers" && <TeacherList teachers={teachers} onAddTeacher={() => setIsTeacherModalOpen(true)} />}
        {activeTab === "admin_requests" && (
          <RequestsList 
            requests={tuitionRequests} 
            onUpdateStatus={handleUpdateTuitionRequestStatus} 
            onDelete={handleDeleteTuitionRequest} 
          />
        )}
        {activeTab === "admin_pending_teachers" && (
          <PendingTeachersList 
            teachers={teachers} 
            onUpdateStatus={handleUpdateTeacherStatus} 
            onDelete={handleDeleteTeacher} 
          />
        )}
      </main>

      <Footer 
        isEditing={isEditing} 
        onEntryClick={() => setActiveTab("add")} 
        onInstall={handleInstallClick} 
      />

      <PaymentModal onConfirm={processPayment} />
      <HistoryModal />
      <ConfirmDialog {...confirmDialog} />
      <TeacherModal onAdd={handleAddTeacher} />
    </div>
  );
}
