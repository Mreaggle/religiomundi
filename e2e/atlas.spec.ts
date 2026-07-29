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
  await expect(page.locator(".archetype-icon")).toHaveCount(44);
  await expect(page.locator('[data-archetype-code="A15"] .lucide-heart')).toBeVisible();
  await expect(page.locator('[data-archetype-code="A01"] .lucide-sprout')).toBeVisible();
  await expect(page.locator(".correlation-fiber").first()).toHaveAttribute(
    "style",
    /--fiber-color:/,
  );
  const activeArchetypes = await page.locator(".archetype-node:not(.inactive)").count();
  const connectedArchetypes = await page
    .locator(".correlation-fiber")
    .evaluateAll(
      (fibers) => new Set(fibers.map((fiber) => fiber.getAttribute("data-archetype-code"))).size,
    );
  expect(connectedArchetypes).toBe(activeArchetypes);
  await expect(page.getByText("471 × 44")).toHaveText("471 × 44");

  await page.getByRole("button", { name: "Abrir busca e filtros" }).click();
  await page.getByLabel("Busca global").fill("Šamaš");
  await expect(page.locator(".command-results")).toContainText("Šamaš");
  await page.locator(".command-results > button").first().click();
  await expect(page.getByText("DOSSIÊ DA TRADIÇÃO")).toBeVisible();
  await page
    .getByRole("button", { name: /Fechar/ })
    .first()
    .click();
  await page.getByRole("button", { name: "Abrir busca e filtros" }).click();
  await page.getByRole("button", { name: "Limpar" }).click();
  await page.getByRole("button", { name: /Fechar/ }).click();
  await page.getByRole("button", { name: "Hoje" }).click();

  await page.getByRole("button", { name: "Mapa", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Mapa das tradições documentadas" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Árvore", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Árvore das tradições" })).toBeVisible();
  expect(await page.locator(".lineage-node").count()).toBeGreaterThan(400);
  expect(await page.locator(".lineage-documented").count()).toBeGreaterThan(0);
  expect(await page.locator(".lineage-hypothesis").count()).toBeGreaterThan(0);
  expect(await page.locator(".lineage-syncretism").count()).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Charts", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "CHARTS — Anatomia comparada do sagrado" }),
  ).toBeVisible();
  await expect(page.getByText("Grupos religiosos mundiais — não países")).toBeVisible();
  await expect(page.locator(".population-ranking li")).toHaveCount(7);
  await expect(page.locator(".population-ranking")).toContainText("Sem filiação religiosa");
  await page.getByRole("button", { name: "Matriz", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Matriz navegável" })).toBeVisible();
  await expect(page.locator(".matrix-cell").first()).toBeVisible();
  await page.getByRole("button", { name: "Fontes", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Biblioteca de fontes" })).toBeVisible();
  await expect(page.locator(".source-library article")).toHaveCount(44);
  await expect(page.locator("a[download]")).toHaveCount(0);
  await expect(page.getByText(/UNO_reformulado\.xlsx/i)).toHaveCount(0);
  await page.getByRole("button", { name: "Sobre o projeto" }).click();
  await expect(page.getByRole("heading", { name: "SOBRE O PROJETO" })).toBeVisible();
  await expect(page.locator("a[download]")).toHaveCount(0);
  await expect(page.getByText(/UNO_reformulado\.xlsx|SHA-256/i)).toHaveCount(0);

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

test("árvore antiga acumula antecessores e separa três classes de evidência", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.locator("#temporal-range").fill("459");
  await expect(page.locator("#temporal-range")).toHaveAttribute("aria-valuetext", /7 a\.C\./);
  await page.getByRole("button", { name: "Árvore", exact: true }).click();

  await expect(page.locator(".lineage-node")).toHaveCount(56);
  expect(await page.locator(".lineage-documented").count()).toBeGreaterThanOrEqual(3);
  expect(await page.locator(".lineage-syncretism").count()).toBeGreaterThanOrEqual(8);
  expect(await page.locator(".lineage-hypothesis").count()).toBeGreaterThanOrEqual(4);

  if (!testInfo.project.name.includes("mobile")) {
    await page.locator(".lineage-syncretism").first().click();
    await expect(page.locator(".lineage-relation-inspector")).toContainText(
      "SINCRETISMO / INCORPORAÇÃO DOCUMENTADA",
    );
    await expect(page.locator(".lineage-relation-inspector a").first()).toHaveAttribute(
      "href",
      /^https:\/\/(www\.)?(cambridge|metmuseum|britishmuseum|oracc)/,
    );
  }
});

test("origem regional permanece separada do alcance global ou diaspórico", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir busca e filtros" }).click();
  await page.getByLabel("Busca global").fill("Igreja Católica");
  await page
    .locator(".command-results > button")
    .filter({ hasText: "Igreja Católica" })
    .first()
    .click();
  await expect(page.getByText("Origem / formação")).toBeVisible();
  await expect(page.locator(".metadata-grid")).toContainText("Mediterrâneo/Europa");
  await expect(page.getByText("Alcance registrado")).toBeVisible();
  await expect(page.locator(".metadata-grid")).toContainText("Global");
  await expect(page.getByText("Global, diáspora ou região indeterminada")).toHaveCount(0);
});

test("metadados de descoberta descrevem o atlas e seus índices públicos", async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "Metadados independem do viewport");
  await page.goto("/");
  await expect(page).toHaveTitle(/O Maior Atlas Religioso do Mundo/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /471 religiões/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://mreaggle.github.io/religiomundi/",
  );
  const structuredData = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}",
  );
  expect(structuredData.name).toBe("RELIGIO MUNDI");
  expect(structuredData.isAccessibleForFree).toBe(true);
  for (const asset of ["/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/og-image.svg"]) {
    expect((await request.get(asset)).ok(), asset).toBe(true);
  }
});

