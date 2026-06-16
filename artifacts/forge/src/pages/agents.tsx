import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListAgents, getListAgentsQueryKey,
  useCreateAgent, useUpdateAgent, useRunAgent,
  useListAgentRuns, getListAgentRunsQueryKey,
  useListProjects,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Layers, Shield, FileText, Play, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

const AGENT_DEFS = [
  {
    type: "repair",
    name: "Repair Agent",
    description: "Detects and diagnoses TypeScript errors, build failures, and runtime issues. Generates fixes for approval without applying any changes automatically.",
    icon: Wrench,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
  },
  {
    type: "architecture",
    name: "Architecture Agent",
    description: "Analyses code structure, coupling, and design patterns. Recommends improvements without modifying any files — observations only.",
    icon: Layers,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    ring: "ring-violet-500/20",
  },
  {
    type: "security",
    name: "Security Agent",
    description: "Audits dependencies for known CVEs, scans for insecure patterns, and flags secrets in source. No changes applied without explicit approval.",
    icon: Shield,
    color: "text-red-400",
    bg: "bg-red-500/10",
    ring: "ring-red-500/20",
  },
  {
    type: "documentation",
    name: "Documentation Agent",
    description: "Identifies undocumented functions, outdated READMEs, and missing API descriptions. Generates documentation stubs for review.",
    icon: FileText,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
  },
];

export default function Agents() {
  const queryClient = useQueryClient();
  const [runDialogAgentId, setRunDialogAgentId] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [expandedRuns, setExpandedRuns] = useState<Record<number, boolean>>({});

  const { data: agents, isLoading } = useListAgents({ query: { queryKey: getListAgentsQueryKey() } });
  const { data: projects } = useListProjects();

  const createAgent = useCreateAgent({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAgentsQueryKey() }) },
  });
  const updateAgent = useUpdateAgent({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAgentsQueryKey() }) },
  });
  const runAgent = useRunAgent({
    mutation: {
      onSuccess: (_, vars) => {
        queryClient.invalidateQueries({ queryKey: getListAgentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListAgentRunsQueryKey(vars.id) });
        setRunDialogAgentId(null);
        setSelectedProject("");
      },
    },
  });

  useEffect(() => {
    if (!agents || agents.length > 0 || isLoading) return;
    AGENT_DEFS.forEach((def) =>
      createAgent.mutate({ data: { type: def.type, name: def.name, description: def.description } })
    );
  }, [agents, isLoading]);

  const agentByType = Object.fromEntries((agents ?? []).map((a) => [a.type, a]));

  return (
    <div className="flex-1 overflow-auto">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="px-8 py-4">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Agents</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Specialised engineering agents — they recommend, never act without approval.
          </p>
        </div>
      </div>

      <div className="p-8">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {AGENT_DEFS.map((def) => {
              const agent = agentByType[def.type];
              const Icon = def.icon;
              return (
                <Card
                  key={def.type}
                  className={cn(
                    "overflow-hidden border-border bg-card transition-colors",
                    agent?.enabled && "hover:border-violet-500/20"
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1", def.bg, def.ring)}>
                        <Icon className={cn("h-5 w-5", def.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-sm font-semibold">{def.name}</CardTitle>
                          {agent && (
                            <Switch
                              checked={agent.enabled}
                              onCheckedChange={(checked) =>
                                updateAgent.mutate({ id: agent.id, data: { enabled: checked } })
                              }
                            />
                          )}
                        </div>
                        <CardDescription className="mt-1 text-xs leading-relaxed">{def.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {agent ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {agent.lastRunAt
                              ? formatDistanceToNow(new Date(agent.lastRunAt), { addSuffix: true })
                              : "Never run"}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={agent.enabled ? "secondary" : "outline"}
                              className={cn("px-1.5 py-0 text-[10px]", agent.enabled && "border-violet-500/30 bg-violet-500/10 text-violet-400")}
                            >
                              {agent.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                            <button
                              onClick={() => {
                                setRunDialogAgentId(agent.id);
                                setSelectedProject(agent.projectId ? String(agent.projectId) : "");
                              }}
                              disabled={!agent.enabled}
                              className={cn(
                                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                                agent.enabled
                                  ? "border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20"
                                  : "cursor-not-allowed border-border bg-secondary/50 text-muted-foreground/40"
                              )}
                            >
                              <Play className="h-3 w-3" /> Run
                            </button>
                          </div>
                        </div>
                        <AgentRunsList
                          agentId={agent.id}
                          expanded={expandedRuns[agent.id]}
                          onToggle={() => setExpandedRuns((p) => ({ ...p, [agent.id]: !p[agent.id] }))}
                        />
                      </>
                    ) : (
                      <Skeleton className="h-6 w-32" />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={runDialogAgentId !== null}
        onOpenChange={(open) => { if (!open) { setRunDialogAgentId(null); setSelectedProject(""); } }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Select a project. No changes will be made without your approval.
            </p>
            {projects && projects.length > 0 ? (
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project…" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="rounded-xl border border-border p-3 text-sm text-muted-foreground">
                No projects registered yet. Add a project first.
              </p>
            )}
          </div>
          <DialogFooter>
            <button
              onClick={() => setRunDialogAgentId(null)}
              className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (runDialogAgentId && selectedProject) {
                  runAgent.mutate({ id: runDialogAgentId, data: { projectId: Number(selectedProject) } });
                }
              }}
              disabled={!selectedProject || runAgent.isPending}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-violet-500 disabled:opacity-50"
            >
              {runAgent.isPending ? "Starting…" : "Run Agent"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AgentRunsList({
  agentId,
  expanded,
  onToggle,
}: {
  agentId: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { data: runs } = useListAgentRuns(agentId, {
    query: { queryKey: getListAgentRunsQueryKey(agentId) },
  });

  if (!runs || runs.length === 0) return null;

  const latest = runs[runs.length - 1];

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {runs.length} run{runs.length !== 1 ? "s" : ""}
        {latest.status === "running" && (
          <span className="ml-1 flex items-center gap-1 text-violet-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
            Running
          </span>
        )}
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {[...runs]
            .reverse()
            .slice(0, 3)
            .map((run) => (
              <div key={run.id} className="rounded-xl border border-border bg-secondary/30 p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <Badge
                    variant={
                      run.status === "completed" ? "secondary" : run.status === "running" ? "outline" : "destructive"
                    }
                    className="px-1.5 py-0 text-[10px]"
                  >
                    {run.status}
                  </Badge>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {format(new Date(run.createdAt), "MMM d, HH:mm")}
                  </span>
                </div>
                {run.summary && <p className="mb-1.5 text-xs text-muted-foreground">{run.summary}</p>}
                {run.recommendations && run.recommendations.length > 0 && (
                  <ul className="space-y-0.5">
                    {run.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-1.5 text-xs">
                        <span className="shrink-0 text-violet-400">·</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
