import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("religiomundi:intro-dismissed", "true");
  });
});

test("integra dados, busca, tempo e modos sem erros de console", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Constelação Arquetípica Temporal" }),
  ).toBeVisible();
  await expect(page.locator(".archetype-node")).toHaveCount(44);
  await expect(page.getByText("460 × 44")).toHaveText("460 × 44");

  await page.getByRole("button", { name: "Abrir busca e filtros" }).click();
  await page.getByLabel("Busca global").fill("Šamaš");
  await expect(page.locator(".command-results")).toContainText("Šamaš");
  await page.locator(".command-results > button").first().click();
  await expect(page.getByText("DOSSIÊ DA TRADIÇÃO")).toBeVisible();
  await page
    .getByRole("button", { name: /Fechar/ })
    .first()
    .click();

  await page.getByRole("button", { name: "Mapa", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Mapa das tradições documentadas" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Matriz", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Matriz navegável" })).toBeVisible();
  await expect(page.locator(".matrix-cell").first()).toBeVisible();
  await page.getByRole("button", { name: "Fontes", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Biblioteca de fontes" })).toBeVisible();
  await expect(page.locator(".source-library article")).toHaveCount(32);

  expect(errors, `Erros de console em ${testInfo.project.name}`).toEqual([]);
});

test("camada Aeons exige confirmação e permanece epistemicamente separada", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Camada esotérica/ }).click();
  await expect(
    page.getByText(/não representa consenso arqueológico, historiográfico ou científico/i),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ativar interpretação autoral" }).click();
  await expect(page.getByLabel("Interpretação autoral e esotérica")).toBeVisible();
  await expect(page.getByText("INTERPRETAÇÃO AUTORAL / ESOTÉRICA")).toBeVisible();
});

test("mapa oferece zoom focal e acesso explícito às 460 tradições", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "Roda do mouse é verificada no desktop");
  await page.goto("/");
  await page.getByRole("button", { name: "Mapa", exact: true }).click();

  const viewport = page.locator(".map-viewport");
  const before = await viewport.getAttribute("transform");
  const map = page.locator(".map-stage > svg");
  await map.hover({ position: { x: 680, y: 360 } });
  await page.mouse.wheel(0, -650);
  await expect(page.getByLabel("Nível de zoom")).not.toHaveText("100%");
  await expect.poll(() => viewport.getAttribute("transform")).not.toBe(before);

  await page.getByRole("button", { name: "Catálogo · 460" }).click();
  await expect(page.locator(".map-summary")).toContainText("460 tradições");
  await expect(page.getByText("460 de 460 tradições")).toBeVisible();

  await page.getByRole("button", { name: "Restaurar posição do mapa" }).click();
  const clusterNodes = page.locator(".tradition-cluster");
  const labels = await clusterNodes.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("aria-label") ?? ""),
  );
  const counts = labels.map((label) => Number(label.match(/, (\d+) tradições/)?.[1] ?? 0));
  const largest = Math.max(...counts);
  await clusterNodes.nth(counts.indexOf(largest)).click();
  await expect(page.locator(".map-cluster-inspector")).toBeVisible();
  await expect(page.locator(".map-inspector-list > button")).toHaveCount(largest);
});

test("layout móvel mantém navegação, lista alternativa e dossiê em sheet", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Modos de visualização" })).toBeVisible();
  await page.getByRole("button", { name: "Visualização em lista" }).click();
  await expect(page.locator(".accessible-list.open")).toBeVisible();
  await page.locator(".accessible-list li button").first().click();
  await expect(page.locator(".dossier-drawer")).toBeVisible();
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
});
