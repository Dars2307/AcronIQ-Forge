import {
  useGetDashboardSummary, getGetDashboardSummaryQueryKey,
  useGetDashboardActivity, getGetDashboardActivityQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity, AlertTriangle, GitPullRequest, GitMerge,
  CheckCircle, Search, FolderGit2, ListTodo, Laptop, Bot, Download, ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() },
  });
  const { data: activity, isLoading: isLoadingActivity } = useGetDashboardActivity({
    query: { queryKey: getGetDashboardActivityQueryKey() },
  });

  const noProjects = !isLoadingSummary && summary?.totalProjects === 0;

  const statCards = summary
    ? [
        { label: "Active Projects", value: summary.activeProjects, sub: `${summary.totalProjects} total · avg health ${summary.avgHealthScore}%`, icon: FolderGit2, accent: "text-violet-400", glow: "bg-violet-500" },
        { label: "Open Tasks", value: summary.openTasks, sub: `${summary.awaitingApproval} awaiting approval`, icon: ListTodo, accent: "text-amber-400", glow: "bg-amber-500" },
        { label: "Pull Requests", value: summary.openPullRequests, sub: `${summary.tasksThisWeek} tasks this week`, icon: GitPullRequest, accent: "text-blue-400", glow: "bg-blue-500" },
        { label: "Critical Issues", value: summary.criticalIssues, sub: summary.criticalIssues > 0 ? "Immediate attention needed" : "All clear", icon: AlertTriangle, accent: summary.criticalIssues > 0 ? "text-red-400" : "text-muted-foreground", glow: "bg-red-500" },
        { label: "Connected Devices", value: summary.connectedDevices, sub: "Forge Seed agents online", icon: Laptop, accent: summary.connectedDevices > 0 ? "text-emerald-400" : "text-muted-foreground", glow: "bg-emerald-500" },
        { label: "Agents Active", value: summary.agentsEnabled, sub: "Engineering agents enabled", icon: Bot, accent: summary.agentsEnabled > 0 ? "text-violet-400" : "text-muted-foreground", glow: "bg-violet-500" },
      ]
    : [];

  return (
    <div className="flex-1 overflow-auto">
      {/* Page header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Command Centre</h1>
            <p className="text-xs text-muted-foreground mt-0.5">System status and autonomous activity</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="text-xs font-medium text-emerald-400">All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* First-time onboarding banner */}
        {noProjects && (
          <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-600/10 via-violet-500/5 to-transparent p-6">
            <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-violet-600/5 to-transparent" />
            <div className="flex items-center gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 ring-1 ring-violet-500/30">
                <Download className="h-5 w-5 text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-foreground">No projects connected</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Install Forge Seed on your machine to begin monitoring your repositories and running autonomous agents.
                </p>
              </div>
              <Link href="/devices">
                <a className="shrink-0 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition-all hover:bg-violet-500 active:scale-[0.98]">
                  Install Forge Seed
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Link>
            </div>
          </div>
        )}

        {/* Stat cards */}
        {isLoadingSummary ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-border bg-card">
                <CardHeader className="pb-2"><Skeleton className="h-3 w-20" /></CardHeader>
                <CardContent><Skeleton className="h-7 w-10" /><Skeleton className="mt-2 h-3 w-28" /></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {statCards.map(({ label, value, sub, icon: Icon, accent, glow }) => (
              <Card key={label} className="group relative overflow-hidden border-border bg-card transition-colors hover:border-violet-500/20">
                <div className={`pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full ${glow}/8 blur-xl transition-all group-hover:${glow}/15`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
                  <Icon className={`h-3.5 w-3.5 ${accent}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold tracking-tight ${value === 0 ? "text-muted-foreground/40" : accent}`}>
                    {value}
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main content grid */}
        <div className="grid gap-4 lg:grid-cols-7">
          {/* Activity feed */}
          <Card className="col-span-4 border-border bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
              <CardDescription className="text-xs">Real-time feed of autonomous actions across all projects.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoadingActivity ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activity && activity.length > 0 ? (
                <div className="space-y-4">
                  {activity.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-secondary">
                        {item.type === "task_completed" && <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />}
                        {item.type === "pr_opened" && <GitPullRequest className="h-3.5 w-3.5 text-blue-400" />}
                        {item.type === "pr_merged" && <GitMerge className="h-3.5 w-3.5 text-violet-400" />}
                        {item.type === "issue_found" && <AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
                        {item.type === "scan_complete" && <Search className="h-3.5 w-3.5 text-violet-400" />}
                        {item.type === "task_approved" && <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />}
                        {!["task_completed","pr_opened","pr_merged","issue_found","scan_complete","task_approved"].includes(item.type) && (
                          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium leading-none">{item.title}</p>
                          <span className="shrink-0 font-mono text-xs text-muted-foreground">
                            {format(new Date(item.createdAt), "HH:mm:ss")}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono">
                            {item.projectName}
                          </Badge>
                          {item.severity && (
                            <Badge variant={item.severity === "critical" ? "destructive" : "outline"} className="px-1.5 py-0 text-[10px]">
                              {item.severity}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary">
                    <Activity className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">Activity appears here once Forge Seed is connected.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="col-span-3 border-border bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
              <CardDescription className="text-xs">Common tasks and navigation shortcuts.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-1.5">
              {[
                { href: "/projects", icon: FolderGit2, label: "View Projects", sub: summary ? `${summary.totalProjects} registered` : "No projects", color: "text-violet-400 bg-violet-500/10" },
                { href: "/devices", icon: Laptop, label: "Manage Devices", sub: summary ? `${summary.connectedDevices} online` : "No devices", color: "text-emerald-400 bg-emerald-500/10" },
                { href: "/agents", icon: Bot, label: "Engineering Agents", sub: summary ? `${summary.agentsEnabled} active` : "Configure agents", color: "text-violet-400 bg-violet-500/10" },
                { href: "/tasks", icon: ListTodo, label: "Pending Tasks", sub: summary ? `${summary.awaitingApproval} awaiting approval` : "No tasks", color: "text-amber-400 bg-amber-500/10" },
                { href: "/pull-requests", icon: GitPullRequest, label: "Pull Requests", sub: summary ? `${summary.openPullRequests} open` : "No PRs", color: "text-blue-400 bg-blue-500/10" },
              ].map(({ href, icon: Icon, label, sub, color }) => (
                <Link key={href} href={href}>
                  <a className="group flex items-center gap-3 rounded-lg border border-transparent p-3 transition-all hover:border-border hover:bg-secondary/50">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none text-foreground/80 group-hover:text-foreground">{label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                  </a>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
