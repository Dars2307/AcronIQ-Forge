import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListDevices, getListDevicesQueryKey,
  useRegisterDevice, useDeleteDevice,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Laptop, Wifi, WifiOff, Copy, Check, Trash2, Plus, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

function StatusBadge({ status }: { status: string }) {
  if (status === "online") return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-chart-3">
      <span className="w-1.5 h-1.5 rounded-full bg-chart-3 animate-pulse" />
      Online
    </span>
  );
  if (status === "idle") return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-chart-4">
      <span className="w-1.5 h-1.5 rounded-full bg-chart-4" />
      Idle
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
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
    query: { queryKey: getListDevicesQueryKey() }
  });

  const registerDevice = useRegisterDevice({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDevicesQueryKey() });
        setShowAddDialog(false);
        setDeviceName("");
        toast({ title: "Device registered", description: "Install Forge Seed and it will link automatically." });
      },
    }
  });

  const deleteDevice = useDeleteDevice({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListDevicesQueryKey() }),
    }
  });

  function copyToken(id: number, token: string) {
    navigator.clipboard.writeText(token);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <div className="flex items-center justify-between mb-8 border-b pb-4 border-border/50">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-mono text-primary">Devices</h2>
          <p className="text-muted-foreground mt-1">Connected Forge Seed agents on your machines.</p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          Register Device
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : devices && devices.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {devices.map(device => (
            <Card key={device.id} className="border-border/50 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Laptop className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{device.name}</CardTitle>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">{device.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={device.status} />
                    <button
                      onClick={() => deleteDevice.mutate({ id: device.id })}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
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
                    Last seen {formatDistanceToNow(new Date(device.lastHeartbeatAt), { addSuffix: true })}
                  </p>
                )}

                {/* Ollama AI Status */}
                <div className="rounded-lg border border-border/50 bg-secondary/30 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    {device.ollamaAvailable ? (
                      <Wifi className="h-3.5 w-3.5 text-chart-3" />
                    ) : (
                      <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className="text-xs font-medium">
                      {device.ollamaAvailable ? "Ollama detected" : "Ollama not detected"}
                    </span>
                    {device.ollamaVersion && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{device.ollamaVersion}</Badge>
                    )}
                  </div>
                  {device.ollamaAvailable ? (
                    <p className="text-xs text-muted-foreground pl-5">
                      Active model: <span className="text-foreground font-mono">{device.activeModel ?? "None selected"}</span>
                    </p>
                  ) : (
                    <a
                      href="https://ollama.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline pl-5 flex items-center gap-1"
                    >
                      Install Ollama <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {device.agentVersion && (
                  <p className="text-xs text-muted-foreground">
                    Forge Seed <span className="font-mono">{device.agentVersion}</span>
                  </p>
                )}

                {/* Pairing token */}
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Pairing token</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-[10px] font-mono bg-secondary/50 rounded px-2 py-1 truncate text-muted-foreground">
                      {device.pairingToken.slice(0, 32)}...
                    </code>
                    <button
                      onClick={() => copyToken(device.id, device.pairingToken)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copiedToken === device.id ? <Check className="h-3.5 w-3.5 text-chart-3" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty state — first-time experience */
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-border/50 bg-card p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <Laptop className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No devices connected</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
              Install Forge Seed on your development machine. It will automatically detect your Replit account and link to this control centre.
            </p>

            {/* Download button */}
            <div className="mb-8">
              <button
                onClick={() => {
                  toast({
                    title: "Forge Seed installer coming soon",
                    description: "We're packaging the v0.1.0 Windows installer. You'll be notified when it's ready to download.",
                  });
                }}
                className="inline-flex items-center gap-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
              >
                <Laptop className="h-4 w-4" />
                Download Forge Seed for Windows
                <Badge variant="secondary" className="text-[10px] ml-1 bg-primary-foreground/20 text-primary-foreground border-0">v0.1.0</Badge>
              </button>
              <p className="text-xs text-muted-foreground mt-2">macOS and Linux support coming soon</p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-3 gap-4 text-left">
              {[
                { n: "1", title: "Download", desc: "Download the Forge Seed installer for Windows 10/11." },
                { n: "2", title: "Install", desc: "Run the installer. Administrator access is only required once." },
                { n: "3", title: "Select Folders", desc: "Choose the project folders you want Forge to monitor." },
              ].map(({ n, title, desc }) => (
                <div key={n} className="rounded-lg border border-border/50 bg-secondary/30 p-4">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary mb-2">
                    {n}
                  </div>
                  <p className="text-sm font-semibold mb-1">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowAddDialog(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Or register a device manually
              </button>
            </div>
          </div>
        </div>
      )}

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
                onChange={e => setDeviceName(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              A unique pairing token will be generated. Forge Seed will use it to link automatically.
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowAddDialog(false)}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => registerDevice.mutate({ data: { name: deviceName, platform: "windows" } })}
              disabled={!deviceName.trim() || registerDevice.isPending}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {registerDevice.isPending ? "Registering..." : "Register Device"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
