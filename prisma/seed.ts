import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";
import * as path from "path";

// Prisma 7 requires a driver adapter (no datasource url in schema).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Starting database seeding...");

  const contentDir = path.join(process.cwd(), "content", "ccna");

  // ─── 1. Seed Course ───
  console.log("📚 Seeding course metadata...");
  const courseData = JSON.parse(
    fs.readFileSync(path.join(contentDir, "course.json"), "utf-8")
  );

  const course = await prisma.course.upsert({
    where: { slug: courseData.slug },
    update: {
      title: courseData.title,
      description: courseData.description,
      imageUrl: courseData.imageUrl,
      category: courseData.category,
    },
    create: {
      slug: courseData.slug,
      title: courseData.title,
      description: courseData.description,
      imageUrl: courseData.imageUrl,
      category: courseData.category,
      published: true,
    },
  });
  console.log(`✅ Course upserted: ${course.title}`);

  // ─── 2. Seed Modules ───
  console.log("📦 Seeding modules...");
  const modulesData = JSON.parse(
    fs.readFileSync(path.join(contentDir, "modules.json"), "utf-8")
  );

  const dbModules: Record<string, string> = {}; // map slug -> id

  for (const m of modulesData) {
    const dbModule = await prisma.module.upsert({
      where: {
        courseId_slug: { courseId: course.id, slug: m.slug },
      },
      update: {
        title: m.title,
        order: m.order,
      },
      create: {
        courseId: course.id,
        title: m.title,
        slug: m.slug,
        order: m.order,
      },
    });
    dbModules[m.slug] = dbModule.id;
  }
  console.log(`✅ ${modulesData.length} Modules seeded`);

  // ─── 3. Seed Chapters ───
  console.log("📂 Seeding chapters...");
  const chaptersData = JSON.parse(
    fs.readFileSync(path.join(contentDir, "chapters.json"), "utf-8")
  );

  const dbChapters: Record<string, string> = {}; // map slug -> id

  for (const c of chaptersData) {
    const moduleId = dbModules[c.moduleSlug];
    if (!moduleId) {
      console.warn(`⚠️ Module slug not found for chapter: ${c.title}`);
      continue;
    }

    const dbChapter = await prisma.chapter.upsert({
      where: {
        moduleId_slug: { moduleId, slug: c.slug },
      },
      update: {
        title: c.title,
        order: c.order,
      },
      create: {
        moduleId,
        title: c.title,
        slug: c.slug,
        order: c.order,
      },
    });
    dbChapters[c.slug] = dbChapter.id;
  }
  console.log(`✅ ${chaptersData.length} Chapters seeded`);

  // ─── 4. Seed Lessons ───
  console.log("📄 Seeding lessons...");
  const lessonsData = JSON.parse(
    fs.readFileSync(path.join(contentDir, "lessons.json"), "utf-8")
  );

  for (const l of lessonsData) {
    const chapterId = dbChapters[l.chapterSlug];
    if (!chapterId) {
      console.warn(`⚠️ Chapter slug not found for lesson: ${l.title}`);
      continue;
    }

    // Read markdown file content
    const mdPath = path.join(contentDir, "lessons", l.file);
    let mdContent = "";
    if (fs.existsSync(mdPath)) {
      mdContent = fs.readFileSync(mdPath, "utf-8");
    } else {
      console.warn(`⚠️ Lesson content markdown file not found: ${l.file}`);
      mdContent = `# ${l.title}\n\nContent coming soon.`;
    }

    await prisma.lesson.upsert({
      where: {
        chapterId_slug: { chapterId, slug: l.slug },
      },
      update: {
        title: l.title,
        content: mdContent,
        order: l.order,
        estimatedMinutes: l.estimatedMinutes,
      },
      create: {
        chapterId,
        title: l.title,
        slug: l.slug,
        content: mdContent,
        order: l.order,
        estimatedMinutes: l.estimatedMinutes,
      },
    });
  }
  console.log(`✅ ${lessonsData.length} Lessons seeded`);

  // ─── 5. Seed Practice Questions ───
  console.log("❓ Seeding practice questions...");
  const questionsData = JSON.parse(
    fs.readFileSync(path.join(contentDir, "questions.json"), "utf-8")
  );

  // For questions, let's delete existing questions for this course slug to avoid duplicates, or upsert.
  // Since questions don't have a unique slug/key, we can clean and reload, or do simple creations.
  // For safety in dev seeding, we delete old ones first.
  await prisma.question.deleteMany({
    where: { courseId: course.id },
  });

  for (const q of questionsData) {
    await prisma.question.create({
      data: {
        courseId: course.id,
        topic: q.topic,
        difficulty: q.difficulty,
        text: q.text,
        options: q.options,
        correctIdx: q.correctIdx,
        explanation: q.explanation,
        tags: q.tags,
      },
    });
  }
  console.log(`✅ ${questionsData.length} MCQ Questions seeded`);

  // ─── 6. Seed Flashcards ───
  console.log("🎴 Seeding flashcards...");
  const flashcardsData = JSON.parse(
    fs.readFileSync(path.join(contentDir, "flashcards.json"), "utf-8")
  );

  await prisma.flashcard.deleteMany({
    where: { courseId: course.id },
  });

  for (const f of flashcardsData) {
    await prisma.flashcard.create({
      data: {
        courseId: course.id,
        front: f.front,
        back: f.back,
        topic: f.topic,
        tags: f.tags,
      },
    });
  }
  console.log(`✅ ${flashcardsData.length} Flashcards seeded`);

  console.log("✨ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
