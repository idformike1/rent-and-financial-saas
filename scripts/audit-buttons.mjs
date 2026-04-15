/**
 * AXIOM BUTTON AUDIT SCANNER v1.1
 * Read-only static analysis. No file mutations. Zero external deps.
 *
 * Violation categories:
 *   V1  - Native <button> instead of Axiom <Button>
 *   V2  - <Button> missing explicit type prop
 *   V3  - <Button> missing disabled/pending/isLoading state
 *   V4  - Inline <svg> literal (zero-icon directive)
 *   V4b - Icon library component rendered inside/near button context
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ─── Scan targets (relative to ROOT) ──────────────────────────────────────
const SCAN_DIRS = ["app", "components", "src"];

// ─── Skip these dirs entirely ─────────────────────────────────────────────
const SKIP_DIRS = new Set(["node_modules", ".next", ".npm_cache", ".git", "dist"]);

// ─── Icon library imports we flag ─────────────────────────────────────────
const ICON_LIB_PATTERNS = [
  /from\s+['"]lucide-react['"]/,
  /from\s+['"]react-icons/,
  /from\s+['"]@heroicons/,
  /from\s+['"]@radix-ui\/react-icons['"]/,
  /from\s+['"]phosphor-react['"]/,
  /from\s+['"]@tabler\/icons-react['"]/,
];

// Icon-like component name suffixes
const ICON_NAME_RE =
  /<([A-Z][a-zA-Z]*(Icon|Logo|Arrow|Chevron|Plus|Minus|Trash|Edit|Search|Check|X(?=\s|\/|>)|Eye|Lock|Star|Bell|Home|Settings|User|Chart|Dollar|Calendar|Filter|Sort|Upload|Download|Refresh|Add|Remove|Close|Caret|Dot|Grip))[\s/>]/;

// ─── Recursive file walker ──────────────────────────────────────────────
function walk(dir, results = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name), results);
    } else if (entry.name.endsWith(".tsx")) {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
/**
 * Capture a JSX open tag block that may span multiple lines.
 * Accumulates lines until we see /> or a bare > that ends the tag.
 */
function captureTag(lines, startIndex) {
  let tag = "";
  for (let j = startIndex; j < Math.min(startIndex + 15, lines.length); j++) {
    tag += " " + lines[j];
    const trimmed = lines[j].trim();
    if (trimmed.endsWith("/>")) break;
    // A naked > that isn't part of an arrow function ends the tag
    if (/[^=]>/.test(trimmed) && !trimmed.endsWith("=>")) break;
  }
  return tag;
}

/**
 * Walk backwards ≤60 lines to find the enclosing React function/component name.
 */
function extractComponentName(lines, currentIndex) {
  for (let k = currentIndex; k >= Math.max(0, currentIndex - 60); k--) {
    const m = lines[k].match(/(?:function|const)\s+([A-Z][a-zA-Z0-9_]*)\s*[=(]/);
    if (m) return m[1];
  }
  return "(unknown)";
}

// ─── Per-file analysis ────────────────────────────────────────────────────
function analyzeFile(filePath, content) {
  const lines = content.split("\n");
  const relativePath = path.relative(ROOT, filePath);
  const findings = [];

  // Skip the canonical Button definition itself
  const isButtonDef = relativePath.endsWith("button.tsx");

  const hasIconImport = ICON_LIB_PATTERNS.some((p) => p.test(content));

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    // ── V1: Native <button> ───────────────────────────────────────────
    if (!isButtonDef && /<button[\s>\/]/i.test(trimmed)) {
      findings.push({
        file: relativePath,
        line: lineNum,
        violation: "V1 — Native `<button>` instead of Axiom `<Button>`",
        component: extractComponentName(lines, i),
      });
    }

    // ── V2 & V3: Axiom <Button> checks ───────────────────────────────
    if (!isButtonDef && /<Button[\s>\/]/.test(trimmed)) {
      const fullTag = captureTag(lines, i);

      // V2: missing explicit type
      if (!/\btype\s*=/.test(fullTag)) {
        findings.push({
          file: relativePath,
          line: lineNum,
          violation: "V2 — `<Button>` missing explicit `type` prop",
          component: extractComponentName(lines, i),
        });
      }

      // V3: missing disabled/pending/isLoading/isSubmitting
      const hasState =
        /\bdisabled\b/.test(fullTag) ||
        /\bpending\b/i.test(fullTag) ||
        /\bisLoading\b/i.test(fullTag) ||
        /\bisSubmitting\b/i.test(fullTag) ||
        /\bloading\b/i.test(fullTag);
      if (!hasState) {
        findings.push({
          file: relativePath,
          line: lineNum,
          violation: "V3 — `<Button>` missing disabled/pending/isLoading state",
          component: extractComponentName(lines, i),
        });
      }
    }

    // ── V4: Inline <svg> literal ──────────────────────────────────────
    if (!isButtonDef && /<svg[\s>]/i.test(trimmed)) {
      findings.push({
        file: relativePath,
        line: lineNum,
        violation: "V4 — Inline `<svg>` literal (zero-icon directive violation)",
        component: extractComponentName(lines, i),
      });
    }

    // ── V4b: Icon library usage ───────────────────────────────────────
    if (!isButtonDef && hasIconImport && ICON_NAME_RE.test(trimmed)) {
      findings.push({
        file: relativePath,
        line: lineNum,
        violation: "V4b — Icon library component in use (zero-icon directive)",
        component: extractComponentName(lines, i),
      });
    }
  }

  return findings;
}

