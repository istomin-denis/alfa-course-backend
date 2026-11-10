import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("WCAG 2.1 AA on home, personalization and results", async ({ page }) => {
  await page.goto("/");
  for (const screen of ["home", "profile", "results"]) {
    if (screen === "profile") {
      await page
        .getByLabel("Ваша бизнес-задача", { exact: true })
        .fill("Хочу привлечь клиентов");
      await page
        .getByRole("button", { name: "Подобрать материалы", exact: true })
        .click();
    }
    if (screen === "results") {
      await page
        .getByRole("button", { name: "Пропустить и получить подборку" })
        .click();
      await expect(page.locator("article")).toHaveCount(4);
    }
    await page.waitForTimeout(400);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        help: v.help,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
});
