import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const INTRO = "Découvrez les parcours de dix-sept personnages fictifs, dont plusieurs personnages LGBTI+, aux identités, situations et expériences variées.";
const INTERSECTIONALITY = "L’intersectionnalité permet d’observer comment plusieurs caractéristiques ou rapports sociaux peuvent se combiner dans une même situation et modifier les obstacles ou les protections rencontrés.";
const TAB_GROUPS = [
  { id: "overview", title: "Vue d’ensemble", sections: [1, 2, 11, 12] },
  { id: "journey", title: "Son parcours", sections: [3, 4, 5, 9] },
  { id: "privacy", title: "Entourage et confidentialité", sections: [6, 7, 8, 13] },
  { id: "school", title: "Au lycée", sections: [10] },
];
const biographies = JSON.parse(readFileSync(join(ROOT, "src/data/public/publicCharacters.generated.json"), "utf8")).biographies;
const testedCharacters = ["P02", "XP01", "XP02", "P04", "XP04"];
const triggerShifts = [];
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function launchChrome() {
  const profile = mkdtempSync(join(tmpdir(), "mosaique-tabs-chrome-"));
  const chrome = spawn(process.env.CHROME_BIN || "google-chrome", ["--headless=new", "--no-sandbox", "--disable-gpu", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  const websocketUrl = await new Promise((resolve, reject) => {
    let stderr = "";
    const timeout = setTimeout(() => reject(new Error(`Endpoint DevTools absent : ${stderr}`)), 10_000);
    chrome.stderr.setEncoding("utf8");
    chrome.stderr.on("data", (chunk) => {
      stderr += chunk;
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (!match) return;
      clearTimeout(timeout);
      resolve(match[1]);
    });
    chrome.once("error", reject);
  });
  return {
    chrome, profile, port: new URL(websocketUrl).port,
    async close() {
      if (chrome.exitCode === null) {
        chrome.kill("SIGTERM");
        await Promise.race([new Promise((resolve) => chrome.once("exit", resolve)), wait(2_000)]);
      }
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try { rmSync(profile, { recursive: true, force: true }); break; }
        catch (error) { if (error.code !== "ENOTEMPTY" || attempt === 4) throw error; await wait(100); }
      }
    },
  };
}

class CdpPage {
  constructor(websocket) {
    this.websocket = websocket; this.nextId = 0; this.pending = new Map();
    websocket.onmessage = ({ data }) => {
      const message = JSON.parse(data); const resolve = this.pending.get(message.id);
      if (!resolve) return; this.pending.delete(message.id); resolve(message);
    };
  }
  static async open(url) {
    const websocket = new WebSocket(url);
    await new Promise((resolve, reject) => { websocket.onopen = resolve; websocket.onerror = reject; });
    return new CdpPage(websocket);
  }
  call(method, params = {}) {
    return new Promise((resolve) => { const id = ++this.nextId; this.pending.set(id, resolve); this.websocket.send(JSON.stringify({ id, method, params })); });
  }
  async evaluate(expression) {
    const response = await this.call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (response.result.exceptionDetails) throw new Error(response.result.exceptionDetails.exception?.description ?? response.result.exceptionDetails.text);
    return response.result.result.value;
  }
  async waitFor(expression, label) {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      try { if (await this.evaluate(expression)) return; } catch { /* navigation */ }
      await wait(50);
    }
    throw new Error(`Délai dépassé : ${label}`);
  }
  async navigate(url) {
    await this.call("Page.navigate", { url });
    await this.waitFor("Boolean(document.querySelector('main h1'))", url);
    await wait(50);
  }
  async viewport(width, height = 900) {
    await this.call("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
    await this.call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width <= 480 });
    await wait(40);
  }
  async key(key, { shift = false } = {}) {
    const codes = { ArrowLeft: 37, ArrowRight: 39, Home: 36, End: 35, Enter: 13, " ": 32, Tab: 9 };
    const code = key === " " ? "Space" : key;
    const text = key === "Enter" ? "\r" : key === " " ? " " : "";
    const modifiers = shift ? 8 : 0;
    await this.call("Input.dispatchKeyEvent", { type: "keyDown", key, code, text, unmodifiedText: text, modifiers, windowsVirtualKeyCode: codes[key], nativeVirtualKeyCode: codes[key] });
    await this.call("Input.dispatchKeyEvent", { type: "keyUp", key, code, modifiers, windowsVirtualKeyCode: codes[key], nativeVirtualKeyCode: codes[key] });
    await wait(50);
  }
  close() { this.websocket.close(); }
}