// ─── Main ─────────────────────────────────────────────────────────────────
function main() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║       AXIOM BUTTON AUDIT SCANNER — READ ONLY MODE       ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  // Collect all .tsx files
  const allFiles = [];
  for (const dir of SCAN_DIRS) {
    const absDir = path.join(ROOT, dir);
    if (fs.existsSync(absDir)) walk(absDir, allFiles);
  }

  console.log(`  ✦ FILES SCANNED : ${allFiles.length}`);
  console.log(`  ✦ SCAN ROOT     : ${ROOT}\n`);

  const allFindings = [];

  for (const filePath of allFiles) {
    let content;
    try {
      content = fs.readFileSync(filePath, "utf-8");
    } catch {
      continue;
    }
    const findings = analyzeFile(filePath, content);
    allFindings.push(...findings);
  }

  // Deduplicate identical (file, line, violation) triples
  const seen = new Set();
  const deduped = allFindings.filter((f) => {
    const key = `${f.file}||${f.line}||${f.violation}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by file path then line number
  deduped.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

  // Violation breakdown
  const byViolation = {};
  for (const f of deduped) {
    const vtype = f.violation.split("—")[0].trim();
    byViolation[vtype] = (byViolation[vtype] || 0) + 1;
  }

  console.log("  VIOLATION BREAKDOWN:");
  for (const [vt, cnt] of Object.entries(byViolation)) {
    console.log(`    ${vt.padEnd(6)}: ${cnt}`);
  }
  console.log(`\n  ████ TOTAL DUMB BUTTONS DETECTED: ${deduped.length} ████\n`);

  // ── Build Markdown report ──────────────────────────────────────────
  const now = new Date().toISOString();
  let md = `# 🔴 AXIOM BUTTON AUDIT REPORT\n\n`;
  md += `> **Generated:** ${now}  \n`;
  md += `> **Scanner:** \`scripts/audit-buttons.mjs\`  \n`;
  md += `> **Mode:** Read-Only Static Analysis — No mutations  \n`;
  md += `> **Files Scanned:** ${allFiles.length}  \n`;
  md += `> **Total Violations:** **${deduped.length}**  \n\n`;
  md += `---\n\n`;

  md += `## Violation Legend\n\n`;
  md += `| Code | Violation Description |\n`;
  md += `|------|-----------------------|\n`;
  md += `| V1   | Native \`<button>\` used instead of Axiom \`<Button>\` component |\n`;
  md += `| V2   | \`<Button>\` missing explicit \`type\` prop (\`"button"\` or \`"submit"\`) |\n`;
  md += `| V3   | \`<Button>\` missing \`disabled\` / \`pending\` / \`isLoading\` state mapping |\n`;
  md += `| V4   | Inline \`<svg>\` literal — zero-icon directive violation |\n`;
  md += `| V4b  | Icon library component rendered in button context |\n\n`;
  md += `---\n\n`;

  md += `## Findings\n\n`;
  md += `| File Path | Line | Violation Type | Component |\n`;
  md += `|-----------|-----:|----------------|----------:|\n`;

  for (const f of deduped) {
    const safePath = f.file.replace(/\|/g, "\\|");
    const safeViol = f.violation.replace(/\|/g, "\\|");
    const safeComp = f.component.replace(/\|/g, "\\|");
    md += `| \`${safePath}\` | ${f.line} | ${safeViol} | \`${safeComp}\` |\n`;
  }

  md += `\n---\n\n`;
  md += `## Summary by Violation Type\n\n`;
  md += `| Violation | Count |\n`;
  md += `|-----------|------:|\n`;
  for (const [vt, cnt] of Object.entries(byViolation)) {
    md += `| ${vt} | ${cnt} |\n`;
  }
  md += `\n---\n\n`;
  md += `> ### TOTAL DUMB BUTTONS DETECTED: ${deduped.length}\n`;

  const reportPath = path.join(ROOT, "button_audit_report.md");
  fs.writeFileSync(reportPath, md, "utf-8");

  console.log(`  ✦ Report written → ${reportPath}`);
  console.log("  ✦ Audit complete. No files were mutated.\n");
}

main();
