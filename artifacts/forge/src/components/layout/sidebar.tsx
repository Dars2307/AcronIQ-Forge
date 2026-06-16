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
  Zap,
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
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
      user.email?.[0]?.toUpperCase() ||
      "U"
    : "U";

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : user?.email ?? "Engineer";

  return (
    <aside className="relative flex h-screen w-56 shrink-0 flex-col bg-sidebar border-r border-sidebar-border overflow-hidden">
      {/* Atmospheric violet glow */}
      <div className="pointer-events-none absolute -top-12 -left-12 h-40 w-40 rounded-full bg-violet-600/10 blur-3xl" />

      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600 shadow-lg shadow-violet-900/50">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
            AcronIQ Forge
          </p>
          <p className="text-[10px] text-muted-foreground leading-tight">Engineering Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? location === "/" : location.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_hsl(263,30%,20%)]"
                  : "text-sidebar-foreground/50 hover:bg-sidebar-border/40 hover:text-sidebar-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-violet-400"
                    : "text-sidebar-foreground/30 group-hover:text-sidebar-foreground/70"
                )}
              />
              <span className="truncate">{label}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="shrink-0 border-t border-sidebar-border px-2 py-2 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
            location.startsWith("/settings")
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/50 hover:bg-sidebar-border/40 hover:text-sidebar-foreground"
          )}
        >
          <Settings
            className={cn(
              "h-4 w-4 shrink-0",
              location.startsWith("/settings")
                ? "text-violet-400"
                : "text-sidebar-foreground/30 group-hover:text-sidebar-foreground/70"
            )}
          />
          Settings
        </Link>

        {/* User row */}
        <div className="flex items-center gap-2.5 rounded-md px-3 py-2">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={initials}
              className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-violet-500/30"
            />
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-[10px] font-bold text-white">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-sidebar-foreground/80">
              {displayName}
            </p>
            <p className="text-[10px] text-muted-foreground/60 truncate">Administrator</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="shrink-0 text-muted-foreground/40 transition-colors hover:text-sidebar-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