function biography(id) {
  const result = biographies.find((candidate) => candidate.id === id);
  assert.ok(result, `biographie ${id}`);
  return result;
}

function sectionTokens(item, number) {
  const section = item.sections.find((candidate) => candidate.number === number);
  assert.ok(section, `${item.id}/${number}`);
  const tokens = [section.title];
  for (const block of section.blocks) {
    if (block.type === "paragraph") tokens.push(...block.content.map(({ text }) => text));
    if (block.type === "list") tokens.push(...block.items.flatMap((content) => content.map(({ text }) => text)));
    if (block.type === "timeline") tokens.push(...block.entries.flatMap(({ period, content }) => [period, ...content.map(({ text }) => text)]));
    if (block.type === "disclosure-map") tokens.push(...block.entries.flatMap(({ group: label, currentSituation }) => [label, currentSituation]));
  }
  return tokens.filter((token) => token.trim().length > 1);
}

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth");
  assert.ok(overflow <= 1, `${label} : débordement horizontal ${overflow}px`);
}

async function auditGallery(page, baseUrl) {
  await page.navigate(`${baseUrl}#/personnages`);
  const result = await page.evaluate(`(() => ({
    intro: document.querySelector(".explorer-header h1 + p")?.textContent.trim(),
    intersectionality: document.querySelector(".explorer-gallery__introduction")?.textContent.trim(),
    cards: [...document.querySelectorAll(".explorer-character-card")].map((card) => card.innerText),
    quizLinks: [...document.querySelectorAll("a")].filter((link) => link.getAttribute("href") === "#/personnages/quiz").length,
    words: [...document.querySelectorAll("a")].some((link) => link.textContent.trim() === "Mots et parcours"),
  }))()`);
  assert.equal(result.intro, INTRO, "introduction Personnages exacte");
  assert.equal(result.intersectionality, INTERSECTIONALITY, "explication Intersectionnalités exacte");
  assert.equal(result.cards.length, 17, "17 cartes Personnages");
  assert.equal(result.quizLinks, 0, "aucune promotion Quiz Personnages");
  assert.equal(result.words, true, "Mots et parcours promu");
  for (const text of result.cards) {
    assert.ok(!/(?:^|\s)(?:XP|P)\d{2}(?:\s|$)/m.test(text), `identifiant technique visible : ${text}`);
    assert.ok(!/Galerie (?:générale|Intersectionnalités)\s*·/.test(text), `ligne technique visible : ${text}`);
  }
}

