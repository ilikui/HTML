import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd(), "projects/study-manager");
const htmlPath = resolve(root, "index.html");
const cssPath = resolve(root, "styles.css");
const jsPath = resolve(root, "app.js");

for (const path of [htmlPath, cssPath, jsPath]) {
  assert.ok(existsSync(path), `Required project file is missing: ${path}`);
}

const html = readFileSync(htmlPath, "utf8");
const css = readFileSync(cssPath, "utf8");
const js = readFileSync(jsPath, "utf8");

assert.match(html, /href="styles\.css"/, "HTML must load styles.css");
assert.match(html, /src="app\.js"/, "HTML must load app.js");
assert.doesNotMatch(html, /<style(?:\s[^>]*)?>/i, "CSS should stay in styles.css");
assert.doesNotMatch(html, /<script(?:\s[^>]*)?>[\s\S]*?function todayLocal/i, "Application logic should stay in app.js");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(ids.length, new Set(ids).size, "HTML IDs must be unique");

for (const id of [
  "record-form", "record-list", "weekly-chart", "category-chart",
  "goal-form", "weekly-goal", "current-streak", "longest-streak",
  "topic-export-select", "export-topic-btn"
]) {
  assert.ok(ids.includes(id), `Expected interface element #${id}`);
}

for (const feature of [
  "function renderAnalytics()", "function renderGoalAndStreak()",
  "function renderTopicExportOptions()", "function exportTopicMarkdown()",
  'localStorage.setItem(GOAL_KEY'
]) {
  assert.ok(js.includes(feature), `Expected application feature: ${feature}`);
}

assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length,
  "CSS opening and closing brace counts must match");
assert.match(css, /@media\s*\(max-width:\s*780px\)/, "Responsive layout rules should exist");

console.log("Study Manager static checks passed.");
