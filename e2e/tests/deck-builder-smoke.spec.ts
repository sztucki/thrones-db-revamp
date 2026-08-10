import { expect, test } from "@playwright/test";

test("cards search, and the full house -> agenda -> build deck flow, persist across reload", async ({
  page,
}) => {
  const unique = Date.now();
  const email = `e2e-${unique}@example.com`;
  const username = `e2euser${unique}`;

  await page.goto("/cards");
  await expect(page.getByText(/of \d+ cards/)).toBeVisible();
  await page.getByLabel("Search card text").fill("stark");
  await expect(page.getByText(/of \d+ cards/)).toBeVisible();

  await page.getByRole("button", { name: "Log in" }).click();
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill("correcthorsebattery");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("button", { name: `Account menu for ${username}`, exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Decks" }).click();
  await expect(page.getByText("You haven't built any decks yet")).toBeVisible();

  await page.getByRole("link", { name: "+ New Deck" }).click();
  await expect(page.getByText("Step 1 of 2")).toBeVisible();
  await page.getByRole("button", { name: "Stark" }).click();

  await expect(page.getByText("Step 2 of 2")).toBeVisible();
  await page.getByRole("button", { name: /Start building/ }).click();

  await expect(page.getByText("Tournament Legality")).toBeVisible();
  await expect(page.getByText(/Too few draw cards/)).toBeVisible();
  await expect(page.getByText("No cards added yet")).toBeVisible();

  await page.locator("[role=button]").filter({ hasText: "cost" }).first().click();
  await expect(page.getByText("x1")).toBeVisible();
  await expect(page.getByText("No cards added yet")).not.toBeVisible();

  const deckNameInput = page.getByLabel("Deck name");
  await deckNameInput.fill("E2E Smoke Deck");
  await deckNameInput.blur();
  await expect(page.getByText("Saved")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Deck name")).toHaveValue("E2E Smoke Deck");
  await expect(page.getByText("x1")).toBeVisible();

  await page.getByText("x1").click();
  await expect(page.getByText("No cards added yet")).toBeVisible();
});
