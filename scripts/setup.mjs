#!/usr/bin/env node
/**
 * Project Setup Script
 *
 * Checks and installs prerequisites:
 * - Node.js version
 * - Wrangler (Cloudflare CLI)
 * - Playwright browsers
 * - .env file from .env.example
 */

import { execSync } from "node:child_process";
import { existsSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";

const green = (t) => `\x1b[32m${t}\x1b[0m`;
const red = (t) => `\x1b[31m${t}\x1b[0m`;
const yellow = (t) => `\x1b[33m${t}\x1b[0m`;
const dim = (t) => `\x1b[2m${t}\x1b[0m`;
const bold = (t) => `\x1b[1m${t}\x1b[0m`;

let passed = 0;
let failed = 0;

function check(label, fn) {
  try {
    const result = fn();
    console.log(`  ${green("✓")} ${label} ${dim(result || "")}`);
    passed++;
    return true;
  } catch (e) {
    console.log(`  ${red("✗")} ${label} ${dim(`— ${e.message}`)}`);
    failed++;
    return false;
  }
}

function run(cmd) {
  return execSync(cmd, { encoding: "utf-8", stdio: "pipe" }).trim();
}

console.log(`\n${bold("🔧 Project Setup")}\n`);

// ── Node.js ──────────────────────────────────────────
console.log(bold("Runtime"));
check("Node.js >= 18", () => {
  const version = process.version;
  const major = Number.parseInt(version.slice(1));
  if (major < 18) {
    throw new Error(`Found ${version}, need >= 18`);
  }
  return version;
});

// ── Package Manager ──────────────────────────────────
console.log(`\n${bold("Package Manager")}`);
const hasBun = check("Bun installed", () => run("bun --version"));
if (!hasBun) {
  console.log(`    ${yellow("→")} Install Bun: ${dim("curl -fsSL https://bun.sh/install | bash")}`);
}

// ── Cloudflare CLI ───────────────────────────────────
console.log(`\n${bold("Cloudflare")}`);
const hasWrangler = check("Wrangler CLI installed", () => {
  try {
    return run("npx wrangler --version 2>/dev/null").split("\n").pop();
  } catch {
    throw new Error("not found");
  }
});
if (!hasWrangler) {
  console.log(`    ${yellow("→")} Installing wrangler...`);
  try {
    execSync("npm install -g wrangler", { stdio: "inherit" });
    console.log(`    ${green("✓")} Wrangler installed`);
  } catch {
    console.log(`    ${red("✗")} Failed to install. Run manually: ${dim("npm install -g wrangler")}`);
  }
}

check("Wrangler authenticated", () => {
  try {
    const out = run("npx wrangler whoami 2>/dev/null");
    const match = out.match(/(?:email|account).*?[:\s]+(\S+)/i);
    return match ? match[1] : "logged in";
  } catch {
    throw new Error("run: npx wrangler login");
  }
});

// ── MCP Servers ──────────────────────────────────────
console.log(`\n${bold("MCP Servers (AI Agent Tools)")}`);
const mcpServers = [
  { name: "@playwright/mcp", label: "Playwright MCP" },
  { name: "@upstash/context7-mcp", label: "Context7 MCP" },
  { name: "@cloudflare/mcp-server-cloudflare", label: "Cloudflare MCP" },
  { name: "@modelcontextprotocol/server-sequential-thinking", label: "Sequential Thinking MCP" },
];

for (const server of mcpServers) {
  check(server.label, () => {
    try {
      run(`npm view ${server.name} version 2>/dev/null`);
      return "available";
    } catch {
      throw new Error("not found on npm");
    }
  });
}
console.log(`    ${dim("MCP servers run on-demand via npx — no install needed")}`);

// ── Playwright ───────────────────────────────────────
console.log(`\n${bold("Testing")}`);
const hasPlaywright = check("Playwright browsers installed", () => {
  try {
    const out = run("npx playwright --version 2>/dev/null");
    return out;
  } catch {
    throw new Error("browsers not installed");
  }
});
if (!hasPlaywright) {
  console.log(`    ${yellow("→")} Installing Playwright browsers...`);
  try {
    execSync("npx playwright install --with-deps chromium", { stdio: "inherit" });
    console.log(`    ${green("✓")} Playwright browsers installed`);
  } catch {
    console.log(`    ${yellow("!")} Run manually: ${dim("npx playwright install")}`);
  }
}

// ── Environment ──────────────────────────────────────
console.log(`\n${bold("Environment")}`);
const envPath = resolve(process.cwd(), ".env");
const examplePath = resolve(process.cwd(), ".env.example");

if (existsSync(envPath)) {
  check(".env file exists", () => "already configured");
} else if (existsSync(examplePath)) {
  copyFileSync(examplePath, envPath);
  check(".env file created from .env.example", () => "fill in your values");
} else {
  console.log(`  ${yellow("!")} No .env.example found`);
}

// ── Git Hooks ────────────────────────────────────────
console.log(`\n${bold("Git Hooks")}`);
check("Husky git hooks", () => {
  if (existsSync(resolve(process.cwd(), ".husky"))) {
    return "configured";
  }
  try {
    run("npx husky");
    return "initialized";
  } catch {
    throw new Error("failed to initialize");
  }
});

// ── Summary ──────────────────────────────────────────
console.log(`\n${"─".repeat(40)}`);
console.log(`${bold("Summary:")} ${green(`${passed} passed`)}${failed > 0 ? `, ${red(`${failed} failed`)}` : ""}`);

if (failed === 0) {
  console.log(`\n${green("🚀 All set! Run")} ${bold("npm run dev")} ${green("to start developing.")}\n`);
} else {
  console.log(`\n${yellow("⚠  Fix the issues above, then run")} ${bold("npm run setup")} ${yellow("again.")}\n`);
}
