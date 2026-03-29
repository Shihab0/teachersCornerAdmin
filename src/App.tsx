import React, { useState, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from "firebase/auth";
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, query, orderBy, getDocs, getDocFromServer } from "firebase/firestore";
import { auth, db, googleProvider, appId, allowedEmails } from "./lib/firebase";
import { Toaster, toast } from "sonner";
import { Deal, Expense, Tab, HistoryEntry, Teacher, TuitionRequest } from "./types";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
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
import { Icon } from "./components/ui/Icon";
import { Smartphone, Loader2 } from "lucide-react";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

import { DEMO_TEACHERS, DEMO_DEALS, DEMO_EXPENSES } from "./lib/demoData";

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  // App Install States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Data States
  const [deals, setDeals] = useState<Deal[]>([]);
  const [publicDeals, setPublicDeals] = useState<Deal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [tuitionRequests, setTuitionRequests] = useState<TuitionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const isInjecting = React.useRef(false);

  // UI States
  const [paymentModalDealId, setPaymentModalDealId] = useState<string | null>(null);
  const [historyModalData, setHistoryModalData] = useState<{ title: string; history: HistoryEntry[] } | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
    isDanger: true,
  });

  // Filters
  const [filterTuitionStatus, setFilterTuitionStatus] = useState("All");
  const [filterCommissionStatus, setFilterCommissionStatus] = useState("All");
  const [revYear, setRevYear] = useState("All");
  const [revMonth, setRevMonth] = useState("All");

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
  const [isEditingExpense, setIsEditingExpense] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    adminName: "",
    amount: "",
    purpose: "",
  });

  // Auth & PWA Prompt
  useEffect(() => {
    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, "artifacts", appId, "public", "data", "connection_test", "test"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("the client is offline")) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email && allowedEmails.includes(currentUser.email.toLowerCase())) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
      setAuthLoading(false);

      // Hide PWA Loader
      const loader = document.getElementById("pwa-loader");
      if (loader) {
        loader.style.opacity = "0";
        loader.style.visibility = "hidden";
        setTimeout(() => loader.remove(), 500);
      }
    });

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    return () => unsubscribe();
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
    // Surface to user if needed, or just log for agent
  };

  // Fetch Data
  useEffect(() => {
    // Public deals for landing page
    const dealPath = `artifacts/${appId}/public/data/tc_deals`;
    const baseRef = collection(db, dealPath);
    const qPublicDeals = query(baseRef, orderBy("createdAt", "desc"));
    const unsubPublic = onSnapshot(qPublicDeals, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Deal))
        .filter(d => d.tuitionStatus === "Confirmed" || d.tuitionStatus === "Running")
        .slice(0, 5);
      setPublicDeals(data);
    });

    if (!isAdmin) return () => unsubPublic();

    const qDeals = query(baseRef, orderBy("createdAt", "desc"));
    const unsubDeals = onSnapshot(qDeals, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Deal));
      setDeals(data);
      setIsLoading(false);
    }, (err) => {
      handleFirestoreError(err, "list", dealPath);
      setIsLoading(false);
    });

    const expPath = `artifacts/${appId}/public/data/tc_expenses`;
    const expRef = collection(db, expPath);
    const qExp = query(expRef, orderBy("createdAt", "desc"));
    const unsubExp = onSnapshot(qExp, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Expense));
      setExpenses(data);
    }, (err) => {
      handleFirestoreError(err, "list", expPath);
    });

    const teacherPath = `artifacts/${appId}/public/data/tc_teachers`;
    const teacherRef = collection(db, teacherPath);
    const qTeacher = query(teacherRef, orderBy("createdAt", "desc"));
    const unsubTeacher = onSnapshot(qTeacher, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Teacher));
      setTeachers(data);
    }, (err) => {
      handleFirestoreError(err, "list", teacherPath);
    });

    const reqPath = `artifacts/${appId}/public/data/tc_tuition_requests`;
    const reqRef = collection(db, reqPath);
    const qReq = query(reqRef, orderBy("createdAt", "desc"));
    const unsubReq = onSnapshot(qReq, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as TuitionRequest));
      setTuitionRequests(data);
    }, (err) => {
      handleFirestoreError(err, "list", reqPath);
    });

    return () => {
      unsubPublic();
      unsubDeals();
      unsubExp();
      unsubTeacher();
      unsubReq();
    };
  }, [isAdmin]);

  // Demo Data Injection
  useEffect(() => {
    if (!isAdmin || authLoading || isLoading || isInjecting.current) return;

    const injectIfEmpty = async () => {
      isInjecting.current = true;
      try {
        const tPath = `artifacts/${appId}/public/data/tc_teachers`;
        const dPath = `artifacts/${appId}/public/data/tc_deals`;
        const ePath = `artifacts/${appId}/public/data/tc_expenses`;
        const tCol = collection(db, tPath);
        const dCol = collection(db, dPath);
        const eCol = collection(db, ePath);

        if (teachers.length === 0) {
          console.log("Injecting Teachers...");
          for (const t of DEMO_TEACHERS) await addDoc(tCol, t);
        }
        if (deals.length === 0) {
          console.log("Injecting Deals...");
          for (const d of DEMO_DEALS) await addDoc(dCol, d);
        }
        if (expenses.length === 0) {
          console.log("Injecting Expenses...");
          for (const e of DEMO_EXPENSES) await addDoc(eCol, e);
        }
        console.log("Demo data injection check complete.");
      } catch (e) {
        handleFirestoreError(e, "write", "demo_injection");
      } finally {
        isInjecting.current = false;
      }
    };

    if (teachers.length === 0 || deals.length === 0 || expenses.length === 0) {
      injectIfEmpty();
    }
  }, [isAdmin, authLoading, isLoading, deals.length, teachers.length, expenses.length]);

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
          console.log("Starting demo data reset process...");
          const tPath = `artifacts/${appId}/public/data/tc_teachers`;
          const dPath = `artifacts/${appId}/public/data/tc_deals`;
          const ePath = `artifacts/${appId}/public/data/tc_expenses`;
          const tCol = collection(db, tPath);
          const dCol = collection(db, dPath);
          const eCol = collection(db, ePath);
          
          // Clear existing
          console.log("Fetching existing documents for deletion...");
          const [tSnap, dSnap, eSnap] = await Promise.all([
            getDocs(tCol),
            getDocs(dCol),
            getDocs(eCol)
          ]);
          
          console.log(`Found: ${tSnap.size} teachers, ${dSnap.size} deals, ${eSnap.size} expenses to delete.`);
          
          const deletePromises = [
            ...tSnap.docs.map(d => deleteDoc(d.ref)),
            ...dSnap.docs.map(d => deleteDoc(d.ref)),
            ...eSnap.docs.map(d => deleteDoc(d.ref))
          ];
          
          await Promise.all(deletePromises);
          console.log("All existing documents deleted successfully.");
          
          // Inject new
          console.log("Injecting new demo data...");
          const injectPromises = [
            ...DEMO_TEACHERS.map(t => addDoc(tCol, t)),
            ...DEMO_DEALS.map(d => addDoc(dCol, d)),
            ...DEMO_EXPENSES.map(e => addDoc(eCol, e))
          ];
          
          await Promise.all(injectPromises);
          console.log("New demo data injected successfully.");
          
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

  const handleLogin = async () => {
    try {
      setAuthLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      alert("লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
    } else {
      setShowInstallModal(true);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleExpenseChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });

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
      const dealPath = `artifacts/${appId}/public/data/tc_deals`;
      const colRef = collection(db, dealPath);
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
      handleFirestoreError(err, isEditing ? OperationType.UPDATE : OperationType.CREATE, `artifacts/${appId}/public/data/tc_deals`);
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
    await updateDoc(doc(db, "artifacts", appId, "public", "data", "tc_deals", id), updates);
  };

  const deleteDeal = (id: string) => {
    requestConfirm("নিশ্চিত ডিলিট?", "এই রেকর্ডটি চিরতরে মুছে যাবে।", async () => {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "tc_deals", id));
    });
  };

  const handleDeleteFromEdit = () => {
    if (!editId) return;
    requestConfirm("নিশ্চিত ডিলিট?", "এই রেকর্ডটি চিরতরে মুছে যাবে।", async () => {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "tc_deals", editId));
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
    await updateDoc(doc(db, "artifacts", appId, "public", "data", "tc_deals", deal.id), {
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
        await updateDoc(doc(db, "artifacts", appId, "public", "data", "tc_deals", deal.id), {
          commissionStatus: "Pending",
          collectedBy: null,
          history,
        });
      },
      false
    );
  };

  const handleAddExpense = async (e: FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.adminName) return;
    setIsProcessing(true);
    const colRef = collection(db, "artifacts", appId, "public", "data", "tc_expenses");

    try {
      if (isEditingExpense && editExpenseId) {
        const oldExp = expenses.find((ex) => ex.id === editExpenseId);
        const history = [
          ...(oldExp?.history || []),
          { date: new Date().toISOString(), log: "খরচের তথ্য আপডেট করা হয়েছে" },
        ];
        await updateDoc(doc(colRef, editExpenseId), {
          ...expenseForm,
          amount: Number(expenseForm.amount),
          history,
        });
        setIsEditingExpense(false);
        setEditExpenseId(null);
        toast.success("খরচ সফলভাবে আপডেট করা হয়েছে!");
      } else {
        await addDoc(colRef, {
          ...expenseForm,
          amount: Number(expenseForm.amount),
          createdAt: Date.now(),
          history: [{ date: new Date().toISOString(), log: "নতুন খরচ এন্ট্রি করা হয়েছে" }],
        });
        toast.success("নতুন খরচ সফলভাবে যোগ করা হয়েছে!");
      }
      setExpenseForm({ adminName: "", amount: "", purpose: "" });
    } catch (err) {
      console.error(err);
      toast.error("খরচ সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditExpenseClick = (exp: Expense) => {
    setExpenseForm({
      adminName: exp.adminName,
      amount: exp.amount.toString(),
      purpose: exp.purpose,
    });
    setIsEditingExpense(true);
    setEditExpenseId(exp.id);
  };

  const deleteExpense = (id: string) => {
    requestConfirm("খরচ ডিলিট?", "আপনি কি নিশ্চিত?", async () => {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "tc_expenses", id));
    });
  };

  const exportToCSV = () => {
    const headers = [
      "Tuition ID",
      "Tutor Name",
      "Tutor Phone",
      "Guardian Phone",
      "Class",
      "Subject/Area",
      "Management",
      "Commission",
      "Tuition Status",
      "Payment Status",
      "Collected By",
      "Selection Date",
    ];
    const rows = deals.map((d) => [
      d.tuitionId,
      d.tutorName,
      d.tutorPhone,
      d.guardianPhone,
      d.studentClass,
      `"${d.details || ""}"`,
      d.adminName,
      d.commission,
      d.tuitionStatus,
      d.commissionStatus,
      d.collectedBy || "N/A",
      d.selectionDate,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TC_Data_Backup_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const revStats = useMemo(() => {
    const fDeals = deals.filter((d) => {
      if (revYear === "All" && revMonth === "All") return true;
      const date = new Date(d.confirmDate || d.selectionDate || d.createdAt);
      const y = date.getFullYear().toString();
      const m = (date.getMonth() + 1).toString().padStart(2, "0");
      return (revYear === "All" || y === revYear) && (revMonth === "All" || m === revMonth);
    });

    const fExps = expenses.filter((e) => {
      if (revYear === "All" && revMonth === "All") return true;
      const date = new Date(e.createdAt);
      const y = date.getFullYear().toString();
      const m = (date.getMonth() + 1).toString().padStart(2, "0");
      return (revYear === "All" || y === revYear) && (revMonth === "All" || m === revMonth);
    });

    const collected = fDeals
      .filter((d) => d.commissionStatus === "Paid")
      .reduce((s, d) => s + Number(d.commission), 0);
    const pending = fDeals
      .filter((d) => d.commissionStatus === "Pending" && !["Rejected", "Cancelled"].includes(d.tuitionStatus))
      .reduce((s, d) => s + Number(d.commission), 0);
    const totalExp = fExps.reduce((s, e) => s + Number(e.amount), 0);

    const admins: Record<string, number> = { Dipu: 0, Shimanto: 0 };
    fDeals.forEach((d) => {
      if (d.commissionStatus === "Paid" && d.collectedBy) admins[d.collectedBy] += Number(d.commission);
    });

    const adminExps: Record<string, number> = { Dipu: 0, Shimanto: 0 };
    fExps.forEach((e) => {
      if (adminExps[e.adminName] !== undefined) adminExps[e.adminName] += Number(e.amount);
    });

    return { collected, pending, totalExp, admins, adminExps };
  }, [deals, expenses, revYear, revMonth]);

  const handleAddTeacher = async (teacherData: Partial<Teacher>) => {
    try {
      const teacherRef = collection(db, "artifacts", appId, "public", "data", "tc_teachers");
      await addDoc(teacherRef, {
        ...teacherData,
        status: "Approved",
        createdAt: Date.now(),
      });
      toast.success("শিক্ষক সফলভাবে যুক্ত করা হয়েছে");
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast.error("শিক্ষক যুক্ত করতে সমস্যা হয়েছে");
    }
  };

  const handleUpdateTuitionRequestStatus = async (id: string, status: "Approved" | "Rejected") => {
    try {
      await updateDoc(doc(db, "artifacts", appId, "public", "data", "tc_tuition_requests", id), {
        status,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error updating request status:", error);
      throw error;
    }
  };

  const handleDeleteTuitionRequest = async (id: string) => {
    try {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "tc_tuition_requests", id));
    } catch (error) {
      console.error("Error deleting request:", error);
      throw error;
    }
  };

  const handleUpdateTeacherStatus = async (id: string, status: "Approved" | "Rejected") => {
    try {
      await updateDoc(doc(db, "artifacts", appId, "public", "data", "tc_teachers", id), {
        status,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error updating teacher status:", error);
      throw error;
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    try {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "tc_teachers", id));
    } catch (error) {
      console.error("Error deleting teacher:", error);
      throw error;
    }
  };

  if (authLoading || (isAdmin && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-indigo-200 font-black text-sm uppercase tracking-widest animate-pulse">
            লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Login user={user} onLogin={handleLogin} onLogout={handleLogout} deals={publicDeals} />;
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 overflow-hidden shadow-2xl">
      <Toaster position="top-center" richColors />
      <Header user={user} onLogout={handleLogout} onInstall={handleInstallClick} />

      <main className="flex-1 overflow-y-auto p-4 pb-28 no-scrollbar">
        {activeTab === "dashboard" && (
          <Dashboard
            deals={deals}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterTuitionStatus={filterTuitionStatus}
            setFilterTuitionStatus={setFilterTuitionStatus}
            filterCommissionStatus={filterCommissionStatus}
            setFilterCommissionStatus={setFilterCommissionStatus}
            exportToCSV={exportToCSV}
            onEdit={handleEditClick}
            onDelete={deleteDeal}
            onStatusChange={changeTuitionStatus}
            onHistoryClick={setHistoryModalData}
            onCommissionClick={(deal) => setPaymentModalDealId(deal.id)}
            onUndoPayment={handleUndoPayment}
            onResetDemo={handleResetDemoData}
          />
        )}

        {activeTab === "add" && (
          <AddDeal
            isEditing={isEditing}
            formData={formData}
            handleInputChange={handleInputChange}
            setFormData={setFormData}
            idError={idError}
            setIdError={setIdError}
            onSubmit={handleAddDeal}
            onDelete={handleDeleteFromEdit}
            onCancel={() => {
              setIsEditing(false);
              setEditId(null);
              setIdError("");
              setActiveTab("dashboard");
            }}
            isProcessing={isProcessing}
          />
        )}

        {activeTab === "revenue" && (
          <Revenue
            revYear={revYear}
            setRevYear={setRevYear}
            revMonth={revMonth}
            setRevMonth={setRevMonth}
            revStats={revStats}
            expenses={expenses}
            expenseForm={expenseForm}
            handleExpenseChange={handleExpenseChange}
            handleAddExpense={handleAddExpense}
            isEditingExpense={isEditingExpense}
            setIsEditingExpense={setIsEditingExpense}
            setExpenseForm={setExpenseForm}
            onEditExpense={handleEditExpenseClick}
            onDeleteExpense={deleteExpense}
            onHistoryClick={setHistoryModalData}
            isProcessing={isProcessing}
          />
        )}

        {activeTab === "stats" && (
          <Stats 
            deals={deals} 
            teachers={teachers} 
            onResetDemo={handleResetDemoData}
          />
        )}

        {activeTab === "teachers" && (
          <TeacherList 
            teachers={teachers.filter(t => t.status === "Approved")} 
            onAddTeacher={() => setIsTeacherModalOpen(true)} 
            onResetDemo={handleResetDemoData}
          />
        )}

        {activeTab === "requests" && (
          <RequestsList 
            requests={tuitionRequests} 
            onUpdateStatus={handleUpdateTuitionRequestStatus}
            onDelete={handleDeleteTuitionRequest}
          />
        )}

        {activeTab === "pending_teachers" && (
          <PendingTeachersList 
            teachers={teachers.filter(t => t.status === "Pending")} 
            onUpdateStatus={handleUpdateTeacherStatus}
            onDelete={handleDeleteTeacher}
          />
        )}
      </main>

      <TeacherModal 
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onAdd={handleAddTeacher}
      />

      <Footer
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isEditing={isEditing}
        onEntryClick={() => {
          setActiveTab("add");
          if (!isEditing)
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
          setIdError("");
        }}
      />

      {/* Modals */}
      {historyModalData && (
        <HistoryModal
          title={historyModalData.title}
          history={historyModalData.history}
          onClose={() => setHistoryModalData(null)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
        isDanger={confirmDialog.isDanger}
      />

      {paymentModalDealId && (
        <PaymentModal onProcess={processPayment} onClose={() => setPaymentModalDealId(null)} />
      )}

      {showInstallModal && (
        <div
          className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-6 backdrop-blur-sm"
          onClick={() => setShowInstallModal(false)}
        >
          <div className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <Icon icon={Smartphone} size={40} className="mx-auto text-indigo-500 mb-5" />
            <h3 className="font-black text-xl text-gray-800 mb-2">হোম স্ক্রিনে সেভ করুন</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-8 font-medium">
              অ্যাপটি আপনার মোবাইলে সেভ করতে ব্রাউজারের <span className="font-bold text-gray-800">৩-ডট (⋮)</span> মেনু থেকে{" "}
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">"Install app"</span> অথবা{" "}
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">"Add to Home screen"</span> এ ক্লিক করুন।
            </p>
            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 transition-transform"
            >
              বুঝতে পেরেছি
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
