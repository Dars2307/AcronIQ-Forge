import https from "https";
import http from "http";
import { URL } from "url";

export interface PairResponse {
  deviceId: number;
  name: string;
}

export interface HeartbeatPayload {
  status: "online" | "idle";
  ollamaAvailable: boolean;
  ollamaVersion?: string;
  activeModel?: string;
  agentVersion: string;
}

function request(
  method: string,
  urlStr: string,
  body?: unknown,
  headers: Record<string, string> = {}
): Promise<{ status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const isHttps = url.protocol === "https:";
    const mod = isHttps ? https : http;

    const bodyStr = body ? JSON.stringify(body) : undefined;
    const opts: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "ForgeSeed/0.1.0",
        ...headers,
        ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr).toString() } : {}),
      },
    };

    const req = mod.request(opts, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode ?? 0, data: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode ?? 0, data: raw });
        }
      });
    });

    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

export async function pairDevice(
  serverUrl: string,
  token: string
): Promise<PairResponse> {
  const url = `${serverUrl.replace(/\/$/, "")}/api/devices/pair?token=${encodeURIComponent(token)}`;
  const res = await request("GET", url);
  if (res.status !== 200) {
    throw new Error(`Pairing failed (${res.status}): ${JSON.stringify(res.data)}`);
  }
  return res.data as PairResponse;
}

export async function sendHeartbeat(
  serverUrl: string,
  deviceId: number,
  token: string,
  payload: HeartbeatPayload
): Promise<void> {
  const url = `${serverUrl.replace(/\/$/, "")}/api/devices/${deviceId}/heartbeat`;
  const res = await request("PATCH", url, payload, {
    Authorization: `Bearer ${token}`,
  });
  if (res.status !== 200) {
    throw new Error(`Heartbeat failed (${res.status})`);
  }
}
