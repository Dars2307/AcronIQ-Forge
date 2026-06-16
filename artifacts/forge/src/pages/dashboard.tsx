import { useGetDashboardSummary, getGetDashboardSummaryQueryKey, useGetDashboardActivity, getGetDashboardActivityQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, GitPullRequest, GitMerge, CheckCircle, Search, ListTodo, TerminalSquare } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() }
  });

  const { data: activity, isLoading: isLoadingActivity } = useGetDashboardActivity({
    query: { queryKey: getGetDashboardActivityQueryKey() }
  });

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <div className="flex items-center justify-between space-y-2 mb-8 border-b pb-4 border-border/50">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-mono text-primary">Forge Command Centre</h2>
          <p className="text-muted-foreground mt-1">System status and recent autonomous activity.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="font-mono text-xs border-primary/50 text-primary">
            System Online
          </Badge>
        </div>
      </div>
      
      {isLoadingSummary ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border-border/50 bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : summary ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-border/50 bg-card hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{summary.activeProjects} <span className="text-sm font-normal text-muted-foreground">/ {summary.totalProjects}</span></div>
              <p className="text-xs text-muted-foreground mt-1">Avg Health: {summary.avgHealthScore}%</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open Tasks</CardTitle>
              <Search className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{summary.openTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">{summary.awaitingApproval} awaiting approval</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pull Requests</CardTitle>
              <GitPullRequest className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{summary.openPullRequests}</div>
              <p className="text-xs text-muted-foreground mt-1">{summary.tasksThisWeek} tasks this week</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-destructive">{summary.criticalIssues}</div>
              <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-4 border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Real-time feed of autonomous actions across all projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-1/3 bg-muted animate-pulse rounded"></div>
                      <div className="h-3 w-1/2 bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-6">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 group">
                    <div className="mt-0.5 rounded-full p-1.5 border border-border bg-background">
                      {item.type === 'task_completed' && <CheckCircle className="h-4 w-4 text-chart-3" />}
                      {item.type === 'pr_opened' && <GitPullRequest className="h-4 w-4 text-chart-2" />}
                      {item.type === 'pr_merged' && <GitMerge className="h-4 w-4 text-chart-2" />}
                      {item.type === 'issue_found' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                      {item.type === 'scan_complete' && <Search className="h-4 w-4 text-primary" />}
                      {item.type === 'task_approved' && <CheckCircle className="h-4 w-4 text-chart-3" />}
                      {!['task_completed', 'pr_opened', 'pr_merged', 'issue_found', 'scan_complete', 'task_approved'].includes(item.type) && <Activity className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                          {item.title}
                        </p>
                        <span className="text-xs text-muted-foreground font-mono">
                          {format(new Date(item.createdAt), 'HH:mm:ss')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="flex items-center pt-1 gap-2">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded font-mono">
                          {item.projectName}
                        </Badge>
                        {item.severity && (
                          <Badge variant={item.severity === 'critical' ? 'destructive' : 'outline'} className="text-[10px] px-1.5 py-0 rounded">
                            {item.severity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <Activity className="mx-auto h-10 w-10 opacity-20 mb-3" />
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border/50 bg-card">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Platform health and agent capacity.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Agent Capacity</span>
                    <span className="text-sm font-mono text-muted-foreground">42%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[42%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">API Rate Limits</span>
                    <span className="text-sm font-mono text-muted-foreground">12%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-chart-3 w-[12%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Model Latency</span>
                    <span className="text-sm font-mono text-muted-foreground">840ms</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-chart-4 w-[60%] rounded-full"></div>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-border/50">
                  <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/projects" className="flex items-center justify-center gap-2 p-2 rounded-md bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors">
                      <TerminalSquare className="h-4 w-4" /> View Projects
                    </Link>
                    <Link href="/tasks" className="flex items-center justify-center gap-2 p-2 rounded-md bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors">
                      <ListTodo className="h-4 w-4" /> Pending Tasks
                    </Link>
                  </div>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
