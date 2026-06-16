export function TerminalVariant() {
  const nav = [
    { label: "dashboard", active: true },
    { label: "projects" },
    { label: "devices" },
    { label: "tasks" },
    { label: "agents" },
    { label: "pull-requests" },
    { label: "chat" },
    { label: "audit-log" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#030303", fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace", color: "#00ff41", overflow: "hidden", fontSize: 12 }}>
      {/* Sidebar */}
      <div style={{ width: 200, borderRight: "1px solid #003a00", display: "flex", flexDirection: "column", flexShrink: 0, background: "#010101" }}>
        {/* Logo */}
        <div style={{ padding: "16px 14px", borderBottom: "1px solid #003a00" }}>
          <div style={{ color: "#00ff41", fontWeight: 700, letterSpacing: 1 }}>ACRONIQ</div>
          <div style={{ color: "#006600", fontSize: 10 }}>FORGE v0.1.0</div>
          <div style={{ color: "#002200", fontSize: 9, marginTop: 4 }}>───────────────</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 0", display: "flex", flexDirection: "column" }}>
          {nav.map(({ label, active }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
              cursor: "pointer",
              background: active ? "#001a00" : "transparent",
              color: active ? "#00ff41" : "#006600",
              borderLeft: active ? "2px solid #00ff41" : "2px solid transparent",
            }}>
              <span style={{ color: active ? "#00ff41" : "#004400", fontSize: 10 }}>{active ? "►" : "·"}</span>
              <span style={{ letterSpacing: 0.5 }}>/{label}</span>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid #003a00", padding: "10px 14px" }}>
          <div style={{ color: "#006600", fontSize: 10, marginBottom: 6 }}>───────────────</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "4px 0", cursor: "pointer" }}>
            <span style={{ color: "#006600" }}>·</span>
            <span style={{ color: "#004400" }}>/settings</span>
          </div>
          <div style={{ color: "#004400", fontSize: 10, marginTop: 8 }}>
            <span style={{ color: "#00ff41" }}>admin@</span>acroniq
          </div>
          <div style={{ color: "#002200", fontSize: 9, marginTop: 2 }}>session active</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #001a00" }}>
          <div style={{ color: "#004400", fontSize: 10, marginBottom: 4 }}>$ acroniq forge --dashboard --verbose</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#00ff41", letterSpacing: 1 }}>FORGE COMMAND CENTRE</div>
            <div style={{ padding: "2px 8px", border: "1px solid #006600", fontSize: 9, color: "#00cc33", letterSpacing: 1 }}>● ONLINE</div>
          </div>
          <div style={{ color: "#006600", fontSize: 10, marginTop: 4 }}>system status and recent autonomous activity</div>
        </div>

        {/* Banner */}
        <div style={{ margin: "16px 24px 0", padding: "12px 16px", border: "1px solid #006600", background: "#001a00", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#ffcc00", fontSize: 12 }}>⚠</span>
          <span style={{ color: "#00ff41", fontSize: 11 }}>NO PROJECTS CONNECTED — Install Forge Seed to begin monitoring repositories</span>
          <div style={{ marginLeft: "auto", padding: "4px 10px", border: "1px solid #00ff41", color: "#00ff41", fontSize: 10, cursor: "pointer", letterSpacing: 1 }}>INSTALL_SEED</div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 1, margin: "16px 24px 0", border: "1px solid #002a00" }}>
          {[
            { label: "PROJECTS", value: "0" },
            { label: "TASKS", value: "0" },
            { label: "PULL_REQ", value: "0" },
            { label: "CRITICAL", value: "0" },
            { label: "DEVICES", value: "0" },
            { label: "AGENTS", value: "0" },
          ].map(({ label, value }, i) => (
            <div key={label} style={{ padding: "14px 16px", background: "#010101", borderRight: i < 5 ? "1px solid #002a00" : "none" }}>
              <div style={{ fontSize: 9, color: "#006600", letterSpacing: 1, marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: value === "0" ? "#004400" : "#00ff41", lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, margin: "16px 24px 0", borderTop: "1px solid #002a00" }}>
          {/* Activity */}
          <div style={{ padding: "16px 20px", background: "#010101", borderRight: "1px solid #002a00" }}>
            <div style={{ fontSize: 10, color: "#006600", marginBottom: 4, letterSpacing: 1 }}>// RECENT_ACTIVITY</div>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "20px 0", color: "#004400", fontSize: 11 }}>
              <div>[ no entries ]</div>
              <div style={{ fontSize: 10 }}>waiting for forge seed connection...</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                <span style={{ animation: "none", opacity: 0.4 }}>█</span>
                <span style={{ color: "#003300", fontSize: 9 }}>cursor blinking</span>
              </div>
            </div>
          </div>

          {/* Quick nav */}
          <div style={{ padding: "16px 20px", background: "#010101" }}>
            <div style={{ fontSize: 10, color: "#006600", marginBottom: 16, letterSpacing: 1 }}>// QUICK_NAV</div>
            {[
              { cmd: "$ cd /projects", desc: "view_projects [0]" },
              { cmd: "$ cd /devices", desc: "manage_devices [0 online]" },
              { cmd: "$ cd /agents", desc: "engineering_agents [none]" },
              { cmd: "$ cd /tasks", desc: "pending_tasks [0]" },
              { cmd: "$ cd /pull-requests", desc: "pull_requests [0]" },
            ].map(({ cmd, desc }) => (
              <div key={cmd} style={{ marginBottom: 8, padding: "8px 10px", border: "1px solid #001a00", cursor: "pointer", background: "#000" }}>
                <div style={{ color: "#00ff41", fontSize: 11 }}>{cmd}</div>
                <div style={{ color: "#006600", fontSize: 10, marginTop: 2 }}>→ {desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Status bar */}
        <div style={{ borderTop: "1px solid #002a00", padding: "8px 24px", display: "flex", gap: 24, marginTop: "auto", background: "#010101" }}>
          <span style={{ color: "#006600", fontSize: 10 }}>PID:4521</span>
          <span style={{ color: "#006600", fontSize: 10 }}>MEM:0.4%</span>
          <span style={{ color: "#006600", fontSize: 10 }}>DB:connected</span>
          <span style={{ color: "#006600", fontSize: 10 }}>API:8080</span>
          <span style={{ marginLeft: "auto", color: "#004400", fontSize: 10 }}>acroniq-forge ©2026</span>
        </div>
      </div>
    </div>
  );
}
