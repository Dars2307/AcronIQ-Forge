import { useParams, useLocation } from "wouter";
import { useGetTask, getGetTaskQueryKey, useApproveTask, useRejectTask } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Check, X, ServerCrash, Clock, FileCode, PlayCircle, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TaskDetail() {
  const { id } = useParams();
  const taskId = parseInt(id || "0", 10);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: task, isLoading } = useGetTask(taskId, {
    query: { queryKey: getGetTaskQueryKey(taskId), enabled: !!taskId }
  });

  const approveTask = useApproveTask();
  const rejectTask = useRejectTask();

  const handleApprove = () => {
    approveTask.mutate({ id: taskId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
      }
    });
  };

  const handleReject = () => {
    rejectTask.mutate({ id: taskId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-8 bg-background">
        <div className="h-8 w-1/3 bg-muted animate-pulse rounded mb-4"></div>
        <div className="h-32 bg-card animate-pulse rounded-xl border border-border/50 mb-8"></div>
        <div className="h-64 bg-card animate-pulse rounded-xl border border-border/50"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-background">
        <div className="text-center">
          <ServerCrash className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">Task not found</h3>
          <p className="text-sm text-muted-foreground mt-1">The requested task ID could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 mb-6 border-b pb-4 border-border/50">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold tracking-tight font-mono text-primary">Task #{task.id}</h2>
            <Badge variant={
              task.status === 'completed' ? 'default' :
              task.status === 'running' ? 'secondary' :
              task.status === 'awaiting_approval' ? 'outline' :
              task.status === 'failed' || task.status === 'rejected' ? 'destructive' : 'secondary'
            } className="font-mono text-xs uppercase">
              {task.status === 'running' && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              {task.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2">
             <Badge variant="secondary" className="font-mono text-[10px] uppercase">
               Project: {task.projectName || task.projectId}
             </Badge>
             <Badge variant="outline" className="font-mono text-[10px] uppercase">
               Type: {task.type}
             </Badge>
             <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
               <Clock className="h-3 w-3" /> {format(new Date(task.createdAt), 'PPP HH:mm')}
             </span>
          </div>
        </div>
        
        {task.status === 'awaiting_approval' && (
          <div className="flex items-center space-x-3 bg-secondary/30 p-3 rounded-lg border border-border/50">
            <span className="text-sm font-medium mr-2">Review Required:</span>
            <Button size="sm" variant="destructive" onClick={handleReject} disabled={rejectTask.isPending || approveTask.isPending} className="font-mono">
              <X className="mr-1 h-4 w-4" /> Reject
            </Button>
            <Button size="sm" variant="default" onClick={handleApprove} disabled={rejectTask.isPending || approveTask.isPending} className="font-mono">
              <Check className="mr-1 h-4 w-4" /> Approve Plan
            </Button>
          </div>
        )}
      </div>

      <Card className="border-border/50 bg-card mb-6">
        <CardHeader className="pb-3">
           <CardTitle className="text-sm text-muted-foreground uppercase font-mono tracking-wider">Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base font-medium leading-relaxed">{task.prompt}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card className="border-border/50 bg-card md:col-span-2">
          <CardHeader className="pb-3">
             <CardTitle className="text-sm text-muted-foreground uppercase font-mono tracking-wider">Execution Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {task.plan ? (
              <div className="bg-background rounded-md p-4 border border-border/50 font-mono text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed overflow-auto max-h-[400px]">
                {task.plan}
              </div>
            ) : (
               <div className="text-center py-10 text-muted-foreground border border-dashed border-border/50 rounded-md">
                 <PlayCircle className="mx-auto h-8 w-8 opacity-20 mb-2" />
                 <p className="text-sm">Plan is being generated...</p>
               </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3">
               <CardTitle className="text-sm text-muted-foreground uppercase font-mono tracking-wider">Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                 <p className="text-xs text-muted-foreground font-mono mb-1">Confidence Score</p>
                 <div className="flex items-center justify-between">
                   <span className="font-mono font-bold text-lg">{task.confidenceScore ?? '--'}%</span>
                 </div>
                 {task.confidenceScore && (
                   <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mt-1">
                      <div className={`h-full rounded-full ${task.confidenceScore >= 80 ? 'bg-chart-3' : task.confidenceScore >= 50 ? 'bg-chart-4' : 'bg-destructive'}`} style={{ width: `${task.confidenceScore}%` }}></div>
                   </div>
                 )}
               </div>
               <div>
                 <p className="text-xs text-muted-foreground font-mono mb-1">Build Status</p>
                 <Badge variant={task.buildStatus === 'success' ? 'default' : task.buildStatus === 'failed' ? 'destructive' : 'secondary'} className="font-mono uppercase text-[10px]">
                   {task.buildStatus || 'N/A'}
                 </Badge>
               </div>
               <div>
                 <p className="text-xs text-muted-foreground font-mono mb-1">Completed At</p>
                 <p className="font-mono text-sm">{task.completedAt ? format(new Date(task.completedAt), 'HH:mm:ss') : 'N/A'}</p>
               </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3">
               <CardTitle className="text-sm text-muted-foreground uppercase font-mono tracking-wider flex items-center gap-2">
                 <FileCode className="h-4 w-4" /> Files Modified
               </CardTitle>
            </CardHeader>
            <CardContent>
               {task.filesModified && task.filesModified.length > 0 ? (
                 <ul className="space-y-2">
                   {task.filesModified.map((file, i) => (
                     <li key={i} className="text-xs font-mono text-muted-foreground bg-secondary/30 p-2 rounded border border-border/50 truncate" title={file}>
                       {file}
                     </li>
                   ))}
                 </ul>
               ) : (
                 <p className="text-sm text-muted-foreground italic">No files modified yet</p>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
