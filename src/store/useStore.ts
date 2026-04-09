import { create } from "zustand";
import { User as FirebaseUser } from "firebase/auth";
import { Deal, Expense, Tab, Teacher, TuitionRequest } from "../types";

interface AppState {
  // Auth
  user: FirebaseUser | null;
  isAdmin: boolean;
  authLoading: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setAuthLoading: (loading: boolean) => void;

  // UI
  activeTab: Tab;
  isDarkMode: boolean;
  setActiveTab: (tab: Tab) => void;
  setIsDarkMode: (isDark: boolean) => void;
  toggleDarkMode: () => void;

  // Data
  deals: Deal[];
  publicDeals: Deal[];
  expenses: Expense[];
  teachers: Teacher[];
  tuitionRequests: TuitionRequest[];
  isLoading: boolean;
  searchQuery: string;
  setDeals: (deals: Deal[]) => void;
  setPublicDeals: (deals: Deal[]) => void;
  setExpenses: (expenses: Expense[]) => void;
  setTeachers: (teachers: Teacher[]) => void;
  setTuitionRequests: (requests: TuitionRequest[]) => void;
  setIsLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;

  // Filters
  filterTuitionStatus: string;
  filterCommissionStatus: string;
  revYear: string;
  revMonth: string;
  isEditingExpense: boolean;
  editExpenseId: string | null;
  expenseForm: { adminName: string; amount: string; purpose: string };
  isProcessing: boolean;
  setFilterTuitionStatus: (status: string) => void;
  setFilterCommissionStatus: (status: string) => void;
  setRevYear: (year: string) => void;
  setRevMonth: (month: string) => void;
  setIsEditingExpense: (isEditing: boolean) => void;
  setEditExpenseId: (id: string | null) => void;
  setExpenseForm: (form: { adminName: string; amount: string; purpose: string }) => void;
  setIsProcessing: (isProcessing: boolean) => void;

  // New UI States
  paymentModalDealId: string | null;
  setPaymentModalDealId: (id: string | null) => void;
  historyModalData: { title: string; history: any[] } | null;
  setHistoryModalData: (data: { title: string; history: any[] } | null) => void;
  isTeacherModalOpen: boolean;
  setIsTeacherModalOpen: (val: boolean) => void;
  isManualEntryModalOpen: boolean;
  setIsManualEntryModalOpen: (val: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // Auth
  user: null,
  isAdmin: false,
  authLoading: true,
  setUser: (user) => set({ user }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setAuthLoading: (authLoading) => set({ authLoading }),

  // UI
  activeTab: "dashboard",
  isDarkMode: (() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" || 
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  })(),
  setActiveTab: (activeTab) => set({ activeTab }),
  setIsDarkMode: (isDarkMode) => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    set({ isDarkMode });
  },
  toggleDarkMode: () => set((state) => {
    const nextMode = !state.isDarkMode;
    localStorage.setItem("theme", nextMode ? "dark" : "light");
    return { isDarkMode: nextMode };
  }),

  // Data
  deals: [],
  publicDeals: [],
  expenses: [],
  teachers: [],
  tuitionRequests: [],
  isLoading: true,
  searchQuery: "",
  setDeals: (deals) => set({ deals }),
  setPublicDeals: (publicDeals) => set({ publicDeals }),
  setExpenses: (expenses) => set({ expenses }),
  setTeachers: (teachers) => set({ teachers }),
  setTuitionRequests: (tuitionRequests) => set({ tuitionRequests }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Filters
  filterTuitionStatus: "All",
  filterCommissionStatus: "All",
  revYear: "All",
  revMonth: "All",
  isEditingExpense: false,
  editExpenseId: null,
  expenseForm: { adminName: "", amount: "", purpose: "" },
  isProcessing: false,
  setFilterTuitionStatus: (filterTuitionStatus) => set({ filterTuitionStatus }),
  setFilterCommissionStatus: (filterCommissionStatus) => set({ filterCommissionStatus }),
  setRevYear: (revYear) => set({ revYear }),
  setRevMonth: (revMonth) => set({ revMonth }),
  setIsEditingExpense: (isEditingExpense) => set({ isEditingExpense }),
  setEditExpenseId: (editExpenseId) => set({ editExpenseId }),
  setExpenseForm: (expenseForm) => set({ expenseForm }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),

  // New UI States
  paymentModalDealId: null,
  setPaymentModalDealId: (paymentModalDealId) => set({ paymentModalDealId }),
  historyModalData: null,
  setHistoryModalData: (historyModalData) => set({ historyModalData }),
  isTeacherModalOpen: false,
  setIsTeacherModalOpen: (isTeacherModalOpen) => set({ isTeacherModalOpen }),
  isManualEntryModalOpen: false,
  setIsManualEntryModalOpen: (isManualEntryModalOpen) => set({ isManualEntryModalOpen }),
}));
