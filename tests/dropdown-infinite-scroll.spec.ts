import { test, expect } from "playwright/test";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";

test.use({ channel: "chrome" });
let server: ChildProcess;
let origin: string;

test.beforeAll(async () => {
  origin = await new Promise<string>((resolve, reject) => {
    server = spawn(process.execPath, [path.resolve("tests/fixtures/dropdown-server.mjs")], {
      windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
    });
    server.once("error", reject);
    server.once("exit", code => reject(new Error("Dropdown fixture exited: " + code)));
    server.stdout?.on("data", data => {
      const match = String(data).match(/DROPDOWN_TEST_ORIGIN=(http:\/\/127\.0\.0\.1:\d+)/);
      if (match) resolve(match[1]);
    });
    server.stderr?.on("data", data => process.stderr.write(data));
  });
});
test.afterAll(() => server?.kill());

for (const kind of ["dropdown", "select", "grouped", "major", "native", "combobox"]) {
  test(`${kind}: renders a small viewport then reaches the last option`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => { errors.push(error.message); console.error(error.message); });
    await page.goto(`${origin}/?kind=${kind}`);
    if (kind === "combobox") await page.getByPlaceholder("Search options").click();
    else if (kind === "select" || kind === "grouped") await page.getByRole("button").first().click();
    else await page.getByRole("button", { name: "Options", exact: true }).click();
    const list = page.getByRole("listbox");
    await expect(list).toBeVisible();
    await expect.poll(() => page.getByRole("option").count()).toBeLessThan(35);
    for (let i = 0; i < 8; i++) {
      await list.evaluate(element => { element.scrollTop = element.scrollHeight; });
      if (await page.getByRole("option", { name: "Option 200", exact: true }).isVisible()) break;
      await page.waitForTimeout(100);
    }
    await page.getByRole("option", { name: "Option 200", exact: true }).click();
    await expect(page.getByTestId("value")).toHaveText("200");
    expect(errors).toEqual([]);
  });
}

test("selected option outside the first page keeps its label and keyboard navigation", async ({ page }) => {
  await page.goto(`${origin}/?kind=selected`);
  const trigger = page.getByRole("button").first();
  await expect(trigger).toContainText("Option 180");
  await trigger.click();
  await expect(page.getByRole("option", { name: "Option 180", exact: true })).toBeVisible();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("value")).toHaveText("200");
  await expect(trigger).toContainText("Option 200");
});

test("search resets after selection and mobile dropdown stays inside its frame", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(origin);
  const trigger = page.getByRole("button", { name: "Options", exact: true });
  await trigger.click();
  const search = page.getByPlaceholder("Search options");
  await search.fill("Option 160");
  await page.getByRole("option", { name: "Option 160", exact: true }).click();
  await expect(trigger).toContainText("Option 160");
  await trigger.click();
  await expect(search).toHaveValue("");
  const bounds = await page.getByRole("listbox").evaluate(element => ({
    listBottom: element.getBoundingClientRect().bottom,
    popupBottom: element.closest("[data-placement]")!.getBoundingClientRect().bottom,
    pageWidth: document.documentElement.scrollWidth,
    viewportWidth: innerWidth,
  }));
  expect(bounds.listBottom).toBeLessThan(bounds.popupBottom);
  expect(bounds.pageWidth).toBeLessThanOrEqual(bounds.viewportWidth);
  await page.screenshot({ path: test.info().outputPath("dropdown-mobile.png") });
});

test("multiple selection retains an earlier choice while scrolling", async ({ page }) => {
  await page.goto(`${origin}/?kind=multiple`);
  await page.getByRole("button", { name: "Options", exact: true }).click();
  await page.getByRole("option", { name: "Option 001", exact: true }).click();
  const list = page.getByRole("listbox");
  await list.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await page.getByRole("option", { name: "Option 200", exact: true }).click();
  await expect(page.getByTestId("value")).toHaveText("1,200");
});

test("native adapter retains change events, required validation, FormData and reset", async ({ page }) => {
  await page.goto(`${origin}/?kind=native`);
  expect(await page.locator("form").evaluate((element: HTMLFormElement) => element.checkValidity())).toBe(false);
  const trigger = page.getByRole("button", { name: "Options", exact: true });
  await trigger.click();
  await page.getByRole("option", { name: "Option 003", exact: true }).click();
  await expect(page.getByTestId("events")).toHaveText("1");
  await expect(trigger).toContainText("Option 003");
  expect(await page.locator("form").evaluate((element: HTMLFormElement) => element.checkValidity())).toBe(true);
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByTestId("value")).toHaveText("3");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(trigger).toContainText("Choose");
});

