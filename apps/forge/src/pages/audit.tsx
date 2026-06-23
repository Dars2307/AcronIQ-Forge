import { useState } from "react";
import { useListAuditEntries, getListAuditEntriesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Activity, Shield, Terminal, Key, User, Database, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Audit() {
  const [entityType, setEntityType] = useState<string>("all");
  
  const params = entityType !== "all" ? { entityType } : undefined;
  
  const { data: entries, isLoading } = useListAuditEntries(params, {
    query: { queryKey: getListAuditEntriesQueryKey(params) }
  });

  const getIconForAction = (action: string, entity: string) => {
    if (action.includes('login') || action.includes('auth')) return <Key className="h-4 w-4" />;
    if (entity === 'project') return <Database className="h-4 w-4" />;
    if (entity === 'task') return <Terminal className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 mb-8 border-b pb-4 border-border/50">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-mono text-primary flex items-center gap-3">
            <Activity className="h-8 w-8" /> 
            Audit Log
          </h2>
          <p className="text-muted-foreground mt-1">Immutable chronological record of all system events.</p>
        </div>
        <div className="w-full md:w-64">
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger className="font-mono bg-card">
              <SelectValue placeholder="Filter by entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="pull_request">Pull Requests</SelectItem>
              <SelectItem value="conversation">Conversations</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-border/50 bg-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 font-mono border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">Actor</th>
                  <th className="px-6 py-4 font-medium">Entity</th>
                  <th className="px-6 py-4 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="animate-pulse bg-background/50">
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-muted rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-muted rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-muted rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-48 bg-muted rounded"></div></td>
                    </tr>
                  ))
                ) : entries && entries.length > 0 ? (
                  entries.map((entry) => (
                    <tr key={entry.id} className="bg-background hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-muted-foreground text-xs">
                        {format(new Date(entry.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-medium">
                          <span className="text-primary/70">{getIconForAction(entry.action, entry.entityType)}</span>
                          {entry.action}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {entry.actor === 'system' || entry.actor === 'agent' ? (
                             <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/20 font-mono text-[10px] uppercase">
                               {entry.actor}
                             </Badge>
                          ) : (
                             <span className="flex items-center gap-1 text-muted-foreground">
                               <User className="h-3 w-3" /> {entry.actor}
                             </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="uppercase text-muted-foreground">{entry.entityType}</span>
                          {entry.entityId && <span className="text-foreground">#{entry.entityId}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground max-w-xs truncate" title={entry.details || ""}>
                        {entry.details || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-8 w-8 opacity-20 mb-2" />
                        <p>No audit records found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
