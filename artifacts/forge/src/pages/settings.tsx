import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListMemoryEntries, getListMemoryEntriesQueryKey,
  useCreateMemoryEntry, useDeleteMemoryEntry,
  useListConstitutionRules, getListConstitutionRulesQueryKey,
  useCreateConstitutionRule, useUpdateConstitutionRule, useDeleteConstitutionRule,
  useListDevices, getListDevicesQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Brain, Shield, Laptop, Download, Check } from "lucide-react";
import { format } from "date-fns";

const MEMORY_CATEGORIES = ["architecture", "fix", "convention", "preference", "workflow"] as const;
const CONSTITUTION_CATEGORIES = ["language", "security", "structure", "git", "testing", "architecture"] as const;
const ENFORCEMENT_LABELS: Record<string, { label: string; variant: "destructive" | "outline" | "secondary" }> = {
  block: { label: "Block", variant: "destructive" },
  warn: { label: "Warn", variant: "outline" },
  info: { label: "Info", variant: "secondary" },
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
  const config = ENFORCEMENT_LABELS[enforcement] ?? { label: enforcement, variant: "secondary" as const };
  return (
    <Badge variant={config.variant} className="text-[10px] px-1.5 py-0 uppercase tracking-wide">
      {config.label}
    </Badge>
  );
}

