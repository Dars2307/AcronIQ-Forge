import { useParams } from "wouter";
import { useGetProject, getGetProjectQueryKey, useListProjectIssues, getListProjectIssuesQueryKey, useGetProjectSummary, getGetProjectSummaryQueryKey, useTriggerScan, useListTasks, getListTasksQueryKey, useUpdateProject } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { Activity, AlertTriangle, CheckCircle, Clock, GitBranch, ShieldCheck, TerminalSquare, Settings, Play, ServerCrash, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProjectDetail() {
  const { id } = useParams();
  const projectId = parseInt(id || "0", 10);
  const queryClient = useQueryClient();
  
  const { data: project, isLoading: isLoadingProject } = useGetProject(projectId, {
    query: { queryKey: getGetProjectQueryKey(projectId) }
  });

  const { data: summary, isLoading: isLoadingSummary } = useGetProjectSummary(projectId, {
    query: { queryKey: getGetProjectSummaryQueryKey(projectId) }
  });

  const { data: issues, isLoading: isLoadingIssues } = useListProjectIssues(projectId, {
    query: { queryKey: getListProjectIssuesQueryKey(projectId) }
  });

  const { data: tasks, isLoading: isLoadingTasks } = useListTasks({ projectId }, {
    query: { queryKey: getListTasksQueryKey({ projectId }) }
  });

  const triggerScan = useTriggerScan();
  const updateProject = useUpdateProject();

  const handleTriggerScan = () => {
    triggerScan.mutate({ id: projectId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey({ projectId }) });
      }
    });
  };

  if (isLoadingProject) {
    return (
      <div className="flex-1 overflow-auto p-8 bg-background">
        <div className="h-8 w-1/3 bg-muted animate-pulse rounded mb-4"></div>
        <div className="h-4 w-1/4 bg-muted animate-pulse rounded mb-8"></div>
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-card animate-pulse rounded-xl border border-border/50"></div>)}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-background">
        <div className="text-center">
          <ServerCrash className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">Project not found</h3>
          <p className="text-sm text-muted-foreground mt-1">The project you are looking for does not exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 mb-8 border-b pb-4 border-border/50">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <TerminalSquare className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight font-mono text-primary">{project.name}</h2>
            <Badge variant={
              project.status === 'active' ? 'default' :
              project.status === 'scanning' ? 'secondary' :
              project.status === 'error' ? 'destructive' : 'outline'
            } className="font-mono text-xs ml-2 uppercase">
              {project.status === 'scanning' && <RefreshCw className="mr-1 h-3 w-3 animate-spin" />}
              {project.status}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono text-sm">{project.repoUrl}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="font-mono text-xs">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Button>
          <Button 
            className="font-mono text-xs" 
            onClick={handleTriggerScan} 
            disabled={project.status === 'scanning' || triggerScan.isPending}
          >
            {project.status === 'scanning' || triggerScan.isPending ? (
              <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Scanning...</>
            ) : (
              <><Play className="mr-2 h-4 w-4" /> Trigger Scan</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-border/50 bg-card hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Health Score</CardTitle>
            {project.healthScore >= 90 ? <ShieldCheck className="h-4 w-4 text-chart-3" /> : 
             project.healthScore >= 70 ? <Activity className="h-4 w-4 text-chart-4" /> : 
             <AlertTriangle className="h-4 w-4 text-destructive" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{project.healthScore}%</div>
            <div className="h-1 w-full bg-secondary rounded-full overflow-hidden mt-2">
              <div 
                className={`h-full rounded-full ${
                  project.healthScore >= 90 ? 'bg-chart-3' : 
                  project.healthScore >= 70 ? 'bg-chart-4' : 'bg-destructive'
                }`}
                style={{ width: `${project.healthScore}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        
        {summary && (
          <>
            <Card className="border-border/50 bg-card hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Open Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{summary.openIssues}</div>
                <p className="text-xs text-muted-foreground mt-1"><span className="text-destructive font-medium">{summary.criticalIssues} critical</span></p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Tasks</CardTitle>
                <Activity className="h-4 w-4 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{summary.openTasks}</div>
                <p className="text-xs text-muted-foreground mt-1">In progress</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Files Indexed</CardTitle>
                <TerminalSquare className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{summary.filesIndexed}</div>
                <p className="text-xs text-muted-foreground mt-1">Codebase context</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="issues" className="space-y-6">
        <TabsList className="bg-secondary/50 border border-border/50">
          <TabsTrigger value="issues" className="font-mono text-xs">Issues</TabsTrigger>
          <TabsTrigger value="tasks" className="font-mono text-xs">Tasks</TabsTrigger>
          <TabsTrigger value="details" className="font-mono text-xs">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="issues" className="space-y-4">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle>Identified Issues</CardTitle>
              <CardDescription>Vulnerabilities, bugs, and improvements identified by Forge.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingIssues ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-muted/50 animate-pulse rounded"></div>)}
                </div>
              ) : issues && issues.length > 0 ? (
                <div className="space-y-4">
                  {issues.map(issue => (
                    <div key={issue.id} className="flex items-start justify-between p-4 border border-border/50 rounded-lg bg-background">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            issue.severity === 'critical' ? 'destructive' :
                            issue.severity === 'high' ? 'default' :
                            issue.severity === 'medium' ? 'secondary' : 'outline'
                          } className="text-[10px] uppercase">
                            {issue.severity}
                          </Badge>
                          <span className="font-mono text-sm text-primary">{issue.type}</span>
                          <Badge variant="outline" className="text-[10px] uppercase font-mono">
                            {issue.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{issue.message}</p>
                        <div className="text-xs font-mono text-muted-foreground bg-secondary/50 p-2 rounded w-fit">
                          {issue.filePath}{issue.line ? `:${issue.line}` : ''}
                        </div>
                      </div>
                      <div className="pl-4">
                        {issue.status === 'open' && (
                          <Button size="sm" variant="secondary" className="font-mono text-xs">Fix Issue</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShieldCheck className="mx-auto h-10 w-10 text-chart-3 mb-3 opacity-80" />
                  <p className="text-sm text-muted-foreground">No open issues found. Codebase is clean.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-4">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle>Task History</CardTitle>
              <CardDescription>Autonomous actions and scans performed on this project.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTasks ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-muted/50 animate-pulse rounded"></div>)}
                </div>
              ) : tasks && tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map(task => (
                    <Link key={task.id} href={`/tasks/${task.id}`}>
                      <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-background hover:bg-secondary/50 transition-colors cursor-pointer mb-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] uppercase font-mono bg-secondary">{task.type}</Badge>
                            <span className="font-medium text-sm truncate max-w-[400px]">{task.prompt}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(task.createdAt))} ago</span>
                            {task.confidenceScore && <span>Confidence: {task.confidenceScore}%</span>}
                          </div>
                        </div>
                        <Badge variant={
                          task.status === 'completed' ? 'default' :
                          task.status === 'running' ? 'secondary' :
                          task.status === 'awaiting_approval' ? 'outline' :
                          task.status === 'failed' || task.status === 'rejected' ? 'destructive' : 'secondary'
                        } className="uppercase text-[10px]">
                          {task.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="mx-auto h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">No tasks history.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-mono">Language</span>
                  <p className="font-mono text-sm font-medium">{project.language}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-mono">Branch</span>
                  <div className="flex items-center gap-1 font-mono text-sm font-medium">
                    <GitBranch className="h-3 w-3" /> {project.branch}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-mono">Created At</span>
                  <p className="font-mono text-sm font-medium">{format(new Date(project.createdAt), 'PPP p')}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-mono">Last Scanned</span>
                  <p className="font-mono text-sm font-medium">{project.lastScanAt ? format(new Date(project.lastScanAt), 'PPP p') : 'Never'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
