import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainLayout } from "@/components/layout/main-layout";
import NotFound from "@/pages/not-found";
import { useAuth } from "@workspace/replit-auth-web";
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

function LoginPage() {
  const { login } = useAuth();
  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-violet-600/8 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 h-60 w-60 rounded-full bg-indigo-600/6 blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(263 70% 58%) 1px, transparent 1px), linear-gradient(90deg, hsl(263 70% 58%) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8 px-6">
        {/* Logo mark */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 shadow-2xl shadow-violet-900/60 ring-1 ring-violet-500/20">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              AcronIQ Forge
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Autonomous engineering platform
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl border border-border bg-card/60 p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-6 text-center">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Autonomous software engineering for AcronIQ projects. Sign in to access your command centre.
            </p>
          </div>

          <button
            onClick={login}
            className="w-full rounded-xl bg-violet-600 py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition-all hover:bg-violet-500 hover:shadow-violet-900/60 active:scale-[0.98]"
          >
            Sign in to continue
          </button>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Secure · Internal</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground/40 text-center">
          AcronIQ Forge — Internal Engineering Platform
        </p>
      </div>
    </div>
  );
}

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

function AppInner() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppInner />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
