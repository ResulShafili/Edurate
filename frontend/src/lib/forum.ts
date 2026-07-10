export type ForumCourse = {
  id: string;
  code: string;
  title: string;
  departmentName: string;
};

export type ForumQuestionSummary = {
  id: string;
  slug?: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  categoryName: string;
  title: string;
  body: string;
  status: "open" | "answered" | "closed";
  authorName: string;
  answerCount: number;
  voteScore: number;
  lastActivityAt: string;
  createdAt: string;
};

export type ForumAnswer = {
  id: string;
  questionId: string;
  parentAnswerId: string | null;
  authorName: string;
  body: string;
  voteScore: number;
  viewerVote?: -1 | 0 | 1;
  createdAt: string;
  replies?: ForumAnswer[];
};

export type ForumQuestion = ForumQuestionSummary & {
  answers: ForumAnswer[];
};

export const forumApiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";

export const mockCourses: ForumCourse[] = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    code: "CS201",
    title: "Data Structures",
    departmentName: "Computer Science",
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    code: "CS301",
    title: "Algorithms",
    departmentName: "Computer Science",
  },
  {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    code: "SE240",
    title: "Databases",
    departmentName: "Software Engineering",
  },
  {
    id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    code: "WEB210",
    title: "React Fundamentals",
    departmentName: "Information Technologies",
  },
];

export const mockQuestions: ForumQuestion[] = [
  {
    id: "question-linked-list-arraylist",
    courseId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    courseCode: "CS201",
    courseTitle: "Data Structures",
    categoryName: "Fənn sualları",
    title: "Linked List ilə ArrayList arasında imtahanda necə müqayisə aparmaq lazımdır?",
    body: "Müəllim insertion və deletion üçün time complexity soruşacağını dedi. Cavabda real nümunə də yazmaq istəyirəm, amma qısa və dəqiq necə strukturlaşdırım?",
    status: "open",
    authorName: "Anonim tələbə",
    answerCount: 4,
    voteScore: 12,
    lastActivityAt: "2026-07-06T12:30:00.000Z",
    createdAt: "2026-07-05T09:20:00.000Z",
    answers: [
      {
        id: "answer-random-access",
        questionId: "question-linked-list-arraylist",
        parentAnswerId: null,
        authorName: "Nihat",
        body: "Əvvəl random access fərqini yaz: ArrayList O(1), Linked List O(n). Sonra insertion/deletion üçün ortada node bilinirsə Linked List daha rahatdır, amma node-u tapmaq yenə traversal tələb edir.",
        voteScore: 18,
        viewerVote: 0,
        createdAt: "2026-07-05T10:10:00.000Z",
      },
      {
        id: "answer-memory-locality",
        questionId: "question-linked-list-arraylist",
        parentAnswerId: "answer-random-access",
        authorName: "Aysu",
        body: "Bir də memory locality qeyd etsən yaxşı olar. ArrayList cache baxımından çox vaxt praktikada daha sürətli olur.",
        voteScore: 9,
        viewerVote: 0,
        createdAt: "2026-07-05T10:45:00.000Z",
      },
      {
        id: "answer-comparison-table",
        questionId: "question-linked-list-arraylist",
        parentAnswerId: null,
        authorName: "Anonim tələbə",
        body: "Mən cavabı cədvəl kimi yazırdım: access, search, insert, delete. Sonda hansı case-də hansını seçərdim deyə bir cümlə əlavə etmək kifayət edir.",
        voteScore: 11,
        viewerVote: 0,
        createdAt: "2026-07-05T11:15:00.000Z",
      },
      {
        id: "answer-big-o-format",
        questionId: "question-linked-list-arraylist",
        parentAnswerId: "answer-comparison-table",
        authorName: "Murad",
        body: "Bu format imtahanda oxunaqlı olur. Big-O notation-u ayrı sətirdə yazmaq da bal qazandırır.",
        voteScore: 4,
        viewerVote: 0,
        createdAt: "2026-07-05T12:15:00.000Z",
      },
    ],
  },
  {
    id: "question-normalization-bcnf",
    courseId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    courseCode: "SE240",
    courseTitle: "Databases",
    categoryName: "Fənn sualları",
    title: "Normalization mövzusunda 3NF ilə BCNF fərqini necə yadda saxlayaq?",
    body: "Functional dependency suallarında 3NF-dən BCNF-ə keçidi qarışdırıram. Sadə qayda və nümunə paylaşa bilərsiniz?",
    status: "answered",
    authorName: "Leyla",
    answerCount: 2,
    voteScore: 8,
    lastActivityAt: "2026-07-06T16:00:00.000Z",
    createdAt: "2026-07-04T14:00:00.000Z",
    answers: [
      {
        id: "answer-bcnf-superkey",
        questionId: "question-normalization-bcnf",
        parentAnswerId: null,
        authorName: "Elvin",
        body: "BCNF daha sərtdir: hər non-trivial dependency üçün determinant superkey olmalıdır. 3NF-də prime attribute istisnası var, ona görə bəzi 3NF cədvəllər BCNF olmaya bilər.",
        voteScore: 16,
        viewerVote: 0,
        createdAt: "2026-07-04T15:25:00.000Z",
      },
      {
        id: "answer-bcnf-memory-rule",
        questionId: "question-normalization-bcnf",
        parentAnswerId: null,
        authorName: "Anonim tələbə",
        body: "Mən belə yadda saxlayıram: BCNF-də determinant həmişə açar kimi davranmalıdır. Bu cümlə çox suala bəs edir.",
        voteScore: 7,
        viewerVote: 0,
        createdAt: "2026-07-04T16:10:00.000Z",
      },
    ],
  },
  {
    id: "question-useeffect-dependencies",
    courseId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    courseCode: "WEB210",
    courseTitle: "React Fundamentals",
    categoryName: "Fənn sualları",
    title: "useEffect dependency array üçün praktik qayda nədir?",
    body: "Hansı dəyişənləri dependency array-ə əlavə etmək lazımdır? Bəzən əlavə edəndə loop yaranır.",
    status: "open",
    authorName: "Səbinə",
    answerCount: 1,
    voteScore: 6,
    lastActivityAt: "2026-07-06T18:20:00.000Z",
    createdAt: "2026-07-06T17:10:00.000Z",
    answers: [
      {
        id: "answer-reactive-dependencies",
        questionId: "question-useeffect-dependencies",
        parentAnswerId: null,
        authorName: "Aysel",
        body: "Effect içində oxunan reactive dəyərləri dependency-ə sal. Loop yaranırsa, adətən state-i effect-də sync etməyə çalışırsan. O halda dəyəri render zamanı derive etmək daha yaxşıdır.",
        voteScore: 13,
        viewerVote: 0,
        createdAt: "2026-07-06T18:20:00.000Z",
      },
    ],
  },
];

