export type Stage = "idea" | "launch" | "operating" | "growth";
export type Level = "beginner" | "intermediate" | "advanced";
export type Format =
  | "article"
  | "template"
  | "course"
  | "webinar"
  | "podcast"
  | "glossary"
  | "calculator";
export interface Interaction {
  material_id: string;
  event:
    "view" | "started" | "completed" | "dismissed" | "clicked" | "purchased";
}
export interface Profile {
  task: string;
  topic?: string;
  industry?: string;
  stage?: Stage;
  level?: Level;
  preferred_format?: Format;
  history: Interaction[];
  limit?: number;
  strategy?: "personalized" | "baseline";
}
export interface Material {
  id: string;
  title: string;
  summary: string;
  format: Format;
  topics: string[];
  industries: string[];
  stages: Stage[];
  level: Level | null;
  access: "free" | "paid" | "unknown";
  url: string | null;
  related: string[];
  popularity: number;
  duration_minutes?: number;
}
export interface Recommendation {
  material: Material;
  reasons: string[];
  next_step: string;
}
export interface Result {
  strategy: string;
  mode: "cold_start" | "personalized" | "fallback";
  clarification: string | null;
  recommendations: Recommendation[];
}
export interface Onboarding {
  optional: boolean;
  topics: string[];
  industries: string[];
  stages: Record<Stage, string>;
  levels: Record<Level, string>;
  formats: Format[];
}
// Optional future extension. Current API preserves its ordered recommendations; the UI does not rank them.
export interface LearningRoute {
  id: string;
  title: string;
  steps: { material_id: string; title: string; next_step: string }[];
}
export interface NavigatorResponse extends Result {
  route?: LearningRoute;
  task_summary?: string;
}
export type DemoScenario = "normal" | "fallback" | "empty" | "error";
