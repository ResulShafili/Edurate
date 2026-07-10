require('dotenv').config();

const bcrypt = require('bcryptjs');

const db = require('./src/config/db');

const TEST_EMAIL = 'test@karabakh.edu.az';
const TEST_PASSWORD = 'password123';

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function one(client, query, params = []) {
  const result = await client.query(query, params);
  return result.rows[0];
}

async function cleanDatabase(client) {
  await client.query('TRUNCATE TABLE universities RESTART IDENTITY CASCADE');
}

async function seedUniversity(client) {
  return one(
    client,
    `
      INSERT INTO universities (name, slug, city, email_domains)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
    [
      'Qarabağ Universiteti',
      'qarabag-universiteti',
      'Xankəndi',
      ['karabakh.edu.az']
    ]
  );
}

async function seedUsers(client, universityId) {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  const users = {};
  const userRows = [
    {
      key: 'test',
      email: TEST_EMAIL,
      fullName: 'Test Tələbə',
      username: 'teststudent'
    },
    {
      key: 'aysu',
      email: 'aysu@karabakh.edu.az',
      fullName: 'Aysu Məmmədli',
      username: 'aysum'
    },
    {
      key: 'nihat',
      email: 'nihat@karabakh.edu.az',
      fullName: 'Nihat Əliyev',
      username: 'nihataliyev'
    },
    {
      key: 'murad',
      email: 'murad@karabakh.edu.az',
      fullName: 'Murad Qasımov',
      username: 'muradq'
    }
  ];

  for (const user of userRows) {
    users[user.key] = await one(
      client,
      `
        INSERT INTO users (
          university_id,
          email,
          password_hash,
          full_name,
          username,
          is_email_verified,
          email_verified_at
        )
        VALUES ($1, $2, $3, $4, $5, true, now())
        RETURNING id, email, full_name AS "fullName"
      `,
      [
        universityId,
        user.email,
        passwordHash,
        user.fullName,
        user.username
      ]
    );
  }

  return users;
}

async function seedAcademics(client, universityId) {
  const departments = {};
  const departmentRows = [
    { key: 'math', name: 'Riyaziyyat və Statistika', code: 'MATH' },
    { key: 'cs', name: 'Kompüter Elmləri', code: 'CS' },
    { key: 'is', name: 'İnformasiya Sistemləri', code: 'IS' },
    { key: 'engineering', name: 'Mühəndislik', code: 'ENG' }
  ];

  for (const department of departmentRows) {
    departments[department.key] = await one(
      client,
      `
        INSERT INTO departments (university_id, name, code)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [universityId, department.name, department.code]
    );
  }

  const courses = {};
  const courseRows = [
    {
      key: 'calculus',
      department: 'math',
      code: 'MATH101',
      title: 'Calculus I',
      description: 'Limit, törəmə və inteqralın əsasları.'
    },
    {
      key: 'programming',
      department: 'cs',
      code: 'CS101',
      title: 'Proqramlaşdırmaya Giriş',
      description: 'JavaScript və problem həll etmə əsasları.'
    },
    {
      key: 'dataStructures',
      department: 'cs',
      code: 'CS204',
      title: 'Data Structures',
      description: 'Array, linked list, stack, queue, tree və graph mövzuları.'
    },
    {
      key: 'databases',
      department: 'is',
      code: 'DB201',
      title: 'Verilənlər Bazası Sistemləri',
      description: 'SQL, relational model, index və normalization.'
    },
    {
      key: 'express',
      department: 'cs',
      code: 'WEB202',
      title: 'Node.js və Express',
      description: 'REST API, middleware və JWT auth praktikası.'
    },
    {
      key: 'physics',
      department: 'engineering',
      code: 'PHYS110',
      title: 'Mexanika',
      description: 'Kinematika, dinamika və enerji qanunları.'
    }
  ];

  for (const course of courseRows) {
    courses[course.key] = await one(
      client,
      `
        INSERT INTO courses (
          university_id,
          department_id,
          code,
          title,
          description
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, code, title
      `,
      [
        universityId,
        departments[course.department].id,
        course.code,
        course.title,
        course.description
      ]
    );
  }

  const teachers = {};
  const teacherRows = [
    {
      key: 'leyla',
      department: 'math',
      fullName: 'Dr. Leyla Məmmədova',
      title: 'Riyaziyyat müəllimi',
      email: 'leyla.mammadova@karabakh.edu.az',
      bio: 'Calculus və tətbiqi riyaziyyatı real nümunələrlə izah edən tələbə yönümlü müəllim.'
    },
    {
      key: 'rashad',
      department: 'cs',
      fullName: 'Rəşad Əliyev',
      title: 'Senior Software Engineer',
      email: 'rashad.aliyev@karabakh.edu.az',
      bio: 'Backend arxitekturası, JavaScript və alqoritmləri praktiki layihələrlə öyrədir.'
    },
    {
      key: 'nigar',
      department: 'is',
      fullName: 'Nigar Həsənova',
      title: 'Verilənlər bazası müəllimi',
      email: 'nigar.hasanova@karabakh.edu.az',
      bio: 'SQL, PostgreSQL və data modeling mövzularını case-study formatında keçir.'
    },
    {
      key: 'kamal',
      department: 'engineering',
      fullName: 'Kamal Rzayev',
      title: 'Fizika müəllimi',
      email: 'kamal.rzayev@karabakh.edu.az',
      bio: 'Mexanika mövzularında güclü nəzəri baza verir, quiz-ləri bir az sərtdir.'
    }
  ];

  for (const teacher of teacherRows) {
    teachers[teacher.key] = await one(
      client,
      `
        INSERT INTO teachers (
          university_id,
          department_id,
          full_name,
          title,
          email,
          bio
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, full_name AS "fullName"
      `,
      [
        universityId,
        departments[teacher.department].id,
        teacher.fullName,
        teacher.title,
        teacher.email,
        teacher.bio
      ]
    );
  }

  const teacherCourseRows = [
    ['leyla', 'calculus'],
    ['rashad', 'programming'],
    ['rashad', 'dataStructures'],
    ['rashad', 'express'],
    ['nigar', 'databases'],
    ['kamal', 'physics']
  ];

  for (const [teacherKey, courseKey] of teacherCourseRows) {
    await client.query(
      `
        INSERT INTO teacher_courses (university_id, teacher_id, course_id)
        VALUES ($1, $2, $3)
      `,
      [universityId, teachers[teacherKey].id, courses[courseKey].id]
    );
  }

  return {
    departments,
    courses,
    teachers
  };
}

