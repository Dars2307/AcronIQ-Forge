export function CommandVariant() {
  const nav = [
    { icon: "⬡", label: "Dashboard", active: true },
    { icon: "◫", label: "Projects" },
    { icon: "⬢", label: "Devices" },
    { icon: "≡", label: "Tasks" },
    { icon: "◈", label: "Agents" },
    { icon: "⎇", label: "Pull Requests" },
    { icon: "◎", label: "Chat" },
    { icon: "▤", label: "Audit Log" },
  ];

  const stats = [
    { label: "Active Projects", value: "0", sub: "0 total · avg health 0%", accent: "#00d4ff" },
    { label: "Open Tasks", value: "0", sub: "0 awaiting approval", accent: "#f59e0b" },
    { label: "Pull Requests", value: "0", sub: "0 tasks this week", accent: "#22d3ee" },
    { label: "Critical Issues", value: "0", sub: "Requires attention", accent: "#ef4444" },
    { label: "Connected Devices", value: "0", sub: "Forge Seed agents online", accent: "#10b981" },
    { label: "Agents Active", value: "0", sub: "Engineering agents enabled", accent: "#00d4ff" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#070710", fontFamily: "'Inter', 'SF Pro', system-ui, sans-serif", color: "#e2e8f0", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: "#0a0a18", borderRight: "1px solid #1a1a35", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px 18px", borderBottom: "1px solid #1a1a35", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #00d4ff22, #00d4ff08)", border: "1px solid #00d4ff40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#00d4ff" }}>⬡</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.3px" }}>AcronIQ Forge</div>
            <div style={{ fontSize: 10, color: "#475569" }}>Engineering Platform</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {nav.map(({ icon, label, active }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
              borderRadius: 8, cursor: "pointer", position: "relative",
              background: active ? "linear-gradient(90deg, #00d4ff12, #00d4ff04)" : "transparent",
              color: active ? "#00d4ff" : "#64748b",
              fontSize: 13, fontWeight: active ? 600 : 400,
              borderLeft: active ? "2px solid #00d4ff60" : "2px solid transparent",
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 12, opacity: active ? 1 : 0.5 }}>{icon}</span>
              {label}
              {active && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 6px #00d4ff" }} />}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid #1a1a35", padding: "10px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, color: "#475569", fontSize: 13, cursor: "pointer" }}>
            <span style={{ fontSize: 12 }}>⚙</span> Settings
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #00d4ff30, #00d4ff10)", border: "1px solid #00d4ff30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#00d4ff" }}>AE</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>Admin Engineer</div>
              <div style={{ fontSize: 10, color: "#334155" }}>Admin</div>
            </div>
            <span style={{ fontSize: 11, color: "#334155", cursor: "pointer" }}>⎋</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{ padding: "20px 32px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: "#00d4ff50", letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>System Online</span>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", margin: 0, letterSpacing: "-0.5px" }}>Forge Command Centre</h1>
            <p style={{ fontSize: 13, color: "#475569", margin: "4px 0 0" }}>System status and recent autonomous activity.</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ padding: "6px 12px", borderRadius: 20, border: "1px solid #00d4ff30", fontSize: 11, color: "#00d4ff", letterSpacing: 1, textTransform: "uppercase" }}>All Systems Go</div>
          </div>
        </div>

        {/* First-time banner */}
        <div style={{ margin: "20px 32px 0", padding: "16px 20px", borderRadius: 12, border: "1px solid #00d4ff20", background: "linear-gradient(90deg, #00d4ff08, #070710)", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#00d4ff10", border: "1px solid #00d4ff25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>⬢</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>No projects connected.</div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>Install Forge Seed on your machine to begin monitoring projects.</div>
          </div>
          <div style={{ padding: "8px 16px", borderRadius: 8, background: "#00d4ff", color: "#020817", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Install Forge Seed</div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, padding: "20px 32px 0" }}>
          {stats.map(({ label, value, sub, accent }) => (
            <div key={label} style={{ background: "#0d0d1e", border: "1px solid #1a1a35", borderRadius: 10, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 40, height: 40, background: `radial-gradient(circle at 100% 0%, ${accent}12 0%, transparent 70%)` }} />
              <div style={{ fontSize: 10, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: accent, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 10, color: "#334155", marginTop: 6, lineHeight: 1.4 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Bottom grid */}
        <div style={{ display: "grid", gridTemplateColumns: "4fr 3fr", gap: 16, padding: "20px 32px 32px" }}>
          {/* Activity feed */}
          <div style={{ background: "#0d0d1e", border: "1px solid #1a1a35", borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>Recent Activity</div>
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 20 }}>Real-time feed of autonomous actions across all projects.</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1a1a35", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, opacity: 0.4 }}>◎</div>
              <div style={{ fontSize: 13, color: "#475569" }}>No recent activity</div>
              <div style={{ fontSize: 11, color: "#334155" }}>Activity will appear here once Forge Seed is connected.</div>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ background: "#0d0d1e", border: "1px solid #1a1a35", borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>Quick Actions</div>
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 16 }}>Common tasks and navigation shortcuts.</div>
            {[
              { icon: "◫", label: "View Projects", sub: "0 registered" },
              { icon: "⬢", label: "Manage Devices", sub: "0 online" },
              { icon: "◈", label: "Engineering Agents", sub: "Configure agents" },
              { icon: "≡", label: "Pending Tasks", sub: "0 awaiting approval" },
              { icon: "⎇", label: "Pull Requests", sub: "0 open" },
            ].map(({ icon, label, sub }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, background: "#0a0a18", marginBottom: 6, cursor: "pointer", border: "1px solid #1a1a3520" }}>
                <span style={{ fontSize: 14, color: "#00d4ff", opacity: 0.7 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>{label}</div>
                  <div style={{ fontSize: 10, color: "#475569" }}>{sub}</div>
                </div>
                <span style={{ fontSize: 10, color: "#334155" }}>›</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
