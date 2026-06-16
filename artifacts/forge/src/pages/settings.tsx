import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListMemoryEntries, getListMemoryEntriesQueryKey,
  useCreateMemoryEntry, useDeleteMemoryEntry,
  useListConstitutionRules, getListConstitutionRulesQueryKey,
  useCreateConstitutionRule, useUpdateConstitutionRule, useDeleteConstitutionRule,
  useListDevices, getListDevicesQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Brain, Shield, Laptop, Download } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const MEMORY_CATEGORIES = ["architecture", "fix", "convention", "preference", "workflow"] as const;
const CONSTITUTION_CATEGORIES = ["language", "security", "structure", "git", "testing", "architecture"] as const;

const ENFORCEMENT_CONFIG: Record<string, { label: string; color: string }> = {
  block: { label: "Block", color: "border-red-500/30 bg-red-500/10 text-red-400" },
  warn: { label: "Warn", color: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  info: { label: "Info", color: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
};

const DEFAULT_CONSTITUTION_RULES = [
  { category: "language", title: "TypeScript First", description: "All code must be TypeScript. No .js files in source directories.", enforcement: "block" },
  { category: "security", title: "No Secrets in Repository", description: "API keys, tokens, and credentials must never be committed to source. Use environment variables.", enforcement: "block" },
  { category: "structure", title: "Build Validation Required", description: "Every change must pass tsc --noEmit and npm run build before approval.", enforcement: "block" },
  { category: "structure", title: "Consistent Project Structure", description: "Follow established folder conventions: src/, lib/, components/, services/.", enforcement: "warn" },
  { category: "security", title: "No Hardcoded Configuration", description: "Configuration must be loaded from environment variables, never hardcoded.", enforcement: "warn" },
  { category: "git", title: "Repository Standards Enforcement", description: "PRs must include updated documentation for any public API changes.", enforcement: "warn" },
];

function EnforcementBadge({ enforcement }: { enforcement: string }) {
  const cfg = ENFORCEMENT_CONFIG[enforcement] ?? { label: enforcement, color: "border-border bg-secondary text-muted-foreground" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0 text-[10px] font-semibold uppercase tracking-wide ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function MemoryTab() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: "architecture", key: "", value: "" });

  const { data: entries, isLoading } = useListMemoryEntries(undefined, {
    query: { queryKey: getListMemoryEntriesQueryKey() },
  });
  const createEntry = useCreateMemoryEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMemoryEntriesQueryKey() });
        setShowAdd(false);
        setForm({ category: "architecture", key: "", value: "" });
      },
    },
  });
  const deleteEntry = useDeleteMemoryEntry({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMemoryEntriesQueryKey() }) },
  });

  const grouped = (entries ?? []).reduce<Record<string, typeof entries>>((acc, e) => {
    if (!acc[e.category]) acc[e.category] = [];
    acc[e.category]!.push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold">Engineering Memory</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Forge learns how your repositories are built and generates code that matches your patterns.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-sm font-medium text-violet-400 transition-all hover:bg-violet-500/20"
        >
          <Plus className="h-3.5 w-3.5" /> Add Entry
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : entries && entries.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 capitalize">
                {category}
              </p>
              <div className="space-y-2">
                {items?.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-violet-500/20">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="truncate text-sm font-semibold">{entry.key}</p>
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] capitalize">{entry.source}</Badge>
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">{entry.value}</p>
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground/40">
                        {format(new Date(entry.updatedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteEntry.mutate({ id: entry.id })}
                      className="shrink-0 rounded-md p-1 text-muted-foreground/30 transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary">
            <Brain className="h-5 w-5 text-muted-foreground/30" />
          </div>
          <p className="text-sm font-medium">No memory entries yet</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            Forge learns from your repositories as it analyses and fixes code. You can also add entries manually.
          </p>
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Memory Entry</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MEMORY_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Key</Label>
              <Input placeholder="e.g. preferred-orm, api-pattern" value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Textarea placeholder="Describe the pattern or preference…" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setShowAdd(false)} className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary">Cancel</button>
            <button
              onClick={() => createEntry.mutate({ data: { category: form.category, key: form.key, value: form.value, source: "manual" } })}
              disabled={!form.key.trim() || !form.value.trim() || createEntry.isPending}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-violet-500 disabled:opacity-50"
            >
              {createEntry.isPending ? "Saving…" : "Add Entry"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ConstitutionTab() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: "language", title: "", description: "", enforcement: "warn" });

  const { data: rules, isLoading } = useListConstitutionRules({
    query: { queryKey: getListConstitutionRulesQueryKey() },
  });
  const createRule = useCreateConstitutionRule({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListConstitutionRulesQueryKey() });
        setShowAdd(false);
        setForm({ category: "language", title: "", description: "", enforcement: "warn" });
      },
    },
  });
  const updateRule = useUpdateConstitutionRule({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListConstitutionRulesQueryKey() }) },
  });
  const deleteRule = useDeleteConstitutionRule({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListConstitutionRulesQueryKey() }) },
  });

  useEffect(() => {
    if (!rules || rules.length > 0 || isLoading) return;
    DEFAULT_CONSTITUTION_RULES.forEach((rule) => createRule.mutate({ data: rule }));
  }, [rules, isLoading]);

  const grouped = (rules ?? []).reduce<Record<string, typeof rules>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category]!.push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold">Engineering Constitution</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Enforceable engineering rules applied to all AI-generated changes before approval.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-sm font-medium text-violet-400 transition-all hover:bg-violet-500/20"
        >
          <Plus className="h-3.5 w-3.5" /> Add Rule
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : rules && rules.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 capitalize">
                {category}
              </p>
              <div className="space-y-2">
                {items?.map((rule) => (
                  <div
                    key={rule.id}
                    className={`flex items-start gap-3 rounded-xl border p-4 transition-all ${
                      rule.enabled ? "border-border bg-card hover:border-violet-500/20" : "border-border/40 bg-card/40 opacity-60"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold">{rule.title}</p>
                        <EnforcementBadge enforcement={rule.enforcement} />
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">{rule.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) =>
                          updateRule.mutate({ id: rule.id, data: { enabled: checked } })
                        }
                      />
                      <button
                        onClick={() => deleteRule.mutate({ id: rule.id })}
                        className="rounded-md p-1 text-muted-foreground/30 transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <Shield className="mx-auto mb-3 h-8 w-8 text-muted-foreground/20" />
          <p className="text-sm font-medium text-muted-foreground">Setting up default rules…</p>
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Constitution Rule</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONSTITUTION_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Enforcement</Label>
                <Select value={form.enforcement} onValueChange={(v) => setForm((f) => ({ ...f, enforcement: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="warn">Warn</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="e.g. TypeScript First" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the rule…" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setShowAdd(false)} className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary">Cancel</button>
            <button
              onClick={() => createRule.mutate({ data: { category: form.category, title: form.title, description: form.description, enforcement: form.enforcement } })}
              disabled={!form.title.trim() || !form.description.trim() || createRule.isPending}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-violet-500 disabled:opacity-50"
            >
              {createRule.isPending ? "Saving…" : "Add Rule"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ForgeSeedTab() {
  const { toast } = useToast();
  const { data: devices } = useListDevices({ query: { queryKey: getListDevicesQueryKey() } });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">Forge Seed</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          The local agent that runs on your machine and monitors project folders.
        </p>
      </div>

      {/* Download */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-violet-400" />
            <CardTitle className="text-sm">Download Forge Seed</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3">
            <div>
              <p className="text-sm font-medium">Windows 10 / 11</p>
              <p className="text-xs text-muted-foreground">x64 installer · Forge Seed v0.1.0</p>
            </div>
            <button
              onClick={() =>
                toast({
                  title: "Forge Seed installer coming soon",
                  description: "We're packaging the v0.1.0 installer. You'll be notified when it's ready.",
                })
              }
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-violet-500"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </button>
          </div>
          <p className="text-xs text-muted-foreground/60">macOS and Linux support coming soon.</p>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: "Install", desc: "Download and run the installer. Admin access required only during installation." },
              { title: "Link account", desc: "Forge Seed detects your Replit account automatically and links to this control centre." },
              { title: "Select folders", desc: "Choose the project folders you want Forge to monitor. Add and remove at any time." },
              { title: "Monitor", desc: "Forge Seed watches for file changes and incrementally re-indexes affected files in the background." },
            ].map(({ title, desc }, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600/10 text-xs font-bold text-violet-400 ring-1 ring-violet-500/20">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connected devices */}
      {devices && devices.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Connected Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {devices.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3">
                  <Laptop className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{d.name}</p>
                    <p className="text-xs capitalize text-muted-foreground">{d.platform}</p>
                  </div>
                  {d.status === "online" ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      Online
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Offline</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Settings() {
  return (
    <div className="flex-1 overflow-auto">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="px-8 py-4">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Engineering memory, constitution rules, and Forge Seed configuration.
          </p>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-3xl">
          <Tabs defaultValue="memory">
            <TabsList className="mb-6 bg-secondary/50 border border-border">
              <TabsTrigger value="memory" className="flex items-center gap-1.5 data-[state=active]:bg-violet-600/20 data-[state=active]:text-violet-300">
                <Brain className="h-3.5 w-3.5" /> Engineering Memory
              </TabsTrigger>
              <TabsTrigger value="constitution" className="flex items-center gap-1.5 data-[state=active]:bg-violet-600/20 data-[state=active]:text-violet-300">
                <Shield className="h-3.5 w-3.5" /> Constitution
              </TabsTrigger>
              <TabsTrigger value="seed" className="flex items-center gap-1.5 data-[state=active]:bg-violet-600/20 data-[state=active]:text-violet-300">
                <Laptop className="h-3.5 w-3.5" /> Forge Seed
              </TabsTrigger>
            </TabsList>
            <TabsContent value="memory"><MemoryTab /></TabsContent>
            <TabsContent value="constitution"><ConstitutionTab /></TabsContent>
            <TabsContent value="seed"><ForgeSeedTab /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
