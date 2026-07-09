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

export type PhaseLevel = "foundation" | "intermediate" | "advanced";

/** The lesson structure for a single phase of an adaptive course. */
export type PhaseBlueprint = {
  chapters: {
    title: string;
    lessons: { title: string; estimatedMinutes: number }[];
  }[];
};

/** A generated MCQ (checkpoint mocktest). */
export type GeneratedQuestion = {
  topic: string;
  difficulty: string;
  text: string;
  options: string[];
  correctIdx: number;
  explanation: string;
};