async function assertActiveTab(page, item, groupIndex, openSectionIndex = 0) {
  const group = TAB_GROUPS[groupIndex];
  const state = await page.evaluate(`(() => ({
    tabs: [...document.querySelectorAll('[role="tab"]')].map((tab) => ({ name: tab.textContent.trim(), selected: tab.getAttribute("aria-selected"), controls: tab.getAttribute("aria-controls"), tabIndex: tab.tabIndex })),
    panels: [...document.querySelectorAll('[role="tabpanel"]')].map((panel) => ({ id: panel.id, labelledby: panel.getAttribute("aria-labelledby"), visibleText: panel.innerText, domText: panel.textContent, top: panel.getBoundingClientRect().top, hidden: panel.hidden })),
    listBottom: document.querySelector('[role="tablist"]').getBoundingClientRect().bottom,
  }))()`);
  assert.deepEqual(state.tabs.map(({ name }) => name), TAB_GROUPS.map(({ title }) => title), "quatre onglets exacts");
  assert.equal(state.tabs.filter(({ selected }) => selected === "true").length, 1, "un seul onglet sélectionné");
  assert.equal(state.tabs[groupIndex].selected, "true", `${group.title} sélectionné`);
  assert.equal(state.tabs[groupIndex].tabIndex, 0, `${group.title} dans l’ordre de tabulation`);
  assert.equal(state.panels.length, 4, "quatre panneaux associés dans le DOM");
  assert.equal(state.panels.filter(({ hidden }) => !hidden).length, 1, "un seul panneau visible");
  const activePanel = state.panels.find(({ hidden }) => !hidden);
  assert.equal(activePanel.id, `biography-panel-${group.id}`, "panneau associé");
  assert.equal(activePanel.labelledby, `biography-tab-${group.id}`, "panneau étiqueté par l’onglet");
  assert.ok(activePanel.top >= state.listBottom - 1, "panneau placé sous les onglets");
  const headings = await page.evaluate("[...document.querySelectorAll('[role=tabpanel]:not([hidden]) .biography-subsection h2 button > span:first-child')].map((heading) => heading.textContent.trim())");
  assert.deepEqual(headings, group.sections.map((number) => item.sections.find((section) => section.number === number).title), `${group.title} : rubriques exactes`);
  for (const number of group.sections) for (const token of sectionTokens(item, number)) assert.ok(activePanel.domText.includes(token), `${item.id}/${group.id} : contenu canonique absent : ${token}`);

  const accordions = await page.evaluate(`(() => {
    const panel = document.querySelector('[role="tabpanel"]:not([hidden])');
    return {
      buttons: [...panel.querySelectorAll('.biography-subsection h2 button')].map((button) => ({ name: button.querySelector('span')?.textContent.trim(), expanded: button.getAttribute('aria-expanded'), controls: button.getAttribute('aria-controls'), focused: document.activeElement === button })),
      regions: [...panel.querySelectorAll('.biography-subsection__panel')].map((region) => ({ id: region.id, labelledby: region.getAttribute('aria-labelledby'), hidden: region.hidden, text: region.innerText })),
    };
  })()`);
  assert.equal(accordions.buttons.filter(({ expanded }) => expanded === "true").length, 1, `${group.title} : un seul accordéon ouvert`);
  assert.equal(accordions.regions.filter(({ hidden }) => !hidden).length, 1, `${group.title} : un seul contenu d’accordéon visible`);
  assert.equal(accordions.buttons[openSectionIndex].expanded, "true", `${group.title} : accordéon attendu ouvert`);
  const openRegion = accordions.regions[openSectionIndex];
  assert.equal(openRegion.hidden, false, `${group.title} : panneau attendu visible`);
  assert.equal(accordions.buttons[openSectionIndex].controls, openRegion.id, `${group.title} : aria-controls exact`);
  assert.equal(openRegion.labelledby, `biography-section-button-${group.id}-${group.sections[openSectionIndex]}`, `${group.title} : panneau étiqueté`);
  for (const token of sectionTokens(item, group.sections[openSectionIndex]).slice(1)) assert.ok(openRegion.text.includes(token), `${item.id}/${group.id} : contenu ouvert absent : ${token}`);
}

