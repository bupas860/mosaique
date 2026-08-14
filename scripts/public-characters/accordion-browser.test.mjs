import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "vite";

const ROOT = new URL("../..", import.meta.url).pathname;
const TOLERANCE = 1;
const measurements = [];

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function launchChrome() {
  const profile = mkdtempSync(join(tmpdir(), "mosaique-accordion-chrome-"));
  const chrome = spawn(process.env.CHROME_BIN || "google-chrome", [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "about:blank",
  ], { stdio: ["ignore", "ignore", "pipe"] });

  const websocketUrl = await new Promise((resolve, reject) => {
    let stderr = "";
    const timeout = setTimeout(() => reject(new Error(`Chrome ne fournit pas son endpoint DevTools : ${stderr}`)), 10_000);
    chrome.stderr.setEncoding("utf8");
    chrome.stderr.on("data", (chunk) => {
      stderr += chunk;
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (!match) return;
      clearTimeout(timeout);
      resolve(match[1]);
    });
    chrome.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    chrome.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Chrome s'est arrêté avant le test (code ${code}).`));
    });
  });

  return {
    chrome,
    profile,
    port: new URL(websocketUrl).port,
    async close() {
      if (chrome.exitCode === null) {
        chrome.kill("SIGTERM");
        await Promise.race([
          new Promise((resolve) => chrome.once("exit", resolve)),
          wait(2_000),
        ]);
      }
      rmSync(profile, { recursive: true, force: true });
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
    await new Promise((resolve, reject) => {
      websocket.onopen = resolve;
      websocket.onerror = reject;
    });
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
    if (response.result.exceptionDetails) throw new Error(response.result.exceptionDetails.text);
    return response.result.result.value;
  }

  close() {
    this.websocket.close();
  }
}

function geometryExpression(id) {
  return `(() => {
    const trigger = document.querySelector("#biography-button-${id}");
    const panel = document.querySelector("#biography-panel-${id}");
    const heading = trigger.parentElement;
    return {
      trigger: trigger.getBoundingClientRect().toJSON(),
      panel: panel.getBoundingClientRect().toJSON(),
      expanded: trigger.getAttribute("aria-expanded"),
      controls: trigger.getAttribute("aria-controls"),
      focused: document.activeElement === trigger,
      panelFollowsTrigger: Boolean(trigger.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING),
      panelImmediatelyFollowsHeading: heading.nextElementSibling === panel,
      scrollY,
    };
  })()`;
}

async function centerTrigger(page, id) {
  await page.evaluate(`(() => {
    const trigger = document.querySelector("#biography-button-${id}");
    const rect = trigger.getBoundingClientRect();
    scrollBy(0, rect.top - ((innerHeight - rect.height) / 2));
  })()`);
  await wait(50);
  return page.evaluate(geometryExpression(id));
}

async function mouseActivate(page, rect) {
  const params = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, button: "left", clickCount: 1 };
  await page.call("Input.dispatchMouseEvent", { ...params, type: "mousePressed" });
  await page.call("Input.dispatchMouseEvent", { ...params, type: "mouseReleased" });
}

async function keyboardActivate(page, key) {
  const code = key === "Enter" ? "Enter" : "Space";
  const windowsVirtualKeyCode = key === "Enter" ? 13 : 32;
  const text = key === "Enter" ? "\r" : " ";
  await page.call("Input.dispatchKeyEvent", { type: "keyDown", key, code, text, unmodifiedText: text, windowsVirtualKeyCode, nativeVirtualKeyCode: windowsVirtualKeyCode });
  await page.call("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode });
}

function assertOpened(before, after, label) {
  assert.equal(after.expanded, "true", `${label} : aria-expanded doit annoncer l'ouverture`);
  assert.equal(after.controls, `biography-panel-${label.split("/").at(-1)}`, `${label} : aria-controls doit cibler le panneau`);
  assert.equal(after.focused, true, `${label} : le focus doit rester sur le déclencheur`);
  assert.equal(after.panelFollowsTrigger, true, `${label} : le panneau doit suivre le bouton dans le DOM`);
  assert.equal(after.panelImmediatelyFollowsHeading, true, `${label} : le panneau doit suivre immédiatement le titre contenant le bouton`);
  assert.ok(after.panel.top >= after.trigger.bottom - TOLERANCE, `${label} : panneau ${after.panel.top}px au-dessus du bas du bouton ${after.trigger.bottom}px`);
  assert.ok(Math.abs(after.trigger.top - before.trigger.top) <= TOLERANCE, `${label} : le bouton s'est déplacé verticalement de ${after.trigger.top - before.trigger.top}px`);
  measurements.push({ label, gap: after.panel.top - after.trigger.bottom, triggerShift: after.trigger.top - before.trigger.top });
}

async function openWithMouse(page, id, label) {
  const before = await centerTrigger(page, id);
  await mouseActivate(page, before.trigger);
  await wait(100);
  const after = await page.evaluate(geometryExpression(id));
  assertOpened(before, after, `${label}/${id}`);
  return after;
}

async function closeWithMouse(page, id) {
  const before = await centerTrigger(page, id);
  await mouseActivate(page, before.trigger);
  await wait(100);
  assert.equal((await page.evaluate(geometryExpression(id))).expanded, "false", `${id} : la fermeture doit fonctionner`);
}

async function openWithKeyboard(page, id, key, label) {
  const before = await centerTrigger(page, id);
  await page.evaluate(`document.querySelector("#biography-button-${id}").focus({ preventScroll: true })`);
  await keyboardActivate(page, key);
  await wait(100);
  const after = await page.evaluate(geometryExpression(id));
  assertOpened(before, after, `${label}/${id}`);
}

const vite = await createServer({ root: ROOT, logLevel: "silent", server: { host: "127.0.0.1", port: 0 } });
let browser;
let page;

try {
  await vite.listen();
  browser = await launchChrome();
  const target = await (await fetch(`http://127.0.0.1:${browser.port}/json/new?${encodeURIComponent(`${vite.resolvedUrls.local[0]}#/personnages/p01`)}`, { method: "PUT" })).json();
  page = await CdpPage.open(target.webSocketDebuggerUrl);
  await page.call("Runtime.enable");
  await page.call("Page.enable");

  await page.call("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await page.evaluate("Boolean(document.querySelector('#biography-button-journey'))")) break;
    await wait(50);
  }

  await openWithMouse(page, "journey", "desktop-souris");
  await closeWithMouse(page, "journey");
  await openWithMouse(page, "journey", "desktop-réouverture");
  await openWithKeyboard(page, "privacy", "Enter", "desktop-clavier-Entrée");
  await openWithKeyboard(page, "school", " ", "desktop-clavier-Espace");

  await closeWithMouse(page, "journey");
  await closeWithMouse(page, "privacy");
  await page.call("Emulation.setDeviceMetricsOverride", { width: 320, height: 800, deviceScaleFactor: 1, mobile: true });
  await wait(100);
  await openWithMouse(page, "journey", "mobile-320px");
  await openWithKeyboard(page, "privacy", "Enter", "mobile-320px-clavier");

  const minimumGap = Math.min(...measurements.map(({ gap }) => gap));
  const maximumTriggerShift = Math.max(...measurements.map(({ triggerShift }) => Math.abs(triggerShift)));
  console.log(`Accordéons Personnages conformes : ordre DOM et géométrique (écart minimal ${minimumGap}px), stabilité du bouton (déplacement maximal ${maximumTriggerShift}px), souris, Entrée, Espace, réouverture et largeur 320 px.`);
} finally {
  page?.close();
  await browser?.close();
  await vite.close();
}
