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