async function activateAccordion(page, item, groupIndex, sectionIndex, key) {
  const selector = `[role="tabpanel"]:not([hidden]) .biography-subsection:nth-child(${sectionIndex + 1}) h2 button`;
  await page.evaluate(`(() => { const button = document.querySelector(${JSON.stringify(selector)}); const rect = button.getBoundingClientRect(); scrollBy(0, rect.top - ((innerHeight - rect.height) / 2)); button.focus({ preventScroll: true }); })()`);
  await wait(40);
  const before = await page.evaluate(`document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect().toJSON()`);
  if (key) await page.key(key);
  else await page.evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  await wait(50);
  const after = await page.evaluate(`document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect().toJSON()`);
  await assertActiveTab(page, item, groupIndex, sectionIndex);
  assert.equal(await page.evaluate(`document.activeElement === document.querySelector(${JSON.stringify(selector)})`), true, `${TAB_GROUPS[groupIndex].title}/${sectionIndex} : focus stable`);
  const shift = after.top - before.top;
  triggerShifts.push(Math.abs(shift));
  assert.ok(Math.abs(shift) <= 1, `${TAB_GROUPS[groupIndex].title}/${sectionIndex} : déplacement vertical du déclencheur ${shift}px`);
}

async function auditBiography(page, baseUrl, id, thorough = false) {
  const item = biography(id);
  await page.navigate(`${baseUrl}#/personnages/${id.toLowerCase()}`);
  const profile = await page.evaluate(`(() => ({
    h1: document.querySelector("h1")?.textContent.trim(), metadata: document.querySelector(".biography-profile__metadata")?.textContent.trim(),
    description: document.querySelector(".biography-profile__description")?.textContent.trim(), alt: document.querySelector(".biography-profile img")?.alt,
    tags: document.querySelectorAll(".biography-profile .character-markers li").length, words: Boolean(document.querySelector('.biography-profile a[href="#/personnages/mots-et-parcours"]')),
    text: document.querySelector("main").innerText, previous: Boolean(document.querySelector('.biography-sequence a[href*="/personnages/"]')), next: document.querySelectorAll(".biography-sequence a").length > 0,
  }))()`);
  assert.equal(profile.h1, item.name, `${id} : prénom`);
  assert.equal(profile.metadata, `${item.age} ans · ${item.schoolLevel}`, `${id} : âge et classe`);
  assert.equal(profile.description, item.shortDescription, `${id} : présentation courte`);
  assert.equal(profile.alt, item.portraitAlt, `${id} : alternative Portrait`);
  assert.ok(profile.tags >= 2, `${id} : caractéristiques publiques`);
  assert.equal(profile.words, true, `${id} : Mots et parcours dans le profil`);
  assert.ok(!profile.text.includes("À propos de cette fiche") && !profile.text.includes("Sommaire de la fiche"), `${id} : blocs obsolètes absents`);
  assert.ok(!profile.text.includes(item.id) && !profile.text.includes(item.galleryLabel), `${id} : informations techniques absentes`);
  await assertActiveTab(page, item, 0);
  if (!thorough) return;
  assert.equal(await page.evaluate("getComputedStyle(document.querySelector('.biography-layout')).gridTemplateColumns.split(' ').length"), 2, "desktop : profil et contenu sur deux colonnes");
  const surfaces = await page.evaluate(`(() => ({ profile: getComputedStyle(document.querySelector('.biography-profile__content')).backgroundColor, tabs: getComputedStyle(document.querySelector('.biography-tabs__list')).backgroundColor, content: getComputedStyle(document.querySelector('.biography-tabs__panel:not([hidden])')).backgroundColor, open: getComputedStyle(document.querySelector('.biography-subsection--open button')).backgroundColor, closed: getComputedStyle(document.querySelector('.biography-subsection:not(.biography-subsection--open) button')).backgroundColor, panel: getComputedStyle(document.querySelector('.biography-subsection__panel:not([hidden])')).backgroundColor }))()`);
  assert.ok(Object.values(surfaces).every((color) => color !== "rgb(255, 255, 255)"), `surfaces légèrement teintées : ${JSON.stringify(surfaces)}`);
  assert.notEqual(surfaces.open, surfaces.closed, "états ouvert et fermé visuellement distincts");

  for (let sectionIndex = 1; sectionIndex < TAB_GROUPS[0].sections.length; sectionIndex += 1) await activateAccordion(page, item, 0, sectionIndex);

  await page.evaluate("(() => { const tab = document.querySelectorAll('[role=tab]')[1]; tab.focus({ preventScroll: true }); tab.click(); })()");
  await wait(40); await assertActiveTab(page, item, 1, 0);
  for (let sectionIndex = 1; sectionIndex < TAB_GROUPS[1].sections.length; sectionIndex += 1) await activateAccordion(page, item, 1, sectionIndex);

  await page.evaluate("(() => { const tab = document.querySelectorAll('[role=tab]')[2]; tab.focus({ preventScroll: true }); tab.click(); })()");
  await wait(40); await assertActiveTab(page, item, 2, 0);
  await activateAccordion(page, item, 2, 1);
  await activateAccordion(page, item, 2, 2);

  await page.evaluate("(() => { const tab = document.querySelectorAll('[role=tab]')[3]; tab.focus({ preventScroll: true }); tab.click(); })()");
  await wait(40); await assertActiveTab(page, item, 3, 0);

  await page.evaluate("document.querySelector('[role=tab]').focus({ preventScroll: true })");
  await page.key("ArrowRight"); await assertActiveTab(page, item, 1, 0);
  assert.equal(await page.evaluate("document.activeElement === document.querySelector('[role=tab][aria-selected=true]')"), true, "focus suit l’onglet activé au clavier");
  await page.key("Tab");
  assert.equal(await page.evaluate("document.activeElement === document.querySelector('[role=tabpanel]:not([hidden]) .biography-subsection h2 button')"), true, "Tab rejoint le premier accordéon");
  await page.key("Enter"); await assertActiveTab(page, item, 1, 0);
  assert.equal(await page.evaluate("document.activeElement.getAttribute('aria-expanded')"), "true", "Entrée conserve le premier accordéon ouvert");
  await page.key("Tab");
  await page.key(" "); await assertActiveTab(page, item, 1, 1);
  assert.equal(await page.evaluate("document.activeElement.getAttribute('aria-expanded')"), "true", "Espace ouvre le deuxième accordéon");
  await page.key("Tab", { shift: true });
  assert.equal(await page.evaluate("document.activeElement === document.querySelector('[role=tabpanel]:not([hidden]) .biography-subsection h2 button')"), true, "Maj+Tab revient à l’accordéon précédent");

  await page.evaluate("document.querySelector('[role=tab][aria-selected=true]').focus({ preventScroll: true })");
  await page.key("End"); await assertActiveTab(page, item, 3, 0);
  await page.key("Home"); await assertActiveTab(page, item, 0, 0);
  await page.key("ArrowLeft"); await assertActiveTab(page, item, 3, 0);

  const ax = (await page.call("Accessibility.getFullAXTree")).result.nodes.filter((node) => !node.ignored);
  assert.equal(ax.filter((node) => node.role?.value === "tab").length, 4, "quatre onglets dans l’arbre AX");
  assert.equal(ax.filter((node) => node.role?.value === "tabpanel").length, 1, "un seul panneau dans l’arbre AX");
  const sectionTitles = new Set(item.sections.map(({ title }) => title));
  assert.equal(ax.filter((node) => node.role?.value === "region" && sectionTitles.has(node.name?.value)).length, 1, "un seul panneau d’accordéon dans l’arbre AX");

  await page.evaluate("document.querySelector('.biography-sequence a')?.click()");
  await page.waitFor("Boolean(document.querySelector('[role=tab][aria-selected=true]'))", "personnage précédent/suivant");
  assert.equal(await page.evaluate("document.querySelector('[role=tab][aria-selected=true]').textContent.trim()"), "Vue d’ensemble", "Vue d’ensemble réinitialisée au changement de personnage");
  await assertActiveTab(page, biography("P01"), 0, 0);
}

