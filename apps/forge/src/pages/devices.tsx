import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListDevices, getListDevicesQueryKey,
  useRegisterDevice, useDeleteDevice,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Laptop, Wifi, WifiOff, Copy, Check, Trash2, Plus, ExternalLink, Download, ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function StatusDot({ status }: { status: string }) {
  if (status === "online")
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        Online
      </span>
    );
  if (status === "idle")
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        Idle
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
      Offline
    </span>
  );
}

export default function Devices() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [copiedToken, setCopiedToken] = useState<number | null>(null);

  const { data: devices, isLoading } = useListDevices({
    query: { queryKey: getListDevicesQueryKey() },
  });

  const registerDevice = useRegisterDevice({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDevicesQueryKey() });
        setShowAddDialog(false);
        setDeviceName("");
        toast({ title: "Device registered", description: "Install Forge Seed and it will link automatically." });
      },
    },
  });

  const deleteDevice = useDeleteDevice({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListDevicesQueryKey() }),
    },
  });

  function copyToken(id: number, token: string) {
    navigator.clipboard.writeText(token);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Devices</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">Connected Forge Seed agents on your machines.</p>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-all hover:bg-violet-500 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Register Device
          </button>
        </div>
      </div>

      <div className="p-8">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : devices && devices.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {devices.map((device) => (
              <Card key={device.id} className="group overflow-hidden border-border bg-card transition-colors hover:border-violet-500/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 ring-1 ring-violet-500/20">
                        <Laptop className="h-5 w-5 text-violet-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{device.name}</CardTitle>
                        <p className="mt-0.5 font-mono text-xs capitalize text-muted-foreground">{device.platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusDot status={device.status} />
                      <button
                        onClick={() => deleteDevice.mutate({ id: device.id })}
                        className="rounded-md p-1 text-muted-foreground/40 transition-colors hover:text-destructive"
                        title="Unlink device"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {device.lastHeartbeatAt && (
                    <p className="text-xs text-muted-foreground">
                      Last seen{" "}
                      <span className="text-foreground/70">
                        {formatDistanceToNow(new Date(device.lastHeartbeatAt), { addSuffix: true })}
                      </span>
                    </p>
                  )}

                  {/* Ollama AI status */}
                  <div className="rounded-xl border border-border bg-secondary/30 p-3">
                    <div className="flex items-center gap-2">
                      {device.ollamaAvailable ? (
                        <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <WifiOff className="h-3.5 w-3.5 text-muted-foreground/40" />
                      )}
                      <span className={cn("text-xs font-medium", device.ollamaAvailable ? "text-emerald-400" : "text-muted-foreground")}>
                        {device.ollamaAvailable ? "Ollama detected" : "Ollama not detected"}
                      </span>
                      {device.ollamaVersion && (
                        <Badge variant="secondary" className="ml-auto px-1.5 py-0 font-mono text-[10px]">
                          {device.ollamaVersion}
                        </Badge>
                      )}
                    </div>
                    {device.ollamaAvailable ? (
                      <p className="mt-1 pl-5 text-xs text-muted-foreground">
                        Model:{" "}
                        <span className="font-mono text-foreground/80">{device.activeModel ?? "None selected"}</span>
                      </p>
                    ) : (
                      <a
                        href="https://ollama.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center gap-1 pl-5 text-xs text-violet-400 hover:underline"
                      >
                        Install Ollama <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  {device.agentVersion && (
                    <p className="text-xs text-muted-foreground">
                      Forge Seed <span className="font-mono text-foreground/60">{device.agentVersion}</span>
                    </p>
                  )}

                  {/* Pairing token */}
                  <div>
                    <p className="mb-1 text-[10px] text-muted-foreground/60">Pairing token</p>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-2 py-1.5">
                      <code className="flex-1 truncate font-mono text-[10px] text-muted-foreground">
                        {device.pairingToken.slice(0, 32)}…
                      </code>
                      <button
                        onClick={() => copyToken(device.id, device.pairingToken)}
                        className="shrink-0 text-muted-foreground/40 transition-colors hover:text-foreground"
                      >
                        {copiedToken === device.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="mx-auto max-w-2xl">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 text-center">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-600/5 to-transparent" />
              <div className="relative">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/10 ring-1 ring-violet-500/20">
                  <Laptop className="h-7 w-7 text-violet-400" />
                </div>
                <h3 className="mb-2 text-xl font-bold">No devices connected</h3>
                <p className="mx-auto mb-8 max-w-md text-sm text-muted-foreground">
                  Install Forge Seed on your development machine. It will automatically detect your account and link to this control centre.
                </p>

                <div className="mb-8 flex flex-col items-center gap-2">
                  <a
                    href="/api/devices/download/forge-seed.exe"
                    download="forge-seed.exe"
                    className="inline-flex items-center gap-2.5 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition-all hover:bg-violet-500 active:scale-[0.98]"
                  >
                    <Download className="h-4 w-4" />
                    Download Forge Seed for Windows
                    <Badge variant="secondary" className="ml-1 border-0 bg-white/20 text-[10px] text-white">
                      v0.1.0
                    </Badge>
                  </a>
                  <p className="text-xs text-muted-foreground/60">macOS and Linux support coming soon</p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-3 gap-4 text-left">
                  {[
                    { n: "1", title: "Download", desc: "Download the Forge Seed installer for Windows 10/11." },
                    { n: "2", title: "Install", desc: "Run the installer. Administrator access is only required once." },
                    { n: "3", title: "Select Folders", desc: "Choose project folders you want Forge to monitor." },
                  ].map(({ n, title, desc }) => (
                    <div key={n} className="rounded-xl border border-border bg-secondary/30 p-4">
                      <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-violet-600/10 text-xs font-bold text-violet-400 ring-1 ring-violet-500/20">
                        {n}
                      </div>
                      <p className="mb-1 text-sm font-semibold">{title}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setShowAddDialog(true)}
                    className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Or register a device manually
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="device-name">Device name</Label>
              <Input
                id="device-name"
                placeholder="e.g. Desktop-PC, MacBook-Pro"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              A unique pairing token will be generated. Forge Seed will use it to link automatically.
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowAddDialog(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                registerDevice.mutate({ data: { name: deviceName, platform: "windows" } })
              }
              disabled={!deviceName.trim() || registerDevice.isPending}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-violet-500 disabled:opacity-50"
            >
              {registerDevice.isPending ? "Registering…" : "Register Device"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
