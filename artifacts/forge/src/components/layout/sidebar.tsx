import { Link, useLocation } from "wouter";
import { Activity, GitMerge, LayoutDashboard, ListTodo, MessageSquare, ShieldAlert, TerminalSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: TerminalSquare },
  { name: "Tasks", href: "/tasks", icon: ListTodo },
  { name: "Pull Requests", href: "/pull-requests", icon: GitMerge },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Audit Log", href: "/audit", icon: Activity },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center border-b px-4">
        <ShieldAlert className="mr-2 h-6 w-6 text-primary" />
        <span className="font-mono text-lg font-bold tracking-tight text-sidebar-foreground">AcronIQ Forge</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <span className="text-xs font-mono font-bold text-primary">EN</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Engineer</span>
            <span className="text-xs text-muted-foreground">Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
