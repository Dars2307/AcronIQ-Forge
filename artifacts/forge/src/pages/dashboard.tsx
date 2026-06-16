import { useGetDashboardSummary, getGetDashboardSummaryQueryKey, useGetDashboardActivity, getGetDashboardActivityQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, GitPullRequest, GitMerge, CheckCircle, Search, ListTodo, FolderGit2, Laptop, Bot, Download } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() }
  });

  const { data: activity, isLoading: isLoadingActivity } = useGetDashboardActivity({
    query: { queryKey: getGetDashboardActivityQueryKey() }
  });

  const statCards = summary ? [
    {
      label: "Active Projects",
      value: `${summary.activeProjects}`,
      sub: `${summary.totalProjects} total · avg health ${summary.avgHealthScore}%`,
      icon: FolderGit2,
      color: "text-primary",
    },
    {
      label: "Open Tasks",
      value: `${summary.openTasks}`,
      sub: `${summary.awaitingApproval} awaiting approval`,
      icon: ListTodo,
      color: "text-chart-4",
    },
    {
      label: "Pull Requests",
      value: `${summary.openPullRequests}`,
      sub: `${summary.tasksThisWeek} tasks this week`,
      icon: GitPullRequest,
      color: "text-chart-2",
    },
    {
      label: "Critical Issues",
      value: `${summary.criticalIssues}`,
      sub: "Requires immediate attention",
      icon: AlertTriangle,
      color: summary.criticalIssues > 0 ? "text-destructive" : "text-muted-foreground",
    },
    {
      label: "Connected Devices",
      value: `${summary.connectedDevices}`,
      sub: "Forge Seed agents online",
      icon: Laptop,
      color: summary.connectedDevices > 0 ? "text-chart-3" : "text-muted-foreground",
    },
    {
      label: "Agents Active",
      value: `${summary.agentsEnabled}`,
      sub: "Engineering agents enabled",
      icon: Bot,
      color: summary.agentsEnabled > 0 ? "text-primary" : "text-muted-foreground",
    },
  ] : [];

  const noProjectsYet = !isLoadingSummary && summary && summary.totalProjects === 0;

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <div className="flex items-center justify-between mb-8 border-b pb-4 border-border/50">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-mono text-primary">Forge Command Centre</h2>
          <p className="text-muted-foreground mt-1">System status and recent autonomous activity.</p>
        </div>
        <Badge variant="outline" className="font-mono text-xs border-primary/50 text-primary">
          System Online
        </Badge>
      </div>

      {/* First-time experience banner */}
      {noProjectsYet && (
        <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-6 flex items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-base text-foreground">No projects connected.</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Install Forge Seed on your machine to begin monitoring projects. Forge Seed runs locally and links your repositories to this control centre.
            </p>
          </div>
          <Link href="/devices">
            <a className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-5 rounded-lg transition-colors text-sm">
              Install Forge Seed
            </a>
          </Link>
        </div>
      )}

      {/* Stat cards */}
      {isLoadingSummary ? (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <Skeleton className="h-3 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-10 mt-1" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : summary ? (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
          {statCards.map(({ label, value, sub, icon: Icon, color }) => (
            <Card key={label} className="border-border/50 bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="col-span-4 border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Real-time feed of autonomous actions across all projects.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-5">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full p-1.5 border border-border bg-background shrink-0">
                      {item.type === "task_completed" && <CheckCircle className="h-3.5 w-3.5 text-chart-3" />}
                      {item.type === "pr_opened" && <GitPullRequest className="h-3.5 w-3.5 text-chart-2" />}
                      {item.type === "pr_merged" && <GitMerge className="h-3.5 w-3.5 text-chart-2" />}
                      {item.type === "issue_found" && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                      {item.type === "scan_complete" && <Search className="h-3.5 w-3.5 text-primary" />}
                      {item.type === "task_approved" && <CheckCircle className="h-3.5 w-3.5 text-chart-3" />}
                      {!["task_completed","pr_opened","pr_merged","issue_found","scan_complete","task_approved"].includes(item.type) && (
                        <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium leading-none truncate">{item.title}</p>
                        <span className="text-xs text-muted-foreground font-mono shrink-0">
                          {format(new Date(item.createdAt), "HH:mm:ss")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded font-mono">{item.projectName}</Badge>
                        {item.severity && (
                          <Badge variant={item.severity === "critical" ? "destructive" : "outline"} className="text-[10px] px-1.5 py-0 rounded">
                            {item.severity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="mx-auto h-8 w-8 opacity-20 mb-3" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs mt-1 opacity-70">Activity will appear here once Forge Seed is connected.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and navigation shortcuts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: "/projects", icon: FolderGit2, label: "View Projects", sub: summary ? `${summary.totalProjects} registered` : "No projects yet" },
              { href: "/devices", icon: Laptop, label: "Manage Devices", sub: summary ? `${summary.connectedDevices} online` : "No devices" },
              { href: "/agents", icon: Bot, label: "Engineering Agents", sub: summary ? `${summary.agentsEnabled} active` : "Configure agents" },
              { href: "/tasks", icon: ListTodo, label: "Pending Tasks", sub: summary ? `${summary.awaitingApproval} awaiting approval` : "No tasks" },
              { href: "/pull-requests", icon: GitPullRequest, label: "Pull Requests", sub: summary ? `${summary.openPullRequests} open` : "No PRs" },
            ].map(({ href, icon: Icon, label, sub }) => (
              <Link key={href} href={href}>
                <a className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                  </div>
                </a>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
