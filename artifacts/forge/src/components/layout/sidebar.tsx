import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  FolderGit2,
  ListTodo,
  GitPullRequest,
  MessageSquare,
  ScrollText,
  Bot,
  Laptop,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@workspace/replit-auth-web";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderGit2 },
  { href: "/devices", label: "Devices", icon: Laptop },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/pull-requests", label: "Pull Requests", icon: GitPullRequest },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/audit", label: "Audit Log", icon: ScrollText },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"
    : "U";

  return (
    <div className="flex h-screen w-56 flex-col border-r bg-sidebar shrink-0">
      <div className="flex h-14 items-center border-b px-4 gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold font-mono text-sidebar-foreground leading-tight">AcronIQ Forge</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Engineering Platform</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? location === "/" : location.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 shrink-0",
                isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
              )} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            location.startsWith("/settings")
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )}
        >
          <Settings className={cn(
            "h-4 w-4 shrink-0",
            location.startsWith("/settings") ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
          )} />
          Settings
        </Link>

        <div className="flex items-center gap-2.5 px-3 py-2">
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt={initials} className="w-6 h-6 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user?.email ?? "Engineer"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">Admin</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="text-muted-foreground hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
