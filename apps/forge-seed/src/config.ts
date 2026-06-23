import fs from "fs";
import path from "path";
import os from "os";

export interface Config {
  serverUrl: string;
  pairingToken: string;
  deviceId: number;
  agentVersion: string;
  watchedFolders: string[];
}

function configDir(): string {
  if (process.platform === "win32") {
    return path.join(process.env.APPDATA ?? os.homedir(), "ForgeSeed");
  }
  return path.join(os.homedir(), ".forge-seed");
}

export function configPath(): string {
  return path.join(configDir(), "config.json");
}

export function loadConfig(): Config | null {
  const p = configPath();
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as Config;
  } catch {
    return null;
  }
}

export function saveConfig(config: Config): void {
  const dir = configDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(configPath(), JSON.stringify(config, null, 2), "utf8");
}

export function clearConfig(): void {
  const p = configPath();
  if (fs.existsSync(p)) fs.unlinkSync(p);
}
