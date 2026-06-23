import { useState } from "react";
import { useListPullRequests, getListPullRequestsQueryKey, useMergePullRequest, useClosePullRequest } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { GitPullRequest, GitMerge, GitBranch, ExternalLink, X, Check, Search, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function PullRequests() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [search, setSearch] = useState("");
  
  const params = statusFilter !== "all" ? { status: statusFilter } : undefined;
  
  const { data: prs, isLoading } = useListPullRequests(params, {
    query: { queryKey: getListPullRequestsQueryKey(params) }
  });

  const mergePr = useMergePullRequest();
  const closePr = useClosePullRequest();

  const handleAction = (action: 'merge' | 'close', id: number) => {
    const mutation = action === 'merge' ? mergePr : closePr;
    mutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPullRequestsQueryKey(params) });
      }
    });
  };

  const filteredPrs = prs?.filter(pr => 
    pr.title.toLowerCase().includes(search.toLowerCase()) || 
    (pr.projectName && pr.projectName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <div className="flex items-center justify-between space-y-2 mb-8 border-b pb-4 border-border/50">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-mono text-primary flex items-center gap-3">
            <GitPullRequest className="h-8 w-8" /> 
            Pull Requests
          </h2>
          <p className="text-muted-foreground mt-1">Review and manage code proposed by the autonomous agent.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search title or project..."
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
              <SelectItem value="all">All PRs</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="merged">Merged</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="h-6 w-3/4 bg-muted animate-pulse rounded mb-4"></div>
                <div className="h-16 w-full bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredPrs && filteredPrs.length > 0 ? (
          filteredPrs.map(pr => (
            <Card key={pr.id} className="border-border/50 bg-card hover-elevate transition-all overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {pr.status === 'merged' ? (
                           <GitMerge className="h-5 w-5 text-chart-2" />
                        ) : pr.status === 'closed' ? (
                           <X className="h-5 w-5 text-destructive" />
                        ) : (
                           <GitPullRequest className="h-5 w-5 text-chart-3" />
                        )}
                        <h3 className="text-lg font-semibold">{pr.title}</h3>
                        <Badge variant="outline" className="font-mono bg-secondary/50 text-[10px]">
                          #{pr.id}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground font-mono">
                        <span className="flex items-center gap-1">
                           <TerminalSquare className="h-3 w-3" /> {pr.projectName}
                        </span>
                        <span className="flex items-center gap-1 bg-secondary px-1.5 py-0.5 rounded text-[10px]">
                           <GitBranch className="h-3 w-3" /> {pr.branch}
                        </span>
                      </div>
                    </div>
                    <Badge variant={
                      pr.status === 'open' ? 'default' :
                      pr.status === 'merged' ? 'secondary' : 'outline'
                    } className="uppercase font-mono text-[10px]">
                      {pr.status}
                    </Badge>
                  </div>
                  
                  {pr.description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
                      {pr.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-4 text-xs font-mono">
                     <span className="text-chart-3 flex items-center gap-1">+{pr.additions || 0}</span>
                     <span className="text-destructive flex items-center gap-1">-{pr.deletions || 0}</span>
                     <span className="text-muted-foreground border-l border-border pl-4">{pr.filesChanged || 0} files changed</span>
                     <span className="text-muted-foreground ml-auto">
                       Created {formatDistanceToNow(new Date(pr.createdAt))} ago
                     </span>
                  </div>
                </div>
                
                <div className="bg-secondary/30 p-4 md:w-64 border-t md:border-t-0 md:border-l border-border/50 flex flex-col justify-center gap-2">
                   {pr.url && (
                     <Button variant="outline" className="w-full justify-start font-mono text-xs" asChild>
                       <a href={pr.url} target="_blank" rel="noreferrer">
                         <ExternalLink className="mr-2 h-4 w-4" /> View in GitHub
                       </a>
                     </Button>
                   )}
                   
                   {pr.status === 'open' && (
                     <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full justify-start font-mono text-xs bg-chart-2 hover:bg-chart-2/90 text-primary-foreground">
                              <GitMerge className="mr-2 h-4 w-4" /> Merge PR
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Merge Pull Request</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to merge "{pr.title}" into the base branch? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}>Cancel</Button>
                              <Button onClick={() => handleAction('merge', pr.id)} disabled={mergePr.isPending}>
                                {mergePr.isPending ? "Merging..." : "Confirm Merge"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 font-mono text-xs" onClick={() => handleAction('close', pr.id)} disabled={closePr.isPending}>
                          <X className="mr-2 h-4 w-4" /> Close without merging
                        </Button>
                     </>
                   )}

                   {pr.status === 'merged' && pr.mergedAt && (
                      <div className="text-center p-3 border border-chart-2/30 bg-chart-2/10 rounded-md">
                        <Check className="mx-auto h-5 w-5 text-chart-2 mb-1" />
                        <span className="text-xs font-medium text-chart-2">Merged</span>
                        <p className="text-[10px] text-muted-foreground mt-1 font-mono">{format(new Date(pr.mergedAt), 'MMM d, yyyy')}</p>
                      </div>
                   )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 border border-dashed rounded-lg bg-card/30">
            <GitPullRequest className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No pull requests</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {statusFilter !== 'all' ? `There are no ${statusFilter} pull requests.` : "The agent has not created any pull requests yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
