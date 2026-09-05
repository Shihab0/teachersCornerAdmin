import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Teacher } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function inferGenderFromNameOrInstitution(name?: string, collegeName?: string): "Male" | "Female" | null {
  const nameLower = (name || "").toLowerCase();
  const collegeLower = (collegeName || "").toLowerCase();

  const femaleNameKeywords = [
    "akter", "aktar", "akhter", "begum", "khatun", "khatoon", "sultana", 
    "nahar", "nasrin", "nasreen", "parvin", "parveen", "yasmin", "rina", 
    "shirin", "mst.", "mst", "sadia", "মোছাঃ", "মোছা.", "মোছা", "বেগম", "খাতুন", 
    "আক্তার", "সুলতানা", "মরিয়ম", "মরিয়ম", "আরা", "সাদিয়া", "সাদিয়া", "সিগমা", "ক্রিসেন"
  ];

  const femaleCollegeKeywords = [
    "girls", "girls'", "মহিলা", "mohila", "women"
  ];

  for (const kw of femaleNameKeywords) {
    if (nameLower.includes(kw)) {
      return "Female";
    }
  }

  for (const kw of femaleCollegeKeywords) {
    if (collegeLower.includes(kw)) {
      return "Female";
    }
  }

  return null;
}

export function resolveTeacherGender(teacher: Partial<Teacher>): "Male" | "Female" | null {
  if (teacher.gender === "Male" || teacher.gender === "Female") {
    return teacher.gender;
  }
  return inferGenderFromNameOrInstitution(teacher.name, teacher.collegeName);
}

export function normalizePhoneVariations(phone: string): string[] {
  // Extract only digits
  const digits = phone.replace(/\D/g, "");
  let core = digits;
  
  // Extract the core 11-digit BD number starting with "01"
  if (digits.startsWith("8801") && digits.length === 13) {
    core = digits.substring(2);
  } else if (digits.startsWith("01") && digits.length === 11) {
    core = digits;
  } else if (digits.startsWith("1") && digits.length === 10) {
    core = "0" + digits;
  }

  // If we successfully found an 11 digit core, generate known historical database formats
  if (core.startsWith("01") && core.length === 11) {
    return [
      core,                  // "01761992500"
      `+88${core}`,          // "+8801761992500"
      `88${core}`,           // "8801761992500"
      `${core.slice(0,5)}-${core.slice(5)}` // "01761-992500"
    ];
  }

  // Fallback to exactly what the user entered if it doesn't match standard BD format
  return [phone];
}

