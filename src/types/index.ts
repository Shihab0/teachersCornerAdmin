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
  subjects?: string;
  weeklyDays?: string;
  salary?: string;
  location?: string;
  tutorGender?: "Male" | "Female" | "Any";
  details: string;
  referrerName: string;
  adminName: string;
  selectionDate: string;
  confirmDate: string;
  commission: number;
  paidAmount?: number;
  tuitionStatus: "Processing" | "Running" | "Confirmed" | "Rejected" | "Cancelled";
  commissionStatus: "Pending" | "Partial" | "Paid" | "Free" | "Rejected";
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
  photoUrl: string;
  collegeName: string;
  presentAddress: string;
  permanentAddress: string;
  education: {
    ssc: { year: string; group: string; gpa: string };
    hsc: { year: string; group: string; gpa: string };
    honours: { year: string; subject: string; studyYear: string; gpa: string };
  };
  experience: string;
  hasCurrentTuition: boolean;
  interestedSubjectsAndClasses: string;
  isMedical: boolean;
  medicalInstitution?: string;
  isPublicUniversity: boolean;
  publicUniversityName?: string;
  canTeachHSC: boolean;
  hscSubject?: string;
  facebookLink?: string;
  studentIdUrl?: string;
  rating: number;
  createdAt: number;
  status?: "Pending" | "Approved" | "Rejected";
}

export interface TuitionRequest {
  id: string;
  guardianName: string;
  guardianPhone: string;
  studentClass: string;
  subjects: string;
  area: string;
  details: string;
  daysPerWeek: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: number;
}

export type Tab = "dashboard" | "add" | "revenue" | "stats" | "teachers" | "requests" | "admin_requests" | "admin_pending_teachers";
