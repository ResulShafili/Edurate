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
    id: "11111111-1111-4111-8111-111111111111",
    fullName: "Nigar Mammadova",
    title: "Senior Lecturer",
    bio: "Alqoritmlər və problem həlli dərslərində praktiki yanaşması ilə tanınır.",
    departmentName: "Computer Science",
    universityName: "Qarabağ Universiteti",
    reviewCount: 24,
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
    id: "22222222-2222-4222-8222-222222222222",
    fullName: "Elvin Huseynli",
    title: "Assistant Professor",
    bio: "Database design, SQL optimizasiyası və backend arxitekturası üzrə fokuslanır.",
    departmentName: "Software Engineering",
    universityName: "Qarabağ Universiteti",
    reviewCount: 18,
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
    ],
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    fullName: "Aysel Karimova",
    title: "Lecturer",
    bio: "Frontend, UI sistemləri və web accessibility mövzularını praktiki nümunələrlə keçir.",
    departmentName: "Information Technologies",
    universityName: "Qarabağ Universiteti",
    reviewCount: 15,
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
    ],
  },
];

export function findMockProfessor(id: string) {
  return mockProfessors.find((professor) => professor.id === id) || mockProfessors[0];
}

export function formatRating(value: number) {
  return Number.isFinite(value) ? value.toFixed(1) : "0.0";
}

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";
