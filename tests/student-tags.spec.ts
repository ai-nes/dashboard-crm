import { test, expect } from "playwright/test";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";

test.use({ channel: "chrome" });
let serverProcess: ChildProcess;
let origin: string;
test.beforeAll(async () => {
  origin = await new Promise<string>((resolve, reject) => {
    serverProcess = spawn(
      process.execPath,
      [path.resolve("tests/fixtures/student-tags-server.mjs")],
      { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
    );
    serverProcess.once("error", reject);
    serverProcess.once("exit", (code) =>
      reject(new Error("Tag fixture exited: " + code)),
    );
    serverProcess.stderr?.on("data", (data) => process.stderr.write(data));
    serverProcess.stdout?.on("data", (data) => {
      const match = String(data).match(
        /TAG_TEST_ORIGIN=(http:\/\/127\.0\.0\.1:\d+)/,
      );
      if (match) resolve(match[1]);
    });
  });
});
test.afterAll(() => {
  serverProcess?.kill();
});

const catalogue = [
  {
    group_name: "ATTENTION",
    tags: [
      {
        name: "hash-special",
        code: "SPECIAL_ATTENTION",
        label: "Special Attention",
        status: "active",
      },
      {
        name: "hash-priority",
        code: "HIGH_PRIORITY",
        label: "High Priority",
        status: "active",
      },
      {
        name: "hash-parent",
        code: "PARENT_INVOLVED",
        label: "Parent Involved",
        status: "active",
      },
    ],
  },
];

test("adds multiple tags, searches, removes just one, and retains Vietnamese labels after reload", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  let tags = ["hash-special"];
  let revision = 1;
  const writes: { tag: string; expected_modified: string }[] = [];
  const response = () => ({
    student: "STU-TEST",
    modified: String(revision),
    tags: tags.map((tag) => ({ tag, term: tag })),
    needs: [],
  });
  await page.route("**/api/method/**", async (route) => {
    const method = new URL(route.request().url()).pathname.split(".").at(-1);
    if (method === "me")
      return route.fulfill({ json: { message: { csrf_token: "test-token" } } });
    if (method === "list_tag_groups")
      return route.fulfill({ json: { message: catalogue } });
    if (method === "get_classifications")
      return route.fulfill({ json: { message: response() } });
    const body = route.request().postDataJSON();
    writes.push(body);
    if (body.expected_modified !== String(revision)) {
      return route.fulfill({
        status: 417,
        json: { exception: "REVISION_CONFLICT: Student changed" },
      });
    }
    tags =
      method === "add_student_tag"
        ? [...new Set([...tags, body.tag])]
        : tags.filter((tag) => tag !== body.tag);
    revision++;
    return route.fulfill({ json: { message: response() } });
  });
  await page.goto(origin, { waitUntil: "commit" });
  const trigger = page.getByRole("button", { name: /^Sửa tag:/ });
  await expect(trigger).toContainText("Cần chú ý đặc biệt", { timeout: 30000 });
  await expect(trigger.locator("svg")).toHaveCount(0);
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Gắn tag học sinh" });
  await expect(dialog).toBeVisible();
  const priority = page.getByRole("option", {
    name: "Ưu tiên cao",
    exact: true,
  });
  await priority.click();
  await expect(priority).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("option", { name: "Cần chú ý đặc biệt", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(dialog).toBeVisible();
  await page.getByLabel("Tìm tag học sinh").fill("phu huynh");
  const parent = page.getByRole("option", {
    name: "Phụ huynh đồng hành",
    exact: true,
  });
  await parent.click();
  await expect(parent).toHaveAttribute("aria-selected", "true");
  expect(tags).toEqual(["hash-special", "hash-priority", "hash-parent"]);
  await page.getByLabel("Tìm tag học sinh").fill("");
  await priority.focus();
  await page.keyboard.press("Space");
  await expect(priority).toHaveAttribute("aria-selected", "false");
  expect(tags).toEqual(["hash-special", "hash-parent"]);
  expect(writes.map((write) => write.expected_modified)).toEqual([
    "1",
    "2",
    "3",
  ]);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  expect(writes).toHaveLength(3);
  await expect(trigger).toContainText("Phụ huynh đồng hành");
  await page.reload();
  await expect(trigger).toContainText("Phụ huynh đồng hành");
  await expect(trigger).not.toContainText("hash-");
  await page.setViewportSize({ width: 375, height: 700 });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page
    .locator("html")
    .evaluate((element) => element.setAttribute("data-theme", "dark"));
  await trigger.click();
  await expect(dialog).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(375);
  await page.screenshot({ path: "test-results/student-tags-mobile-dark.png" });
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1280, height: 800 });
  await page
    .locator("html")
    .evaluate((element) => element.setAttribute("data-theme", "light"));
  await trigger.click();
  await page.screenshot({ path: "test-results/student-tags-desktop.png" });
  expect(pageErrors).toEqual([]);
  await page.goto(`${origin}/?readonly`);
  await expect(trigger).toBeDisabled();
  await expect(trigger).toContainText("Cần chú ý đặc biệt");
});
