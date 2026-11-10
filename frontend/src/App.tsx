import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Check,
  SlidersHorizontal,
  X,
  RotateCcw,
  History,
  Sparkles,
  Route,
  BookOpen,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";
import { RouteArt } from "./components/RouteArt";
import { MaterialCard } from "./components/MaterialCard";
import { Personalization } from "./pages/Personalization";
import { client, isDemo } from "./api/client";
import { formats, presets } from "./data/demo";
import type {
  DemoScenario,
  Format,
  NavigatorResponse,
  Onboarding,
  Profile,
} from "./types";
import { loadState, saveState } from "./state/storage";
const examples = [
  "Хочу открыть свой бизнес",
  "Нужно увеличить продажи",
  "Не понимаю, как вести бухгалтерию",
  "Хочу научиться продвигать бизнес",
];
type Screen = "home" | "profile" | "loading" | "results" | "error" | "history";
export default function App() {
  const [saved, setSaved] = useState(loadState);
  const [profile, setProfile] = useState<Profile>({ task: "", history: [] });
  const [screen, setScreen] = useState<Screen>("home");
  const [options, setOptions] = useState<Onboarding>();
  const [optionError, setOptionError] = useState(false);
  const [source, setSource] = useState(isDemo ? "synthetic" : "unknown");
  const synthetic = source !== "local";
  const [result, setResult] = useState<NavigatorResponse>();
  const [track, setTrack] = useState(0);
  const [scenario, setScenario] = useState<DemoScenario>("normal");
  const [view, setView] = useState<"cards" | "route">("cards");
  const [filter, setFilter] = useState<Format | "all">("all");
  const [demoOpen, setDemoOpen] = useState(false);
  const [detail, setDetail] = useState<string>();
  const [validation, setValidation] = useState(false);
  const main = useRef<HTMLElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    saveState(saved);
  }, [saved]);
  async function getOptions() {
    setOptionError(false);
    try {
      setOptions(await client.onboarding());
    } catch {
      setOptionError(true);
    }
  }
  useEffect(() => {
    void getOptions();
    void client
      .source()
      .then((s) => setSource(s.catalog))
      .catch(() => setSource("unknown"));
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    main.current?.focus();
  }, [screen]);
  useEffect(() => {
    if (detail) {
      returnFocus.current = document.activeElement as HTMLElement;
      dialog.current?.showModal();
    } else if (dialog.current?.open) {
      dialog.current.close();
      returnFocus.current?.focus();
    }
  }, [detail]);
  async function recommend(p = profile) {
    setScreen("loading");
    setFilter("all");
    setView("cards");
    const request = {
      ...p,
      task: p.task.trim(),
      history: saved.history.slice(-100),
    };
    try {
      const response = await client.recommend(request, track, scenario);
      setResult(response);
      setSaved((s) => ({ ...s, previous: request }));
      setScreen("results");
    } catch {
      setScreen("error");
    }
  }
  function start() {
    if (!profile.task.trim()) {
      setValidation(true);
      document.getElementById("task")?.focus();
      return;
    }
    setValidation(false);
    setScreen("profile");
  }
  function choosePreset(index: number) {
    setTrack(index);
    setProfile(presets[index].profile);
    setDemoOpen(false);
    setScreen("home");
  }
  function complete(id: string) {
    setSaved((s) =>
      s.completed.includes(id)
        ? {
            ...s,
            completed: s.completed.filter((x) => x !== id),
            history: s.history.filter(
              (x) => !(x.material_id === id && x.event === "completed"),
            ),
          }
        : {
            ...s,
            completed: [...s.completed, id],
            history: [
              ...s.history,
              { material_id: id, event: "completed" as const },
            ].slice(-100),
          },
    );
  }
  function openMaterial(id: string) {
    setSaved((s) => ({
      ...s,
      history: [
        ...s.history,
        { material_id: id, event: "view" as const },
      ].slice(-100),
    }));
    setDetail(id);
  }
  const selected = result?.recommendations.find(
    (r) => r.material.id === detail,
  );
  const recommendations = result?.recommendations || [];
  const visible = recommendations.filter(
    (r) => filter === "all" || r.material.format === filter,
  );
  const completed = recommendations.filter((r) =>
    saved.completed.includes(r.material.id),
  ).length;
  const routeSteps =
    result?.route?.steps ||
    recommendations.map((r, i) => ({
      material_id: r.material.id,
      title:
        [
          "Разобраться в проблеме",
          "Получить инструменты",
          "Применить знания",
          "Следующий уровень",
        ][i] || `Шаг ${i + 1}`,
      next_step: r.next_step,
    }));
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip" href="#main">
        К содержимому
      </a>
      <header className="header">
        <button
          className="brand"
          onClick={() => setScreen("home")}
          title="На главную"
        >
          <span className="brand-mark" aria-hidden="true">
            ↗
          </span>
          <span>
            Альфа-Курс<span className="brand-sub">NAVIGATOR</span>
          </span>
        </button>
        <nav aria-label="Главная навигация">
          <button
            className={screen === "home" ? "nav-active" : ""}
            onClick={() => setScreen("home")}
          >
            Подобрать знания
          </button>
          <button
            className={screen === "history" ? "nav-active" : ""}
            onClick={() => setScreen("history")}
          >
            <History size={16} /> Мой путь
            {saved.completed.length > 0 && (
              <span className="nav-count">{saved.completed.length}</span>
            )}
          </button>
        </nav>
        <span className="header-note">
          Для тех, кто делает своё дело <ArrowUpRight size={16} />
        </span>
      </header>
      <div className="mode-bar">
        <span>
          <span className="status-dot" />
          {isDemo
            ? "Демонстрационный режим · все материалы синтетические"
            : source === "synthetic"
              ? "API подключён · синтетический каталог"
              : source === "local"
                ? "API подключён · каталог команды"
                : "API · источник каталога не подтверждён"}
        </span>
        {isDemo && (
          <button
            onClick={() => setDemoOpen((v) => !v)}
            aria-expanded={demoOpen}
          >
            Сценарии демо <SlidersHorizontal size={13} />
          </button>
        )}
      </div>
      {demoOpen && (
        <section className="demo-panel" aria-label="Демонстрационные сценарии">
          <div>
            <strong>Попробуйте другой бизнес</strong>
            <div className="chips">
              {presets.map((p, i) => (
                <button
                  key={p.label}
                  className={track === i ? "chip selected" : "chip"}
                  onClick={() => choosePreset(i)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <label>
            Состояние результата
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as DemoScenario)}
            >
              <option value="normal">Обычная подборка</option>
              <option value="fallback">Нет точных совпадений</option>
              <option value="empty">Пустой каталог</option>
              <option value="error">Ошибка сервера</option>
            </select>
          </label>
          <button
            className="icon-btn"
            aria-label="Закрыть сценарии"
            onClick={() => setDemoOpen(false)}
          >
            <X size={18} />
          </button>
        </section>
      )}
      <main id="main" ref={main} tabIndex={-1}>
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {screen === "home" && (
              <>
                <section className="hero">
                  <div className="hero-copy">
                    <div className="eyebrow">
                      <span className="small-line" /> ЗНАНИЯ В НУЖНЫЙ МОМЕНТ
                    </div>
                    <h1>
                      Ваш бизнес.
                      <br />
                      Ваша задача.
                      <br />
                      <span>Ваш следующий шаг.</span>
                    </h1>
                    <p className="hero-description">
                      Расскажите, какую задачу решаете сейчас.
                      <br className="desktop-break" /> Мы подберём полезные
                      материалы и подскажем,
                      <br className="desktop-break" /> с чего начать.
                    </p>
                    <div className="hero-proof">
                      <span>
                        <Check size={15} />
                        Можно без профиля
                      </span>
                      <span>
                        <Check size={15} />С понятным объяснением
                      </span>
                    </div>
                  </div>
                  <RouteArt />
                </section>
                <section className="task-section" aria-labelledby="task-label">
                  <div className="task-heading">
                    <h2 id="task-label">
                      Что сейчас важно для вашего бизнеса?
                    </h2>
                    <span>Начнём с вашей задачи</span>
                  </div>
                  <form
                    className={"task-box" + (validation ? " invalid" : "")}
                    onSubmit={(e) => {
                      e.preventDefault();
                      start();
                    }}
                  >
                    <label className="sr-only" htmlFor="task">
                      Ваша бизнес-задача
                    </label>
                    <textarea
                      id="task"
                      maxLength={300}
                      value={profile.task}
                      onChange={(e) => {
                        setProfile({ ...profile, task: e.target.value });
                        setValidation(false);
                      }}
                      placeholder="Например: я открыл кофейню, но клиентов мало. Как привлечь покупателей без больших затрат?"
                      aria-invalid={validation}
                      aria-describedby="task-help"
                    />
                    <div className="task-bottom">
                      <span id="task-help">
                        {validation
                          ? "Расскажите о задаче — достаточно одного предложения"
                          : `${profile.task.length}/300 · Пишите своими словами`}
                      </span>
                      <button className="primary" type="submit">
                        Подобрать материалы <ArrowUpRight size={19} />
                      </button>
                    </div>
                  </form>
                  <div className="examples">
                    <span>Или начните с этого</span>
                    {examples.map((example, i) => (
                      <button
                        key={example}
                        onClick={() => {
                          setProfile({ ...profile, task: example });
                          if (i === 1) setTrack(2);
                          if (i === 2) setTrack(1);
                          if (i === 3) setTrack(0);
                          document.getElementById("task")?.focus();
                        }}
                      >
                        {example}
                        <ArrowUpRight size={13} />
                      </button>
                    ))}
                  </div>
                </section>
                <section className="how">
                  <div>
                    <span className="eyebrow">МЕНЬШЕ ПОИСКА. БОЛЬШЕ ДЕЛА.</span>
                    <h2>
                      Не просто учиться.
                      <br />
                      Двигаться вперёд.
                    </h2>
                  </div>
                  {[
                    {
                      n: "01",
                      title: "Начните с задачи",
                      text: "Не нужно знать название курса. Расскажите, что хотите изменить.",
                    },
                    {
                      n: "02",
                      title: "Поймите, что подходит",
                      text: "У каждого материала — причина, почему стоит начать именно с него.",
                    },
                    {
                      n: "03",
                      title: "Перейдите к действию",
                      text: "Свяжите знания в последовательный маршрут, шаг за шагом.",
                    },
                  ].map((item) => (
                    <div className="how-step" key={item.n}>
                      <span>{item.n}</span>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  ))}
                </section>
                {saved.previous && (
                  <button
                    className="previous"
                    onClick={() => {
                      setProfile(saved.previous!);
                      void recommend(saved.previous!);
                    }}
                  >
                    <History size={18} />
                    <span>
                      Вернуться к предыдущей задаче
                      <strong>{saved.previous.task}</strong>
                    </span>
                    <ArrowRight size={18} />
                  </button>
                )}
              </>
            )}
            {screen === "profile" && (
              <Personalization
                profile={profile}
                onChange={setProfile}
                options={options}
                optionError={optionError}
                retry={getOptions}
                back={() => setScreen("home")}
                submit={() => void recommend()}
                skip={() => {
                  const p = { task: profile.task, history: [] };
                  setProfile(p);
                  void recommend(p);
                }}
              />
            )}
            {screen === "loading" && (
              <section
                className="loading state-page"
                aria-live="polite"
                aria-busy="true"
              >
                <div className="loading-icon">
                  <LoaderCircle size={30} />
                </div>
                <span className="eyebrow">ОТ ЗАДАЧИ К РЕШЕНИЮ</span>
                <h1>
                  {isDemo
                    ? "Готовим тестовую подборку"
                    : "Подбираем полезные знания"}
                </h1>
                <p>
                  {isDemo
                    ? "Показываем заранее подготовленный сценарий. Это не работа ML-модели."
                    : "Учитываем задачу и параметры профиля."}
                </p>
                <div className="skeletons">
                  {[1, 2, 3].map((i) => (
                    <div className="skeleton" key={i} />
                  ))}
                </div>
              </section>
            )}
            {screen === "error" && (
              <section className="state-page" role="alert">
                <AlertCircle size={36} />
                <span className="eyebrow">ПОКА НЕ ПОЛУЧИЛОСЬ</span>
                <h1>
                  Небольшая остановка.
                  <br />
                  Не конец маршрута.
                </h1>
                <p>
                  {isDemo
                    ? "Это тестовое состояние ошибки. Выберите обычную подборку в сценариях демо или повторите запрос."
                    : "Не удалось получить рекомендации. Проверьте соединение и попробуйте ещё раз. Ваша задача сохранена."}
                </p>
                <div className="actions">
                  <button className="primary" onClick={() => void recommend()}>
                    <RotateCcw size={17} />
                    Повторить
                  </button>
                  <button
                    className="secondary"
                    onClick={() => setScreen("home")}
                  >
                    К моей задаче
                  </button>
                </div>
              </section>
            )}
            {screen === "history" && (
              <section className="history-page">
                <span className="eyebrow">МОЙ ПУТЬ</span>
                <h1>
                  Маленькие шаги.
                  <br />
                  Настоящее движение.
                </h1>
                {!saved.previous ? (
                  <div className="empty-inline">
                    <History size={30} />
                    <h2>Здесь начнётся ваша история</h2>
                    <p>
                      Расскажите о задаче. Мы сохраним последний запрос и
                      отмеченные вами шаги на этом устройстве.
                    </p>
                    <button
                      className="primary"
                      onClick={() => setScreen("home")}
                    >
                      Найти первый шаг <ArrowRight size={17} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="history-card">
                      <span className="eyebrow">ПОСЛЕДНЯЯ ЗАДАЧА</span>
                      <h2>{saved.previous.task}</h2>
                      <p>
                        Отмечено материалов: {saved.completed.length}. Прогресс
                        хранится только в этом браузере.
                      </p>
                      <button
                        className="primary"
                        onClick={() => {
                          setProfile(saved.previous!);
                          void recommend(saved.previous!);
                        }}
                      >
                        Открыть подборку <ArrowRight size={17} />
                      </button>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => {
                        setSaved({ history: [], completed: [] });
                      }}
                    >
                      Очистить локальную историю
                    </button>
                  </>
                )}
              </section>
            )}
            {screen === "results" && result && (
              <section className="results-page">
                <button className="back" onClick={() => setScreen("profile")}>
                  <ArrowLeft size={16} />
                  Изменить задачу и профиль
                </button>
                <div className="result-heading">
                  <div>
                    <span className="eyebrow">
                      ОТ ВАШЕЙ ЗАДАЧИ — К ДЕЙСТВИЮ
                    </span>
                    <h1>
                      У знаний появился
                      <br />
                      <span>ваш маршрут.</span>
                    </h1>
                  </div>
                  <div className="result-query">
                    <span>ВАША ЗАДАЧА</span>
                    <p>{result.task_summary || profile.task}</p>
                    <div className="tags">
                      {profile.stage && options && (
                        <span>{options.stages[profile.stage]}</span>
                      )}
                      {profile.industry && <span>{profile.industry}</span>}
                      {!profile.stage && <span>Без профиля — тоже можно</span>}
                    </div>
                  </div>
                </div>
                {synthetic && (
                  <p className="demo-notice">
                    <Sparkles size={16} />
                    {isDemo
                      ? "Тестовая подборка: материалы, объяснения и последовательность синтетические. Не результат ML-модели."
                      : source === "synthetic"
                        ? "API использует синтетический каталог. Учебные материалы и ссылки — тестовые."
                        : "Источник каталога не подтверждён. Внешние ссылки временно недоступны."}
                  </p>
                )}
                {result.clarification && (
                  <div className="clarification">
                    <AlertCircle size={18} />
                    <p>{result.clarification}</p>
                    <button onClick={() => setScreen("profile")}>
                      Уточнить профиль <ArrowRight size={15} />
                    </button>
                  </div>
                )}
                {recommendations.length === 0 ? (
                  <div className="empty-inline">
                    <BookOpen size={34} />
                    <h2>В каталоге пока тихо</h2>
                    <p>
                      Материалов для этой подборки нет. Попробуйте другую задачу
                      или вернитесь позже.
                    </p>
                    <button
                      className="primary"
                      onClick={() => setScreen("home")}
                    >
                      Изменить запрос <ArrowRight size={17} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="results-toolbar">
                      <div
                        className="segmented"
                        aria-label="Представление результатов"
                      >
                        <button
                          aria-pressed={view === "cards"}
                          className={view === "cards" ? "active" : ""}
                          onClick={() => setView("cards")}
                        >
                          <BookOpen size={16} />
                          Материалы <span>{recommendations.length}</span>
                        </button>
                        <button
                          aria-pressed={view === "route"}
                          className={view === "route" ? "active" : ""}
                          onClick={() => setView("route")}
                        >
                          <Route size={16} />
                          Маршрут
                        </button>
                      </div>
                      {view === "cards" && (
                        <label className="filter">
                          Формат
                          <select
                            aria-label="Формат материала"
                            value={filter}
                            onChange={(e) =>
                              setFilter(e.target.value as Format | "all")
                            }
                          >
                            <option value="all">Все форматы</option>
                            {[
                              ...new Set(
                                recommendations.map((r) => r.material.format),
                              ),
                            ].map((f) => (
                              <option key={f} value={f}>
                                {formats[f]}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </div>
                    {view === "cards" ? (
                      <div className="material-grid">
                        {visible.map((r, i) => (
                          <MaterialCard
                            key={r.material.id}
                            recommendation={r}
                            index={i}
                            demo={synthetic}
                            completed={saved.completed.includes(r.material.id)}
                            onOpen={() => openMaterial(r.material.id)}
                            onComplete={() => complete(r.material.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="route-layout">
                        <aside className="route-summary">
                          <span className="eyebrow">ВАШ УЧЕБНЫЙ ПЛАН</span>
                          <h2>
                            Один шаг
                            <br />
                            за другим.
                          </h2>
                          <p>
                            {isDemo
                              ? "Демонстрационный маршрут по тестовым материалам."
                              : result.route
                                ? "Маршрут предложен сервисом."
                                : "Материалы в порядке, полученном от API. Отдельный маршрут сервис пока не передаёт."}
                          </p>
                          <div className="progress-label">
                            <span>Ваш прогресс</span>
                            <strong>
                              {completed} / {recommendations.length}
                            </strong>
                          </div>
                          <progress
                            value={completed}
                            max={recommendations.length}
                          />
                          <small>Отмечайте пройденное самостоятельно</small>
                        </aside>
                        <ol className="route-list">
                          {routeSteps.map((step, i) => {
                            const r = recommendations.find(
                              (item) => item.material.id === step.material_id,
                            );
                            if (!r) return null;
                            return (
                              <li
                                key={step.material_id}
                                className={
                                  saved.completed.includes(step.material_id)
                                    ? "done"
                                    : ""
                                }
                              >
                                <span className="route-number">
                                  {saved.completed.includes(
                                    step.material_id,
                                  ) ? (
                                    <Check size={19} />
                                  ) : (
                                    String(i + 1).padStart(2, "0")
                                  )}
                                </span>
                                <div className="route-step">
                                  <span className="eyebrow">{step.title}</span>
                                  <h3>{r.material.title}</h3>
                                  <p>{step.next_step}</p>
                                  <div className="route-actions">
                                    <button
                                      className="text-button"
                                      onClick={() =>
                                        openMaterial(step.material_id)
                                      }
                                    >
                                      {isDemo
                                        ? "О тестовом материале"
                                        : "Посмотреть материал"}
                                      <ArrowUpRight size={16} />
                                    </button>
                                    <button
                                      className="completion"
                                      aria-pressed={saved.completed.includes(
                                        step.material_id,
                                      )}
                                      onClick={() => complete(step.material_id)}
                                    >
                                      <Check size={16} />
                                      {saved.completed.includes(
                                        step.material_id,
                                      )
                                        ? "Пройдено"
                                        : "Отметить пройденным"}
                                    </button>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    )}
                  </>
                )}
                <div className="result-bottom">
                  <p>
                    Задача изменилась?
                    <br />
                    <strong>Начните новый маршрут.</strong>
                  </p>
                  <button
                    className="secondary"
                    onClick={() => {
                      setProfile({ task: "", history: [] });
                      setScreen("home");
                    }}
                  >
                    Новая задача <ArrowUpRight size={17} />
                  </button>
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer>
        <span>
          Альфа-Курс <span className="footer-divider">/</span> Navigator
        </span>
        <span>Знания работают, когда работают на вас.</span>
        <small>
          Концепт для Hack&Change 2026 · Не официальный сервис банка
        </small>
      </footer>
      <dialog
        ref={dialog}
        onCancel={() => setDetail(undefined)}
        onClose={() => setDetail(undefined)}
        aria-labelledby="detail-title"
      >
        <button
          className="icon-btn dialog-close"
          aria-label="Закрыть материал"
          onClick={() => setDetail(undefined)}
        >
          <X size={20} />
        </button>
        {selected && (
          <>
            <span className="eyebrow">
              {synthetic
                ? "ТЕСТОВЫЙ МАТЕРИАЛ"
                : formats[selected.material.format]}
            </span>
            <h2 id="detail-title">{selected.material.title}</h2>
            <p>{selected.material.summary}</p>
            <div className="detail-note">
              <strong>
                {synthetic
                  ? "Это демонстрация, не настоящий курс"
                  : "Следующее действие"}
              </strong>
              <p>
                {synthetic
                  ? "Тестовый материал показывает, как будет выглядеть подборка. Учебного содержания и внешней ссылки здесь нет."
                  : selected.next_step}
              </p>
            </div>
            {!synthetic &&
              selected.material.url &&
              /^https?:\/\//.test(selected.material.url) && (
                <a
                  className="primary"
                  href={selected.material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Перейти к материалу <ArrowUpRight size={17} />
                </a>
              )}
            <button
              className="secondary"
              onClick={() => {
                complete(selected.material.id);
                setDetail(undefined);
              }}
            >
              {saved.completed.includes(selected.material.id)
                ? "Снять отметку о прохождении"
                : "Отметить пройденным"}
            </button>
          </>
        )}
      </dialog>
    </MotionConfig>
  );
}
