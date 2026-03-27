export interface HistoryEntry {
  date: string;
  log: string;
}

export interface Deal {
  id: string;
  tuitionId: string;
  tutorName: string;
  tutorPhone: string;
  guardianPhone: string;
  studentClass: string;
  details: string;
  referrerName: string;
  adminName: string;
  selectionDate: string;
  confirmDate: string;
  commission: number;
  tuitionStatus: "Processing" | "Running" | "Confirmed" | "Rejected" | "Cancelled";
  commissionStatus: "Pending" | "Paid" | "Free" | "Rejected";
  collectedBy: string | null;
  createdAt: number;
  updatedAt: number;
  history: HistoryEntry[];
}

export interface Expense {
  id: string;
  adminName: string;
  amount: number;
  purpose: string;
  createdAt: number;
  history: HistoryEntry[];
}

export interface Teacher {
  id: string;
  name: string;
  phone: string;
  institution: string;
  department: string;
  area: string;
  canTeachHSC: boolean;
  isMedical: boolean;
  rating: number;
  createdAt: number;
}

export type Tab = "dashboard" | "add" | "revenue" | "stats" | "teachers";
