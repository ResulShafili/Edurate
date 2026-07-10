export type CourseSummary = {
  id: string;
  code: string;
  title: string;
};

export type ReviewSummary = {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  ratingOverall: number;
  ratingTeaching: number;
  ratingDifficulty: number;
  ratingObjectivity: number;
  wouldTakeAgain: boolean | null;
  comment: string;
  isAnonymous: boolean;
  semester: string;
  academicYear: number;
  reviewerName: string;
  createdAt: string;
};

export type ProfessorSummary = {
  id: string;
  slug?: string;
  fullName: string;
  title: string;
  bio: string;
  departmentName: string;
  universityName: string;
  reviewCount: number;
  averageRating: number;
  averageTeaching: number;
  averageDifficulty: number;
  averageObjectivity: number;
  courses: CourseSummary[];
};

export type ProfessorProfile = ProfessorSummary & {
  reviews: ReviewSummary[];
};

export const mockProfessors: ProfessorProfile[] = [
  {
    id: "professor-nigar-mammadova",
    fullName: "Nigar Mammadova",
    title: "Senior Lecturer",
    bio: "Alqoritmlər və problem həlli dərslərində praktiki yanaşması ilə tanınır.",
    departmentName: "Computer Science",
    universityName: "Qarabağ Universiteti",
    reviewCount: 2,
    averageRating: 4.8,
    averageTeaching: 4.9,
    averageDifficulty: 3.4,
    averageObjectivity: 4.7,
    courses: [
      {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        code: "CS201",
        title: "Data Structures",
      },
      {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        code: "CS301",
        title: "Algorithms",
      },
    ],
    reviews: [
      {
        id: "r-1",
        courseId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        courseCode: "CS201",
        courseTitle: "Data Structures",
        ratingOverall: 5,
        ratingTeaching: 5,
        ratingDifficulty: 3,
        ratingObjectivity: 5,
        wouldTakeAgain: true,
        comment: "Mövzuları çox aydın izah edir və tapşırıqlar real imtahana yaxşı hazırlayır.",
        isAnonymous: true,
        semester: "fall",
        academicYear: 2026,
        reviewerName: "Anonim tələbə",
        createdAt: "2026-06-20T10:00:00.000Z",
      },
      {
        id: "r-2",
        courseId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        courseCode: "CS301",
        courseTitle: "Algorithms",
        ratingOverall: 5,
        ratingTeaching: 5,
        ratingDifficulty: 4,
        ratingObjectivity: 4,
        wouldTakeAgain: true,
        comment: "Çətin dərsdir, amma izahlar sistemlidir. Lab-ları vaxtında etmək lazımdır.",
        isAnonymous: true,
        semester: "spring",
        academicYear: 2026,
        reviewerName: "Anonim tələbə",
        createdAt: "2026-05-12T10:00:00.000Z",
      },
    ],
  },
  {
    id: "professor-elvin-huseynli",
    fullName: "Elvin Huseynli",
    title: "Assistant Professor",
    bio: "Database design, SQL optimizasiyası və backend arxitekturası üzrə fokuslanır.",
    departmentName: "Software Engineering",
    universityName: "Qarabağ Universiteti",
    reviewCount: 2,
    averageRating: 4.6,
    averageTeaching: 4.6,
    averageDifficulty: 3.8,
    averageObjectivity: 4.5,
    courses: [
      {
        id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        code: "SE240",
        title: "Databases",
      },
      {
        id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        code: "SE310",
        title: "Backend Engineering",
      },
    ],
    reviews: [
      {
        id: "r-3",
        courseId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        courseCode: "SE240",
        courseTitle: "Databases",
        ratingOverall: 4,
        ratingTeaching: 4,
        ratingDifficulty: 4,
        ratingObjectivity: 5,
        wouldTakeAgain: true,
        comment: "SQL mövzularını layihə üzərindən izah etməsi çox kömək edir.",
        isAnonymous: true,
        semester: "fall",
        academicYear: 2026,
        reviewerName: "Anonim tələbə",
        createdAt: "2026-06-02T10:00:00.000Z",
      },
      {
        id: "r-5",
        courseId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        courseCode: "SE310",
        courseTitle: "Backend Engineering",
        ratingOverall: 3,
        ratingTeaching: 4,
        ratingDifficulty: 5,
        ratingObjectivity: 3,
        wouldTakeAgain: true,
        comment: "Tapşırıqlar öyrədicidir, amma deadline-lar bir-birinə çox yaxın düşür. Həftəlik planla getmək vacibdir.",
        isAnonymous: false,
        semester: "spring",
        academicYear: 2026,
        reviewerName: "Nihat Əliyev",
        createdAt: "2026-03-21T10:00:00.000Z",
      },
    ],
  },
  {
    id: "professor-aysel-karimova",
    fullName: "Aysel Karimova",
    title: "Lecturer",
    bio: "Frontend, UI sistemləri və web accessibility mövzularını praktiki nümunələrlə keçir.",
    departmentName: "Information Technologies",
    universityName: "Qarabağ Universiteti",
    reviewCount: 2,
    averageRating: 4.5,
    averageTeaching: 4.7,
    averageDifficulty: 3.1,
    averageObjectivity: 4.4,
    courses: [
      {
        id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        code: "WEB210",
        title: "React Fundamentals",
      },
      {
        id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
        code: "WEB320",
        title: "Product UI",
      },
    ],
    reviews: [
      {
        id: "r-4",
        courseId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        courseCode: "WEB210",
        courseTitle: "React Fundamentals",
        ratingOverall: 5,
        ratingTeaching: 5,
        ratingDifficulty: 3,
        ratingObjectivity: 4,
        wouldTakeAgain: true,
        comment: "Kod review-ları çox faydalıdır, dərsdən sonra nəyi düzəltmək lazım olduğunu bilirsən.",
        isAnonymous: true,
        semester: "spring",
        academicYear: 2026,
        reviewerName: "Anonim tələbə",
        createdAt: "2026-04-18T10:00:00.000Z",
      },
      {
        id: "r-6",
        courseId: "ffffffff-ffff-4fff-8fff-ffffffffffff",
        courseCode: "WEB320",
        courseTitle: "Product UI",
        ratingOverall: 4,
        ratingTeaching: 4,
        ratingDifficulty: 3,
        ratingObjectivity: 5,
        wouldTakeAgain: true,
        comment: "Dizayn qərarlarını əsaslandırmağı öyrədir. Rəy sessiyaları faydalıdır, təqdimat hissəsi isə bir az daha çox vaxt istəyir.",
        isAnonymous: true,
        semester: "fall",
        academicYear: 2025,
        reviewerName: "Anonim tələbə",
        createdAt: "2025-12-09T10:00:00.000Z",
      },
    ],
  },
];

export function getProfessorSlug(professor: Pick<ProfessorSummary, "fullName" | "slug">) {
  return professor.slug || toSlug(professor.fullName);
}

export function getMockProfessor(identifier: string) {
  return mockProfessors.find(
    (professor) =>
      professor.id === identifier || getProfessorSlug(professor) === identifier,
  );
}

export function findMockProfessor(identifier: string) {
  return getMockProfessor(identifier) || mockProfessors[0];
}

export function formatRating(value: number) {
  return Number.isFinite(value) ? value.toFixed(1) : "0.0";
}

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";
import { toSlug } from "@/lib/slug";
