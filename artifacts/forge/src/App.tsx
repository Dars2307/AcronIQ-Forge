import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainLayout } from "@/components/layout/main-layout";
import NotFound from "@/pages/not-found";
import { Zap } from "lucide-react";

import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/projects/[id]";
import Tasks from "@/pages/tasks";
import TaskDetail from "@/pages/tasks/[id]";
import Chat from "@/pages/chat";
import PullRequests from "@/pages/pull-requests";
import Audit from "@/pages/audit";
import Devices from "@/pages/devices";
import Agents from "@/pages/agents";
import Settings from "@/pages/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/projects" component={Projects} />
        <Route path="/projects/:id" component={ProjectDetail} />
        <Route path="/devices" component={Devices} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/agents" component={Agents} />
        <Route path="/pull-requests" component={PullRequests} />
        <Route path="/chat" component={Chat} />
        <Route path="/audit" component={Audit} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
