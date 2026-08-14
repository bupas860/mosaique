import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer, preview } from "vite";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const DIST_MODE = process.argv.includes("--dist");
const VIEWPORTS = [320, 360, 390, 768, 1024, 1280, 1440];
const FORBIDDEN_QS = [
  ["N02", "Le formulaire « Père — Mère »", "Normes ordinaires", "obstacle"],
  ["V10", "Le soutien d’un camarade", "Obstacles visibles", "protection"],
  ["X01", "La chambre accessible", "Intersectionnalités", "obstacle"],
  ["I01", "Sensibiliser par la peur", "Effets invisibles", "obstacle"],
  ["N13", "L’organisation préparée en privé", "Normes ordinaires", "protection"],
  ["X13", "Une adaptation coordonnée", "Intersectionnalités", "protection"],
  ["V01", "Si tu bouges, tu es gay", "Obstacles visibles", "obstacle"],
  ["I14", "Une histoire ordinaire", "Effets invisibles", "protection"],
];

const biographies = JSON.parse(readFileSync(join(ROOT, "src/data/public/publicCharacters.generated.json"), "utf8")).biographies;
const reperes = JSON.parse(readFileSync(join(ROOT, "src/data/public/publicReperes.generated.json"), "utf8")).reperes;
const words = JSON.parse(readFileSync(join(ROOT, "src/data/public/publicUsefulWords.generated.json"), "utf8")).words;
const situationSource = readFileSync(join(ROOT, "src/data/public/publicSituations.generated.ts"), "utf8");
const situations = [...situationSource.matchAll(/"code": "([VNIX]\d{2})",\s+"title": "((?:[^"\\]|\\.)*)",[\s\S]*?"altText": "((?:[^"\\]|\\.)*)"/g)].map((match) => ({
  code: match[1],
  title: JSON.parse(`"${match[2]}"`),
  altText: JSON.parse(`"${match[3]}"`),
}));

assert.equal(biographies.length, 17, "17 biographies attendues");
assert.equal(situations.length, 61, "61 situations attendues");
assert.equal(reperes.length, 5, "5 Repères attendus");
assert.equal(words.length, 25, "25 Mots utiles attendus");

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function parseColor(value) {
  if (value.startsWith("oklch(")) {
    const match = value.match(/oklch\(([\d.]+)(%)?\s+([\d.]+)\s+([\d.]+)(?:deg)?/);
    assert.ok(match, `couleur OKLCH illisible : ${value}`);
    const lightness = Number(match[1]) / (match[2] ? 100 : 1);
    const chroma = Number(match[3]);
    const hue = Number(match[4]) * Math.PI / 180;
    const a = chroma * Math.cos(hue); const b = chroma * Math.sin(hue);
    const lRoot = lightness + 0.3963377774 * a + 0.2158037573 * b;
    const mRoot = lightness - 0.1055613458 * a - 0.0638541728 * b;
    const sRoot = lightness - 0.0894841775 * a - 1.291485548 * b;
    return [
      4.0767416621 * lRoot ** 3 - 3.3077115913 * mRoot ** 3 + 0.2309699292 * sRoot ** 3,
      -1.2684380046 * lRoot ** 3 + 2.6097574011 * mRoot ** 3 - 0.3413193965 * sRoot ** 3,
      -0.0041960863 * lRoot ** 3 - 0.7034186147 * mRoot ** 3 + 1.707614701 * sRoot ** 3,
    ];
  }
  const channels = value.match(/[\d.]+/g)?.map(Number) ?? [];
  return channels.slice(0, 3).map((value) => { const channel = value / 255; return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4; });
}

function colorContrast(first, second) {
  const luminance = (color) => 0.2126 * color[0] + 0.7152 * color[1] + 0.0722 * color[2];
  const values = [luminance(parseColor(first)), luminance(parseColor(second))].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

async function launchChrome() {
  const profile = mkdtempSync(join(tmpdir(), "mosaique-8g-chrome-"));
  const chrome = spawn(process.env.CHROME_BIN || "google-chrome", [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "about:blank",
  ], { stdio: ["ignore", "ignore", "pipe"] });

  const browserWebsocket = await new Promise((resolve, reject) => {
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
    chrome,
    profile,
    port: new URL(browserWebsocket).port,
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
    this.websocket = websocket;
    this.nextId = 0;
    this.pending = new Map();
    websocket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      const resolve = this.pending.get(message.id);
      if (!resolve) return;
      this.pending.delete(message.id);
      resolve(message);
    };
  }

  static async open(websocketUrl) {
    const websocket = new WebSocket(websocketUrl);
    await new Promise((resolve, reject) => { websocket.onopen = resolve; websocket.onerror = reject; });
    return new CdpPage(websocket);
  }

  call(method, params = {}) {
    return new Promise((resolve) => {
      const id = ++this.nextId;
      this.pending.set(id, resolve);
      this.websocket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const response = await this.call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (response.result.exceptionDetails) {
      const detail = response.result.exceptionDetails.exception?.description ?? response.result.exceptionDetails.text;
      throw new Error(detail);
    }
    return response.result.result.value;
  }

  async waitFor(expression, label, attempts = 120) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try { if (await this.evaluate(expression)) return; } catch { /* navigation en cours */ }
      await wait(50);
    }
    throw new Error(`Délai dépassé : ${label}`);
  }

  async navigate(url) {
    await this.call("Page.navigate", { url });
    await this.waitFor("Boolean(document.querySelector('main h1')) && !document.querySelector('.game-loading')", url);
    await wait(40);
  }

  async viewport(width, height = 900) {
    await this.call("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
    await this.call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width <= 480 });
    await wait(30);
  }

  async key(key, { shift = false } = {}) {
    const code = key === " " ? "Space" : key;
    const virtualCodes = { Enter: 13, " ": 32, Tab: 9, Escape: 27, ArrowDown: 40, ArrowUp: 38, ArrowLeft: 37, ArrowRight: 39, Home: 36, End: 35 };
    const windowsVirtualKeyCode = virtualCodes[key] ?? key.codePointAt(0);
    const modifiers = shift ? 8 : 0;
    const text = key === "Enter" ? "\r" : key === " " ? " " : "";
    await this.call("Input.dispatchKeyEvent", { type: "keyDown", key, code, text, unmodifiedText: text, modifiers, windowsVirtualKeyCode, nativeVirtualKeyCode: windowsVirtualKeyCode });
    await this.call("Input.dispatchKeyEvent", { type: "keyUp", key, code, modifiers, windowsVirtualKeyCode, nativeVirtualKeyCode: windowsVirtualKeyCode });
    await wait(30);
  }

  async focusAndActivate(selector, key = "Enter") {
    const found = await this.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) return false; element.focus({ preventScroll: true }); return document.activeElement === element; })()`);
    assert.equal(found, true, `contrôle introuvable : ${selector}`);
    await this.key(key);
    await wait(60);
  }

  async mouseClick(selector) {
    const point = await this.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) return null; const rect = element.getBoundingClientRect(); return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; })()`);
    assert.ok(point, `contrôle introuvable : ${selector}`);
    await this.call("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
    await this.call("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
    await wait(60);
  }

  async accessibilityTree() {
    return (await this.call("Accessibility.getFullAXTree")).result.nodes;
  }

  close() { this.websocket.close(); }
}

function urlFor(baseUrl, hash, query = "") {
  return `${baseUrl}${query}${hash}`;
}

async function pageAudit(page, label, { expectedH1, expectedAlt } = {}) {
  await page.evaluate(`Promise.race([
    Promise.all([...document.querySelectorAll("img")].filter((image) => image.getBoundingClientRect().top < innerHeight).map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => { image.addEventListener("load", resolve, { once: true }); image.addEventListener("error", resolve, { once: true }); }))),
    new Promise((resolve) => setTimeout(resolve, 1_000)),
  ])`);
  const result = await page.evaluate(`(() => {
    const visible = (element) => { const style = getComputedStyle(element); const rect = element.getBoundingClientRect(); return style.display !== "none" && style.visibility !== "hidden" && !element.hidden && rect.width > 0 && rect.height > 0; };
    const labelFor = (element) => element.getAttribute("aria-label") || element.getAttribute("title") || (element.labels ? [...element.labels].map((label) => label.textContent).join(" ") : "") || element.textContent || (element.tagName === "IMG" ? element.alt : "");
    const interactives = [...document.querySelectorAll("a[href],button,input:not([type=hidden]),select,textarea,summary,[tabindex]")].filter((element) => visible(element) && !element.matches('[tabindex="-1"]'));
    const unnamed = interactives.filter((element) => !labelFor(element).trim()).map((element) => element.outerHTML.slice(0, 160));
    const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(visible).map((element) => Number(element.tagName[1]));
    const headingJumps = headings.filter((level, index) => index > 0 && level > headings[index - 1] + 1);
    const images = [...document.querySelectorAll("img")].filter(visible).map((image) => ({ alt: image.alt, complete: image.complete, width: image.naturalWidth, src: image.currentSrc, loading: image.loading, top: image.getBoundingClientRect().top, viewportHeight: innerHeight }));
    return {
      href: location.href,
      title: document.title,
      h1: [...document.querySelectorAll("h1")].filter(visible).map((element) => element.textContent.trim()),
      mains: [...document.querySelectorAll("main")].filter(visible).length,
      unnamed,
      duplicates: [...new Set(duplicates)],
      headingJumps,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      images,
      characterQuizPromotions: [...document.querySelectorAll('a[href="#/personnages/quiz"]')].filter(visible).length,
    };
  })()`);
  assert.equal(result.mains, 1, `${label} : main unique`);
  assert.equal(result.h1.length, 1, `${label} : h1 unique (${result.h1.join(" | ")})`);
  if (expectedH1) assert.equal(result.h1[0], expectedH1, `${label} : h1`);
  assert.deepEqual(result.unnamed, [], `${label} : contrôles sans nom`);
  assert.deepEqual(result.duplicates, [], `${label} : identifiants dupliqués`);
  assert.deepEqual(result.headingJumps, [], `${label} : hiérarchie de titres`);
  assert.ok(result.overflow <= 1, `${label} : débordement global de ${result.overflow}px`);
  assert.ok(result.images.every(({ complete, width, loading, top, viewportHeight }) => complete ? width > 0 : loading === "lazy" && top > viewportHeight), `${label} : image visible non chargée`);
  assert.equal(result.characterQuizPromotions, 0, `${label} : aucune promotion visible du Quiz Personnages`);
  if (expectedAlt) assert.ok(result.images.some(({ alt }) => alt === expectedAlt), `${label} : texte alternatif attendu absent`);
  return result;
}

