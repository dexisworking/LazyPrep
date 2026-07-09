import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";
import * as path from "path";

// Prisma 7 requires a driver adapter. Match the runtime client: strip
// sslmode/channel_binding from the URL and supply TLS via config.
function makePrisma() {
  const url = new URL(process.env.DATABASE_URL!);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("channel_binding");
  const adapter = new PrismaPg({ connectionString: url.toString(), ssl: { rejectUnauthorized: false } });
  return new PrismaClient({ adapter });
}

const prisma = makePrisma();
const CONTENT_DIR = path.join(process.cwd(), "content");

// ─── Content-pack types ───
type PackLesson = { title: string; slug?: string; file?: string; content?: string; estimatedMinutes?: number };
type PackChapter = { title: string; slug?: string; lessons: PackLesson[] };
type PackModule = { title: string; slug?: string; chapters: PackChapter[] };
type Pack = {
  slug: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  modules: PackModule[];
};
type PackQuestion = {
  topic: string;
  difficulty: string;
  text: string;
  options: string[];
  correctIdx: number;
  explanation: string;
  tags?: string[];
};
type PackFlashcard = { front: string; back: string; topic: string; tags?: string[] };

function slugify(input: string, fallback: string): string {
  const s = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return s || fallback;
}

function readJson<T>(file: string): T | null {
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf-8")) as T) : null;
}

/** Discover every content pack (a folder in content/ with a course.json). */
function listPacks(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(CONTENT_DIR, d.name, "course.json")))
    .map((d) => d.name);
}

/**
 * Import one content pack as a CURATED course (ownerId = null, published).
 * Idempotent: structure is upserted by slug (preserving user progress); the
 * question and flashcard sets are replaced.
 */
async function importPack(packSlug: string) {
  const dir = path.join(CONTENT_DIR, packSlug);
  const pack = readJson<Pack>(path.join(dir, "course.json"));
  if (!pack) throw new Error(`content/${packSlug}/course.json not found`);

  const course = await prisma.course.upsert({
    where: { slug: pack.slug },
    update: {
      title: pack.title,
      description: pack.description ?? null,
      imageUrl: pack.imageUrl ?? null,
      category: pack.category ?? "certification",
      published: true,
    },
    create: {
      slug: pack.slug,
      title: pack.title,
      description: pack.description ?? null,
      imageUrl: pack.imageUrl ?? null,
      category: pack.category ?? "certification",
      published: true,
      aiGenerated: false,
      adaptive: false,
    },
  });

  const stats = { modules: 0, chapters: 0, lessons: 0, questions: 0, flashcards: 0 };

  for (const [mi, m] of (pack.modules ?? []).entries()) {
    const mSlug = m.slug ?? slugify(m.title, `module-${mi + 1}`);
    const dbModule = await prisma.module.upsert({
      where: { courseId_slug: { courseId: course.id, slug: mSlug } },
      update: { title: m.title, order: mi + 1 },
      create: { courseId: course.id, title: m.title, slug: mSlug, order: mi + 1 },
    });
    stats.modules++;

    for (const [ci, ch] of (m.chapters ?? []).entries()) {
      const cSlug = ch.slug ?? slugify(ch.title, `chapter-${ci + 1}`);
      const dbChapter = await prisma.chapter.upsert({
        where: { moduleId_slug: { moduleId: dbModule.id, slug: cSlug } },
        update: { title: ch.title, order: ci + 1 },
        create: { moduleId: dbModule.id, title: ch.title, slug: cSlug, order: ci + 1 },
      });
      stats.chapters++;

      for (const [li, l] of (ch.lessons ?? []).entries()) {
        const lSlug = l.slug ?? (l.file ? l.file.replace(/\.md$/i, "") : slugify(l.title, `lesson-${li + 1}`));
        let content = l.content ?? "";
        if (l.file) {
          const mdPath = path.join(dir, "lessons", l.file);
          content = fs.existsSync(mdPath)
            ? fs.readFileSync(mdPath, "utf-8")
            : `# ${l.title}\n\nContent coming soon.`;
        }
        await prisma.lesson.upsert({
          where: { chapterId_slug: { chapterId: dbChapter.id, slug: lSlug } },
          update: { title: l.title, content, order: li + 1, estimatedMinutes: l.estimatedMinutes ?? 10 },
          create: {
            chapterId: dbChapter.id,
            title: l.title,
            slug: lSlug,
            content,
            order: li + 1,
            estimatedMinutes: l.estimatedMinutes ?? 10,
          },
        });
        stats.lessons++;
      }
    }
  }

  // Questions and flashcards have no stable key — replace the whole set.
  const questions = readJson<PackQuestion[]>(path.join(dir, "questions.json"));
  if (questions) {
    await prisma.question.deleteMany({ where: { courseId: course.id } });
    for (const q of questions) {
      await prisma.question.create({
        data: {
          courseId: course.id,
          topic: q.topic,
          difficulty: q.difficulty,
          text: q.text,
          options: q.options,
          correctIdx: q.correctIdx,
          explanation: q.explanation,
          tags: q.tags ?? [],
        },
      });
    }
    stats.questions = questions.length;
  }

  const flashcards = readJson<PackFlashcard[]>(path.join(dir, "flashcards.json"));
  if (flashcards) {
    await prisma.flashcard.deleteMany({ where: { courseId: course.id } });
    for (const f of flashcards) {
      await prisma.flashcard.create({
        data: { courseId: course.id, front: f.front, back: f.back, topic: f.topic, tags: f.tags ?? [] },
      });
    }
    stats.flashcards = flashcards.length;
  }

  return { title: pack.title, stats };
}

async function main() {
  // Optionally import a single pack: `tsx prisma/seed.ts <slug>`
  const only = process.argv[2];
  const packs = only ? [only] : listPacks();
  if (packs.length === 0) {
    console.log("No content packs found in content/.");
    return;
  }

  console.log(`📦 Importing ${packs.length} content pack(s): ${packs.join(", ")}`);
  for (const slug of packs) {
    const { title, stats } = await importPack(slug);
    console.log(
      `✅ ${title} — ${stats.modules} modules, ${stats.chapters} chapters, ${stats.lessons} lessons, ${stats.questions} MCQs, ${stats.flashcards} flashcards`,
    );
  }
  console.log("✨ Content import complete.");
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