test("limit API grows 20/40/60, replaces the prefix and resets the cache for search", async ({ page }) => {
  const requests: { limit: number; search: string }[] = [];
  const options = Array.from({ length: 55 }, (_, i) => ({ id: String(i + 1), label: `Option ${String(i + 1).padStart(3, "0")}` }));
  await page.route("**/api/options?**", async route => {
    const params = new URL(route.request().url()).searchParams;
    const limit = Number(params.get("limit"));
    const search = params.get("search") ?? "";
    requests.push({ limit, search });
    await route.fulfill({ json: options.filter(item => item.label.includes(search)).slice(0, limit) });
  });
  await page.goto(`${origin}/?kind=remote`);
  await expect.poll(() => requests.length).toBe(1);
  await page.getByRole("button", { name: "Options", exact: true }).click();
  const list = page.getByRole("listbox");
  await expect(page.getByRole("option", { name: "Option 001", exact: true })).toBeVisible();
  await list.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await expect.poll(() => requests.map(request => request.limit)).toEqual([20, 40]);
  await list.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await expect.poll(() => requests.map(request => request.limit)).toEqual([20, 40, 60]);
  await list.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await page.getByRole("option", { name: "Option 055", exact: true }).click();
  await expect(page.getByTestId("value")).toHaveText("55");
  await page.getByRole("button", { name: "Options", exact: true }).click();
  await page.getByPlaceholder("Search options").fill("Option 050");
  await expect(page.getByRole("option", { name: "Option 050", exact: true })).toBeVisible();
  expect(requests.at(-1)).toEqual({ limit: 20, search: "Option 050" });
  await expect(page.getByRole("option")).toHaveCount(1);
});

test("a failed limit request keeps loaded options, pauses automatic loading and supports retry", async ({ page }) => {
  const limits: number[] = [];
  let fail = true;
  await page.route("**/api/options?**", async route => {
    const limit = Number(new URL(route.request().url()).searchParams.get("limit"));
    limits.push(limit);
    if (limit === 40 && fail) return route.fulfill({ status: 500, json: { error: "test failure" } });
    return route.fulfill({ json: Array.from({ length: Math.min(25, limit) }, (_, index) => ({ id: String(index + 1), label: `Option ${String(index + 1).padStart(3, "0")}` })) });
  });
  await page.goto(`${origin}/?kind=remote-failure`);
  await expect.poll(() => limits).toEqual([20]);
  await page.getByRole("button", { name: "Options", exact: true }).click();
  const list = page.getByRole("listbox");
  await expect(page.getByRole("option", { name: "Option 001", exact: true })).toBeVisible();
  await list.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await expect(page.getByRole("alert")).toContainText("Chưa thể tải thêm");
  expect(limits).toEqual([20, 40]);
  await list.evaluate(element => element.dispatchEvent(new Event("scroll")));
  expect(limits).toEqual([20, 40]);
  fail = false;
  await page.getByRole("button", { name: "Thử lại", exact: true }).click();
  await expect.poll(() => limits).toEqual([20, 40, 40]);
  await list.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await page.getByRole("option", { name: "Option 025", exact: true }).click();
  await expect(page.getByTestId("value")).toHaveText("25");
});

for (const kind of ["guard", "failure"]) {
  test(`${kind}: repeated scroll events do not duplicate a request or loop after failure`, async ({ page }) => {
    await page.goto(`${origin}/?kind=${kind}`);
    const scroller = page.getByTestId("scroller");
    await scroller.evaluate(element => {
      element.scrollTop = element.scrollHeight;
      for (let i = 0; i < 10; i++) element.dispatchEvent(new Event("scroll"));
    });
    await expect(page.getByTestId("calls")).toHaveText("1");
    await expect(page.getByTestId("pending")).toHaveText("false");
    if (kind === "failure") {
      await expect(page.getByTestId("failed")).toHaveText("true");
      await scroller.evaluate(element => element.dispatchEvent(new Event("scroll")));
      await expect(page.getByTestId("calls")).toHaveText("1");
    }
  });
}
