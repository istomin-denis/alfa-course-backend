import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const backend = spawn(
  ".venv/bin/python",
  ["-m", "uvicorn", "app.main:app", "--port", "4180"],
  {
    cwd: "..",
    env: { ...process.env, CORS_ORIGINS: "http://127.0.0.1:4181" },
    stdio: "inherit",
  },
);
const frontend = spawn("npm", ["run", "dev", "--", "--port", "4181"], {
  env: {
    ...process.env,
    VITE_DATA_SOURCE: "api",
    VITE_API_BASE_URL: "http://127.0.0.1:4180",
  },
  stdio: "inherit",
});
let browser;
async function ready(url) {
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Not ready: ${url}`);
}
try {
  await ready("http://127.0.0.1:4180/health");
  await ready("http://127.0.0.1:4181");
  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4181");
  await page
    .getByLabel("Ваша бизнес-задача", { exact: true })
    .fill("Как привлечь клиентов в кофейню?");
  await page
    .getByRole("button", { name: "Подобрать материалы", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Пропустить и получить подборку" })
    .click();
  await page.locator("article").first().waitFor();
  assert((await page.locator("article").count()) > 0);
  assert(
    (await page.locator(".mode-bar").innerText()).includes(
      "синтетический каталог",
    ),
  );
  await page
    .getByRole("button", { name: "О тестовом материале" })
    .first()
    .click();
  assert.equal(await page.getByRole("dialog").locator("a").count(), 0);
  console.log(
    "PASS: real FastAPI response rendered; synthetic source identified; fake links suppressed.",
  );
} finally {
  await browser?.close();
  frontend.kill("SIGTERM");
  backend.kill("SIGTERM");
}