async function axAudit(page, label) {
  const nodes = await page.accessibilityTree();
  const interactiveRoles = new Set(["button", "link", "radio", "checkbox", "combobox"]);
  const unnamed = nodes.filter((node) => !node.ignored && interactiveRoles.has(node.role?.value) && !node.name?.value?.trim()).map((node) => node.role.value);
  const mains = nodes.filter((node) => !node.ignored && node.role?.value === "main");
  assert.deepEqual(unnamed, [], `${label} : contrôle sans nom dans l'arbre AX`);
  assert.equal(mains.length, 1, `${label} : landmark main unique dans l'arbre AX`);
  return nodes;
}

async function exhaustiveRoutes(page, baseUrl) {
  const routes = [
    ["#/", "La marche des privilèges"],
    ["#/jouer", "Préparer votre partie"],
    ["#/personnages", "Personnages"],
    ["#/personnages/mots-et-parcours", "Mots et parcours"],
    ["#/personnages/quiz", "Quiz Personnages"],
    ...biographies.map(({ id, name, portraitAlt }) => [`#/personnages/${id.toLowerCase()}`, name, portraitAlt]),
    ["#/situations", "Situations"],
    ["#/situations/focales/obstacles-visibles", "Obstacles visibles"],
    ["#/situations/focales/normes-ordinaires", "Normes ordinaires"],
    ["#/situations/focales/effets-invisibles", "Effets invisibles"],
    ["#/situations/focales/intersectionnalites", "Intersectionnalités"],
    ["#/situations/quiz", "Quiz Situations"],
    ...situations.map(({ code, title, altText }) => [`#/situations/${code}`, title, altText]),
    ["#/reperes", "Repères"],
    ...reperes.map(({ routeSegment }) => [`#/reperes/${routeSegment}`, "Repères"]),
    ["#/mots-utiles", "Les mots utiles"],
    ...words.map(({ routeSegment, label }) => [`#/mots-utiles/${routeSegment}`, label]),
  ];
  for (const [hash, expectedH1, expectedAlt] of routes) {
    await page.navigate(urlFor(baseUrl, hash));
    await pageAudit(page, hash, { expectedH1, expectedAlt });
  }
  return routes.length;
}

async function navigationAndKeyboard(page, baseUrl) {
  await page.viewport(1280);
  for (const hash of ["#/", "#/jouer", "#/situations/quiz"]) {
    await page.call("Page.navigate", { url: "about:blank" });
    await wait(50);
    await page.navigate(urlFor(baseUrl, hash));
    const beforeTab = await page.evaluate("({ tag: document.activeElement?.tagName, id: document.activeElement?.id, className: document.activeElement?.className })");
    await page.key("Tab");
    const afterTab = await page.evaluate("({ tag: document.activeElement?.tagName, id: document.activeElement?.id, className: document.activeElement?.className, text: document.activeElement?.textContent })");
    assert.equal(afterTab.className?.includes("skip-link"), true, `${hash} : lien d'évitement en première tabulation, avant=${JSON.stringify(beforeTab)}, après=${JSON.stringify(afterTab)}`);
    await page.key("Enter");
    assert.equal(await page.evaluate("document.activeElement?.id"), "main-content", `${hash} : focus du lien d'évitement`);
  }

  await page.viewport(320, 800);
  await page.navigate(urlFor(baseUrl, "#/personnages"));
  await page.focusAndActivate(".public-nav__toggle", "Enter");
  assert.equal(await page.evaluate("document.querySelector('.public-nav__toggle').getAttribute('aria-expanded')"), "true", "menu mobile ouvert");
  await page.key("Tab");
  assert.equal(await page.evaluate("document.activeElement?.textContent.trim()"), "Jouer", "premier lien du menu après le bouton");
  await page.key("Tab", { shift: true });
  assert.equal(await page.evaluate("document.activeElement?.classList.contains('public-nav__toggle')"), true, "navigation arrière vers le bouton avec Maj+Tab");
  await page.key("Tab", { shift: true });
  assert.equal(await page.evaluate("document.activeElement?.textContent.trim()"), "Parcours LGBTI+", "navigation arrière vers l'accueil avec Maj+Tab");
  await page.key("Escape");
  assert.equal(await page.evaluate("document.activeElement?.classList.contains('public-nav__toggle')"), true, "focus rendu au bouton après Échap");

  await page.focusAndActivate(".public-nav__toggle", " ");
  await page.evaluate("document.querySelector('.public-nav__mobile a[href=\"#/situations\"]').focus()");
  await page.key("Enter");
  await page.waitFor("location.hash === '#/situations' && Boolean(document.querySelector('main h1'))", "navigation mobile vers Situations");
  await page.waitFor("document.activeElement?.hasAttribute('data-situations-route-heading')", "focus du titre Situations");
  assert.equal(await page.evaluate("document.activeElement?.hasAttribute('data-situations-route-heading')"), true, "focus au titre Situations après navigation mobile");
}

async function responsiveAudit(page, baseUrl) {
  const matrix = [
    "#/", "#/jouer", "#/personnages", "#/personnages/p01", "#/personnages/quiz",
    "#/situations", "#/situations/focales/obstacles-visibles", "#/situations/X01", "#/situations/quiz", "#/reperes/r4", "#/mots-utiles/mu-conf",
  ];
  let checks = 0;
  for (const width of VIEWPORTS) {
    await page.viewport(width, width <= 390 ? 800 : 900);
    for (const hash of matrix) {
      await page.navigate(urlFor(baseUrl, hash));
      await pageAudit(page, `${hash}@${width}px`);
      checks += 1;
    }
  }
  return checks;
}

