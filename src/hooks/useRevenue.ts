import { ChangeEvent, FormEvent, useMemo } from "react";
import { collection, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { COLLECTIONS } from "../constants";
import { useStore } from "../store/useStore";
import { toast } from "sonner";
import { Expense, HistoryEntry } from "../types";

export const useRevenue = () => {
  const {
    deals,
    expenses,
    revYear,
    revMonth,
    expenseForm,
    setExpenseForm,
    isEditingExpense,
    setIsEditingExpense,
    editExpenseId,
    setEditExpenseId,
    isProcessing,
    setIsProcessing,
  } = useStore();

  const handleExpenseChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });
  };

  const handleAddExpense = async (e: FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.adminName) return;
    setIsProcessing(true);
    const colRef = collection(db, COLLECTIONS.EXPENSES);

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

  const deleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.EXPENSES, id));
      toast.success("খরচ সফলভাবে ডিলিট করা হয়েছে!");
    } catch (err) {
      console.error(err);
      toast.error("খরচ ডিলিট করতে সমস্যা হয়েছে।");
    }
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

    const collected = fDeals.filter((d) => d.commissionStatus === "Paid").reduce((s, d) => s + Number(d.commission), 0);
    const pending = fDeals.filter((d) => d.commissionStatus === "Pending" && !["Rejected", "Cancelled"].includes(d.tuitionStatus)).reduce((s, d) => s + Number(d.commission), 0);
    const totalExp = fExps.reduce((s, e) => s + Number(e.amount), 0);

    const admins: Record<string, number> = { Dipu: 0, Shimanto: 0 };
    fDeals.forEach((d) => { if (d.commissionStatus === "Paid" && d.collectedBy) admins[d.collectedBy] += Number(d.commission); });

    const adminExps: Record<string, number> = { Dipu: 0, Shimanto: 0 };
    fExps.forEach((e) => { if (adminExps[e.adminName] !== undefined) adminExps[e.adminName] += Number(e.amount); });

    return { collected, pending, totalExp, admins, adminExps };
  }, [deals, expenses, revYear, revMonth]);

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

  return {
    revStats,
    handleExpenseChange,
    handleAddExpense,
    handleEditExpenseClick,
    deleteExpense,
    exportToCSV,
  };
};
