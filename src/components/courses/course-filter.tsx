"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import type { getCoursesOverview } from "@/lib/data/courses";

type CourseOverview = Awaited<ReturnType<typeof getCoursesOverview>>[number];

export function CourseFilterContainer({
  mine,
  curated,
  renderGrid,
}: {
  mine: CourseOverview[];
  curated: CourseOverview[];
  renderGrid: (mine: CourseOverview[], curated: CourseOverview[]) => React.ReactNode;
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
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-card p-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-secondary/50 px-3 py-1.5 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-border/50 bg-secondary px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none"
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
            className="rounded-lg border border-border/50 bg-secondary px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
      </div>

      {renderGrid(filteredMine, filteredCurated)}
    </div>
  );
}
