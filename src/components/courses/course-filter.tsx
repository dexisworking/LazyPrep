"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Plus,
  Trophy,
  Library,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import type { getCoursesOverview } from "@/lib/data/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { Pill } from "@/components/shared/pill";
import { ProgressBar } from "@/components/shared/progress-bar";
import { SectionHeader } from "@/components/shared/section-header";
import { Stagger, StaggerItem } from "@/components/motion/motion";

type CourseOverview = Awaited<ReturnType<typeof getCoursesOverview>>[number];

/** Shared native-select styling, including the focus ring both selects lacked. */
const selectCls =
  "h-8 rounded-control border border-border-subtle bg-secondary px-3 text-xs font-medium text-foreground transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

function CourseCard({ course }: { course: CourseOverview }) {
  const pct =
    course.totalLessons > 0
      ? Math.round((course.completedLessons / course.totalLessons) * 100)
      : 0;
  const done = pct === 100 && course.totalLessons > 0;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group relative flex w-full flex-col gap-4 rounded-card border border-border-subtle bg-card p-card transition-[border-color,box-shadow,transform] duration-(--dur-fast) ease-standard hover:border-primary/40 hover:shadow-raised active:scale-[0.995]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-control border border-primary/20 bg-primary/10">
          {course.adaptive ? (
            <Trophy className="h-5 w-5 text-primary" />
          ) : (
            <BookOpen className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {course.adaptive ? (
            <Pill tone="primary" size="sm" icon={Sparkles} uppercase>
              Mastery path
            </Pill>
          ) : (
            <Pill tone="success" size="sm" uppercase>
              Curated
            </Pill>
          )}
          <Pill tone="muted" size="sm" uppercase>
            {course.category}
          </Pill>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-foreground group-hover:text-primary">{course.title}</h3>
        {course.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
        )}
      </div>

      <div className="mt-auto space-y-2">
        {!course.adaptive && (
          <ProgressBar value={pct} aria-label={`${course.title} progress`} />
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {course.adaptive ? (
              <>Foundation → Advanced</>
            ) : (
              <>
                {done && <CheckCircle2 className="h-3.5 w-3.5 text-np-success" />}
                {course.completedLessons} / {course.totalLessons} lessons
              </>
            )}
          </span>
          <span className="flex items-center gap-1 font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            {course.enrolled ? "Continue" : "Start"}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CourseFilterContainer({
  mine,
  curated,
}: {
  mine: CourseOverview[];
  curated: CourseOverview[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<"newest" | "title">("newest");

  const filterCourse = (c: CourseOverview) => {
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === "all" || c.category === category;
    return matchesSearch && matchesCategory;
  };

  const sortCourses = (list: CourseOverview[]) => {
    return [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const filteredMine = sortCourses(mine.filter(filterCourse));
  const filteredCurated = sortCourses(curated.filter(filterCourse));

  const allCategories = Array.from(
    new Set([...mine, ...curated].map((c) => c.category)),
  );

  return (
    <div className="space-y-8">
      {/* Controls.
          `basis-48` + `flex-1` instead of `min-w-[200px]`: the fixed minimum
          overflowed the wrapping toolbar at 320px. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border-subtle bg-card p-3">
        <div className="relative flex-1 basis-48">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            size="sm"
            aria-label="Search courses"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-transparent bg-secondary/50 pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Filter className="h-3.5 w-3.5" aria-hidden /> Filter:
          </div>
          {/*
           * Native selects, but with a real focus ring — both previously used
           * `focus:outline-none` with nothing to replace it.
           */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className={selectCls}
          >
            <option value="all">All Categories</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "title")}
            aria-label="Sort courses"
            className={selectCls}
          >
            <option value="newest">Newest First</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-10">
        {/* My Courses */}
        <section className="space-y-4">
          <SectionHeader
            as="h1"
            size="lg"
            title="My Courses"
            description="Mastery courses you've generated with AI."
            action={
              <Button render={<Link href="/courses/new" />}>
                <Plus />
                Create with AI
              </Button>
            }
          />

          {filteredMine.length === 0 ? (
            <EmptyState
              size="lg"
              icon={Sparkles}
              title={
                search || category !== "all"
                  ? "No matching courses"
                  : "Create your first course"
              }
              description={
                search || category !== "all"
                  ? "Try adjusting your search terms or filter criteria."
                  : "Tell LazyPrep any subject and it builds a full mastery path — from the absolute basics up to advanced — tailored as you learn."
              }
              action={{ label: "Create with AI", href: "/courses/new", icon: Plus }}
            />
          ) : (
            <Stagger className="grid gap-4 sm:grid-cols-2">
              {filteredMine.map((course) => (
                <StaggerItem key={course.id} className="flex">
                  <CourseCard course={course} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </section>

        {/* Catalog */}
        <section className="space-y-4">
          <SectionHeader
            as="h2"
            icon={Library}
            title="Course Catalog"
            description="Curated packs by LazyPrep — more subjects on the way."
          />

          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCurated.map((course) => (
              <StaggerItem key={course.id} className="flex">
                <CourseCard course={course} />
              </StaggerItem>
            ))}

            {/* Coming soon placeholder */}
            <EmptyState
              size="sm"
              icon={Clock}
              title="More courses coming soon"
              description="Can't wait? Generate any subject above."
            />
          </Stagger>
        </section>
      </div>
    </div>
  );
}
