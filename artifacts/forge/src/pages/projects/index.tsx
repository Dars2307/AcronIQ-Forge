import { useState } from "react";
import { useListProjects, getListProjectsQueryKey, useCreateProject } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Activity, GitBranch, Clock, TerminalSquare, AlertTriangle, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  repoUrl: z.string().min(1, "Repo URL is required").url("Must be a valid URL"),
  branch: z.string().default("main"),
  language: z.string().default("typescript"),
});

export default function Projects() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const { data: projects, isLoading } = useListProjects({
    query: { queryKey: getListProjectsQueryKey() }
  });

  const createProject = useCreateProject();

  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      repoUrl: "",
      branch: "main",
      language: "typescript",
    },
  });

  const onSubmit = (values: z.infer<typeof createProjectSchema>) => {
    createProject.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          setIsCreateOpen(false);
          form.reset();
        },
      }
    );
  };

  const filteredProjects = projects?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.repoUrl.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <div className="flex items-center justify-between space-y-2 mb-8 border-b pb-4 border-border/50">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-mono text-primary">Projects</h2>
          <p className="text-muted-foreground mt-1">Manage repositories monitored by the Forge agent.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="font-mono">
                <Plus className="mr-2 h-4 w-4" /> Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
                <DialogDescription>
                  Register a repository for the Forge agent to monitor and maintain.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. core-api" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="repoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repository URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/org/repo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="branch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch</FormLabel>
                          <FormControl>
                            <Input placeholder="main" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <FormControl>
                            <Input placeholder="typescript" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit" disabled={createProject.isPending}>
                      {createProject.isPending ? "Adding..." : "Add Project"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center mb-6 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-9 font-mono bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-border/50 bg-card/50">
              <CardHeader className="space-y-2">
                <div className="h-5 w-1/2 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects && filteredProjects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="border-border/50 bg-card hover-elevate transition-all cursor-pointer h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2 font-mono">
                        <TerminalSquare className="h-4 w-4 text-primary" />
                        {project.name}
                      </CardTitle>
                      <CardDescription className="truncate max-w-[200px]" title={project.repoUrl}>
                        {project.repoUrl}
                      </CardDescription>
                    </div>
                    <Badge variant={
                      project.status === 'active' ? 'default' :
                      project.status === 'scanning' ? 'secondary' :
                      project.status === 'error' ? 'destructive' : 'outline'
                    } className="font-mono text-[10px] uppercase">
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3 flex-1">
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          {project.healthScore >= 90 ? <ShieldCheck className="h-3 w-3 text-chart-3" /> : 
                           project.healthScore >= 70 ? <Activity className="h-3 w-3 text-chart-4" /> : 
                           <AlertTriangle className="h-3 w-3 text-destructive" />}
                          Health Score
                        </span>
                        <span className="text-sm font-mono font-bold">{project.healthScore}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            project.healthScore >= 90 ? 'bg-chart-3' : 
                            project.healthScore >= 70 ? 'bg-chart-4' : 'bg-destructive'
                          }`}
                          style={{ width: `${project.healthScore}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <GitBranch className="h-3 w-3" />
                        <span className="font-mono">{project.branch}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground border border-border/50 px-1.5 rounded bg-secondary/50">
                        <span className="font-mono">{project.language}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-1 bg-secondary/20">
                  <Clock className="h-3 w-3" />
                  {project.lastScanAt ? (
                    <span>Last scanned {formatDistanceToNow(new Date(project.lastScanAt))} ago</span>
                  ) : (
                    <span>Never scanned</span>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed rounded-lg bg-card/30">
          <TerminalSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {search ? "No projects match your search query." : "Add your first repository to start monitoring."}
          </p>
          {!search && (
            <Button onClick={() => setIsCreateOpen(true)} className="font-mono">
              <Plus className="mr-2 h-4 w-4" /> Add Project
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
