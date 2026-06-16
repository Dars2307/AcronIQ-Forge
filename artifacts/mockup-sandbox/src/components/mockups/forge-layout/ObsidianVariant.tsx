export function ObsidianVariant() {
  const nav = [
    { icon: "◆", label: "Dashboard", active: true },
    { icon: "⬡", label: "Projects" },
    { icon: "◉", label: "Devices" },
    { icon: "⊞", label: "Tasks" },
    { icon: "❖", label: "Agents" },
    { icon: "⇌", label: "Pull Requests" },
    { icon: "◯", label: "Chat" },
    { icon: "≡", label: "Audit Log" },
  ];

  const stats = [
    { label: "Active Projects", value: "0", sub: "0 total", accent: "#a78bfa" },
    { label: "Open Tasks", value: "0", sub: "0 awaiting review", accent: "#f59e0b" },
    { label: "Pull Requests", value: "0", sub: "0 this week", accent: "#60a5fa" },
    { label: "Critical Issues", value: "0", sub: "All clear", accent: "#f87171" },
    { label: "Connected Devices", value: "0", sub: "0 agents online", accent: "#34d399" },
    { label: "Agents Active", value: "0", sub: "0 enabled", accent: "#a78bfa" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0c0c14", fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif", color: "#c4c4d4", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 228, background: "linear-gradient(180deg, #10101e 0%, #0c0c18 100%)", borderRight: "1px solid rgba(120,80,255,0.1)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "22px 18px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, boxShadow: "0 4px 12px rgba(124,58,237,0.4)"
            }}>⬡</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>AcronIQ Forge</div>
              <div style={{ fontSize: 10, color: "#4b4b6a" }}>Engineering Platform</div>
            </div>
          </div>
        </div>

        {/* Search pill */}
        <div style={{ margin: "12px 12px 4px", padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#3d3d5c" }}>⌕</span>
          <span style={{ fontSize: 12, color: "#3d3d5c" }}>Search...</span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: "#2d2d42", padding: "2px 5px", border: "1px solid #2d2d42", borderRadius: 4 }}>⌘K</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "4px 8px", display: "flex", flexDirection: "column", gap: 1 }}>
          <div style={{ fontSize: 9, color: "#2d2d48", letterSpacing: 1.5, textTransform: "uppercase", padding: "8px 10px 4px", fontWeight: 600 }}>Navigation</div>
          {nav.map(({ icon, label, active }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: 8, cursor: "pointer",
              background: active ? "linear-gradient(90deg, rgba(124,58,237,0.15), rgba(79,70,229,0.08))" : "transparent",
              color: active ? "#a78bfa" : "#4b4b6a",
              fontSize: 13, fontWeight: active ? 600 : 400,
              boxShadow: active ? "inset 0 0 0 1px rgba(124,58,237,0.2)" : "none",
            }}>
              <span style={{ fontSize: 11, opacity: active ? 1 : 0.4 }}>{icon}</span>
              {label}
              {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#7c3aed", boxShadow: "0 0 8px #7c3aed" }} />}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "10px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, color: "#4b4b6a", fontSize: 13, cursor: "pointer" }}>
            <span style={{ fontSize: 11, opacity: 0.4 }}>⚙</span> Settings
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#fff"
            }}>AE</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#7878a0" }}>Admin Engineer</div>
              <div style={{ fontSize: 10, color: "#3d3d58" }}>Administrator</div>
            </div>
            <span style={{ fontSize: 12, color: "#3d3d58", cursor: "pointer" }}>↗</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Header */}
        <div style={{ padding: "28px 36px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
              <span style={{ fontSize: 11, color: "#34d399", fontWeight: 600, letterSpacing: 0.5 }}>All systems operational</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.5px", lineHeight: 1.1 }}>Command Centre</h1>
            <p style={{ fontSize: 13, color: "#4b4b6a", margin: "6px 0 0" }}>System status and recent autonomous activity.</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
            <div style={{
              padding: "7px 14px", borderRadius: 20,
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.25)",
              fontSize: 12, color: "#a78bfa", fontWeight: 500
            }}>+ New Project</div>
          </div>
        </div>

        {/* No projects banner */}
        <div style={{
          margin: "24px 36px 0", padding: "20px 24px", borderRadius: 16,
          background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(79,70,229,0.04))",
          border: "1px solid rgba(124,58,237,0.15)",
          display: "flex", alignItems: "center", gap: 18
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.1))",
            border: "1px solid rgba(124,58,237,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0
          }}>⬢</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e2f0" }}>No projects connected</div>
            <div style={{ fontSize: 13, color: "#4b4b6a", marginTop: 3 }}>Install Forge Seed on your development machine to begin monitoring projects.</div>
          </div>
          <div style={{
            padding: "9px 18px", borderRadius: 10,
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(124,58,237,0.4)", flexShrink: 0
          }}>Install Forge Seed</div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, padding: "20px 36px 0" }}>
          {stats.map(({ label, value, sub, accent }) => (
            <div key={label} style={{
              background: "#10101e", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 14, padding: "16px 18px", position: "relative", overflow: "hidden"
            }}>
              <div style={{ position: "absolute", top: -10, right: -10, width: 50, height: 50, borderRadius: "50%", background: `${accent}12`, filter: "blur(10px)" }} />
              <div style={{ fontSize: 10, color: "#4b4b6a", marginBottom: 10, fontWeight: 500, letterSpacing: 0.3 }}>{label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: value === "0" ? "#3d3d58" : accent, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 10, color: "#3d3d58", marginTop: 6 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div style={{ display: "grid", gridTemplateColumns: "5fr 3fr", gap: 16, padding: "20px 36px 36px" }}>
          <div style={{ background: "#10101e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "22px 26px" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e2f0", marginBottom: 4 }}>Recent Activity</div>
            <div style={{ fontSize: 12, color: "#4b4b6a", marginBottom: 24 }}>Real-time feed of autonomous actions across all projects.</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 0", gap: 10 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, opacity: 0.3 }}>◎</div>
              <div style={{ fontSize: 13, color: "#4b4b6a" }}>No recent activity</div>
              <div style={{ fontSize: 12, color: "#3d3d58" }}>Connect Forge Seed to start collecting data.</div>
            </div>
          </div>
          <div style={{ background: "#10101e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "22px 24px" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e2f0", marginBottom: 4 }}>Quick Actions</div>
            <div style={{ fontSize: 12, color: "#4b4b6a", marginBottom: 16 }}>Common tasks and shortcuts.</div>
            {[
              { icon: "⬡", label: "View Projects", sub: "0 registered", color: "#a78bfa" },
              { icon: "◉", label: "Manage Devices", sub: "0 online", color: "#34d399" },
              { icon: "❖", label: "Engineering Agents", sub: "Configure", color: "#a78bfa" },
              { icon: "⊞", label: "Pending Tasks", sub: "0 items", color: "#f59e0b" },
              { icon: "⇌", label: "Pull Requests", sub: "0 open", color: "#60a5fa" },
            ].map(({ icon, label, sub, color }) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                borderRadius: 10, background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
                marginBottom: 6, cursor: "pointer"
              }}>
                <span style={{ fontSize: 14, color }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#7878a0" }}>{label}</div>
                  <div style={{ fontSize: 10, color: "#4b4b6a" }}>{sub}</div>
                </div>
                <span style={{ fontSize: 14, color: "#3d3d58" }}>›</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