async function auditResponsiveAndZoom(page, baseUrl) {
  for (const width of [320, 360, 390, 768]) {
    await page.viewport(width, 800);
    await page.navigate(`${baseUrl}#/personnages/p02`);
    await assertNoOverflow(page, `${width}px`);
    const layout = await page.evaluate(`(() => ({ columns: getComputedStyle(document.querySelector(".biography-layout")).gridTemplateColumns.split(" ").length, tabColumns: getComputedStyle(document.querySelector(".biography-tabs__list")).gridTemplateColumns.split(" ").length, internalScroll: [...document.querySelectorAll(".biography-tabs, .biography-tabs__panel, .biography-subsection__panel")].some((element) => ["auto", "scroll"].includes(getComputedStyle(element).overflowY)), accordionWidth: document.querySelector('.biography-subsection').getBoundingClientRect().width, panelWidth: document.querySelector('[role=tabpanel]:not([hidden])').getBoundingClientRect().width }))()`);
    assert.equal(layout.columns, 1, `${width}px : fiche sur une colonne`);
    assert.equal(layout.tabColumns, 2, `${width}px : onglets sur deux colonnes`);
    assert.equal(layout.internalScroll, false, `${width}px : aucun scroll interne`);
    assert.ok(layout.accordionWidth <= layout.panelWidth, `${width}px : accordéons pleine largeur sans débordement`);
  }
  for (const scale of [2, 4]) {
    await page.viewport(1440, 900);
    const layoutWidth = await page.evaluate("document.documentElement.clientWidth");
    await page.call("Emulation.setPageScaleFactor", { pageScaleFactor: scale });
    assert.ok(Math.abs((await page.evaluate("visualViewport.width")) - layoutWidth / scale) <= 1, `zoom réel ${scale * 100}%`);
    await page.call("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
    await page.viewport(1440 / scale, 900);
    await page.navigate(`${baseUrl}#/personnages/p02`);
    await assertNoOverflow(page, `zoom ${scale * 100}%`);
    assert.equal(await page.evaluate("getComputedStyle(document.querySelector('.biography-layout')).gridTemplateColumns.split(' ').length"), 1, `reflow ${scale * 100}% sur une colonne`);
  }
}

const vite = await createServer({ root: ROOT, logLevel: "silent", server: { host: "127.0.0.1", port: 0 } });
let browser; let page;
try {
  await vite.listen();
  const baseUrl = vite.resolvedUrls.local[0];
  browser = await launchChrome();
  const target = await (await fetch(`http://127.0.0.1:${browser.port}/json/new?${encodeURIComponent(`${baseUrl}#/personnages`)}`, { method: "PUT" })).json();
  page = await CdpPage.open(target.webSocketDebuggerUrl);
  await page.call("Runtime.enable"); await page.call("Page.enable"); await page.call("Accessibility.enable");
  await page.viewport(1280);
  await auditGallery(page, baseUrl);
  for (const id of testedCharacters) await auditBiography(page, baseUrl, id, id === "P02");
  await auditResponsiveAndZoom(page, baseUrl);
  await page.viewport(1280);
  await page.navigate(`${baseUrl}?context=elea#/personnages/p02`);
  assert.equal(await page.evaluate("Boolean(document.querySelector('.public-nav'))"), false, "chrome Éléa allégé");
  await assertActiveTab(page, biography("P02"), 0);
  await page.navigate(`${baseUrl}#/personnages/quiz`);
  assert.equal(await page.evaluate("document.querySelector('h1')?.textContent.trim()"), "Quiz Personnages", "route directe Quiz Personnages conservée");
  console.log(`Onglets et accordéons Personnages conformes : galerie 17 cartes, 5 biographies, contenus canoniques, ouverture exclusive, déplacement maximal ${Math.max(...triggerShifts)}px, surfaces teintées, clavier, arbre AX, 320/360/390/768 px, zooms 200/400 %, Éléa et route directe Quiz.`);
} finally {
  page?.close(); await browser?.close(); await vite.close();
}