async function zoomAudit(page, baseUrl) {
  const routes = ["#/", "#/jouer", "#/personnages", "#/personnages/p01", "#/personnages/quiz", "#/situations", "#/situations/focales/obstacles-visibles", "#/situations/X01", "#/situations/quiz", "#/reperes/r4", "#/mots-utiles/mu-conf"];
  const results = [];
  for (const scale of [2, 4]) {
    await page.viewport(1440, 900);
    const layoutWidth = await page.evaluate("document.documentElement.clientWidth");
    await page.call("Emulation.setPageScaleFactor", { pageScaleFactor: scale });
    const visualWidth = await page.evaluate("visualViewport.width");
    assert.ok(Math.abs(visualWidth - (layoutWidth / scale)) <= 1, `zoom CDP ${scale * 100}% réel : largeur visuelle ${visualWidth}px`);
    await page.call("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
    await page.viewport(1440 / scale, 900);
    for (const hash of routes) {
      await page.navigate(urlFor(baseUrl, hash));
      await pageAudit(page, `${hash}@zoom-${scale * 100}`);
    }
    results.push({ scale, visualWidth, reflowWidth: 1440 / scale });
  }
  return results;
}

async function reducedMotionAudit(page, baseUrl) {
  await page.viewport(1280);
  await page.call("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await page.navigate(urlFor(baseUrl, "#/jouer"));
  const durations = await page.evaluate(`[...document.querySelectorAll("*")].filter((element) => { const rect = element.getBoundingClientRect(); return rect.width && rect.height; }).map((element) => { const style = getComputedStyle(element); return [style.animationDuration, style.transitionDuration]; }).flat()`);
  const seconds = durations.flatMap((value) => value.split(",")).map((value) => value.trim()).map((value) => value.endsWith("ms") ? Number.parseFloat(value) / 1000 : Number.parseFloat(value));
  assert.ok(seconds.every((value) => !Number.isFinite(value) || value <= 0.001), "prefers-reduced-motion limite toutes les durées à 1 ms");
  await page.call("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
}

async function contrastAndTargetsAudit(page, baseUrl) {
  const samples = [
    ["#/", [".home-hero__intro", ".home-primary-link", ".home-introduction p", ".public-nav a", ".public-footer a"]],
    ["#/situations", [".public-situations-intro p", ".public-focal-link", ".public-situation-filters label", ".public-situation-results", ".public-badge--obstacle", ".public-badge--protection"]],
    ["#/situations/V03", [".public-situation-canonical", ".public-situation-tabs button", ".public-disclosure-heading button"]],
    ["#/personnages/p01", [".biography-profile__metadata", ".biography-tabs__list button", ".biography-blocks"]],
    ["#/reperes", [".reference-page--compact > header p", ".reference-accordion > h2 button", ".reference-primary p", ".reference-compact-links a"]],
    ["#/personnages/quiz", [".quiz-page p", ".quiz-page button", ".quiz-note"]],
  ];
  const ratios = [];
  for (const [hash, selectors] of samples) {
    await page.navigate(urlFor(baseUrl, hash));
    const routeRatios = await page.evaluate(`(() => {
      const parse = (value) => {
        if (value.startsWith("oklch(")) {
          const match = value.match(/oklch\\(([\\d.]+)(%)?\\s+([\\d.]+)\\s+([\\d.]+)(?:deg)?(?:\\s*\\/\\s*([\\d.]+)(%)?)?\\)/);
          const lightness = Number(match[1]) / (match[2] ? 100 : 1);
          const chroma = Number(match[3]);
          const hue = Number(match[4]) * Math.PI / 180;
          const alpha = match[5] ? Number(match[5]) / (match[6] ? 100 : 1) : 1;
          const a = chroma * Math.cos(hue); const b = chroma * Math.sin(hue);
          const lRoot = lightness + 0.3963377774 * a + 0.2158037573 * b;
          const mRoot = lightness - 0.1055613458 * a - 0.0638541728 * b;
          const sRoot = lightness - 0.0894841775 * a - 1.291485548 * b;
          const l = lRoot ** 3; const m = mRoot ** 3; const s = sRoot ** 3;
          const linear = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
          return linear.map((channel) => 255 * (channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055)).concat(alpha);
        }
        const values = value.match(/[\\d.]+/g)?.map(Number) ?? [];
        return [values[0] ?? 0, values[1] ?? 0, values[2] ?? 0, values[3] ?? 1];
      };
      const blend = (front, back) => { const alpha = front[3] + back[3] * (1 - front[3]); return [0, 1, 2].map((index) => (front[index] * front[3] + back[index] * back[3] * (1 - front[3])) / alpha).concat(alpha); };
      const background = (element) => { const chain = []; for (let node = element; node; node = node.parentElement) chain.unshift(node); return chain.reduce((color, node) => blend(parse(getComputedStyle(node).backgroundColor), color), [255, 255, 255, 1]); };
      const luminance = (color) => { const channels = color.slice(0, 3).map((value) => { const channel = value / 255; return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4; }); return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722; };
      return ${JSON.stringify(selectors)}.map((selector) => { const element = document.querySelector(selector); if (!element) return { selector, missing: true }; const style = getComputedStyle(element); const bg = background(element); const fg = blend(parse(style.color), bg); const light = Math.max(luminance(fg), luminance(bg)); const dark = Math.min(luminance(fg), luminance(bg)); const ratio = (light + 0.05) / (dark + 0.05); const large = Number.parseFloat(style.fontSize) >= 24 || (Number.parseFloat(style.fontSize) >= 18.66 && Number.parseInt(style.fontWeight) >= 700); return { selector, ratio, threshold: large ? 3 : 4.5, color: style.color, background: bg }; });
    })()`);
    for (const sample of routeRatios) {
      assert.equal(sample.missing, undefined, `${hash} : échantillon contraste ${sample.selector}`);
      assert.ok(sample.ratio >= sample.threshold, `${hash} ${sample.selector} : contraste ${sample.ratio.toFixed(2)} < ${sample.threshold}`);
      ratios.push(sample.ratio);
    }
  }

  await page.viewport(320, 800);
  await page.navigate(urlFor(baseUrl, "#/personnages/p01"));
  const targets = await page.evaluate(`(() => [".public-nav__toggle", ".biography-tabs__list button", ".biography-subsection h2 button"].map((selector) => { const rect = document.querySelector(selector).getBoundingClientRect(); return { selector, width: rect.width, height: rect.height }; }))()`);
  const biographyBorders = await page.evaluate(`(() => [".biography-subsection:first-child", ".biography-subsection:nth-child(2)"].map((selector) => { const element = document.querySelector(selector); const style = getComputedStyle(element); return { selector, border: style.borderTopColor, background: getComputedStyle(element.querySelector("button")).backgroundColor }; }))()`);
  await page.navigate(urlFor(baseUrl, "#/situations"));
  const essentialBorders = biographyBorders.concat(await page.evaluate(`(() => [".public-nav__toggle", ".public-situation-filters select", ".public-situation-filters button"].map((selector) => { const style = getComputedStyle(document.querySelector(selector)); return { selector, border: style.borderTopColor, background: style.backgroundColor }; }))()`));
  for (const sample of essentialBorders) {
    sample.ratio = colorContrast(sample.border, sample.background);
    assert.ok(sample.ratio >= 3, `${sample.selector} : contraste de bordure essentielle ${sample.ratio.toFixed(2)} < 3`);
  }
  targets.push(...await page.evaluate(`(() => [".public-situation-filters select", ".public-situation-filters button"].map((selector) => { const rect = document.querySelector(selector).getBoundingClientRect(); return { selector, width: rect.width, height: rect.height }; }))()`));
  await page.navigate(urlFor(baseUrl, "#/personnages/quiz"));
  targets.push(...await page.evaluate(`(() => [".quiz-page button"].map((selector) => { const rect = document.querySelector(selector).getBoundingClientRect(); return { selector, width: rect.width, height: rect.height }; }))()`));
  assert.ok(targets.every(({ width, height }) => width >= 44 && height >= 44), `cibles tactiles principales : ${JSON.stringify(targets)}`);
  return { minimumRatio: Math.min(...ratios), minimumEssentialBorderRatio: Math.min(...essentialBorders.map(({ ratio }) => ratio)), targets };
}

async function filtersHistoryAndContextLinksAudit(page, baseUrl) {
  await page.viewport(1024);
  await page.navigate(urlFor(baseUrl, "#/situations"));
  const initialCount = await page.evaluate("document.querySelectorAll('.public-situation-card').length");
  assert.equal(initialCount, 61, "61 situations dans la galerie non filtrée");
  const filtered = await page.evaluate(`(() => {
    const selects = document.querySelectorAll(".public-situation-filters select");
    selects[0].value = "V"; selects[0].dispatchEvent(new Event("change", { bubbles: true }));
    selects[1].value = "protection"; selects[1].dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  })()`);
  assert.equal(filtered, true, "combinaison de filtres appliquée");
  await page.waitFor("document.querySelectorAll('.public-situation-card').length > 0 && document.querySelectorAll('.public-situation-card').length < 61", "résultat des filtres combinés");
  await page.focusAndActivate(".public-situation-filters button", "Enter");
  await page.waitFor("document.querySelectorAll('.public-situation-card').length === 61", "réinitialisation des filtres");

  await page.focusAndActivate(".public-situation-card__link", "Enter");
  await page.waitFor("location.hash.startsWith('#/situations/') && Boolean(document.querySelector('.public-useful-words a'))", "fiche Situation depuis la galerie");
  const situationHash = await page.evaluate("location.hash");
  await page.focusAndActivate(".public-useful-words a", "Enter");
  await page.waitFor("Boolean(document.querySelector('.context-return'))", "Mot utile depuis une Situation");
  assert.equal(await page.evaluate("document.querySelector('.context-return').getAttribute('href')"), situationHash, "retour contextuel Situation exact");
  await page.focusAndActivate(".context-return", "Enter");
  await page.waitFor(`location.hash === ${JSON.stringify(situationHash)}`, "retour à la Situation");

  await page.navigate(urlFor(baseUrl, "#/personnages/mots-et-parcours"));
  await page.focusAndActivate(".journey-words-list a", "Enter");
  await page.waitFor("Boolean(document.querySelector('.context-return'))", "Mot utile depuis Mots et parcours");
  assert.equal(await page.evaluate("document.querySelector('.context-return').getAttribute('href')"), "#/personnages/mots-et-parcours", "retour contextuel Mots et parcours");

  await page.navigate(urlFor(baseUrl, "#/reperes/r1"));
  await page.focusAndActivate("a[href*='/mots-utiles/']", "Enter");
  await page.waitFor("Boolean(document.querySelector('.context-return'))", "Mot utile depuis un Repère");
  assert.equal(await page.evaluate("document.querySelector('.context-return').getAttribute('href')"), "#/reperes/r1", "retour contextuel Repère");

  await page.navigate(urlFor(baseUrl, "#/personnages"));
  await page.focusAndActivate(".explorer-character-card__link", "Enter");
  await page.waitFor("location.hash.startsWith('#/personnages/') && location.hash !== '#/personnages'", "navigation vers une biographie");
  const detailHash = await page.evaluate("location.hash");
  await page.evaluate("history.back()");
  await page.waitFor("location.hash === '#/personnages'", "historique précédent");
  await page.evaluate("history.forward()");
  await page.waitFor(`location.hash === ${JSON.stringify(detailHash)}`, "historique suivant");
}

async function situationsUiAudit(page, baseUrl) {
  await page.viewport(1280);
  await page.navigate(urlFor(baseUrl, "#/situations"));
  const gallery = await page.evaluate(`(() => ({
    intro: document.querySelector('.public-situations-intro p')?.textContent.trim(),
    focals: [...document.querySelectorAll('.public-focal-link')].map((link) => ({ text: link.textContent.trim(), href: link.getAttribute('href') })),
    cards: document.querySelectorAll('.public-situation-card').length,
    cardCodes: [...document.querySelectorAll('.public-situation-card')].filter((card) => /\\b[VNIX]\\d{2}\\b/.test(card.innerText)).length,
    quizAfterGrid: Boolean(document.querySelector('.public-situations-grid + .public-situations-quiz')),
    quizLinks: [...document.querySelectorAll('a[href="#/situations/quiz"]')].map((link) => link.closest('.public-situations-quiz') !== null),
    statsInteractive: [...document.querySelectorAll('a,button')].some((element) => /61 situations|53 obstacles|8 protections/.test(element.textContent)),
    roles: [...document.querySelectorAll('.public-badge--obstacle,.public-badge--protection')].map((badge) => ({ text: badge.textContent, color: getComputedStyle(badge).color, background: getComputedStyle(badge).backgroundColor })),
  }))()`);
  assert.equal(gallery.intro, "Explorez des situations ordinaires du lycée pour comprendre ce qui peut créer un obstacle, ce qui peut protéger, et pourquoi une même situation ne se vit pas de la même manière pour tout le monde.", "introduction Situations exacte");
  assert.equal(gallery.cards, 61, "61 cartes Situations");
  assert.deepEqual(gallery.focals.map(({ href }) => href), ["#/situations/focales/obstacles-visibles", "#/situations/focales/normes-ordinaires", "#/situations/focales/effets-invisibles", "#/situations/focales/intersectionnalites"], "quatre portes d’entrée focales");
  assert.ok(gallery.focals.every(({ text }) => /situations/.test(text)), "compte lisible sur chaque focale");
  assert.equal(gallery.cardCodes, 0, "aucun code technique visible dans les cartes");
  assert.equal(gallery.quizAfterGrid, true, "Quiz Situations après la galerie");
  assert.ok(gallery.quizLinks.length === 1 && gallery.quizLinks.every(Boolean), "promotion du quiz uniquement en zone secondaire");
  assert.equal(gallery.statsInteractive, false, "statistiques non interactives");
  assert.ok(gallery.roles.some(({ text }) => text === "Obstacle") && gallery.roles.some(({ text }) => text === "Protection"), "deux rôles écrits");
  assert.notEqual(gallery.roles.find(({ text }) => text === "Obstacle")?.background, gallery.roles.find(({ text }) => text === "Protection")?.background, "rôles visuellement distincts");

  await page.evaluate("scrollTo(0, document.documentElement.scrollHeight)");
  await page.focusAndActivate('.public-focal-link[href="#/situations/focales/obstacles-visibles"]', "Enter");
  await page.waitFor("location.hash === '#/situations/focales/obstacles-visibles'", "ouverture focale Obstacles visibles");
  const focal = await page.evaluate(`(() => {
    const h1 = document.querySelector('h1');
    const openButton = document.querySelector('.public-disclosure-heading button[aria-expanded=true]');
    return { title: h1.textContent.trim(), titleTop: h1.getBoundingClientRect().top, focusHeading: document.activeElement === h1, cards: document.querySelectorAll('.public-situation-card').length, focalBadges: document.querySelectorAll('.public-situation-card .public-badge[class*="--focal-"]').length, roleBadges: document.querySelectorAll('.public-situation-card .public-badge--obstacle,.public-situation-card .public-badge--protection').length, codeVisible: /\\bV\\d{2}\\b/.test(document.querySelector('main').innerText), open: openButton?.textContent.trim(), regions: document.querySelectorAll('.public-disclosure-panel:not([hidden])').length }; })()`);
  assert.equal(focal.title, "Obstacles visibles", "titre de focale");
  assert.ok(focal.titleTop >= 0 && focal.titleTop < 450, `arrivée au début logique de la focale : ${focal.titleTop}px`);
  assert.equal(focal.focusHeading, true, "focus placé sur le titre de la nouvelle route");
  assert.equal(focal.cards, 16, "16 situations Obstacles visibles");
  assert.equal(focal.focalBadges, 0, "badge de focale non répété");
  assert.equal(focal.roleBadges, 16, "rôle conservé sur chaque carte");
  assert.equal(focal.codeVisible, false, "aucun code technique visible dans la focale");
  assert.equal(focal.regions, 1, "une rubrique de focale ouverte");

  const focalGeometryBefore = await page.evaluate(`(() => { const button = document.querySelectorAll('.public-disclosure-heading button')[1]; button.scrollIntoView({ block: 'center' }); const rect = button.getBoundingClientRect(); button.focus({ preventScroll: true }); return { top: rect.top, scrollY }; })()`);
  await page.key("Enter");
  const focalGeometryAfter = await page.evaluate(`(() => { const button = document.activeElement; const panel = document.querySelector('.public-disclosure-panel:not([hidden])'); const rect = button.getBoundingClientRect(); return { top: rect.top, scrollY, focus: button.matches('.public-disclosure-heading button'), expanded: button.getAttribute('aria-expanded'), panelBelow: panel.getBoundingClientRect().top >= rect.bottom - 1, regions: document.querySelectorAll('.public-disclosure-panel:not([hidden])').length }; })()`);
  assert.ok(Math.abs(focalGeometryAfter.top - focalGeometryBefore.top) <= 1, "déclencheur de focale stable à l’ouverture");
  assert.equal(focalGeometryAfter.scrollY, focalGeometryBefore.scrollY, "aucun saut de scroll dans la focale");
  assert.equal(focalGeometryAfter.focus, true, "focus conservé sur le disclosure de focale");
  assert.equal(focalGeometryAfter.expanded, "true", "nouvelle rubrique ouverte");
  assert.equal(focalGeometryAfter.panelBelow, true, "contenu de focale sous les déclencheurs");
  assert.equal(focalGeometryAfter.regions, 1, "disclosures de focale exclusifs");

  for (const [hash, title] of [["#/situations/V03", "La tenue commentée"], ["#/situations/V09", "Le recadrage immédiat"], ["#/situations/N02", "Le formulaire « Père — Mère »"], ["#/situations/I01", "Sensibiliser par la peur"], ["#/situations/X01", "La chambre accessible"], ["#/situations/X13", "Une adaptation coordonnée"]]) {
    await page.navigate(urlFor(baseUrl, hash));
    const detail = await page.evaluate(`(() => ({ title: document.querySelector('h1').textContent.trim(), codeVisible: /\\b[VNIX]\\d{2}\\b/.test(document.querySelector('main').innerText), wordCodeVisible: /MU-[A-Z]+/.test(document.querySelector('.public-useful-words').innerText), tabs: [...document.querySelectorAll('[role=tab]')].map((tab) => ({ name: tab.textContent.trim(), selected: tab.getAttribute('aria-selected') })), panels: document.querySelectorAll('[role=tabpanel]:not([hidden])').length, disclosures: document.querySelectorAll('#situation-panel-understand .public-disclosure-heading').length, openDisclosures: document.querySelectorAll('#situation-panel-understand .public-disclosure-panel:not([hidden])').length }))()`);
    assert.equal(detail.title, title, `${hash} : titre canonique`);
    assert.equal(detail.codeVisible, false, `${hash} : code technique masqué`);
    assert.equal(detail.wordCodeVisible, false, `${hash} : identifiants MU masqués`);
    assert.deepEqual(detail.tabs.map(({ name }) => name), ["Comprendre", "Ce qui peut aider", "Un autre angle"], `${hash} : trois onglets exacts`);
    assert.equal(detail.tabs[0].selected, "true", `${hash} : Comprendre actif`);
    assert.equal(detail.panels, 1, `${hash} : un seul panneau actif`);
    assert.equal(detail.disclosures, 3, `${hash} : trois analyses compactées`);
    assert.equal(detail.openDisclosures, 1, `${hash} : un seul accordéon ouvert`);
  }

  await page.navigate(urlFor(baseUrl, "#/situations/V03"));
  const accordionBefore = await page.evaluate(`(() => { const button = document.querySelectorAll('#situation-panel-understand .public-disclosure-heading button')[1]; button.scrollIntoView({ block: 'center' }); button.focus({ preventScroll: true }); const rect = button.getBoundingClientRect(); return { top: rect.top, scrollY }; })()`);
  await page.key(" ");
  const accordionAfter = await page.evaluate(`(() => { const button = document.activeElement; const panel = document.querySelector('#situation-panel-understand .public-disclosure-panel:not([hidden])'); const rect = button.getBoundingClientRect(); return { top: rect.top, scrollY, focus: button.matches('.public-disclosure-heading button'), expanded: button.getAttribute('aria-expanded'), panelBelow: panel.getBoundingClientRect().top >= rect.bottom - 1, open: document.querySelectorAll('#situation-panel-understand .public-disclosure-panel:not([hidden])').length }; })()`);
  assert.ok(Math.abs(accordionAfter.top - accordionBefore.top) <= 1, "déclencheur Comprendre stable");
  assert.equal(accordionAfter.scrollY, accordionBefore.scrollY, "aucun saut de scroll dans Comprendre");
  assert.equal(accordionAfter.focus, true, "focus conservé sur l’accordéon");
  assert.equal(accordionAfter.expanded, "true", "accordéon activé avec Espace");
  assert.equal(accordionAfter.panelBelow, true, "contenu sous les déclencheurs");
  assert.equal(accordionAfter.open, 1, "accordéons Comprendre exclusifs");
  await page.evaluate("document.querySelector('[role=tab]').focus({ preventScroll: true })");
  await page.key("ArrowRight");
  assert.equal(await page.evaluate(`(() => { const tab = document.querySelector('[role=tab][aria-selected=true]'); return tab.textContent.trim() === 'Ce qui peut aider' && document.activeElement === tab && document.querySelectorAll('[role=tabpanel]:not([hidden])').length === 1; })()`), true, "navigation clavier des onglets Situation");
  await page.key("End");
  assert.equal(await page.evaluate("document.querySelector('[role=tab][aria-selected=true]').textContent.trim()"), "Un autre angle", "touche End des onglets Situation");
  await page.key("Home");
  assert.equal(await page.evaluate("document.querySelector('[role=tab][aria-selected=true]').textContent.trim()"), "Comprendre", "touche Home des onglets Situation");

  for (const [width, scale] of [[320, 1], [360, 1], [390, 1], [768, 1], [720, 2], [360, 4]]) {
    await page.viewport(width, 900);
    await page.call("Emulation.setPageScaleFactor", { pageScaleFactor: scale });
    await page.navigate(urlFor(baseUrl, "#/situations/V03"));
    await pageAudit(page, `Situation V03 ${width}px zoom ${scale * 100}%`);
    assert.equal(await page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1"), true, "aucun débordement fiche Situation");
    await page.call("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
  }

  await page.viewport(1280);
  for (const hash of ["#/situations", "#/situations/X01", "#/situations/X13"]) {
    await page.navigate(urlFor(baseUrl, hash, "?context=elea"));
    assert.equal(await page.evaluate("Boolean(document.querySelector('.public-nav'))"), false, `${hash} : chrome Éléa allégé`);
    await pageAudit(page, `Éléa ${hash}`);
  }
}

async function biographyTabsAudit(page, baseUrl) {
  await page.viewport(1280);
  await page.navigate(urlFor(baseUrl, "#/personnages/p01"));
  const initial = await page.evaluate(`(() => ({ tabs: [...document.querySelectorAll('[role="tab"]')].map((tab) => ({ name: tab.textContent.trim(), selected: tab.getAttribute("aria-selected") })), panels: document.querySelectorAll('[role="tabpanel"]:not([hidden])').length, scrollY }))()`);
  assert.deepEqual(initial.tabs.map(({ name }) => name), ["Vue d’ensemble", "Son parcours", "Entourage et confidentialité", "Au lycée"], "quatre onglets exacts");
  assert.equal(initial.tabs[0].selected, "true", "Vue d’ensemble active par défaut");
  assert.equal(initial.panels, 1, "un seul panneau actif");
  await page.evaluate("document.querySelectorAll('[role=tab]')[1].focus({ preventScroll: true })");
  for (const key of ["ArrowRight", "End", "Home", "ArrowRight"]) await page.key(key);
  const after = await page.evaluate(`(() => { const tab = document.querySelector('[role=tab][aria-selected=true]'); const panel = document.querySelector('[role=tabpanel]:not([hidden])'); const list = document.querySelector('[role=tablist]'); return { tab: tab.textContent.trim(), focus: document.activeElement === tab, controls: tab.getAttribute('aria-controls'), panel: panel.id, labelledby: panel.getAttribute('aria-labelledby'), follows: list.nextElementSibling === document.querySelector('[role=tabpanel]'), geometry: panel.getBoundingClientRect().top >= list.getBoundingClientRect().bottom - 1, scrollY, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }; })()`);
  assert.equal(after.tab, "Son parcours", "navigation clavier des onglets");
  assert.equal(after.focus, true, "focus conservé sur l’onglet actif");
  assert.equal(after.controls, after.panel, "aria-controls cible le panneau actif");
  assert.equal(after.labelledby, "biography-tab-journey", "panneau étiqueté");
  assert.equal(after.follows, true, "panneau immédiatement après la barre d’onglets");
  assert.equal(after.geometry, true, "contenu sous la barre d’onglets");
  assert.ok(Math.abs(after.scrollY - initial.scrollY) <= 1, "aucun saut lors du changement d’onglet");
  assert.ok(after.overflow <= 1, "aucun débordement horizontal");
  const accordionInitial = await page.evaluate(`(() => ({ expanded: [...document.querySelectorAll('[role=tabpanel]:not([hidden]) .biography-subsection h2 button')].map((button) => button.getAttribute('aria-expanded')), visibleRegions: document.querySelectorAll('[role=tabpanel]:not([hidden]) .biography-subsection__panel:not([hidden])').length }))()`);
  assert.deepEqual(accordionInitial.expanded, ["true", "false", "false", "false"], "première sous-partie ouverte par défaut");
  assert.equal(accordionInitial.visibleRegions, 1, "un seul accordéon visible");
  const secondSelector = "[role=tabpanel]:not([hidden]) .biography-subsection:nth-child(2) h2 button";
  const beforeAccordion = await page.evaluate(`(() => { const button = document.querySelector(${JSON.stringify(secondSelector)}); const rect = button.getBoundingClientRect(); scrollBy(0, rect.top - ((innerHeight - rect.height) / 2)); button.focus({ preventScroll: true }); return button.getBoundingClientRect().toJSON(); })()`);
  await page.key(" ");
  const afterAccordion = await page.evaluate(`(() => { const button = document.querySelector(${JSON.stringify(secondSelector)}); const panel = document.getElementById(button.getAttribute('aria-controls')); return { rect: button.getBoundingClientRect().toJSON(), focus: document.activeElement === button, expanded: [...document.querySelectorAll('[role=tabpanel]:not([hidden]) .biography-subsection h2 button')].map((candidate) => candidate.getAttribute('aria-expanded')), panelVisible: !panel.hidden, labelledby: panel.getAttribute('aria-labelledby') }; })()`);
  assert.deepEqual(afterAccordion.expanded, ["false", "true", "false", "false"], "ouverture exclusive du deuxième accordéon");
  assert.equal(afterAccordion.focus, true, "focus stable sur l’accordéon activé");
  assert.equal(afterAccordion.panelVisible, true, "panneau associé visible");
  assert.equal(afterAccordion.labelledby, "biography-section-button-journey-4", "panneau explicitement étiqueté");
  assert.ok(Math.abs(afterAccordion.rect.top - beforeAccordion.top) <= 1, "déclencheur d’accordéon géométriquement stable");
}

async function situationQuizAudit(page, baseUrl) {
  await page.viewport(1024);
  await page.navigate(urlFor(baseUrl, "#/situations/quiz"));
  await page.focusAndActivate(".quiz-page button", "Enter");
  for (let index = 0; index < FORBIDDEN_QS.length; index += 1) {
    const [code, title, expectedFocal, expectedRole] = FORBIDDEN_QS[index];
    await page.waitFor(`document.querySelector('.quiz-progress')?.textContent.includes('Situation ${index + 1} sur 8')`, `QS${index + 1}`);
    const before = await page.evaluate(`(() => {
      const main = document.querySelector("main");
      const html = main.outerHTML;
      const attributes = [...main.querySelectorAll("*")].flatMap((element) => [...element.attributes].filter((attribute) => /^(aria-|data-|title)/.test(attribute.name)).map((attribute) => attribute.value)).join(" ");
      return { text: main.innerText, html, attributes, headings: [...main.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((heading) => heading.textContent.trim()), title: document.title, href: location.href, checked: main.querySelectorAll("input:checked").length, feedback: Boolean(main.querySelector(".quiz-feedback")), links: [...main.querySelectorAll("a")].map((link) => link.textContent.trim()) };
    })()`);
    assert.ok(!before.text.includes(code) && !before.html.includes(code), `QS${index + 1} : code prématuré ${code}`);
    assert.ok(!before.headings.some((heading) => heading.includes(title)) && !before.attributes.includes(title), `QS${index + 1} : titre prématuré`);
    assert.ok(!before.title.includes(code) && !before.title.includes(title) && !before.href.includes(code), `QS${index + 1} : fuite route/titre document`);
    assert.equal(before.checked, 0, `QS${index + 1} : aucune réponse précochée`);
    assert.equal(before.feedback, false, `QS${index + 1} : feedback absent`);
    assert.ok(!before.links.some((label) => label.includes(code)), `QS${index + 1} : lien fiche absent`);
    assert.ok(!before.attributes.includes(`expected`) && !before.attributes.includes(`${expectedFocal}|${expectedRole}`), `QS${index + 1} : métadonnée révélatrice absente`);
    const axBefore = await page.accessibilityTree();
    const axText = axBefore.filter((node) => !node.ignored).map((node) => node.name?.value ?? "").join(" ");
    const axHeadings = axBefore.filter((node) => !node.ignored && node.role?.value === "heading").map((node) => node.name?.value ?? "");
    assert.ok(!axText.includes(code) && !axHeadings.some((heading) => heading.includes(title)), `QS${index + 1} : identité absente de l'arbre AX`);

    await page.focusAndActivate("input[name=focal]", " ");
    await page.focusAndActivate("form button[type=submit]", "Enter");
    assert.equal(await page.evaluate("document.querySelectorAll('input[name=role]').length"), 2, `QS${index + 1} : étape rôle`);
    await page.focusAndActivate("input[name=role]", " ");
    await page.focusAndActivate("form button[type=submit]", "Enter");
    await page.waitFor("Boolean(document.querySelector('.quiz-feedback'))", `feedback QS${index + 1}`);
    const after = await page.evaluate(`(() => ({ text: document.querySelector("main").innerText, focus: document.activeElement?.textContent.trim(), link: document.querySelector(".quiz-feedback a")?.getAttribute("href") }))()`);
    assert.ok(after.text.includes(code) && after.text.includes(title) && after.text.toLowerCase().includes(expectedRole), `QS${index + 1} : révélation complète`);
    assert.equal(after.focus, "Correction de la situation", `QS${index + 1} : focus feedback`);
    assert.equal(after.link, `#/situations/${code}`, `QS${index + 1} : lien fiche exact`);
    await page.focusAndActivate(".quiz-feedback button", "Enter");
  }
  await page.waitFor("document.querySelector('h1')?.textContent.includes('Bilan du quiz Situations')", "bilan QS");
  assert.ok((await page.evaluate("document.querySelector('main').innerText")).includes("focales retrouvées sur 8"), "bilan QS séparé");
}

async function characterQuizAudit(page, baseUrl) {
  await page.navigate(urlFor(baseUrl, "#/personnages/quiz"));
  await page.focusAndActivate(".quiz-page button", "Enter");
  for (let index = 0; index < 8; index += 1) {
    await page.waitFor(`document.querySelector('.quiz-progress')?.textContent.includes('Question ${index + 1} sur 8')`, `QP${index + 1}`);
    const association = await page.evaluate("Boolean(document.querySelector('.quiz-association select'))");
    if (association) {
      const count = await page.evaluate("document.querySelectorAll('.quiz-association select').length");
      for (let selectIndex = 0; selectIndex < count; selectIndex += 1) {
        await page.focusAndActivate(`.quiz-association:nth-of-type(${selectIndex + 1}) select`, "ArrowDown");
      }
    } else {
      await page.focusAndActivate("form input", " ");
    }
    await page.focusAndActivate("form button[type=submit]", "Enter");
    await page.waitFor("Boolean(document.querySelector('.quiz-feedback'))", `feedback QP${index + 1}`);
    assert.equal(await page.evaluate("document.activeElement?.textContent.trim()"), "Correction", `QP${index + 1} : focus feedback`);
    await page.focusAndActivate(".quiz-feedback button", "Enter");
  }
  await page.waitFor("document.querySelector('h1')?.textContent.includes('repères retrouvés sur 8')", "bilan QP");
}

async function reperesAudit(page, baseUrl) {
  const titles = ["Comment jouer ?", "D’où vient la marche des privilèges ?", "Privilège, droit et position sociale", "Normes et institutions", "Aider sans imposer"];
  const routes = ["#/reperes", "#/reperes/r1", "#/reperes/r2", "#/reperes/r3", "#/reperes/r4", "#/reperes/r5"];
  await page.viewport(1280);
  for (let routeIndex = 0; routeIndex < routes.length; routeIndex += 1) {
    const hash = routes[routeIndex];
    await page.navigate(urlFor(baseUrl, hash));
    await pageAudit(page, hash, { expectedH1: "Repères" });
    const expectedOpen = hash === "#/reperes" ? 0 : routeIndex - 1;
    const state = await page.evaluate(`(() => ({
      intro: document.querySelector('.reference-page--compact > header p')?.textContent.trim(),
      titles: [...document.querySelectorAll('.reference-accordion > h2 button')].map((button) => button.textContent.replace(/[−+]/g, '').trim()),
      expanded: [...document.querySelectorAll('.reference-accordion > h2 button')].map((button) => button.getAttribute('aria-expanded')),
      panels: document.querySelectorAll('.reference-accordion__panel:not([hidden])').length,
      technicalIds: /(^|\\s)R[1-5](?=\\s|$)/m.test(document.querySelector('main').innerText),
      oldBrand: document.querySelector('main').innerText.includes('Mosaïque'),
      deepClosed: document.querySelector('.reference-secondary-disclosure button')?.getAttribute('aria-expanded'),
      words: document.querySelectorAll('.reference-compact-links a[href*="/mots-utiles/"]').length,
      continuations: [...document.querySelectorAll('.reference-compact-links a')].filter((link) => !link.href.includes('/mots-utiles/')).length,
    }))()`);
    assert.equal(state.intro, "Quelques clés pour comprendre la marche des privilèges et les notions utilisées dans l’activité.", `${hash} : introduction compacte exacte`);
    assert.deepEqual(state.titles, titles, `${hash} : cinq titres publics exacts`);
    assert.equal(state.expanded.filter((value) => value === "true").length, 1, `${hash} : un accordéon principal ouvert`);
    assert.equal(state.expanded[expectedOpen], "true", `${hash} : accordéon attendu ouvert`);
    assert.equal(state.panels, 1, `${hash} : un seul panneau principal visible`);
    assert.equal(state.technicalIds, false, `${hash} : R1–R5 absents de l’affichage`);
    assert.equal(state.oldBrand, false, `${hash} : ancienne marque absente de Repères`);
    assert.equal(state.deepClosed, "false", `${hash} : Approfondir fermé par défaut`);
    assert.equal(state.words, 3, `${hash} : trois Mots utiles actifs`);
    assert.equal(state.continuations, 2, `${hash} : deux prolongements actifs`);
  }

  await page.viewport(320, 800);
  await page.navigate(urlFor(baseUrl, "#/reperes"));
  const before = await page.evaluate(`(() => { const button = document.querySelectorAll('.reference-accordion > h2 button')[1]; const initial = button.getBoundingClientRect(); window.scrollBy(0, initial.top - innerHeight * 0.45); button.focus({ preventScroll: true }); const rect = button.getBoundingClientRect(); return { top: rect.top, scrollY }; })()`);
  await wait(250);
  await page.mouseClick('.reference-accordion:nth-child(2) > h2 button');
  const after = await page.evaluate(`(() => { const button = document.activeElement; const panel = document.getElementById(button.getAttribute('aria-controls')); const rect = button.getBoundingClientRect(); return { top: rect.top, bottom: rect.bottom, viewportHeight: innerHeight, scrollY, focus: button.matches('.reference-accordion > h2 button'), expanded: button.getAttribute('aria-expanded'), panels: document.querySelectorAll('.reference-accordion__panel:not([hidden])').length, panelBelow: panel.getBoundingClientRect().top >= rect.bottom - 1 }; })()`);
  console.log(`Mesure diagnostique Repères : avant=${JSON.stringify(before)}, après=${JSON.stringify(after)}, déplacement=${(after.top - before.top).toFixed(2)}px`);
  assert.ok(Math.abs(after.top - before.top) <= 64 && after.top >= 0 && after.bottom < after.viewportHeight, `position de lecture Repères préservée : avant=${JSON.stringify(before)}, après=${JSON.stringify(after)}`);
  assert.equal(after.focus, true, "focus conservé sur le Repère activé");
  assert.equal(after.expanded, "true", "Repère activé au clavier");
  assert.equal(after.panels, 1, "accordéons Repères exclusifs");
  assert.equal(after.panelBelow, true, "panneau Repère sous son déclencheur");
  const deepBefore = await page.evaluate(`(() => { const button = document.querySelector('.reference-accordion__panel:not([hidden]) .reference-secondary-disclosure button'); button.focus({ preventScroll: true }); const rect = button.getBoundingClientRect(); return { top: rect.top, scrollY }; })()`);
  await page.key(" ");
  const deepAfter = await page.evaluate(`(() => { const button = document.activeElement; return { expanded: button.getAttribute('aria-expanded'), focus: button.matches('.reference-secondary-disclosure button'), top: button.getBoundingClientRect().top, scrollY, visible: !document.getElementById(button.getAttribute('aria-controls')).hidden }; })()`);
  assert.equal(deepAfter.expanded, "true", "Approfondir ouvert avec Espace");
  assert.equal(deepAfter.focus, true, "focus conservé sur Approfondir");
  assert.ok(Math.abs(deepAfter.top - deepBefore.top) <= 1 && deepAfter.scrollY === deepBefore.scrollY, "Approfondir sans saut de scroll");
  assert.equal(deepAfter.visible, true, "contenu Approfondir visible");

  await page.navigate(urlFor(baseUrl, "#/reperes/r2"));
  const sourceButtonCount = await page.evaluate("[...document.querySelectorAll('.reference-secondary-disclosure button')].filter((button) => button.textContent.includes('Sources')).length");
  assert.equal(sourceButtonCount, 1, "disclosure Sources présent lorsqu’il existe");
  await page.evaluate("[...document.querySelectorAll('.reference-secondary-disclosure button')].find((button) => button.textContent.includes('Sources')).focus({ preventScroll: true })");
  await page.key("Enter");
  assert.ok((await page.evaluate("document.querySelectorAll('.reference-secondary-disclosure__panel:not([hidden]) a[href^=http]').length")) > 0, "sources publiques conservées et actives");

  const switchScenarios = [
    { hash: "#/reperes/r1", target: 1, key: "Enter", width: 1280, scale: 1, query: "" },
    { hash: "#/reperes/r3", target: 3, key: " ", width: 320, scale: 1, query: "" },
    { hash: "#/reperes/r5", target: 0, key: "Enter", width: 1280, scale: 1, query: "" },
    { hash: "#/reperes", target: 1, key: " ", width: 320, scale: 1, query: "?context=elea" },
    { hash: "#/reperes/r3", target: 3, key: "Enter", width: 720, scale: 2, query: "" },
  ];
  for (const scenario of switchScenarios) {
    await page.viewport(scenario.width, 800);
    await page.call("Emulation.setPageScaleFactor", { pageScaleFactor: scenario.scale });
    await page.navigate(urlFor(baseUrl, scenario.hash, scenario.query));
    const selector = `.reference-accordion:nth-child(${scenario.target + 1}) > h2 button`;
    const positionBefore = await page.evaluate(`(() => { const button = document.querySelector(${JSON.stringify(selector)}); const initial = button.getBoundingClientRect(); window.scrollBy(0, initial.top - innerHeight * 0.45); button.focus({ preventScroll: true }); return { top: button.getBoundingClientRect().top, scrollY, viewportHeight: innerHeight }; })()`);
    await wait(250);
    await page.key(scenario.key);
    const positionAfter = await page.evaluate(`(() => { const button = document.querySelector(${JSON.stringify(selector)}); const panel = document.getElementById(button.getAttribute('aria-controls')); const rect = button.getBoundingClientRect(); return { top: rect.top, bottom: rect.bottom, viewportHeight: innerHeight, focus: document.activeElement === button, expanded: button.getAttribute('aria-expanded'), visiblePanels: document.querySelectorAll('.reference-accordion__panel:not([hidden])').length, panelBelow: panel.getBoundingClientRect().top >= rect.bottom - 1 }; })()`);
    const displacement = positionAfter.top - positionBefore.top;
    assert.ok(positionAfter.top >= 0 && positionAfter.bottom <= positionAfter.viewportHeight * 0.8 && Math.abs(displacement) <= positionAfter.viewportHeight * 0.4, `${scenario.query}${scenario.hash} : déclencheur conservé dans la zone de lecture, déplacement=${displacement.toFixed(2)}px`);
    assert.equal(positionAfter.focus, true, `${scenario.query}${scenario.hash} : focus conservé`);
    assert.equal(positionAfter.expanded, "true", `${scenario.query}${scenario.hash} : accordéon activé`);
    assert.equal(positionAfter.visiblePanels, 1, `${scenario.query}${scenario.hash} : exclusivité conservée`);
    assert.equal(positionAfter.panelBelow, true, `${scenario.query}${scenario.hash} : contenu sous le déclencheur`);
    await page.call("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
  }

  for (const [width, scale] of [[320, 1], [360, 1], [390, 1], [720, 2], [360, 4]]) {
    await page.viewport(width, 900);
    await page.call("Emulation.setPageScaleFactor", { pageScaleFactor: scale });
    await page.navigate(urlFor(baseUrl, "#/reperes/r3"));
    await pageAudit(page, `Repères ${width}px zoom ${scale * 100}%`);
    assert.equal(await page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1"), true, "aucun débordement Repères");
    await page.call("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
  }
  await page.viewport(1280);
  await page.navigate(urlFor(baseUrl, "#/reperes", "?context=elea"));
  assert.equal(await page.evaluate("Boolean(document.querySelector('.public-nav'))"), false, "Repères Éléa : chrome allégé");
  await pageAudit(page, "Repères Éléa", { expectedH1: "Repères" });
  await axAudit(page, "Repères");
}

async function gameAudit(page, baseUrl) {
  await page.viewport(1280);
  await page.navigate(urlFor(baseUrl, "#/"));
  const home = await page.evaluate(`(() => ({ brand: document.querySelector('.public-brand')?.textContent.trim(), h1: document.querySelector('h1')?.textContent.trim(), action: document.querySelector('.home-primary-link')?.textContent.trim(), cards: document.querySelectorAll('.public-card').length }))()`);
  assert.deepEqual(home, { brand: "Parcours LGBTI+", h1: "La marche des privilèges", action: "Commencer une partie", cards: 0 }, "nouvel accueil Jouer sans grille redondante");
  await page.focusAndActivate(".home-primary-link", "Enter");
  await page.waitFor("document.querySelector('h1')?.textContent.includes('Préparer votre partie')", "préparation unique");
  assert.equal(await page.evaluate("document.activeElement === document.getElementById('main-content') || document.activeElement === document.querySelector('main h1')"), true, "focus logique sur la préparation");
  const preparation = await page.evaluate(`(() => ({ modes: document.querySelectorAll('input[name=game-mode]').length, selectedModes: document.querySelectorAll('input[name=game-mode]:checked').length, selectedMode: document.querySelector('input[name=game-mode]:checked')?.value, available: [...document.querySelectorAll('main *')].filter((node) => node.children.length === 0 && node.textContent.trim() === 'Disponible').length, characters: document.querySelectorAll('input[name=game-character]').length, startDisabled: document.querySelector('.game-preparation__action button').disabled }))()`);
  assert.equal(preparation.modes, 5, "cinq modes de jeu");
  assert.equal(preparation.selectedModes, 1, "un mode sélectionné");
  assert.equal(preparation.selectedMode, "discovery", "Découverte sélectionné par défaut");
  assert.equal(preparation.available, 0, "aucun badge Disponible inutile");
  assert.ok(preparation.characters > 0, "personnages proposés sur la même page");
  assert.equal(preparation.startDisabled, true, "démarrage désactivé avant choix du personnage");
  await page.evaluate("document.querySelector('input[name=game-character]').click()");
  await page.waitFor("document.querySelectorAll('input[name=game-character]:checked').length === 1 && Boolean(document.querySelector('.game-preparation__selected-character'))", "sélection du personnage dans la préparation");
  assert.equal(await page.evaluate("document.querySelector('.game-preparation__action button').disabled"), false, "démarrage activé après sélection");
  const selectedProfile = await page.evaluate(`(() => ({ heading: document.querySelector('.game-preparation__selected-character h3')?.textContent.trim(), portrait: Boolean(document.querySelector('.game-preparation__selected-character img[alt]')), name: document.querySelector('.game-preparation__selected-name')?.textContent.trim(), description: document.querySelector('.game-preparation__selected-character > p')?.textContent.trim(), tags: document.querySelectorAll('.game-preparation__selected-character .character-markers li').length, link: document.querySelector('.game-preparation__selected-character a')?.getAttribute('href'), technical: /\\b(?:P|XP)\\d{2}\\b/.test(document.querySelector('.game-preparation__selected-character').innerText) }))()`);
  assert.equal(selectedProfile.heading, "Personnage sélectionné", "panneau du personnage sélectionné");
  assert.equal(selectedProfile.portrait, true, "portrait du personnage sélectionné");
  assert.ok(selectedProfile.name && selectedProfile.description && selectedProfile.tags >= 2, "informations publiques du personnage sélectionné");
  assert.match(selectedProfile.link, /^#\/personnages\/(?:p|xp)\d{2}$/u, "lien vers la biographie complète");
  assert.equal(selectedProfile.technical, false, "aucun identifiant technique dans le panneau");
  const selectedModeBeforeBiography = await page.evaluate("document.querySelector('input[name=game-mode]:checked').value");
  await page.focusAndActivate(".game-preparation__selected-character a", "Enter");
  await page.waitFor("location.hash.startsWith('#/personnages/')", "biographie depuis la préparation");
  await page.evaluate("history.back()");
  await page.waitFor("location.hash === '#/jouer' && Boolean(document.querySelector('.game-preparation__selected-character'))", "retour à la préparation");
  assert.equal(await page.evaluate("document.querySelector('input[name=game-mode]:checked').value"), selectedModeBeforeBiography, "mode conservé après retour navigateur");
  assert.equal(await page.evaluate("document.querySelectorAll('input[name=game-character]:checked').length"), 1, "personnage conservé après retour navigateur");
  await page.focusAndActivate(".game-preparation__action button", "Enter");
  await page.waitFor("Boolean(document.querySelector('.situation-card'))", "première situation Jouer");
  assert.equal(await page.evaluate("document.activeElement === document.querySelector('.situation-card h2')"), true, "focus sur la première situation Jouer");
  const statuses = new Set();
  for (let index = 0; index < 10; index += 1) {
    const question = await page.evaluate(`(() => { const buttons = [...document.querySelectorAll('.game-decision-options button')]; const help = document.querySelector('.game-movement-help-button'); const helpStyle = getComputedStyle(help); return { prompt: document.querySelector('#game-decision-question')?.textContent.trim(), yes: buttons[0]?.textContent.trim(), no: buttons[1]?.textContent.trim(), helpHidden: document.querySelector('#game-movement-help')?.hidden, helpName: help?.getAttribute('aria-label'), heights: buttons.map((button) => button.getBoundingClientRect().height), backgrounds: buttons.map((button) => getComputedStyle(button).backgroundColor), borders: buttons.map((button) => getComputedStyle(button).borderTopWidth), borderColors: buttons.map((button) => getComputedStyle(button).borderTopColor), colors: buttons.map((button) => getComputedStyle(button).color), helpStyle: { height: help.getBoundingClientRect().height, background: helpStyle.backgroundColor, border: helpStyle.borderTopColor, color: helpStyle.color } }; })()`);
    assert.match(question.prompt, /^Pour .+, cette situation constitue-t-elle un obstacle\s?\?$/u, `question explicite ${index + 1}`);
    assert.match(question.yes, /^Oui — .+ reste sur place$/u, `option Oui ${index + 1}`);
    assert.match(question.no, /^Non — .+ avance$/u, `option Non ${index + 1}`);
    assert.equal(question.helpHidden, true, `aide discrète et fermée ${index + 1}`);
    assert.equal(question.helpName, "Comprendre ce que signifie avancer ou rester sur place", `nom accessible de l’aide ${index + 1}`);
    assert.ok(question.heights.every((height) => height >= 44) && question.borders.every((width) => width !== "0px"), `vrais boutons tactiles ${index + 1}`);
    assert.equal(question.backgrounds[0], question.backgrounds[1], `traitement neutre identique ${index + 1}`);
    assert.equal(question.colors[0], question.colors[1], `aucune réponse anticipée ${index + 1}`);
    assert.ok(question.colors.every((color, buttonIndex) => colorContrast(color, question.backgrounds[buttonIndex]) >= 4.5), `contraste du texte des réponses ${index + 1}`);
    assert.ok(question.borderColors.every((color, buttonIndex) => colorContrast(color, question.backgrounds[buttonIndex]) >= 4.77), `contraste des bordures des réponses ${index + 1}`);
    assert.ok(question.helpStyle.height >= 44 && colorContrast(question.helpStyle.color, question.helpStyle.background) >= 4.5 && colorContrast(question.helpStyle.border, question.helpStyle.background) >= 4.77, `cible et contrastes de l’aide ${index + 1}`);
    if (index === 0) {
      const helpBefore = await page.evaluate(`(() => { const button = document.querySelector('.game-movement-help-button'); button.focus({ preventScroll: true }); const rect = button.getBoundingClientRect(); return { top: rect.top, scrollY }; })()`);
      await page.evaluate("document.querySelector('.game-movement-help-button').click()");
      const helpAfterClick = await page.evaluate(`(() => { const button = document.querySelector('.game-movement-help-button'); const panel = document.querySelector('#game-movement-help'); return { expanded: button.getAttribute('aria-expanded'), text: panel.textContent.trim(), hidden: panel.hidden, top: button.getBoundingClientRect().top, scrollY }; })()`);
      assert.equal(helpAfterClick.expanded, "true", "aide ouverte au clic/tap");
      assert.equal(helpAfterClick.text, "Avancer signifie que cette situation ne réduit pas la marge de manœuvre du personnage. Rester sur place signifie qu’elle constitue ici un obstacle.", "contenu exact de l’aide");
      assert.equal(helpAfterClick.hidden, false, "popover d’aide visible");
      assert.ok(Math.abs(helpAfterClick.top - helpBefore.top) <= 1 && helpAfterClick.scrollY === helpBefore.scrollY, "aide sans saut de scroll");
      await page.key("Escape");
      assert.equal(await page.evaluate("document.querySelector('#game-movement-help').hidden && document.activeElement === document.querySelector('.game-movement-help-button')"), true, "aide fermée avec Échap et focus restauré");
      await page.key(" ");
      assert.equal(await page.evaluate("document.querySelector('.game-movement-help-button').getAttribute('aria-expanded')"), "true", "aide ouverte au clavier");
      await page.key("Escape");
    }
    await page.focusAndActivate(`.game-decision-options button:nth-child(${index % 2 === 0 ? 1 : 2})`, "Enter");
    await page.waitFor("Boolean(document.querySelector('section[aria-live=polite]'))", `feedback Jouer ${index + 1}`);
    const feedbackFocus = await page.evaluate(`(() => ({ matches: document.activeElement === document.querySelector("section[aria-live='polite'] h2"), active: document.activeElement?.outerHTML?.slice(0, 240), headings: [...document.querySelectorAll("section[aria-live='polite'] h2")].map((heading) => heading.outerHTML.slice(0, 240)) }))()`);
    assert.equal(feedbackFocus.matches, true, `focus sur le feedback Jouer ${index + 1} : ${JSON.stringify(feedbackFocus)}`);
    const feedback = await page.evaluate(`(() => { const next = document.querySelector('.game-feedback__next button'); const details = document.querySelector('.game-feedback__details h3 button'); const status = document.querySelector('.interpretation-status strong')?.textContent.trim(); return { status, action: next?.textContent.trim(), actionBeforeDetails: Boolean(next && details && (next.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING)), detailsExpanded: details?.getAttribute('aria-expanded') }; })()`);
    statuses.add(feedback.status);
    assert.equal(feedback.action, index === 9 ? "Voir le bilan" : "Situation suivante", `action de progression ${index + 1}`);
    assert.equal(feedback.actionBeforeDetails, true, `action avant l’analyse détaillée ${index + 1}`);
    assert.equal(feedback.detailsExpanded, "false", `analyse fermée par défaut ${index + 1}`);
    if (index === 0) {
      const before = await page.evaluate(`(() => { const button = document.querySelector('.game-feedback__details h3 button'); button.focus({ preventScroll: true }); const rect = button.getBoundingClientRect(); return { top: rect.top, scrollY }; })()`);
      await page.key(" ");
      const after = await page.evaluate(`(() => { const button = document.activeElement; return { expanded: button.getAttribute('aria-expanded'), focus: button.matches('.game-feedback__details h3 button'), top: button.getBoundingClientRect().top, scrollY, visible: !document.querySelector('.game-feedback__details-panel').hidden }; })()`);
      assert.equal(after.expanded, "true", "Comprendre ouvert au clavier");
      assert.equal(after.focus, true, "focus conservé sur Comprendre");
      assert.ok(Math.abs(after.top - before.top) <= 1 && after.scrollY === before.scrollY, "aucun saut de scroll sur Comprendre");
    }
    await page.focusAndActivate(".game-feedback__next button", "Enter");
    if (index < 9) {
      await page.waitFor(`document.querySelector('.situation-panel')?.innerText.includes('Situation ${index + 2} / 10')`, `situation Jouer ${index + 2}`);
      assert.equal(await page.evaluate("document.activeElement === document.querySelector('.situation-card h2')"), true, `focus sur la situation Jouer ${index + 2}`);
    }
  }
  await page.waitFor("document.querySelector('h1')?.textContent.includes('Bilan de votre parcours')", "bilan Jouer");
  assert.equal(await page.evaluate("document.activeElement === document.querySelector('main h1')"), true, "focus sur le bilan Jouer");
  assert.equal(await page.evaluate("document.querySelectorAll('.summary-detail').length"), 10, "10 réponses au bilan Jouer");
  assert.equal(await page.evaluate("document.querySelectorAll('.game-journey__step').length"), 10, "parcours numéroté de 10 étapes");
  assert.equal(await page.evaluate("[...document.querySelectorAll('.summary-detail button[aria-expanded]')].every((button) => button.getAttribute('aria-expanded') === 'false')"), true, "dix réponses fermées par défaut");
  assert.equal(await page.evaluate("document.querySelector('main').innerText.includes('Revoir mes réponses')"), false, "Revoir mes réponses absent");
  assert.ok(statuses.has("Lecture concordante") && statuses.has("Lecture différente"), `concordance et différence rencontrées : ${[...statuses].join(', ')}`);
  await page.focusAndActivate(".game-journey__step:nth-child(3)", "Enter");
  assert.equal(await page.evaluate("document.querySelector('.game-journey__step:nth-child(3)').getAttribute('aria-pressed')"), "true", "sélection d’une étape du parcours");
  assert.match(await page.evaluate("document.querySelector('.game-step-detail h3').textContent.trim()"), /^Situation 3 — /u, "détail de l’étape sélectionnée");
  await page.focusAndActivate(".summary-detail:nth-child(1) h3 button", "Enter");
  await page.focusAndActivate(".summary-detail:nth-child(2) h3 button", "Enter");
  assert.deepEqual(await page.evaluate("[...document.querySelectorAll('.summary-detail button[aria-expanded]')].slice(0, 2).map((button) => button.getAttribute('aria-expanded'))"), ["false", "true"], "récapitulatif exclusif");
  const columns = await page.evaluate("getComputedStyle(document.querySelector('.game-summary__overview')).gridTemplateColumns.split(' ').length");
  assert.ok(columns >= 2, "bilan en deux colonnes sur desktop");
  for (const width of [720, 360]) {
    await page.viewport(width, 900);
    await pageAudit(page, `bilan Jouer reflow ${width}px`);
  }
  await page.viewport(1280);
}

async function deepLinksAndElea(page, baseUrl) {
  const normalizations = [
    ["#/personnages/P01", "#/personnages/p01"],
    ["#/situations/x01", "#/situations/X01"],
    ["#/reperes/R1", "#/reperes/r1"],
    ["#/mots-utiles/MU-ORI", "#/mots-utiles/mu-ori"],
  ];
  for (const [input, output] of normalizations) {
    await page.navigate(urlFor(baseUrl, input));
    await page.waitFor(`location.hash === ${JSON.stringify(output)}`, `normalisation ${input}`);
  }
  await page.navigate(urlFor(baseUrl, "#/inconnue"));
  await pageAudit(page, "route inconnue", { expectedH1: "Page introuvable" });

  for (const hash of ["#/personnages", "#/jouer", "#/situations/X01", "#/situations/X13", "#/reperes"]) {
    await page.navigate(urlFor(baseUrl, hash, "?context=elea"));
    assert.equal(await page.evaluate("Boolean(document.querySelector('.public-nav'))"), false, `${hash} Éléa : navigation allégée`);
    assert.equal(await page.evaluate("document.querySelector('.public-footer')?.textContent.trim()"), "Parcours LGBTI+", `${hash} Éléa : footer allégé`);
  }
  for (const query of ["?context=test", "?context=ELEA"]) {
    await page.navigate(urlFor(baseUrl, "#/personnages", query));
    assert.equal(await page.evaluate("Boolean(document.querySelector('.public-nav'))"), true, `${query} reste normal`);
  }
}

async function focusVisibilityAudit(page, baseUrl) {
  await page.viewport(1280);
  const cases = [
    ["#/", ".home-primary-link"],
    ["#/personnages", ".explorer-character-card__link"],
    ["#/personnages/p01", ".biography-tabs__list button"],
    ["#/personnages/p01", ".biography-subsection h2 button"],
    ["#/situations", ".public-situation-filters select"],
    ["#/situations/V03", ".public-situation-tabs button"],
    ["#/situations/V03", ".public-disclosure-heading button"],
    ["#/reperes", ".reference-accordion > h2 button"],
    ["#/personnages/quiz", ".quiz-page button"],
  ];
  for (const [hash, selector] of cases) {
    await page.navigate(urlFor(baseUrl, hash));
    await page.key("Tab");
    const visible = await page.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); element.focus(); const style = getComputedStyle(element); return { focused: document.activeElement === element, focusVisible: element.matches(":focus-visible"), outline: style.outlineStyle, outlineWidth: style.outlineWidth, boxShadow: style.boxShadow }; })()`);
    assert.equal(visible.focused, true, `${hash} : focus atteint`);
    assert.equal(visible.focusVisible, true, `${hash} : modalité clavier reconnue`);
    assert.ok((visible.outline !== "none" && visible.outlineWidth !== "0px") || visible.boxShadow !== "none", `${hash} : focus visible sur ${selector} ${JSON.stringify(visible)}`);
  }
}

async function sourceRecipe(page, baseUrl) {
  if (process.env.RECIPE_SECTION === "keyboard") { await navigationAndKeyboard(page, baseUrl); return { section: "keyboard" }; }
  if (process.env.RECIPE_SECTION === "contrast") { return { section: "contrast", contrast: await contrastAndTargetsAudit(page, baseUrl) }; }
  if (process.env.RECIPE_SECTION === "focus") { await focusVisibilityAudit(page, baseUrl); return { section: "focus" }; }
  if (process.env.RECIPE_SECTION === "accordions" || process.env.RECIPE_SECTION === "tabs") { await biographyTabsAudit(page, baseUrl); return { section: "tabs" }; }
  if (process.env.RECIPE_SECTION === "situations") { await situationsUiAudit(page, baseUrl); return { section: "situations" }; }
  if (process.env.RECIPE_SECTION === "reperes") { await reperesAudit(page, baseUrl); return { section: "reperes" }; }
  if (process.env.RECIPE_SECTION === "quizzes") { await characterQuizAudit(page, baseUrl); await situationQuizAudit(page, baseUrl); return { section: "quizzes" }; }
  if (process.env.RECIPE_SECTION === "game") { await gameAudit(page, baseUrl); return { section: "game" }; }
  const routeCount = await exhaustiveRoutes(page, baseUrl);
  console.log(`Routes publiques contrôlées : ${routeCount}`);
  await navigationAndKeyboard(page, baseUrl);
  const responsiveChecks = await responsiveAudit(page, baseUrl);
  console.log(`Contrôles responsive : ${responsiveChecks}`);
  const zoom = await zoomAudit(page, baseUrl);
  console.log(`Zooms contrôlés : ${zoom.map(({ scale }) => `${scale * 100}%`).join(", ")}`);
  await reducedMotionAudit(page, baseUrl);
  const contrast = await contrastAndTargetsAudit(page, baseUrl);
  console.log(`Contraste minimal échantillonné : ${contrast.minimumRatio.toFixed(2)}:1`);
  await focusVisibilityAudit(page, baseUrl);
  await biographyTabsAudit(page, baseUrl);
  console.log("Clavier, focus et onglets Personnages contrôlés");
  await situationsUiAudit(page, baseUrl);
  console.log("Galerie, focales et fiches Situations contrôlées");
  await reperesAudit(page, baseUrl);
  console.log("Repères compacts, routes historiques et disclosures contrôlés");
  await characterQuizAudit(page, baseUrl);
  await situationQuizAudit(page, baseUrl);
  console.log("Quiz Personnages et Situations contrôlés");
  await gameAudit(page, baseUrl);
  console.log("Partie Jouer complète contrôlée");
  await deepLinksAndElea(page, baseUrl);
  await filtersHistoryAndContextLinksAudit(page, baseUrl);
  for (const hash of ["#/", "#/personnages/p01", "#/situations/X13", "#/personnages/quiz", "#/situations/quiz"]) {
    await page.navigate(urlFor(baseUrl, hash));
    await axAudit(page, hash);
  }
  return { routeCount, responsiveChecks, zoom, contrast };
}

async function distRecipe(page, baseUrl) {
  for (const [hash, h1] of [["#/", "La marche des privilèges"], ["#/jouer", "Préparer votre partie"], ["#/personnages/p01", "Noé"], ["#/situations/X01", "La chambre accessible"], ["#/reperes", "Repères"], ["#/reperes/r1", "Repères"], ["#/reperes/r3", "Repères"], ["#/mots-utiles/mu-ori", "Orientation sexuelle"]]) {
    await page.navigate(urlFor(baseUrl, hash));
    await pageAudit(page, `dist ${hash}`, { expectedH1: h1 });
  }
  await page.navigate(urlFor(baseUrl, "#/situations/X13", "?context=elea"));
  assert.equal(await page.evaluate("Boolean(document.querySelector('.public-nav'))"), false, "dist Éléa");
  await page.navigate(urlFor(baseUrl, "#/reperes", "?context=elea"));
  assert.equal(await page.evaluate("Boolean(document.querySelector('.public-nav'))"), false, "dist Repères Éléa");
  const resources = await page.evaluate("performance.getEntriesByType('resource').map((entry) => entry.name)");
  assert.ok(resources.every((resource) => resource.startsWith(baseUrl) || resource.startsWith("blob:")), "assets sous /mosaique/");
  assert.ok(resources.every((resource) => !resource.includes("/home/")), "aucun chemin local dans les ressources");
  return { smokeRoutes: 9, resources: resources.length };
}

const server = DIST_MODE
  ? await preview({ root: ROOT, logLevel: "silent", preview: { host: "127.0.0.1", port: 0 } })
  : await createServer({ root: ROOT, logLevel: "silent", server: { host: "127.0.0.1", port: 0 } });
let browser;
let page;

try {
  if (!DIST_MODE) await server.listen();
  const baseUrl = server.resolvedUrls.local[0];
  assert.equal(new URL(baseUrl).pathname, "/mosaique/", "base de production /mosaique/");
  browser = await launchChrome();
  const target = await (await fetch(`http://127.0.0.1:${browser.port}/json/new?${encodeURIComponent(baseUrl)}`, { method: "PUT" })).json();
  page = await CdpPage.open(target.webSocketDebuggerUrl);
  await page.call("Runtime.enable");
  await page.call("Page.enable");
  await page.call("Accessibility.enable");
  await page.viewport(1280);
  const result = DIST_MODE ? await distRecipe(page, baseUrl) : await sourceRecipe(page, baseUrl);
  console.log(`${DIST_MODE ? "Smoke GitHub Pages" : "Recette Chrome 8G"} conforme : ${JSON.stringify(result)}`);
} finally {
  page?.close();
  await browser?.close();
  await server.close();
}
