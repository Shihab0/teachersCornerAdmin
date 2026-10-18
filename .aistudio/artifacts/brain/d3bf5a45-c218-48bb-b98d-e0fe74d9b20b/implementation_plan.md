# Teacher Filtering & Search by Honours Subject

Empower administrators to rapidly find and filter registered and pending tutors by their Honours (Hons) academic subjects via both freeform search and a dedicated subject dropdown.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design and behavioral choices were confirmed through your input:
> - **Search Integration**: Enabled both in the main search bar (freeform text) and via a dedicated Honours subject dropdown filter.
> - **Scope of Application**: Implemented across both the primary **Approved / All Teachers List** (`TeacherList.tsx`) and the **Pending Teachers List** (`PendingTeachersList.tsx`).

- **Confirmed Decision 1**: Searching in the search bar matches teacher name, institution, phone number, and Honours subject (`education.honours.subject`).
- **Confirmed Decision 2**: Added a dedicated Honours Subject dropdown selector alongside existing Area and College dropdowns, populated with standard Kishoreganj tutor subjects and custom subjects.

---

### 1. Overview & Core Concept

When parents or guardians request a tutor for higher-grade subjects (e.g., Higher Math, Physics, Zoology, English), administrators need to find tutors who specialize in those subjects at the undergraduate/honours level. Currently, the search bar only matches teacher name and institution, making subject-specific lookups time-consuming.

This enhancement introduces dual-mode filtering:
1. **Dynamic Text Search**: Typing any subject name (e.g., "Physics", "ইংরেজি", "Mathematics", "Zoology") into the search bar instantly filters matching tutors.
2. **Dedicated Subject Selector**: A clean dropdown filter featuring all recognized university departments/subjects, enabling one-click segmentation of all available tutors.

---

### 2. User Experience & Visual Design

#### Admin Filter Bar Refinement
- **Main Teacher List (`TeacherList.tsx`)**:
  - The search input placeholder is updated to: `নাম, প্রতিষ্ঠান, ফোন নম্বর বা অনার্স বিষয় দিয়ে খুঁজুন...`.
  - The filter row expands from a 3-column grid (`sm:grid-cols-3`) to a balanced 4-column grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`) containing:
    1. **এলাকা (Area)**
    2. **কলেজ / প্রতিষ্ঠান (Institution)**
    3. **অনার্স বিষয় (Honours Subject)**
    4. **বিশেষ ক্যাটাগরি (Special Category)**
  - Retains the existing dark/light slate styling, chevron icons, and smooth transitions.

- **Pending Teachers List (`PendingTeachersList.tsx`)**:
  - Search placeholder updated to: `নাম, ফোন, প্রতিষ্ঠান বা অনার্স বিষয় দিয়ে খুঁজুন...`.
  - Added an Honours Subject dropdown filter right beside the search input, styled consistently with the high-contrast dashboard aesthetic.

- **Zero-Pill Compliance & Clean Data Display**:
  - The Honours subject is displayed as clean, unboxed typography in teacher profiles and expanded detail drawers (`education.honours.subject (Year)`), maintaining the strict anti-slop guidelines.

---

### 3. Key Product Decisions & Trade-Offs

- **Centralized Subject Constants**:
  - *Chosen Approach*: Move `HONOURS_SUBJECTS` to `src/constants.ts` so that registration forms, modal editors, and admin filter dropdowns always share a unified, consistent list of subjects.
  - *Why*: Eliminates duplication and guarantees that when a tutor selects a subject during onboarding, the exact same string is available in the admin filter.
- **Case-Insensitive & Flexible Matching**:
  - *Chosen Approach*: Text search matches against `.toLowerCase()` on both Latin and Bengali characters, ensuring seamless searching regardless of keyboard language.
  - *Why*: Bengali users sometimes search in English ("Physics") and sometimes in Bengali phonetics; normal text search handles exact substrings gracefully.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       Admin Dashboard                       │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
  ┌────────────────────────┐      ┌─────────────────────────┐
  │   TeacherList (All)    │      │   PendingTeachersList   │
  ├────────────────────────┤      ├─────────────────────────┤
  │ [Search: Name/Hons]    │      │ [Search: Name/Hons]     │
  │ [Area Dropdown]        │      │ [Hons Subject Dropdown] │
  │ [Institution Dropdown] │      └────────────┬────────────┘
  │ [Hons Subject Dropdown]│                   │
  │ [Category Dropdown]    │                   │
  └────────────┬───────────┘                   │
               │                               │
               ▼                               ▼
       ┌───────────────────────────────────────────────┐
       │             filteredTeachers Memo             │
       │  • matchesSearch (name, college, phone, hons) │
       │  • matchesSubject (education.honours.subject) │
       │  • matchesArea / matchesCollege / matchesCat  │
       └───────────────────────────────────────────────┘
```

#### Entity Properties
- `teacher.education.honours.subject`: String representing the major department (e.g., "Physics", "Chemistry", "Mathematics", "English", "Others").
- Standard List from `HONOURS_SUBJECTS`: Physics, Chemistry, Mathematics, Zoology, Botany, English, Bangla, Accounting, Management, Economics, Political Science, History, Islamic History, Sociology, Social Work, MBBS, BDS, Computer Science, Others.
