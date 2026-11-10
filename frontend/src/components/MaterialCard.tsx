import {
  ArrowUpRight,
  Check,
  ChevronDown,
  FileText,
  BookOpen,
  Layers,
} from "lucide-react";
import type { Recommendation } from "../types";
import { formats, onboarding } from "../data/demo";
export function MaterialCard({
  recommendation: r,
  index,
  demo,
  completed,
  onOpen,
  onComplete,
}: {
  recommendation: Recommendation;
  index: number;
  demo: boolean;
  completed: boolean;
  onOpen: () => void;
  onComplete: () => void;
}) {
  const Icon =
    r.material.format === "template"
      ? Layers
      : r.material.format === "course"
        ? BookOpen
        : FileText;
  return (
    <article className={"material-card card-" + (index % 4)}>
      <div className="card-top">
        <span className="format-label">
          <Icon size={16} />
          {formats[r.material.format]}
        </span>
        <span className="access">
          {r.material.access === "free"
            ? "Бесплатно"
            : r.material.access === "paid"
              ? "Платный доступ"
              : "Доступ уточняется"}
        </span>
      </div>
      <div className="card-visual" aria-hidden="true">
        <span className="card-ordinal">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="visual-shape">
          <span />
          <span />
          <span />
        </div>
        <ArrowUpRight size={35} />
      </div>
      <div className="card-content">
        <div className="card-meta">
          {r.material.level && (
            <span>{onboarding.levels[r.material.level]}</span>
          )}
          {r.material.duration_minutes != null && (
            <span>{r.material.duration_minutes} мин</span>
          )}
          {demo && <span>Тестовый материал</span>}
        </div>
        <h2>{r.material.title}</h2>
        <p>{r.material.summary}</p>
        <details className="reason">
          <summary>
            Почему это подходит
            <ChevronDown size={15} />
          </summary>
          <ul>
            {r.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </details>
        <div className="card-actions">
          <button className="text-button" onClick={onOpen}>
            {demo ? "О тестовом материале" : "Перейти к материалу"}
            <ArrowUpRight size={17} />
          </button>
          <button
            className={
              "icon-btn completion-icon" + (completed ? " checked" : "")
            }
            aria-label={
              completed
                ? "Снять отметку: " + r.material.title
                : "Отметить пройденным: " + r.material.title
            }
            aria-pressed={completed}
            onClick={onComplete}
          >
            <Check size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
