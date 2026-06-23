import readline from "readline";
import fs from "fs";
import { pairDevice } from "./api";
import { saveConfig, Config } from "./config";

function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));
}

export async function runSetupWizard(): Promise<Config> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("");
  console.log("╔═══════════════════════════════════════════╗");
  console.log("║      Forge Seed — First-time Setup        ║");
  console.log("║   AcronIQ Engineering Platform v0.1.0     ║");
  console.log("╚═══════════════════════════════════════════╝");
  console.log("");
  console.log("You need to pair this machine with your Forge control centre.");
  console.log("Go to your Forge web app → Devices → Register Device to get a pairing token.");
  console.log("");

  let serverUrl = "";
  while (!serverUrl) {
    serverUrl = await prompt(rl, "Forge server URL (e.g. https://yourapp.example.com): ");
    if (!serverUrl.startsWith("http")) {
      console.log("  ✗ URL must start with http:// or https://");
      serverUrl = "";
    }
  }

  let deviceId = 0;
  let deviceName = "";
  let pairingToken = "";

  while (!deviceId) {
    pairingToken = await prompt(rl, "Pairing token (from Forge web UI): ");
    if (!pairingToken) {
      console.log("  ✗ Token cannot be empty.");
      continue;
    }

    process.stdout.write("  Pairing with server... ");
    try {
      const result = await pairDevice(serverUrl, pairingToken);
      deviceId = result.deviceId;
      deviceName = result.name;
      console.log(`✓ Paired! Device: "${deviceName}" (ID: ${deviceId})`);
    } catch (err) {
      console.log(`✗ Failed: ${(err as Error).message}`);
      console.log("  Check your token and server URL and try again.");
      pairingToken = "";
    }
  }

  console.log("");
  console.log("Which folders should Forge monitor for file changes?");
  console.log("Enter one folder path per line. Press Enter twice when done.");
  console.log("");

  const folders: string[] = [];
  while (true) {
    const folderInput = await prompt(rl, `Folder ${folders.length + 1} (or press Enter to finish): `);
    if (!folderInput) {
      if (folders.length === 0) {
        console.log("  ✗ Enter at least one folder.");
        continue;
      }
      break;
    }
    if (!fs.existsSync(folderInput)) {
      console.log(`  ✗ Folder does not exist: ${folderInput}`);
      continue;
    }
    folders.push(folderInput);
    console.log(`  ✓ Added: ${folderInput}`);
  }

  rl.close();

  const config: Config = {
    serverUrl,
    pairingToken,
    deviceId,
    agentVersion: "0.1.0",
    watchedFolders: folders,
  };

  saveConfig(config);

  console.log("");
  console.log("✓ Setup complete! Config saved.");
  return config;
}
