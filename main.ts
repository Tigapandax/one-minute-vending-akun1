// One Line, One Minute: The Vending Machine Pickup Line Contest
// Program: reads the single pickup line from one-line.txt, checks it
// against the contest gate (1-200 chars, one line, clean edges),
// prints it, and stores a copy at /output/entry.txt for the sealed
// scorer, which only ever reads that file.
//
// Runs on Node 22 with the standard library only. No network access.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(HERE, "one-line.txt");
const LIMIT = 200;

// Each rule: a human-readable label plus a predicate over the line.
const RULES = [
  { label: "text is present", passes: (t) => t.length > 0 },
  { label: "text fits the 200-character cap", passes: (t) => t.length <= LIMIT },
  { label: "text stays on one line", passes: (t) => !t.includes("\n") },
  { label: "no carriage returns", passes: (t) => !t.includes("\r") },
  { label: "no leading blank space", passes: (t) => !t.startsWith(" ") },
  { label: "no trailing blank space", passes: (t) => !t.endsWith(" ") },
  { label: "no invisible control characters", passes: (t) => !/[\u0000-\u001F\u007F]/.test(t) },
  { label: "ends with a closing mark", passes: (t) => /[.!?]$/.test(t) },
  { label: "at least three words", passes: (t) => t.trim().split(/\s+/).length >= 3 },
  { label: "mentions the machine's world (coil, slot, button, snack, change, hum)", passes: (t) => /coil|slot|button|snack|change|hum/i.test(t) },
];

function loadLine() {
  if (!existsSync(SOURCE)) {
    console.error(`Missing source file: ${SOURCE}`);
    process.exit(1);
  }
  const raw = readFileSync(SOURCE, "utf8");
  // one-line.txt ends with a single trailing newline; drop exactly that.
  return raw.endsWith("\n") ? raw.slice(0, -1) : raw;
}

function validate(text) {
  return RULES.filter((rule) => !rule.passes(text)).map((rule) => rule.label);
}

const line = loadLine();
const problems = validate(line);

if (problems.length > 0) {
  for (const problem of problems) console.error(`FAIL: ${problem}`);
  console.error(`Line is ${line.length}/${LIMIT} characters.`);
  process.exit(1);
}

console.log(line);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const entryPath = join(outDir, "entry.txt");
writeFileSync(entryPath, `${line}\n`, "utf8");
console.log(`Saved ${entryPath} (${line.length}/${LIMIT} characters).`);
console.log(`All ${RULES.length} checks passed.`);
