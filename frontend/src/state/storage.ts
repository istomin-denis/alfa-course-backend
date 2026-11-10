import type { Profile, Interaction } from "../types";
const key = "alfa-navigator-v1";
export interface SavedState {
  previous?: Profile;
  history: Interaction[];
  completed: string[];
}
const events = new Set([
  "view",
  "started",
  "completed",
  "dismissed",
  "clicked",
  "purchased",
]);
export function loadState(): SavedState {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "null");
    if (!raw || !Array.isArray(raw.history) || !Array.isArray(raw.completed))
      return { history: [], completed: [] };
    const history = raw.history
      .filter(
        (x: Interaction) =>
          x && typeof x.material_id === "string" && events.has(x.event),
      )
      .slice(-100);
    const completed = raw.completed
      .filter((x: unknown) => typeof x === "string")
      .slice(-100);
    // Persisted input is untrusted: restore only fields accepted by the API.
    const previous =
      raw.previous && typeof raw.previous.task === "string"
        ? { task: raw.previous.task.slice(0, 300), history: [] }
        : undefined;
    return { history, completed, previous };
  } catch {
    return { history: [], completed: [] };
  }
}
export function saveState(value: SavedState) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage is optional; quota/private mode must not block learning. */
  }
}
