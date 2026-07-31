import { expect, type Page, test } from "@playwright/test";

async function clickSceneBackground(page: Page, svgSelector: string) {
  const point = await page.locator(svgSelector).evaluate((svg) => {
    const bounds = svg.getBoundingClientRect();
    for (const yRatio of [0.84, 0.72, 0.58, 0.42, 0.28]) {
      for (const xRatio of [0.5, 0.22, 0.78, 0.1, 0.9]) {
        const x = bounds.left + bounds.width * xRatio;
        const y = bounds.top + bounds.height * yRatio;
        if (document.elementFromPoint(x, y)?.classList.contains("focus-dismiss-surface")) {
          return { x, y };
        }
      }
    }
    throw new Error("Nenhuma área vazia do foco foi encontrada");
  });
  await page.mouse.click(point.x, point.y);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("religiomundi:intro-dismissed", "true");
  });
});

test("APOIAR abre sobre a visualização atual e oferece Pix e link direto", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const constellation = page.getByRole("heading", {
    name: "Constelação Arquetípica Temporal",
  });
  await expect(constellation).toBeVisible();

  await page.getByRole("button", { name: "Apoiar", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "APOIAR O RELIGIO MUNDI" })).toBeVisible();
  await expect(
    page.getByRole("img", { name: "QR Code para apoiar o RELIGIO MUNDI via Pix" }),
  ).toBeVisible();
  await expect(page.locator('.support-qr-frame img[src*="qrcodepix.png"]')).toBeVisible();
  await expect(page.getByText("Kauan Crema Dias", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Continuar pelo Nubank/ })).toHaveAttribute(
    "href",
    "https://nubank.com.br/cobrar/18cvy/6a6cf6ad-6522-42b5-aa7d-32bbb73f1efa",
  );

  await page.getByRole("button", { name: "Copiar código Pix" }).click();
  await expect(page.locator(".support-copy-status")).toContainText("Agora é só colar");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "APOIAR O RELIGIO MUNDI" })).toHaveCount(0);
  await expect(constellation).toBeVisible();

  if (testInfo.project.name.includes("mobile")) {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.getByRole("button", { name: "Apoiar", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "APOIAR O RELIGIO MUNDI" })).toBeVisible();
    const horizontalOverflow = await page.evaluate(
      () => document.body.scrollWidth - document.documentElement.clientWidth,
    );
    expect(horizontalOverflow).toBeLessThanOrEqual(1);
    await expect(page.getByRole("button", { name: "Fechar APOIAR O RELIGIO MUNDI" })).toBeVisible();
  }
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
  await expect(page.getByText("482 × 44")).toHaveText("482 × 44");

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
  expect(await page.locator(".ranking-card").count()).toBeGreaterThanOrEqual(12);
  await expect(
    page.getByText("Pares de famílias distintas com assinaturas próximas"),
  ).toBeVisible();
  await expect(page.locator(".ranking-caveat")).toHaveCount(
    await page.locator(".ranking-card").count(),
  );
  await page.getByRole("button", { name: "Matriz", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Matriz navegável" })).toBeVisible();
  await expect(page.locator(".matrix-cell").first()).toBeVisible();
  await page.getByRole("button", { name: "Fontes", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Biblioteca de fontes" })).toBeVisible();
  await expect(page.locator(".source-library article")).toHaveCount(59);
  await expect(page.locator("a[download]")).toHaveCount(0);
  await expect(page.getByText(/UNO_reformulado\.xlsx/i)).toHaveCount(0);
  await page.getByRole("button", { name: "Sobre o projeto" }).click();
  await expect(page.getByRole("heading", { name: "SOBRE O PROJETO" })).toBeVisible();
  await expect(page.locator("a[download]")).toHaveCount(0);
  await expect(page.getByText(/UNO_reformulado\.xlsx|SHA-256/i)).toHaveCount(0);

  expect(errors, `Erros de console em ${testInfo.project.name}`).toEqual([]);
});

test("panorama preserva cultos africanos vivos em 1900 sem criar falsas emergências", async ({
  page,
}) => {
  await page.goto("/");
  const range = page.getByLabel("Ano ou período selecionado");
  await range.evaluate((element) => {
    const input = element as HTMLInputElement;
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    valueSetter?.call(input, "839");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(range).toHaveAttribute("aria-valuetext", /1\.900 d\.C\./);
  await page.getByRole("button", { name: "Visualização em lista" }).click();
  const list = page.locator(".accessible-list.open");
  for (const name of [
    "Religião Yorùbá e Ifá",
    "Religião Akan",
    "Vodun Fon-Ewe",
    "Odinani (Igbo)",
    "Religião Dinka",
    "Religiões San",
    "Cultos Mami Wata",
    "Bwiti",
    "Bori Hausa",
    "Culto Zar",
  ]) {
    await expect(list, name).toContainText(name);
  }
  await expect(list).not.toContainText("Religião Guanche");
  await expect(list).not.toContainText("Religião núbia/kushita");
  await expect(page.getByText(/piso documental conservador/i)).toBeAttached();

  await page.getByRole("button", { name: "Fechar lista" }).click();
  await page.getByRole("button", { name: "Emergências", exact: true }).click();
  await page.getByRole("button", { name: "Visualização em lista" }).click();
  await expect(list).not.toContainText("Religião Yorùbá e Ifá");
  await expect(list).not.toContainText("Vodun Fon-Ewe");
  await page.getByRole("button", { name: "Fechar lista" }).click();
  await page.getByRole("button", { name: "Panorama", exact: true }).click();
  await page.getByRole("button", { name: "Visualização em lista" }).click();
  await expect(list).toContainText("Religião Yorùbá e Ifá");

  await page.getByRole("button", { name: "Fechar lista" }).click();
  await page.getByRole("button", { name: "Hoje" }).click();
  await page.getByRole("button", { name: "Visualização em lista" }).click();
  await expect(list).not.toContainText("Religião nórdica antiga");
  await expect(list).toContainText("Heathenry/Ásatrú");
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

  await expect(page.locator(".lineage-node")).toHaveCount(60);
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
    /482 religiões/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://mreaggle.github.io/religiomundi/",
  );
  await expect(page.locator('script[src*="googletagmanager.com/gtag/js"]')).toHaveAttribute(
    "src",
    "https://www.googletagmanager.com/gtag/js?id=G-930BMPYP28",
  );
  const analyticsConfig = (await page.locator("head > script:not([src])").allTextContents()).join(
    "\n",
  );
  expect(analyticsConfig).toContain('gtag("config", "G-930BMPYP28")');
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

  const constellationClusters = page.locator(".tradition-cluster");
  const constellationClusterCount = await constellationClusters.count();
  const brazilConstellation = page.locator(
    '.constellation-view .tradition-cluster[aria-label^="Brasil,"]',
  );
  const brazilConstellationLabel = (await brazilConstellation.getAttribute("aria-label")) ?? "";
  const brazilConstellationCount = Number(
    brazilConstellationLabel.match(/, (\d+) tradições/)?.[1] ?? 0,
  );
  expect(brazilConstellationCount).toBeGreaterThan(1);
  await brazilConstellation.click();
  await expect(page.locator(".tradition-cluster")).toHaveCount(1);
  await expect(page.locator(".expanded-tradition")).toHaveCount(
    Math.min(48, brazilConstellationCount),
  );
  await expect(page.getByText("DOSSIÊ DA TRADIÇÃO")).toHaveCount(0);
  await clickSceneBackground(page, ".constellation-canvas > svg");
  await expect(page.locator(".tradition-cluster")).toHaveCount(constellationClusterCount);

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

test("mapa oferece zoom focal e acesso explícito às 482 tradições", async ({ page }, testInfo) => {
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

  await page.getByRole("button", { name: "Catálogo · 482" }).click();
  await expect(page.locator(".map-summary")).toContainText("482 tradições");
  await expect(page.getByText("482 de 482 tradições")).toBeVisible();

  await page.getByRole("button", { name: "Restaurar posição do mapa" }).click();
  const clusterNodes = page.locator(".tradition-cluster");
  const clusterCount = await clusterNodes.count();
  const brazilMap = page.locator('.map-view .tradition-cluster[aria-label^="Brasil,"]');
  const brazilMapLabel = (await brazilMap.getAttribute("aria-label")) ?? "";
  const brazilMapCount = Number(brazilMapLabel.match(/, (\d+) tradições/)?.[1] ?? 0);
  expect(brazilMapCount).toBeGreaterThan(1);
  await brazilMap.click();
  await expect(page.locator(".tradition-cluster")).toHaveCount(1);
  await expect(page.locator(".map-cluster-inspector")).toBeVisible();
  await expect(page.locator(".map-inspector-list > button")).toHaveCount(brazilMapCount);
  await expect(page.getByText("DOSSIÊ DA TRADIÇÃO")).toHaveCount(0);
  await clickSceneBackground(page, ".map-stage > svg");
  await expect(page.locator(".tradition-cluster")).toHaveCount(clusterCount);
  await expect(page.locator(".map-cluster-inspector")).toHaveCount(0);
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
