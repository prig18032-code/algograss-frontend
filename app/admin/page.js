"use client";

import { useState } from "react";

export default function AdminPage() {
  const [org, setOrg] = useState("My Company");
  const [currency, setCurrency] = useState("GBP");
  const [timezone, setTimezone] = useState("Europe/London");

  function save() {
    alert("Saved (demo). In v2 this will persist to a backend.");
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2 style={{ marginTop: 0 }}>Admin — Settings</h2>

      <div className="card" style={{ maxWidth: 560, display: "grid", gap: 10 }}>
        <label>
          <div>Organisation name</div>
          <input value={org} onChange={(e) => setOrg(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #cdd5ce" }}/>
        </label>
        <label>
          <div>Currency</div>
          <input value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #cdd5ce" }}/>
        </label>
        <label>
          <div>Timezone</div>
          <input value={timezone} onChange={(e) => setTimezone(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #cdd5ce" }}/>
        </label>
        <div>
          <button onClick={save} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cdd5ce" }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
