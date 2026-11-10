import { test, expect } from "@playwright/test";
async function results(page: import("@playwright/test").Page) {
  await page
    .getByLabel("Ваша бизнес-задача", { exact: true })
    .fill("Я открыл кофейню, как привлечь клиентов?");
  await page
    .getByRole("button", { name: "Подобрать материалы", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Пропустить и получить подборку" })
    .click();
  await expect(page.getByRole("button", { name: "Материалы 4" })).toBeVisible();
}
for (const width of [375, 768, 1440])
  test(`journey and layout ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Ваш бизнес.",
    );
    await expect(
      page.getByRole("button", { name: "Подобрать материалы", exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: `screenshots/home-${width}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page
      .getByRole("button", { name: "Хочу научиться продвигать бизнес" })
      .click();
    await page
      .getByRole("button", { name: "Подобрать материалы", exact: true })
      .click();
    await page.getByRole("button", { name: "Только запускаю" }).click();
    await page.locator("#industry").selectOption("Общественное питание");
    await page.screenshot({
      path: `screenshots/profile-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Продолжить", exact: true }).click();
    await page.getByRole("button", { name: "Начинающий", exact: true }).click();
    await page.getByRole("button", { name: "Статья", exact: true }).click();
    await page.getByRole("button", { name: "Показать подборку" }).click();
    await expect(
      page.getByRole("button", { name: "Материалы 4" }),
    ).toBeVisible();
    await expect(page.locator("article")).toHaveCount(4);
    await page.locator("summary").first().click();
    await page.screenshot({
      path: `screenshots/results-${width}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.getByLabel("Формат материала").selectOption("template");
    await expect(page.locator("article")).toHaveCount(1);
    await page
      .getByRole("button", { name: "О тестовом материале", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.getByRole("button", { name: "Маршрут", exact: true }).click();
    await page
      .getByRole("button", { name: "Отметить пройденным", exact: true })
      .first()
      .click();
    await expect(page.locator("progress")).toHaveAttribute("value", "1");
    await page.screenshot({
      path: `screenshots/route-${width}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.reload();
    await page.getByRole("button", { name: /Мой путь/ }).click();
    await expect(
      page.getByText("Отмечено материалов: 1.", { exact: false }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
for (const scenario of ["fallback", "empty", "error"])
  test(`state ${scenario}`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Сценарии демо" }).click();
    await page.getByLabel("Состояние результата").selectOption(scenario);
    await page.getByRole("button", { name: "Закрыть сценарии" }).click();
    await page
      .getByLabel("Ваша бизнес-задача", { exact: true })
      .fill("Нужна помощь бизнесу");
    await page
      .getByRole("button", { name: "Подобрать материалы", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Пропустить и получить подборку" })
      .click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      scenario === "error" ? "Небольшая остановка" : "У знаний появился",
    );
    if (scenario === "empty")
      await expect(page.getByText("В каталоге пока тихо")).toBeVisible();
    if (scenario === "fallback")
      await expect(
        page.getByText("Точных совпадений нет.", { exact: false }),
      ).toBeVisible();
    if (scenario === "error")
      await expect(
        page.getByRole("button", { name: "Повторить", exact: true }),
      ).toBeVisible();
    await page.screenshot({
      path: `screenshots/state-${scenario}.png`,
      fullPage: true,
    });
  });
test("empty input, no history, long task, profile reset", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Мой путь/ }).click();
  await expect(page.getByText("Здесь начнётся ваша история")).toBeVisible();
  await page.getByRole("button", { name: "Найти первый шаг" }).click();
  await page
    .getByRole("button", { name: "Подобрать материалы", exact: true })
    .click();
  await expect(
    page.getByLabel("Ваша бизнес-задача", { exact: true }),
  ).toHaveAttribute("aria-invalid", "true");
  await page
    .getByLabel("Ваша бизнес-задача", { exact: true })
    .fill("Оченьдлиннаябизнесзадача".repeat(13).slice(0, 300));
  await page
    .getByRole("button", { name: "Подобрать материалы", exact: true })
    .click();
  await page.getByRole("button", { name: "Только запускаю" }).click();
  await page.getByRole("button", { name: "Сбросить параметры" }).click();
  await expect(
    page.getByRole("button", { name: "Только запускаю" }),
  ).toHaveAttribute("aria-pressed", "false");
  await page
    .getByRole("button", { name: "Пропустить и получить подборку" })
    .click();
  await expect(page.getByRole("button", { name: "Материалы 4" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
test("three explicitly selected demo profiles", async ({ page }) => {
  await page.goto("/");
  for (const name of [
    "Налоги без сложностей",
    "Продажи в интернет-магазине",
    "Владелец кофейни",
  ]) {
    await page.getByRole("button", { name: "Сценарии демо" }).click();
    await page.getByRole("button", { name, exact: true }).click();
    await page
      .getByRole("button", { name: "Подобрать материалы", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Пропустить и получить подборку" })
      .click();
    await expect(page.locator("article")).toHaveCount(4);
    await expect(page.locator("article").first()).toContainText(
      name === "Налоги без сложностей"
        ? "налоги"
        : name === "Продажи в интернет-магазине"
          ? "интернет-магазин"
          : "Первые клиенты",
    );
    await page.getByRole("button", { name: "Новая задача" }).click();
  }
});
