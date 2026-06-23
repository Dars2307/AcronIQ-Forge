import http from "http";

export interface OllamaInfo {
  available: boolean;
  version?: string;
  activeModel?: string;
  models: string[];
}

function get(url: string, timeoutMs = 3000): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
    });
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    req.on("error", reject);
  });
}

export async function detectOllama(base = "http://localhost:11434"): Promise<OllamaInfo> {
  try {
    const versionRes = await get(`${base}/api/version`);
    if (versionRes.status !== 200) return { available: false, models: [] };

    let version: string | undefined;
    try {
      version = (JSON.parse(versionRes.body) as { version: string }).version;
    } catch { /* ignore */ }

    const tagsRes = await get(`${base}/api/tags`);
    let models: string[] = [];
    let activeModel: string | undefined;
    if (tagsRes.status === 200) {
      try {
        const parsed = JSON.parse(tagsRes.body) as { models: Array<{ name: string }> };
        models = parsed.models.map((m) => m.name);
        activeModel = models[0];
      } catch { /* ignore */ }
    }

    return { available: true, version, activeModel, models };
  } catch {
    return { available: false, models: [] };
  }
}
