import { expect, test } from "@playwright/test";

test("Calendar keeps one roving day and commits keyboard selection", async ({
  page,
}) => {
  await page.goto("/components/calendar");

  const calendar = page.locator("orc-calendar");
  const activeDay = calendar.locator("button[data-date][tabindex='0']");
  await expect(calendar.getByRole("grid")).toBeVisible();
  await expect(activeDay).toHaveCount(1);

  const activeDate = await activeDay.getAttribute("data-date");
  expect(activeDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  const nextDate = new Date(`${activeDate}T00:00:00Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  const nextDateIso = nextDate.toISOString().slice(0, 10);

  await activeDay.focus();
  await page.keyboard.press("ArrowRight");

  const nextDay = calendar.locator(`button[data-date='${nextDateIso}']`);
  await expect(nextDay).toBeFocused();
  await expect(calendar.locator("button[data-date][tabindex='0']")).toHaveCount(
    1,
  );

  await page.keyboard.press("Enter");
  await expect(
    page.getByText(`value = ${nextDateIso}`, { exact: true }),
  ).toBeVisible();
});
