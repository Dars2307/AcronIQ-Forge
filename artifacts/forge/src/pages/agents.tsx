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

const AGENT_DEFS = [
  {
    type: "repair",
    name: "Repair Agent",
    description: "Detects and diagnoses TypeScript errors, build failures, and runtime issues. Generates fixes for approval without applying any changes automatically.",
    icon: Wrench,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/20",
  },
  {
    type: "architecture",
    name: "Architecture Agent",
    description: "Analyses code structure, coupling, and design patterns. Recommends improvements without modifying any files — observations only.",
    icon: Layers,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    type: "security",
    name: "Security Agent",
    description: "Audits dependencies for known CVEs, scans for insecure patterns, and flags secrets in source. No changes are applied without explicit approval.",
    icon: Shield,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
  },
  {
    type: "documentation",
    name: "Documentation Agent",
    description: "Identifies undocumented functions, outdated READMEs, and missing API descriptions. Generates documentation stubs for review.",
    icon: FileText,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/20",
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
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAgentsQueryKey() }) }
  });
  const updateAgent = useUpdateAgent({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAgentsQueryKey() }) }
  });
  const runAgent = useRunAgent({
    mutation: {
      onSuccess: (_, vars) => {
        queryClient.invalidateQueries({ queryKey: getListAgentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListAgentRunsQueryKey(vars.id) });
        setRunDialogAgentId(null);
        setSelectedProject("");
      }
    }
  });

  // Auto-create default agents if none exist
  useEffect(() => {
    if (!agents || agents.length > 0 || isLoading) return;
    AGENT_DEFS.forEach(def => {
      createAgent.mutate({ data: { type: def.type, name: def.name, description: def.description } });
    });
  }, [agents, isLoading]);

  function toggleRuns(id: number) {
    setExpandedRuns(prev => ({ ...prev, [id]: !prev[id] }));
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-8 bg-background">
        <div className="mb-8 border-b pb-4 border-border/50">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  // Build a map from type → agent record
  const agentByType = Object.fromEntries((agents ?? []).map(a => [a.type, a]));

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <div className="flex items-center justify-between mb-8 border-b pb-4 border-border/50">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-mono text-primary">Agents</h2>
          <p className="text-muted-foreground mt-1">Specialised engineering agents — they recommend, never act without approval.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {AGENT_DEFS.map(def => {
          const agent = agentByType[def.type];
          const Icon = def.icon;
          return (
            <Card key={def.type} className="border-border/50 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${def.bg} border ${def.border} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-5 w-5 ${def.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{def.name}</CardTitle>
                      {agent && (
                        <Switch
                          checked={agent.enabled}
                          onCheckedChange={checked =>
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {agent.lastRunAt
                          ? `Last run ${formatDistanceToNow(new Date(agent.lastRunAt), { addSuffix: true })}`
                          : "Never run"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={agent.enabled ? "secondary" : "outline"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {agent.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <button
                          onClick={() => {
                            setRunDialogAgentId(agent.id);
                            setSelectedProject(agent.projectId ? String(agent.projectId) : "");
                          }}
                          disabled={!agent.enabled}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            agent.enabled
                              ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                              : "opacity-40 cursor-not-allowed bg-secondary text-muted-foreground"
                          }`}
                        >
                          <Play className="h-3 w-3" /> Run
                        </button>
                      </div>
                    </div>

                    {/* Recent runs toggle */}
                    <AgentRunsList agentId={agent.id} expanded={expandedRuns[agent.id]} onToggle={() => toggleRuns(agent.id)} />
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Skeleton className="h-3 w-24" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Run Dialog */}
      <Dialog open={runDialogAgentId !== null} onOpenChange={open => { if (!open) { setRunDialogAgentId(null); setSelectedProject(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Select a project for the agent to analyse. No changes will be made without your approval.</p>
            {projects && projects.length > 0 ? (
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground border border-border rounded-lg p-3">
                No projects registered yet. Add a project first.
              </p>
            )}
          </div>
          <DialogFooter>
            <button onClick={() => setRunDialogAgentId(null)} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-secondary transition-colors">
              Cancel
            </button>
            <button
              onClick={() => {
                if (runDialogAgentId && selectedProject) {
                  runAgent.mutate({ id: runDialogAgentId, data: { projectId: Number(selectedProject) } });
                }
              }}
              disabled={!selectedProject || runAgent.isPending}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {runAgent.isPending ? "Starting..." : "Run Agent"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AgentRunsList({ agentId, expanded, onToggle }: { agentId: number; expanded: boolean; onToggle: () => void }) {
  const { data: runs } = useListAgentRuns(agentId, { query: { queryKey: getListAgentRunsQueryKey(agentId) } });

  if (!runs || runs.length === 0) return null;

  const latest = runs[runs.length - 1];

  return (
    <div>
      <button onClick={onToggle} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {runs.length} run{runs.length !== 1 ? "s" : ""}
        {latest.status === "running" && (
          <span className="ml-1 flex items-center gap-1 text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Running
          </span>
        )}
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {[...runs].reverse().slice(0, 3).map(run => (
            <div key={run.id} className="rounded-lg border border-border/50 bg-secondary/30 p-3">
              <div className="flex items-center justify-between mb-1">
                <Badge
                  variant={run.status === "completed" ? "secondary" : run.status === "running" ? "outline" : "destructive"}
                  className="text-[10px] px-1.5 py-0"
                >
                  {run.status}
                </Badge>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {format(new Date(run.createdAt), "MMM d, HH:mm")}
                </span>
              </div>
              {run.summary && <p className="text-xs text-muted-foreground mb-1.5">{run.summary}</p>}
              {run.recommendations && run.recommendations.length > 0 && (
                <ul className="space-y-0.5">
                  {run.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-foreground flex gap-1.5">
                      <span className="text-primary shrink-0">·</span>
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
