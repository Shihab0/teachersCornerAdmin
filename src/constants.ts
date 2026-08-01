import { appId } from "./lib/firebase";

export const COLLECTIONS = {
  DEALS: `artifacts/${appId}/public/data/tc_deals`,
  EXPENSES: `artifacts/${appId}/public/data/tc_expenses`,
  TEACHERS: `artifacts/${appId}/public/data/tc_teachers`,
  REQUESTS: `artifacts/${appId}/public/data/tc_tuition_requests`,
  CONNECTION_TEST: `artifacts/${appId}/public/data/connection_test`,
};

export const ALLOWED_EMAILS = [
  "ataharshihab1@gmail.com",
  "atahershihab151@gmail.com",
  "teacherscorner01@gmail.com",
  "dipu.tc@gmail.com",
  "shimanto.tc@gmail.com"
];

export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const lower = email.toLowerCase();
  if (ALLOWED_EMAILS.map(e => e.toLowerCase()).includes(lower)) return true;
  if (lower.endsWith("@teacherscorner.com")) return true;
  return false;
};
