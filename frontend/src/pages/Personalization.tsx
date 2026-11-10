import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import type { Onboarding, Profile, Stage, Level, Format } from "../types";
import { formats } from "../data/demo";
export function Personalization({
  profile,
  onChange,
  options,
  optionError,
  retry,
  back,
  submit,
  skip,
}: {
  profile: Profile;
  onChange: (p: Profile) => void;
  options?: Onboarding;
  optionError: boolean;
  retry: () => void;
  back: () => void;
  submit: () => void;
  skip: () => void;
}) {
  const [step, setStep] = useState(0);
  function choice(
    key: "stage" | "level" | "industry" | "preferred_format",
    value: string,
  ) {
    onChange({ ...profile, [key]: profile[key] === value ? undefined : value });
  }
  return (
    <section className="personalization">
      <button className="back" onClick={step === 0 ? back : () => setStep(0)}>
        <ArrowLeft size={16} />
        {step === 0 ? "К моей задаче" : "Предыдущий шаг"}
      </button>
      <div className="profile-layout">
        <aside>
          <span className="eyebrow">ЧУТЬ БОЛЬШЕ О ВАС</span>
          <h1>
            Ваш контекст.
            <br />
            <span>Более точный путь.</span>
          </h1>
          <p>
            Два коротких шага, чтобы знания подходили именно вам. Любой вопрос
            можно пропустить.
          </p>
          <div className="profile-quote">
            <span>ВАША ЗАДАЧА</span>
            <p>{profile.task}</p>
          </div>
          <button
            className="text-button"
            onClick={() => onChange({ task: profile.task, history: [] })}
          >
            <RotateCcw size={15} />
            Сбросить параметры
          </button>
        </aside>
        <div className="profile-form">
          <div className="step-progress">
            <span>ШАГ {step + 1} ИЗ 2</span>
            <div>
              <i className="filled" />
              <i className={step === 1 ? "filled" : ""} />
            </div>
          </div>
          {!options ? (
            <div role="status">
              <h2>
                {optionError
                  ? "Не удалось загрузить параметры"
                  : "Загружаем параметры…"}
              </h2>
              <p>Подборку можно получить и без профиля.</p>
              {optionError && (
                <button className="secondary" onClick={retry}>
                  Повторить загрузку
                </button>
              )}
            </div>
          ) : step === 0 ? (
            <>
              <fieldset>
                <legend>На каком этапе ваш бизнес?</legend>
                <div className="stage-options">
                  {Object.entries(options.stages).map(([key, label], i) => (
                    <button
                      className={
                        profile.stage === key ? "option selected" : "option"
                      }
                      aria-pressed={profile.stage === key}
                      key={key}
                      onClick={() => choice("stage", key as Stage)}
                    >
                      <span className="option-number">0{i + 1}</span>
                      <span>{label}</span>
                      {profile.stage === key && <Check size={17} />}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="field-label" htmlFor="industry">
                В какой сфере работаете?
              </label>
              <select
                id="industry"
                value={profile.industry || ""}
                onChange={(e) =>
                  onChange({
                    ...profile,
                    industry: e.target.value || undefined,
                  })
                }
              >
                <option value="">Можно не указывать</option>
                {options.industries.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </>
          ) : (
            <>
              <fieldset>
                <legend>Сколько у вас опыта?</legend>
                <div className="experience-options">
                  {Object.entries(options.levels).map(([key, label]) => (
                    <button
                      className={
                        profile.level === key ? "option selected" : "option"
                      }
                      aria-pressed={profile.level === key}
                      key={key}
                      onClick={() => choice("level", key as Level)}
                    >
                      {label}
                      {profile.level === key && <Check size={17} />}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>Как вам удобнее учиться?</legend>
                <p className="field-hint">
                  Только форматы, доступные в каталоге
                </p>
                <div className="chips">
                  {options.formats.map((f) => (
                    <button
                      className={
                        profile.preferred_format === f
                          ? "chip selected"
                          : "chip"
                      }
                      aria-pressed={profile.preferred_format === f}
                      key={f}
                      onClick={() => choice("preferred_format", f as Format)}
                    >
                      {formats[f]}
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}
          <div className="profile-actions">
            <button
              className="primary"
              disabled={!options && !optionError}
              onClick={step === 0 && options ? () => setStep(1) : submit}
            >
              {step === 0 && options ? "Продолжить" : "Показать подборку"}
              <ArrowRight size={18} />
            </button>
            <button className="text-button" onClick={skip}>
              Пропустить и получить подборку
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
