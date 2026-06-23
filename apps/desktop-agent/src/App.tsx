import { useState, useEffect } from "react";
import "./App.css";

interface DeviceStatus {
  deviceId: number;
  name: string;
  platform: string;
  status: string;
  lastHeartbeatAt: string | null;
}

function App() {
  const [apiUrl, setApiUrl] = useState("");
  const [pairingToken, setPairingToken] = useState("");
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [isPaired, setIsPaired] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);

  useEffect(() => {
    // Load saved configuration
    const savedApiUrl = localStorage.getItem("forge_api_url");
    const savedDeviceId = localStorage.getItem("forge_device_id");
    const savedPairingToken = localStorage.getItem("forge_pairing_token");
    
    if (savedApiUrl) setApiUrl(savedApiUrl);
    if (savedPairingToken) setPairingToken(savedPairingToken);
    if (savedDeviceId) {
      setIsPaired(true);
      checkDeviceStatus(savedApiUrl || "", savedDeviceId);
    }
  }, []);

  async function checkDeviceStatus(apiUrl: string, deviceId: string) {
    try {
      const response = await fetch(`${apiUrl}/api/devices/${deviceId}`);
      if (response.ok) {
        const data = await response.json();
        setDeviceStatus(data);
        setIsConnected(true);
        setOllamaAvailable(data.ollamaAvailable || false);
      }
    } catch (error) {
      console.error("Failed to check device status:", error);
      setIsConnected(false);
    }
  }

  async function pairDevice() {
    if (!apiUrl || !pairingToken) {
      alert("Please enter API URL and pairing token");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/devices/pair?token=${pairingToken}`);
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("forge_api_url", apiUrl);
        localStorage.setItem("forge_pairing_token", pairingToken);
        localStorage.setItem("forge_device_id", String(data.deviceId));
        setIsPaired(true);
        checkDeviceStatus(apiUrl, String(data.deviceId));
      } else {
        alert("Invalid pairing token");
      }
    } catch (error) {
      alert("Failed to pair device");
      console.error(error);
    }
  }

  async function sendHeartbeat() {
    const deviceId = localStorage.getItem("forge_device_id");
    const token = localStorage.getItem("forge_pairing_token");
    const url = localStorage.getItem("forge_api_url");

    if (!deviceId || !token || !url) return;

    try {
      const response = await fetch(`${url}/api/devices/${deviceId}/heartbeat`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "online",
          ollamaAvailable: ollamaAvailable,
          ollamaVersion: ollamaAvailable ? "1.0.0" : null,
          activeModel: ollamaAvailable ? "llama3" : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDeviceStatus(data);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Heartbeat failed:", error);
      setIsConnected(false);
    }
  }

  useEffect(() => {
    if (isPaired) {
      const interval = setInterval(sendHeartbeat, 30000); // Every 30 seconds
      sendHeartbeat(); // Initial heartbeat
      return () => clearInterval(interval);
    }
  }, [isPaired, ollamaAvailable]);

  return (
    <div className="app-container">
      <div className="header">
        <h1>AcronIQ Forge</h1>
        <p>Desktop Agent</p>
      </div>

      {!isPaired ? (
        <div className="setup-section">
          <h2>Pair Device</h2>
          <div className="form-group">
            <label>API URL:</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:3001"
            />
          </div>
          <div className="form-group">
            <label>Pairing Token:</label>
            <input
              type="text"
              value={pairingToken}
              onChange={(e) => setPairingToken(e.target.value)}
              placeholder="Enter token from web app"
            />
          </div>
          <button onClick={pairDevice} className="primary-button">
            Pair Device
          </button>
          <p className="help-text">
            Get the pairing token from the Forge web app under Settings → Devices
          </p>
        </div>
      ) : (
        <div className="status-section">
          <div className="status-card">
            <h2>Device Status</h2>
            {deviceStatus && (
              <div className="status-details">
                <div className="status-item">
                  <span className="label">Name:</span>
                  <span className="value">{deviceStatus.name}</span>
                </div>
                <div className="status-item">
                  <span className="label">Platform:</span>
                  <span className="value">{deviceStatus.platform}</span>
                </div>
                <div className="status-item">
                  <span className="label">Status:</span>
                  <span className={`value status-${isConnected ? 'online' : 'offline'}`}>
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="label">Last Heartbeat:</span>
                  <span className="value">
                    {deviceStatus.lastHeartbeatAt 
                      ? new Date(deviceStatus.lastHeartbeatAt).toLocaleString()
                      : 'Never'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="ollama-section">
            <h2>Local Model (Ollama)</h2>
            <div className="toggle-container">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={ollamaAvailable}
                  onChange={(e) => setOllamaAvailable(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <span className="toggle-label">
                {ollamaAvailable ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p className="help-text">
              Enable to use local Ollama models for code analysis
            </p>
          </div>

          <button
            onClick={() => {
              localStorage.clear();
              setIsPaired(false);
              setDeviceStatus(null);
            }}
            className="secondary-button"
          >
            Unpair Device
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
