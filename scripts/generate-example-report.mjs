/**
 * Generates a live example report by calling the local runner.
 * The runner must already be running (npm run dev:runner).
 *
 * Usage:
 *   npm run demo:example-report
 *   npm run demo:example-report -- --url https://www.youtube.com/shorts/GVMFbFAsdwE
 */
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportsRoot = path.join(rootDir, "demo", "example-reports");

// --- Config (override via env or CLI args) ---
const RUNNER_URL = process.env.RUNNER_URL ?? "http://localhost:8787";
const RUNNER_TOKEN = process.env.RUNNER_TOKEN ?? "";
const DEFAULT_URL = "https://www.youtube.com/shorts/GVMFbFAsdwE";
const DEFAULT_PROMPT = "Start a fun DM thread about this video. React to it, share another one back.";

// Parse --url and --prompt from CLI args
const args = process.argv.slice(2);
const urlArg = args[args.indexOf("--url") + 1];
const promptArg = args[args.indexOf("--prompt") + 1];
const shortUrl = urlArg ?? DEFAULT_URL;
const judgeMessage = promptArg ?? DEFAULT_PROMPT;

// --- Find next run number ---
await mkdir(reportsRoot, { recursive: true });
const existing = await readdir(reportsRoot).catch(() => []);
const runNumbers = existing
  .map((name) => name.match(/^run-(\d+)$/)?.[1])
  .filter(Boolean)
  .map(Number);
const nextRun = runNumbers.length > 0 ? Math.max(...runNumbers) + 1 : 1;
const runLabel = `run-${String(nextRun).padStart(3, "0")}`;
const outDir = path.join(reportsRoot, runLabel);
await mkdir(outDir, { recursive: true });

// --- Call the runner ---
console.log(`\nCalling runner at ${RUNNER_URL} ...`);
console.log(`  Short URL:  ${shortUrl}`);
console.log(`  Prompt:     ${judgeMessage}\n`);

let runResult;
try {
  const res = await fetch(`${RUNNER_URL}/run`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(RUNNER_TOKEN ? { "X-Runner-Token": RUNNER_TOKEN } : {}),
    },
    body: JSON.stringify({ shortUrl, judgeMessage, turns: 8 }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Runner returned ${res.status}: ${body}`);
  }

  runResult = await res.json();
} catch (err) {
  console.error(`\n✗ Could not reach runner: ${err.message}`);
  console.error(`  Make sure the runner is running: npm run dev:runner`);
  process.exit(1);
}

// --- Fetch the report HTML and save locally ---
const reportFetchUrl = `${RUNNER_URL}${runResult.reportUrl}`;
const reportRes = await fetch(reportFetchUrl, {
  headers: RUNNER_TOKEN ? { "X-Runner-Token": RUNNER_TOKEN } : {},
});

if (!reportRes.ok) {
  console.error(`✗ Could not fetch report HTML from ${reportFetchUrl}`);
  process.exit(1);
}

const html = await reportRes.text();
const indexPath = path.join(outDir, "index.html");
await writeFile(indexPath, html, "utf8");

// --- Print history ---
const allRuns = (await readdir(reportsRoot))
  .filter((name) => /^run-\d+$/.test(name))
  .sort();

console.log(`✓ Report saved: ${runLabel}/index.html`);
if (runResult.personas) {
  console.log(`  Personas: ${runResult.personas.A.name} vs ${runResult.personas.B.name}`);
}
console.log(`\n  open "${indexPath}"\n`);
console.log(`History (${allRuns.length} run${allRuns.length === 1 ? "" : "s"}):`);
for (const run of allRuns) {
  console.log(`  ${run}${run === runLabel ? " ← latest" : ""}`);
}
