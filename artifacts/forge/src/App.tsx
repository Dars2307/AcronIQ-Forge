import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainLayout } from "@/components/layout/main-layout";
import NotFound from "@/pages/not-found";
import { useAuth } from "@workspace/replit-auth-web";

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
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function LoginPage() {
  const { login } = useAuth();
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-8 max-w-sm w-full px-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-cyan-400">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">AcronIQ Forge</h1>
            <p className="text-sm text-zinc-500 mt-1">Autonomous engineering platform</p>
          </div>
        </div>
        <div className="w-full border border-zinc-800 rounded-xl p-8 bg-zinc-900/50 flex flex-col gap-5">
          <div className="text-center">
            <p className="text-zinc-300 text-sm leading-relaxed">
              Autonomous software engineering for AcronIQ projects.
            </p>
          </div>
          <button
            onClick={login}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
          >
            Sign in to continue
          </button>
        </div>
        <p className="text-xs text-zinc-600 text-center">
          AcronIQ Forge &mdash; Internal Engineering Platform
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
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
