import React, { useState, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import { doc, addDoc, updateDoc, deleteDoc, collection, getDocs, getDocFromServer } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "./lib/firebase";
import { Toaster, toast } from "sonner";
import { cn } from "./lib/utils";
import { Deal, Expense, HistoryEntry, Teacher, TuitionRequest } from "./types";
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
import { COLLECTIONS } from "./constants";
import { Footer } from "./components/layout/Footer";

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
    subjects: "",
    weeklyDays: "",
    salary: "",
    location: "",
    tutorGender: "Any" as "Male" | "Female" | "Any",
    details: "",
    referrerName: "",
    adminName: "",
    selectionDate: "",
    confirmDate: "",
    commission: "",
    paidAmount: "0",
    tuitionStatus: "Processing",
    commissionStatus: "Pending",
    isTutorNotSelected: false,
  });
  const [idError, setIdError] = useState("");

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

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

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleClearAllData = async () => {
    setConfirmDialog({
      isOpen: true,
      title: "সব ডাটা মুছে ফেলুন",
      message: "আপনি কি নিশ্চিত যে আপনি সব ডাটা মুছে ফেলতে চান? এটি বর্তমান সব ডাটা স্থায়ীভাবে মুছে ফেলবে।",
      isDanger: true,
      onCancel: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setIsLoading(true);
        try {
          const tCol = collection(db, COLLECTIONS.TEACHERS);
          const dCol = collection(db, COLLECTIONS.DEALS);
          const eCol = collection(db, COLLECTIONS.EXPENSES);
          const rCol = collection(db, COLLECTIONS.REQUESTS);
          
          const [tSnap, dSnap, eSnap, rSnap] = await Promise.all([
            getDocs(tCol),
            getDocs(dCol),
            getDocs(eCol),
            getDocs(rCol)
          ]);
          
          const deletePromises = [
            ...tSnap.docs.map(d => deleteDoc(d.ref)),
            ...dSnap.docs.map(d => deleteDoc(d.ref)),
            ...eSnap.docs.map(d => deleteDoc(d.ref)),
            ...rSnap.docs.map(d => deleteDoc(d.ref))
          ];
          
          await Promise.all(deletePromises);
          toast.success("সব ডাটা সফলভাবে মুছে ফেলা হয়েছে");
        } catch (e) {
          handleFirestoreError(e, "write", "clear_all_data");
          toast.error("ডাটা মুছতে সমস্যা হয়েছে। কনসোল চেক করুন।");
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleInstallClick = async () => {
    requestConfirm(
      "অ্যাপ ইনস্টল করার নিয়ম",
      `অ্যান্ড্রয়েড ফোনে (Google Chrome ব্যবহার করে):
১. আপনার ফোনের Chrome ব্রাউজারে অ্যাপটি ওপেন করুন।
২. ব্রাউজারের উপরে ডানদিকের কোণায় তিনটি ডট (⋮) আইকনে ক্লিক করুন।
৩. নিচের দিকে গিয়ে 'Install app' অথবা 'Add to Home Screen' অপশনটি খুঁজে পাবেন, সেখানে ক্লিক করুন।
৪. একটি পপ-আপ আসবে, সেখানে 'Install' বাটনে ক্লিক করলেই অ্যাপটি আপনার ফোনের হোম স্ক্রিনে চলে আসবে।`,
      async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === "accepted") setDeferredPrompt(null);
        }
      },
      false,
      "ঠিক আছে",
      "",
      false
    );
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const requestConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    isDanger = true,
    confirmText = "নিশ্চিত",
    cancelText = "বাতিল",
    showCancel = true
  ) => {
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
      confirmText,
      cancelText,
      showCancel,
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
      paidAmount: Number(formData.paidAmount || 0),
      updatedAt: Date.now(),
    };

    try {
      const colRef = collection(db, COLLECTIONS.DEALS);
      if (isEditing && editId) {
        const old = deals.find((d) => d.id === editId);
        
        // Detailed history logging
        const changes: string[] = [];
        if (old) {
          if (old.tuitionId !== payload.tuitionId) changes.push(`আইডি: ${old.tuitionId} -> ${payload.tuitionId}`);
          if (old.tutorName !== payload.tutorName) changes.push(`টিউটর: ${old.tutorName} -> ${payload.tutorName}`);
          if (old.studentClass !== payload.studentClass) changes.push(`ক্লাস: ${old.studentClass} -> ${payload.studentClass}`);
          if (old.subjects !== payload.subjects) changes.push(`বিষয়: ${old.subjects} -> ${payload.subjects}`);
          if (old.salary !== payload.salary) changes.push(`স্যালারি: ${old.salary} -> ${payload.salary}`);
          if (old.location !== payload.location) changes.push(`লোকেশন: ${old.location} -> ${payload.location}`);
          if (old.commission !== payload.commission) changes.push(`কমিশন: ${old.commission} -> ${payload.commission}`);
          if (old.paidAmount !== payload.paidAmount) changes.push(`আদায়: ${old.paidAmount} -> ${payload.paidAmount}`);
          if (old.tuitionStatus !== payload.tuitionStatus) changes.push(`স্ট্যাটাস: ${old.tuitionStatus} -> ${payload.tuitionStatus}`);
        }

        const history = [
          ...(old?.history || []),
          { 
            date: new Date().toISOString(), 
            log: changes.length > 0 ? `আপডেট: ${changes.join(", ")}` : "তথ্য আপডেট করা হয়েছে (কোনো পরিবর্তন নেই)" 
          },
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
        subjects: "",
        weeklyDays: "",
        salary: "",
        location: "",
        tutorGender: "Any",
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
      subjects: deal.subjects || "",
      weeklyDays: deal.weeklyDays || "",
      salary: deal.salary || "",
      location: deal.location || "",
      tutorGender: deal.tutorGender || "Any",
      details: deal.details || "",
      referrerName: deal.referrerName || "",
      adminName: deal.adminName || "",
      selectionDate: deal.selectionDate || "",
      confirmDate: deal.confirmDate || "",
      commission: deal.commission.toString() || "",
      paidAmount: (deal.paidAmount || 0).toString(),
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
    const deal = deals.find(d => d.id === id);
    const updates: any = { 
      tuitionStatus: newStatus,
      history: [
        ...(deal?.history || []),
        { date: new Date().toISOString(), log: `টিউশন স্ট্যাটাস পরিবর্তন: ${newStatus}` }
      ]
    };
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

  const processPayment = async (collector: string, amount: number) => {
    if (!paymentModalDealId) return;
    const deal = deals.find((d) => d.id === paymentModalDealId);
    if (!deal) return;

    const newPaidAmount = (deal.paidAmount || 0) + amount;
    const isFullyPaid = newPaidAmount >= deal.commission;

    const history = [
      ...(deal.history || []),
      { 
        date: new Date().toISOString(), 
        log: `৳${amount} আদায় করেছেন ${collector}. মোট আদায়: ৳${newPaidAmount}${!isFullyPaid ? `, বাকি: ৳${deal.commission - newPaidAmount}` : ''}` 
      },
    ];

    await updateDoc(doc(db, COLLECTIONS.DEALS, deal.id), {
      commissionStatus: isFullyPaid ? "Paid" : "Partial",
      paidAmount: newPaidAmount,
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
          paidAmount: 0,
          collectedBy: null,
          history,
        });
      },
      false
    );
  };

  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const handleAddTeacher = async (teacherData: Partial<Teacher>) => {
    try {
      const teacherRef = collection(db, COLLECTIONS.TEACHERS);
      if (editingTeacher) {
        const newStatus = isAdmin ? (teacherData.status || editingTeacher.status || "Approved") : "Pending";
        await updateDoc(doc(teacherRef, editingTeacher.id), { 
          ...teacherData, 
          status: newStatus,
          updatedAt: Date.now() 
        });
        if (!isAdmin) {
          toast.success("শিক্ষকের সিভির তথ্য আপডেট করা হয়েছে এবং পুনরায় এডমিন পর্যালোচনায় (Admin Review) পাঠানো হয়েছে");
        } else {
          toast.success("শিক্ষকের তথ্য সফলভাবে আপডেট করা হয়েছে");
        }
      } else {
        const initialStatus = isAdmin ? "Approved" : "Pending";
        await addDoc(teacherRef, { ...teacherData, status: initialStatus, createdAt: Date.now() });
        toast.success(isAdmin ? "শিক্ষক সফলভাবে যুক্ত করা হয়েছে" : "আপনার সিভি সফলভাবে জমা হয়েছে এবং এডমিন পর্যালোচনায় পাঠানো হয়েছে");
      }
      setEditingTeacher(null);
    } catch (error) {
      console.error("Error saving teacher:", error);
      toast.error("তথ্য সেভ করতে সমস্যা হয়েছে");
    }
  };

  const handleEditTeacherClick = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setIsTeacherModalOpen(true);
  };

  const handleAddManualTuitionRequest = async (request: Omit<TuitionRequest, "id" | "createdAt">) => {
    try {
      await addDoc(collection(db, COLLECTIONS.REQUESTS), {
        ...request,
        createdAt: Date.now(),
      });
      toast.success("রিকোয়েস্ট সফলভাবে যোগ করা হয়েছে!");
    } catch (error) {
      console.error(error);
      toast.error("রিকোয়েস্ট যোগ করতে সমস্যা হয়েছে");
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

  return (
    <div className={cn("flex flex-col h-screen max-w-screen-xl mx-auto bg-gray-50 dark:bg-slate-950 overflow-hidden shadow-2xl transition-colors duration-500", isDarkMode && "dark")}>
      <Toaster position="top-center" richColors />
      
      {!isAdmin ? (
        <Login 
          user={user} 
          onLogin={handleLogin} 
          onLogout={handleLogout} 
          onInstall={handleInstallClick}
          deals={publicDeals} 
          teachers={teachers}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      ) : (
        <>
          <Header 
            onLogout={handleLogout} 
            onInstall={handleInstallClick} 
          />
          
          <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
            {activeTab === "dashboard" && (
              <Dashboard 
                onEdit={handleEditClick} 
                onDelete={deleteDeal} 
                onStatusChange={changeTuitionStatus} 
                onHistoryClick={(data) => setHistoryModalData(data)}
                onPayment={(id) => setPaymentModalDealId(id)} 
                onUndoPayment={handleUndoPayment}
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
                onHistoryClick={(data) => setHistoryModalData(data)}
              />
            )}
            {activeTab === "stats" && (
              <Stats 
                deals={deals} 
                teachers={teachers} 
              />
            )}
            {activeTab === "teachers" && (
              <TeacherList 
                teachers={teachers} 
                onAddTeacher={() => { setEditingTeacher(null); setIsTeacherModalOpen(true); }} 
                onEditTeacher={isAdmin ? handleEditTeacherClick : undefined}
                onUpdateStatus={isAdmin ? handleUpdateTeacherStatus : undefined}
                onDelete={isAdmin ? handleDeleteTeacher : undefined}
              />
            )}
            {activeTab === "admin_requests" && (
              <RequestsList 
                requests={tuitionRequests} 
                onUpdateStatus={handleUpdateTuitionRequestStatus} 
                onDelete={handleDeleteTuitionRequest} 
                onAddRequest={handleAddManualTuitionRequest}
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
        </>
      )}

      <PaymentModal onConfirm={processPayment} />
      <HistoryModal />
      <ConfirmDialog {...confirmDialog} />
      <TeacherModal 
        onAdd={handleAddTeacher} 
        isOpen={isTeacherModalOpen}
        onClose={() => { setIsTeacherModalOpen(false); setEditingTeacher(null); }}
        initialData={editingTeacher || undefined}
      />
    </div>
  );
}