test("constelação oferece zoom focal sem mover seus eixos entre períodos", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "Roda do mouse é verificada no desktop");
  await page.goto("/");

  const viewport = page.locator(".constellation-viewport");
  const before = await viewport.getAttribute("transform");
  const textBefore = await page
    .locator('[data-archetype-code="A15"] .archetype-name')
    .evaluate((node) => node.getBoundingClientRect().height);
  const constellation = page.locator(".constellation-canvas > svg");
  await constellation.hover({ position: { x: 720, y: 390 } });
  await page.mouse.wheel(0, -650);
  await expect(page.getByLabel("Nível de zoom da constelação")).not.toHaveText("100%");
  await expect.poll(() => viewport.getAttribute("transform")).not.toBe(before);
  await expect(page.locator(".archetype-node")).toHaveCount(44);
  const textAfter = await page
    .locator('[data-archetype-code="A15"] .archetype-name')
    .evaluate((node) => node.getBoundingClientRect().height);
  expect(textAfter).toBeGreaterThan(textBefore * 1.1);

  await page.getByRole("button", { name: "Restaurar posição da constelação" }).click();
  await expect(page.getByLabel("Nível de zoom da constelação")).toHaveText("100%");

  await page.locator('.archetype-node[data-archetype-code="A15"]').click();
  await expect(page.locator(".archetype-node.focus-hidden")).toHaveCount(43);
  await page.getByLabel("Fechar dossiê e limpar seleção").click();
  await expect(page.locator(".archetype-node.focus-hidden")).toHaveCount(0);
});

test("revelação não reabre o dossiê do arquétipo em ciclo", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Revelar padrões", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Veja os nomes/ })).toBeVisible();
  await expect(page.getByText("DOSSIÊ DO ARQUÉTIPO")).toHaveCount(0);
  await page.getByRole("button", { name: "Fechar revelação" }).click();
  await expect(page.getByRole("heading", { name: /Veja os nomes/ })).toHaveCount(0);
  await expect(page.getByText("DOSSIÊ DO ARQUÉTIPO")).toHaveCount(0);
});

test("barra temporal recolhe automaticamente no celular deitado e pode reabrir", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "Comportamento específico do celular");
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Expandir barra temporal" })).toBeVisible();
  await expect(page.locator(".temporal-glide")).toHaveClass(/is-collapsed/);
  await page.getByRole("button", { name: "Expandir barra temporal" }).click();
  await expect(page.getByRole("button", { name: "Recolher barra temporal" })).toBeVisible();
  await expect(page.locator(".temporal-glide")).not.toHaveClass(/is-collapsed/);
  await page.getByRole("button", { name: "Recolher barra temporal" }).click();
  await expect(page.locator(".temporal-glide")).toHaveClass(/is-collapsed/);
});

test("mapa oferece zoom focal e acesso explícito às 471 tradições", async ({ page }, testInfo) => {
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

  await page.getByRole("button", { name: "Catálogo · 471" }).click();
  await expect(page.locator(".map-summary")).toContainText("471 tradições");
  await expect(page.getByText("471 de 471 tradições")).toBeVisible();

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

test("mapa político acompanha a timeline sem carregar o arquivo histórico inteiro", async ({
  page,
}) => {
  const snapshotsLoaded = new Set<string>();
  page.on("response", (response) => {
    if (/\/data\/polities\/snapshot-/.test(response.url())) {
      snapshotsLoaded.add(new URL(response.url()).pathname);
    }
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Mapa", exact: true }).click();
  await expect(page.locator(".historical-polity")).toHaveCount(177);
  await expect(page.locator('[data-polity-name="Brazil"]')).toBeVisible();
  await expect(page.locator(".political-map-status")).toContainText("Atual · 2026");

  await page.locator('[data-polity-name="Brazil"]').focus();
  await expect(page.locator('[data-polity-name="Brazil"]')).toHaveCSS("outline-style", "none");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Brazil", exact: true })).toBeVisible();
  await expect(page.locator(".historical-polity.focus-hidden")).toHaveCount(176);
  await page.getByRole("button", { name: "Fechar território" }).click();

  expect(snapshotsLoaded.size).toBeLessThanOrEqual(3);

  await page.locator("#temporal-range").fill("635");
  await expect(page.locator('[data-polity-name="Mongol Empire"]')).toBeVisible();
  await expect(page.locator(".political-map-status")).toContainText("1200");

  await page.locator("#temporal-range").fill("727");
  await expect(page.locator(".political-map-status")).toContainText("1650");
  const algiers = page.locator('[data-polity-name="Algiers"]');
  await expect(algiers).toHaveCount(1);
  const algiersBounds = await algiers.evaluate((node) => {
    const bounds = (node as SVGGraphicsElement).getBBox();
    return { width: bounds.width, height: bounds.height };
  });
  expect(algiersBounds.width).toBeLessThan(100);
  expect(algiersBounds.height).toBeLessThan(100);

  await page.locator("#temporal-range").fill("299");
  await expect(page.locator('[data-polity-name="Babylonia"]')).toBeVisible();
  await expect(page.locator(".political-map-status")).toContainText("1.500 a.C.");
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