async function seedReviews(client, universityId, users, courses, teachers) {
  const reviews = {};
  const reviewRows = [
    {
      key: 'calculus-great',
      reviewer: 'test',
      teacher: 'leyla',
      course: 'calculus',
      semester: 'spring',
      academicYear: 2026,
      overall: 5,
      teaching: 5,
      difficulty: 4,
      fairness: 5,
      wouldTakeAgain: true,
      isAnonymous: false,
      days: 1,
      comment: 'Törəmə və limitləri çox aydın izah edir. Tapşırıqlar çətindir, amma imtahana yaxşı hazırlayır.'
    },
    {
      key: 'calculus-critical',
      reviewer: 'aysu',
      teacher: 'leyla',
      course: 'calculus',
      semester: 'fall',
      academicYear: 2025,
      overall: 3,
      teaching: 4,
      difficulty: 5,
      fairness: 3,
      wouldTakeAgain: true,
      isAnonymous: true,
      days: 4,
      comment: 'Mövzular maraqlıdır, sadəcə quiz-lər bəzən dərsdə keçiləndən daha ağır olur.'
    },
    {
      key: 'programming-great',
      reviewer: 'nihat',
      teacher: 'rashad',
      course: 'programming',
      semester: 'spring',
      academicYear: 2026,
      overall: 5,
      teaching: 5,
      difficulty: 3,
      fairness: 5,
      wouldTakeAgain: true,
      isAnonymous: false,
      days: 2,
      comment: 'Kod review-ları çox faydalıdır. Hər dərsdə real project nümunəsi göstərir.'
    },
    {
      key: 'structures-balanced',
      reviewer: 'murad',
      teacher: 'rashad',
      course: 'dataStructures',
      semester: 'fall',
      academicYear: 2025,
      overall: 4,
      teaching: 4,
      difficulty: 4,
      fairness: 4,
      wouldTakeAgain: true,
      isAnonymous: true,
      days: 6,
      comment: 'Linked list və tree mövzuları yaxşı oturdu. Daha çox practice session olsa super olar.'
    },
    {
      key: 'db-great',
      reviewer: 'aysu',
      teacher: 'nigar',
      course: 'databases',
      semester: 'spring',
      academicYear: 2026,
      overall: 5,
      teaching: 5,
      difficulty: 2,
      fairness: 5,
      wouldTakeAgain: true,
      isAnonymous: false,
      days: 3,
      comment: 'PostgreSQL izahları çox sistemlidir. Normalization mövzusu nəhayət aydın oldu.'
    },
    {
      key: 'physics-critical',
      reviewer: 'test',
      teacher: 'kamal',
      course: 'physics',
      semester: 'winter',
      academicYear: 2026,
      overall: 2,
      teaching: 3,
      difficulty: 5,
      fairness: 2,
      wouldTakeAgain: false,
      isAnonymous: true,
      days: 8,
      comment: 'Nəzəri izahlar güclüdür, amma qiymətləndirmə çox sərt və feedback gec gəlir.'
    }
  ];

  for (const review of reviewRows) {
    reviews[review.key] = await one(
      client,
      `
        INSERT INTO teacher_reviews (
          university_id,
          reviewer_id,
          teacher_id,
          course_id,
          semester,
          academic_year,
          rating_overall,
          rating_teaching,
          rating_difficulty,
          rating_grading_fairness,
          would_take_again,
          comment,
          is_anonymous,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14)
        RETURNING id
      `,
      [
        universityId,
        users[review.reviewer].id,
        teachers[review.teacher].id,
        courses[review.course].id,
        review.semester,
        review.academicYear,
        review.overall,
        review.teaching,
        review.difficulty,
        review.fairness,
        review.wouldTakeAgain,
        review.comment,
        review.isAnonymous,
        daysAgo(review.days)
      ]
    );
  }

  const reviewVotes = [
    ['calculus-great', 'aysu', 1],
    ['calculus-great', 'nihat', 1],
    ['programming-great', 'test', 1],
    ['structures-balanced', 'aysu', 1],
    ['db-great', 'murad', 1],
    ['physics-critical', 'nihat', 1]
  ];

  for (const [reviewKey, userKey, value] of reviewVotes) {
    await client.query(
      `
        INSERT INTO teacher_review_votes (review_id, user_id, university_id, value)
        VALUES ($1, $2, $3, $4)
      `,
      [reviews[reviewKey].id, users[userKey].id, universityId, value]
    );
  }

  return reviews;
}

