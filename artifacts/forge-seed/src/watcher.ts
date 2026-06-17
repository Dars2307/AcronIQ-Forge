import chokidar, { FSWatcher } from "chokidar";
import path from "path";

export interface WatchEvent {
  type: "add" | "change" | "unlink" | "addDir" | "unlinkDir";
  filePath: string;
  folder: string;
}

type EventHandler = (event: WatchEvent) => void;

const IGNORED = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/build/**",
  "**/.next/**",
  "**/__pycache__/**",
  "**/*.pyc",
  "**/.DS_Store",
];

export class FolderWatcher {
  private watchers: FSWatcher[] = [];
  private handler: EventHandler;

  constructor(handler: EventHandler) {
    this.handler = handler;
  }

  watch(folders: string[]): void {
    this.stopAll();
    for (const folder of folders) {
      console.log(`  Watching: ${folder}`);
      const watcher = chokidar.watch(folder, {
        ignored: IGNORED,
        persistent: true,
        ignoreInitial: true,
        depth: 10,
      });

      const emit = (type: WatchEvent["type"]) => (filePath: string) => {
        this.handler({ type, filePath: path.normalize(filePath), folder });
      };

      watcher
        .on("add", emit("add"))
        .on("change", emit("change"))
        .on("unlink", emit("unlink"))
        .on("addDir", emit("addDir"))
        .on("unlinkDir", emit("unlinkDir"))
        .on("error", (err) => console.error(`[watcher] error in ${folder}:`, err));

      this.watchers.push(watcher);
    }
  }

  stopAll(): void {
    for (const w of this.watchers) w.close();
    this.watchers = [];
  }
}