export function getQuestionSlug(question: Pick<ForumQuestionSummary, "slug" | "title">) {
  return question.slug || toSlug(question.title);
}

export function getMockQuestion(identifier: string) {
  return mockQuestions.find(
    (question) => question.id === identifier || getQuestionSlug(question) === identifier,
  );
}

export function findMockQuestion(identifier: string) {
  return getMockQuestion(identifier) || mockQuestions[0];
}

export function buildAnswerTree(answers: ForumAnswer[]) {
  const answerMap = new Map<string, ForumAnswer>();
  const roots: ForumAnswer[] = [];

  answers.forEach((answer) => {
    answerMap.set(answer.id, { ...answer, replies: [] });
  });

  answerMap.forEach((answer) => {
    if (answer.parentAnswerId && answerMap.has(answer.parentAnswerId)) {
      answerMap.get(answer.parentAnswerId)?.replies?.push(answer);
      return;
    }

    roots.push(answer);
  });

  function sortBranch(items: ForumAnswer[]) {
    items.sort((first, second) => {
      if (second.voteScore !== first.voteScore) {
        return second.voteScore - first.voteScore;
      }

      return new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime();
    });

    items.forEach((item) => sortBranch(item.replies || []));
  }

  sortBranch(roots);

  return roots;
}

export function formatForumDate(value: string) {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}
import { toSlug } from "@/lib/slug";
