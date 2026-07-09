export type CourseLevel = "beginner" | "intermediate" | "advanced" | "exam-prep";
export type CourseDepth = "concise" | "balanced" | "in-depth";

/** The questionnaire answers that drive course generation. */
export type Questionnaire = {
  subject: string; // e.g. "AWS SAA-C03", "GATE CS — Operating Systems"
  category: string; // certification | college | competitive | custom
  level: CourseLevel;
  goal: string; // free text, optional
  moduleCount: number; // 2–8
  depth: CourseDepth;
  focusTopics: string; // optional free text
  style: string; // optional, e.g. "practical, lots of examples, include CLI"
};

/** The structured outline the model returns (titles only — no content yet). */
export type CourseBlueprint = {
  title: string;
  description: string;
  category: string;
  modules: {
    title: string;
    chapters: {
      title: string;
      lessons: { title: string; estimatedMinutes: number }[];
    }[];
  }[];
};
