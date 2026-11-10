import { demoResult, onboarding } from "../data/demo";
import type {
  DemoScenario,
  NavigatorResponse,
  Onboarding,
  Profile,
} from "../types";
export const isDemo = import.meta.env.VITE_DATA_SOURCE !== "api";
const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${base}${path}`, {
    ...init,
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`API: ${response.status}`);
  return response.json() as Promise<T>;
}
export const client = {
  source: (): Promise<{ catalog: string }> =>
    isDemo ? Promise.resolve({ catalog: "synthetic" }) : request("/health"),
  onboarding: (): Promise<Onboarding> =>
    isDemo ? Promise.resolve(onboarding) : request("/api/v1/onboarding"),
  recommend: async (
    profile: Profile,
    track: number,
    scenario: DemoScenario,
  ): Promise<NavigatorResponse> => {
    if (!isDemo)
      return request("/api/v1/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
    await new Promise((resolve) => setTimeout(resolve, 700));
    if (scenario === "error")
      throw new Error("Демонстрационная ошибка сервера");
    const result = demoResult(profile, track);
    if (scenario === "empty") result.recommendations = [];
    if (scenario === "fallback") {
      result.mode = "fallback";
      result.clarification =
        "Точных совпадений нет. Эти тестовые материалы помогут начать с основ.";
    }
    return result;
  },
};
