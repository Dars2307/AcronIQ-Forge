import { useState } from "react";
import { useListTasks, getListTasksQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { Activity, Clock, CheckCircle, AlertTriangle, ListTodo, Search } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tasks() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const params = statusFilter !== "all" ? { status: statusFilter } : undefined;
  
  const { data: tasks, isLoading } = useListTasks(params, {
    query: { queryKey: getListTasksQueryKey(params) }
  });

  const filteredTasks = tasks?.filter(t => 
    t.prompt.toLowerCase().includes(search.toLowerCase()) || 
    (t.projectName && t.projectName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <div className="flex items-center justify-between space-y-2 mb-8 border-b pb-4 border-border/50">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-mono text-primary">Tasks Log</h2>
          <p className="text-muted-foreground mt-1">Review autonomous engineering operations.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search prompt or project..."
            className="pl-9 font-mono bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="font-mono bg-card">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
           <div className="space-y-4">
           {[1, 2, 3, 4, 5].map(i => (
             <Card key={i} className="border-border/50 bg-card/50">
               <CardContent className="p-6">
                 <div className="h-6 w-3/4 bg-muted animate-pulse rounded mb-4"></div>
                 <div className="flex gap-4">
                   <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                   <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                 </div>
               </CardContent>
             </Card>
           ))}
         </div>
        ) : filteredTasks && filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <Link key={task.id} href={`/tasks/${task.id}`}>
              <Card className="border-border/50 bg-card hover-elevate transition-all cursor-pointer">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px] uppercase bg-secondary/50">
                          {task.projectName || `Project #${task.projectId}`}
                        </Badge>
                        <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                          {task.type}
                        </Badge>
                        {task.status === 'awaiting_approval' && (
                           <Badge variant="outline" className="border-chart-4 text-chart-4 text-[10px] uppercase animate-pulse">
                             Requires Review
                           </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">{task.prompt}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-mono mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created {formatDistanceToNow(new Date(task.createdAt))} ago
                        </span>
                        {task.completedAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-chart-3" />
                            Completed {format(new Date(task.completedAt), 'HH:mm')}
                          </span>
                        )}
                        {task.confidenceScore !== null && task.confidenceScore !== undefined && (
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            Confidence: {task.confidenceScore}%
                          </span>
                        )}
                        {task.filesModified && task.filesModified.length > 0 && (
                          <span className="flex items-center gap-1 border border-border/50 px-1.5 rounded bg-secondary/30">
                            {task.filesModified.length} files
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center sm:justify-end">
                       <Badge variant={
                          task.status === 'completed' ? 'default' :
                          task.status === 'running' ? 'secondary' :
                          task.status === 'awaiting_approval' ? 'outline' :
                          task.status === 'failed' || task.status === 'rejected' ? 'destructive' : 'secondary'
                        } className="uppercase text-[10px] whitespace-nowrap">
                          {task.status}
                        </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 border border-dashed rounded-lg bg-card/30">
            <ListTodo className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No tasks found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {search || statusFilter !== 'all' ? "Try adjusting your filters." : "No engineering tasks have been executed yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
