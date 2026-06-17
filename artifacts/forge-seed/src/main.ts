#!/usr/bin/env node
/**
 * Forge Seed — AcronIQ local engineering agent
 * Monitors project folders, detects Ollama, and sends heartbeats to Forge.
 */

import { loadConfig, clearConfig } from "./config";
import { runSetupWizard } from "./setup";
import { sendHeartbeat } from "./api";
import { detectOllama } from "./ollama";
import { FolderWatcher } from "./watcher";

const VERSION = "0.1.0";
const HEARTBEAT_INTERVAL_MS = 30_000;

function printBanner() {
  console.log("╔═══════════════════════════════════════════╗");
  console.log("║          Forge Seed  v" + VERSION + "              ║");
  console.log("║   AcronIQ Autonomous Engineering Agent    ║");
  console.log("╚═══════════════════════════════════════════╝");
  console.log("");
}

async function runDaemon() {
  let config = loadConfig();

  if (process.argv.includes("--reset")) {
    clearConfig();
    console.log("Config cleared.");
    config = null;
  }

  if (!config) {
    config = await runSetupWizard();
  } else {
    printBanner();
    console.log(`✓ Loaded config for device "${config.deviceId}"`);
    console.log(`  Server: ${config.serverUrl}`);
    console.log(`  Watching ${config.watchedFolders.length} folder(s)`);
  }

  // Start file watcher
  console.log("");
  console.log("Starting file watcher...");
  const watcher = new FolderWatcher((event) => {
    const rel = event.filePath.replace(event.folder, "").replace(/^[\\/]/, "");
    if (rel.length < 200) {
      process.stdout.write(`\r  [${event.type.padEnd(10)}] ${rel.substring(0, 80)}              `);
    }
  });

  watcher.watch(config.watchedFolders);

  // Initial heartbeat
  console.log("");
  console.log("Sending initial heartbeat...");

  async function heartbeat() {
    if (!config) return;
    try {
      const ollama = await detectOllama();
      await sendHeartbeat(config.serverUrl, config.deviceId, config.pairingToken, {
        status: "online",
        ollamaAvailable: ollama.available,
        ollamaVersion: ollama.version,
        activeModel: ollama.activeModel,
        agentVersion: VERSION,
      });
      const ollamaStr = ollama.available
        ? `Ollama ${ollama.version ?? ""}${ollama.activeModel ? " · " + ollama.activeModel : ""}`
        : "Ollama not detected";
      process.stdout.write(
        `\r[${new Date().toLocaleTimeString()}] Heartbeat OK · ${ollamaStr}          `
      );
    } catch (err) {
      process.stdout.write(`\r[${new Date().toLocaleTimeString()}] Heartbeat failed: ${(err as Error).message}          `);
    }
  }

  await heartbeat();

  const timer = setInterval(heartbeat, HEARTBEAT_INTERVAL_MS);

  console.log("");
  console.log(`✓ Forge Seed is running. Press Ctrl+C to stop.`);
  console.log(`  Heartbeat every ${HEARTBEAT_INTERVAL_MS / 1000}s`);
  console.log("");

  process.on("SIGINT", () => {
    console.log("\n\nShutting down Forge Seed...");
    clearInterval(timer);
    watcher.stopAll();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    clearInterval(timer);
    watcher.stopAll();
    process.exit(0);
  });

  // Keep alive
  setInterval(() => {}, 2_147_483_647);
}

runDaemon().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