function MemoryTab() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: "architecture", key: "", value: "" });

  const { data: entries, isLoading } = useListMemoryEntries(undefined, { query: { queryKey: getListMemoryEntriesQueryKey() } });
  const createEntry = useCreateMemoryEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMemoryEntriesQueryKey() });
        setShowAdd(false);
        setForm({ category: "architecture", key: "", value: "" });
      }
    }
  });
  const deleteEntry = useDeleteMemoryEntry({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMemoryEntriesQueryKey() }) }
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
          <p className="text-sm text-muted-foreground mt-0.5">
            Forge learns how your repositories are built and generates code that matches your patterns.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-sm bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          <Plus className="h-3.5 w-3.5" /> Add Entry
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : entries && entries.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 capitalize">{category}</h4>
              <div className="space-y-2">
                {items?.map(entry => (
                  <div key={entry.id} className="flex items-start gap-3 rounded-lg border border-border/50 bg-card p-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold truncate">{entry.key}</p>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">{entry.source}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{entry.value}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{format(new Date(entry.updatedAt), "MMM d, yyyy")}</p>
                    </div>
                    <button
                      onClick={() => deleteEntry.mutate({ id: entry.id })}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0"
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
        <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
          <Brain className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No memory entries yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Forge will learn from your repositories as it analyses and fixes code. You can also add entries manually.
          </p>
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Memory Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MEMORY_CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Key</Label>
              <Input placeholder="e.g. preferred-orm, api-pattern" value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Textarea placeholder="Describe the pattern or preference..." value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-secondary transition-colors">Cancel</button>
            <button
              onClick={() => createEntry.mutate({ data: { category: form.category, key: form.key, value: form.value, source: "manual" } })}
              disabled={!form.key.trim() || !form.value.trim() || createEntry.isPending}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createEntry.isPending ? "Saving..." : "Add Entry"}
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

  const { data: rules, isLoading } = useListConstitutionRules({ query: { queryKey: getListConstitutionRulesQueryKey() } });
  const createRule = useCreateConstitutionRule({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListConstitutionRulesQueryKey() });
        setShowAdd(false);
        setForm({ category: "language", title: "", description: "", enforcement: "warn" });
      }
    }
  });
  const updateRule = useUpdateConstitutionRule({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListConstitutionRulesQueryKey() }) }
  });
  const deleteRule = useDeleteConstitutionRule({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListConstitutionRulesQueryKey() }) }
  });

  // Seed default rules on first load
  useEffect(() => {
    if (!rules || rules.length > 0 || isLoading) return;
    DEFAULT_CONSTITUTION_RULES.forEach(rule => {
      createRule.mutate({ data: rule });
    });
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
          <p className="text-sm text-muted-foreground mt-0.5">
            Enforceable engineering rules applied to all AI-generated changes before approval.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-sm bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          <Plus className="h-3.5 w-3.5" /> Add Rule
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : rules && rules.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 capitalize">{category}</h4>
              <div className="space-y-2">
                {items?.map(rule => (
                  <div key={rule.id} className={`flex items-start gap-3 rounded-lg border p-3 transition-opacity ${rule.enabled ? "border-border/50 bg-card" : "border-border/30 bg-card/50 opacity-60"}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold">{rule.title}</p>
                        <EnforcementBadge enforcement={rule.enforcement} />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{rule.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={checked => updateRule.mutate({ id: rule.id, data: { enabled: checked } })}
                      />
                      <button
                        onClick={() => deleteRule.mutate({ id: rule.id })}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
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
        <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
          <Shield className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium">Setting up default rules...</p>
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Constitution Rule</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONSTITUTION_CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Enforcement</Label>
                <Select value={form.enforcement} onValueChange={v => setForm(f => ({ ...f, enforcement: v }))}>
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
              <Input placeholder="e.g. TypeScript First" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the rule..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-secondary transition-colors">Cancel</button>
            <button
              onClick={() => createRule.mutate({ data: { category: form.category, title: form.title, description: form.description, enforcement: form.enforcement } })}
              disabled={!form.title.trim() || !form.description.trim() || createRule.isPending}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createRule.isPending ? "Saving..." : "Add Rule"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ForgeSeedTab() {
  const { data: devices } = useListDevices({ query: { queryKey: getListDevicesQueryKey() } });

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold">Forge Seed</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          The local agent that runs on your machine and monitors project folders.
        </p>
      </div>

      {/* Download */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Download Forge Seed</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary/30">
            <div>
              <p className="text-sm font-medium">Windows 10 / 11</p>
              <p className="text-xs text-muted-foreground">x64 installer · Forge Seed v0.1.0</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              <Download className="h-3.5 w-3.5" /> Download
            </button>
          </div>
          <p className="text-xs text-muted-foreground">macOS and Linux support coming soon.</p>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { title: "Install", desc: "Download and run the installer. Admin access required only during installation." },
              { title: "Link account", desc: "Forge Seed detects your Replit account automatically and links to this control centre." },
              { title: "Select folders", desc: "Choose the project folders you want Forge to monitor. Add and remove folders at any time." },
              { title: "Monitor", desc: "Forge Seed watches for file changes and incrementally re-indexes affected files in the background." },
            ].map(({ title, desc }, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connected devices */}
      {devices && devices.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Connected Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {devices.map(d => (
                <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 bg-secondary/30">
                  <Laptop className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{d.platform}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    {d.status === "online" ? (
                      <span className="flex items-center gap-1 text-chart-3"><span className="w-1.5 h-1.5 rounded-full bg-chart-3 animate-pulse" />Online</span>
                    ) : (
                      <span className="text-muted-foreground">Offline</span>
                    )}
                  </div>
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
    <div className="flex-1 overflow-auto p-8 bg-background">
      <div className="mb-8 border-b pb-4 border-border/50">
        <h2 className="text-3xl font-bold tracking-tight font-mono text-primary">Settings</h2>
        <p className="text-muted-foreground mt-1">Engineering memory, constitution rules, and Forge Seed configuration.</p>
      </div>

      <div className="max-w-3xl">
        <Tabs defaultValue="memory">
          <TabsList className="mb-6">
            <TabsTrigger value="memory" className="flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5" /> Engineering Memory
            </TabsTrigger>
            <TabsTrigger value="constitution" className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Constitution
            </TabsTrigger>
            <TabsTrigger value="seed" className="flex items-center gap-1.5">
              <Laptop className="h-3.5 w-3.5" /> Forge Seed
            </TabsTrigger>
          </TabsList>
          <TabsContent value="memory"><MemoryTab /></TabsContent>
          <TabsContent value="constitution"><ConstitutionTab /></TabsContent>
          <TabsContent value="seed"><ForgeSeedTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