async function seedForum(client, universityId, users, courses) {
  const categories = {};
  const categoryRows = [
    {
      key: 'courseHelp',
      name: 'Dərs köməyi',
      slug: 'ders-komeyi',
      description: 'Fənn mövzuları üzrə sual-cavab.'
    },
    {
      key: 'debugging',
      name: 'Kod problemləri',
      slug: 'kod-problemleri',
      description: 'Bug, error və debugging mövzuları.'
    },
    {
      key: 'examPrep',
      name: 'İmtahan hazırlığı',
      slug: 'imtahan-hazirligi',
      description: 'Quiz, midterm və final hazırlığı.'
    }
  ];

  for (const category of categoryRows) {
    categories[category.key] = await one(
      client,
      `
        INSERT INTO forum_categories (university_id, name, slug, description)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `,
      [
        universityId,
        category.name,
        category.slug,
        category.description
      ]
    );
  }

  const tags = {};
  const tagRows = [
    ['calculus', 'Calculus', 'calculus'],
    ['express', 'Express.js', 'express-js'],
    ['sql', 'SQL', 'sql'],
    ['exam', 'İmtahan', 'imtahan'],
    ['algorithms', 'Alqoritmlər', 'alqoritmler']
  ];

  for (const [key, name, slug] of tagRows) {
    tags[key] = await one(
      client,
      `
        INSERT INTO tags (university_id, name, slug)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [universityId, name, slug]
    );
  }

  const questions = {};
  const questionRows = [
    {
      key: 'limits',
      author: 'test',
      category: 'courseHelp',
      course: 'calculus',
      title: 'Limit və törəmə mövzusunu necə yadda saxlayırsınız?',
      body: 'Calculus I-də limitdən törəməyə keçid hissəsində qarışıram. Formula əzbərləmədən necə yanaşmaq daha yaxşıdır?',
      tags: ['calculus', 'exam'],
      days: 2
    },
    {
      key: 'expressRouter',
      author: 'nihat',
      category: 'debugging',
      course: 'express',
      title: 'Express router middleware sırası niyə route-u tutmur?',
      body: 'Auth middleware-i router-dən əvvəl yazanda bəzi public route-lar da 401 qaytarır. Best practice necədir?',
      tags: ['express'],
      days: 1
    },
    {
      key: 'joins',
      author: 'aysu',
      category: 'examPrep',
      course: 'databases',
      title: 'LEFT JOIN və INNER JOIN fərqini real nümunədə necə izah edərdiniz?',
      body: 'SQL finalına hazırlaşıram. JOIN növlərini cədvəl üzərində daha yaxşı başa düşmək üçün sadə nümunə lazımdır.',
      tags: ['sql', 'exam'],
      days: 3
    }
  ];

  for (const question of questionRows) {
    questions[question.key] = await one(
      client,
      `
        INSERT INTO forum_questions (
          university_id,
          author_id,
          category_id,
          course_id,
          title,
          body,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
        RETURNING id
      `,
      [
        universityId,
        users[question.author].id,
        categories[question.category].id,
        courses[question.course].id,
        question.title,
        question.body,
        daysAgo(question.days)
      ]
    );

    for (const tagKey of question.tags) {
      await client.query(
        `
          INSERT INTO forum_question_tags (question_id, tag_id, university_id)
          VALUES ($1, $2, $3)
        `,
        [questions[question.key].id, tags[tagKey].id, universityId]
      );
    }
  }

  const answers = {};
  async function addAnswer({ key, question, author, parent = null, body, days }) {
    answers[key] = await one(
      client,
      `
        INSERT INTO forum_answers (
          university_id,
          question_id,
          parent_answer_id,
          author_id,
          body,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $6)
        RETURNING id
      `,
      [
        universityId,
        questions[question].id,
        parent ? answers[parent].id : null,
        users[author].id,
        body,
        daysAgo(days)
      ]
    );
  }

  await addAnswer({
    key: 'limits-visual',
    question: 'limits',
    author: 'aysu',
    body: 'Əvvəlcə qrafik üzərində bax, sonra limitin soldan və sağdan yaxınlaşmasını ayrıca yaz. Törəmə üçün də "ani dəyişmə sürəti" kimi düşünmək kömək edir.',
    days: 1.8
  });
  await addAnswer({
    key: 'limits-reply',
    question: 'limits',
    author: 'murad',
    parent: 'limits-visual',
    body: 'Buna əlavə olaraq, hər formul üçün bir real məsələ seçmək yaxşı işləyir. Mən sürət məsələləri ilə yadda saxlayıram.',
    days: 1.7
  });
  await addAnswer({
    key: 'limits-practice',
    question: 'limits',
    author: 'nihat',
    body: 'Professor Leylanın keçən həftə verdiyi 12-ci tapşırığı mütləq həll et. Həmin sual mövzunu çox yaxşı bağlayır.',
    days: 1.5
  });
  await addAnswer({
    key: 'express-order',
    question: 'expressRouter',
    author: 'test',
    body: 'Public route-ları əvvəl yaz, protected router-i isə ayrıca prefix altında auth middleware ilə bağla: app.use("/api/private", requireAuth, privateRoutes).',
    days: 0.8
  });
  await addAnswer({
    key: 'express-reply',
    question: 'expressRouter',
    author: 'aysu',
    parent: 'express-order',
    body: 'Mən də eyni pattern istifadə edirəm. Bir də error middleware ən sonda qalmalıdır.',
    days: 0.6
  });
  await addAnswer({
    key: 'joins-example',
    question: 'joins',
    author: 'murad',
    body: 'INNER JOIN yalnız uyğun gələn sətirləri qaytarır. LEFT JOIN isə soldakı cədvəlin bütün sətirlərini saxlayır, uyğunluq yoxdursa sağ tərəf NULL olur.',
    days: 2.6
  });
  await addAnswer({
    key: 'joins-reply',
    question: 'joins',
    author: 'test',
    parent: 'joins-example',
    body: 'Tələbələr və kitab sifarişləri nümunəsi ilə baxanda daha aydın olur: sifarişi olmayan tələbə LEFT JOIN-də qalır.',
    days: 2.5
  });

  await client.query(
    `
      UPDATE forum_questions
      SET accepted_answer_id = $1
      WHERE id = $2
    `,
    [answers['express-order'].id, questions.expressRouter.id]
  );

  const questionVotes = [
    ['limits', 'aysu', 1],
    ['limits', 'nihat', 1],
    ['expressRouter', 'test', 1],
    ['expressRouter', 'murad', 1],
    ['joins', 'test', 1]
  ];

  for (const [questionKey, userKey, value] of questionVotes) {
    await client.query(
      `
        INSERT INTO forum_question_votes (question_id, user_id, university_id, value)
        VALUES ($1, $2, $3, $4)
      `,
      [questions[questionKey].id, users[userKey].id, universityId, value]
    );
  }

  const answerVotes = [
    ['limits-visual', 'test', 1],
    ['limits-visual', 'nihat', 1],
    ['limits-reply', 'aysu', 1],
    ['express-order', 'nihat', 1],
    ['express-order', 'aysu', 1],
    ['express-reply', 'murad', 1],
    ['joins-example', 'aysu', 1],
    ['joins-example', 'nihat', 1],
    ['joins-reply', 'murad', 1]
  ];

  for (const [answerKey, userKey, value] of answerVotes) {
    await client.query(
      `
        INSERT INTO forum_answer_votes (answer_id, user_id, university_id, value)
        VALUES ($1, $2, $3, $4)
      `,
      [answers[answerKey].id, users[userKey].id, universityId, value]
    );
  }

  return {
    categories,
    tags,
    questions,
    answers
  };
}

async function seedResources(client, universityId, users, courses, tags) {
  const resources = {};
  const resourceRows = [
    {
      key: 'calculusNotes',
      uploader: 'test',
      course: 'calculus',
      title: 'Calculus 1 Konspekti',
      description: 'Limit, törəmə və inteqral üçün 24 səhifəlik qısa imtahan konspekti.',
      fileName: 'calculus-1-konspekti.pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      storageKey: 'demo/calculus-1-konspekti.pdf',
      fileSizeBytes: 1184000,
      pageCount: 24,
      isAnonymous: false,
      tags: ['calculus', 'exam'],
      days: 1
    },
    {
      key: 'expressCheatSheet',
      uploader: 'nihat',
      course: 'express',
      title: 'Express.js cheat sheet',
      description: 'Router, middleware, error handler və JWT auth üçün yığcam xatırlatma.',
      fileName: 'express-js-cheat-sheet.pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      storageKey: 'demo/express-js-cheat-sheet.pdf',
      fileSizeBytes: 732000,
      pageCount: 8,
      isAnonymous: true,
      tags: ['express'],
      days: 2
    },
    {
      key: 'sqlJoinsMap',
      uploader: 'aysu',
      course: 'databases',
      title: 'SQL JOIN xəritəsi',
      description: 'INNER, LEFT, RIGHT və FULL JOIN fərqləri üçün vizual xülasə.',
      fileName: 'sql-join-xeritesi.pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      storageKey: 'demo/sql-join-xeritesi.pdf',
      fileSizeBytes: 546000,
      pageCount: 6,
      isAnonymous: false,
      tags: ['sql', 'exam'],
      days: 4
    }
  ];

  for (const resource of resourceRows) {
    resources[resource.key] = await one(
      client,
      `
        INSERT INTO pdf_notes (
          university_id,
          uploader_id,
          course_id,
          title,
          description,
          file_name,
          file_type,
          file_url,
          storage_key,
          file_size_bytes,
          page_count,
          is_anonymous,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'pdf', $7, $8, $9, $10, $11, $12, $12)
        RETURNING id
      `,
      [
        universityId,
        users[resource.uploader].id,
        courses[resource.course].id,
        resource.title,
        resource.description,
        resource.fileName,
        resource.fileUrl,
        resource.storageKey,
        resource.fileSizeBytes,
        resource.pageCount,
        resource.isAnonymous,
        daysAgo(resource.days)
      ]
    );

    for (const tagKey of resource.tags) {
      await client.query(
        `
          INSERT INTO pdf_note_tags (note_id, tag_id, university_id)
          VALUES ($1, $2, $3)
        `,
        [resources[resource.key].id, tags[tagKey].id, universityId]
      );
    }
  }

  const ratings = [
    ['calculusNotes', 'aysu', 5],
    ['calculusNotes', 'nihat', 4],
    ['expressCheatSheet', 'test', 5],
    ['sqlJoinsMap', 'murad', 5],
    ['sqlJoinsMap', 'test', 4]
  ];

  for (const [resourceKey, userKey, rating] of ratings) {
    await client.query(
      `
        INSERT INTO pdf_note_ratings (note_id, user_id, university_id, rating)
        VALUES ($1, $2, $3, $4)
      `,
      [resources[resourceKey].id, users[userKey].id, universityId, rating]
    );
  }

  const downloads = [
    ['calculusNotes', 'aysu'],
    ['calculusNotes', 'murad'],
    ['expressCheatSheet', 'test'],
    ['sqlJoinsMap', 'nihat']
  ];

  for (const [resourceKey, userKey] of downloads) {
    await client.query(
      `
        INSERT INTO pdf_note_downloads (note_id, user_id, university_id)
        VALUES ($1, $2, $3)
      `,
      [resources[resourceKey].id, users[userKey].id, universityId]
    );
  }

  return resources;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Add it to backend/.env before running the seed script.');
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    await cleanDatabase(client);

    const university = await seedUniversity(client);
    const users = await seedUsers(client, university.id);
    const academics = await seedAcademics(client, university.id);
    const reviews = await seedReviews(
      client,
      university.id,
      users,
      academics.courses,
      academics.teachers
    );
    const forum = await seedForum(client, university.id, users, academics.courses);
    const resources = await seedResources(
      client,
      university.id,
      users,
      academics.courses,
      forum.tags
    );
    await client.query('COMMIT');

    console.log('EduRate demo seed completed successfully.');
    console.log('');
    console.log('Login:');
    console.log(`  Email: ${TEST_EMAIL}`);
    console.log(`  Password: ${TEST_PASSWORD}`);
    console.log('');
    console.log('Inserted:');
    console.log('  Universities: 1');
    console.log(`  Users: ${Object.keys(users).length}`);
    console.log(`  Departments: ${Object.keys(academics.departments).length}`);
    console.log(`  Courses: ${Object.keys(academics.courses).length}`);
    console.log(`  Teachers: ${Object.keys(academics.teachers).length}`);
    console.log(`  Reviews: ${Object.keys(reviews).length}`);
    console.log(`  Questions: ${Object.keys(forum.questions).length}`);
    console.log(`  Answers: ${Object.keys(forum.answers).length}`);
    console.log(`  Resources: ${Object.keys(resources).length}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed failed. Rolled back all changes.');
    throw error;
  } finally {
    client.release();
    await db.pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
