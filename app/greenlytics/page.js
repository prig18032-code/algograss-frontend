"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";

const EF = {
  // very rough demo factors (kg CO2e / currency unit) – replace later with better data
  travel: 0.35,
  fuel: 0.50,
  electricity: 0.30,
  waste: 0.20,
  food: 0.25,
  shipping: 0.28,
  other: 0.15
};

export default function GreenlyticsPage() {
  const [rows, setRows] = useState([]); // [{date, category, spend}]
  const [err, setErr] = useState("");

  function onFile(file) {
    setErr("");
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (res) => {
        try {
          const parsed = res.data
            .map((r) => ({
              date: new Date(String(r.date)),
              category: String(r.category || "").trim().toLowerCase(),
              spend: Number(r.spend),
            }))
            .filter((r) =>
              r.date.toString() !== "Invalid Date" &&
              r.category &&
              Number.isFinite(r.spend)
            )
            .sort((a, b) => a.date - b.date);

          if (!parsed.length) throw new Error("Need columns: date, category, spend");
          setRows(parsed);
        } catch (e) {
          setErr(e.message || "Could not read CSV.");
        }
      },
      error: (e) => setErr(e.message || "Failed to parse CSV."),
    });
  }

  const results = useMemo(() => {
    if (!rows.length) return null;

    const withEmissions = rows.map((r) => {
      const ef = EF[r.category] ?? EF.other;
      return { ...r, emission: +(r.spend * ef).toFixed(2) };
    });

    const byCat = {};
    for (const r of withEmissions) {
      byCat[r.category] ??= { spend: 0, emission: 0 };
      byCat[r.category].spend += r.spend;
      byCat[r.category].emission += r.emission;
    }

    const catTable = Object.entries(byCat)
      .map(([cat, v]) => ({
        category: cat,
        spend: +v.spend.toFixed(2),
        emission: +v.emission.toFixed(2),
      }))
      .sort((a, b) => b.emission - a.emission);

    const totalSpend = withEmissions.reduce((s, r) => s + r.spend, 0);
    const totalEm = withEmissions.reduce((s, r) => s + r.emission, 0);

    return { withEmissions, catTable, totalSpend: +totalSpend.toFixed(2), totalEm: +totalEm.toFixed(2) };
  }, [rows]);

  function downloadTemplate() {
    const csv = "date,category,spend\n2025-01-01,electricity,120\n2025-01-02,travel,80\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "expenses_template.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section>
        <h2 style={{ marginTop: 0 }}>Greenlytics — Carbon & ESG Estimate</h2>
        <p>Upload CSV: <b>date, category, spend</b>. We’ll estimate emissions using demo factors per category.</p>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} />
          <button type="button" onClick={downloadTemplate} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cdd5ce" }}>
            Download CSV template
          </button>
        </div>
        {err && <div style={{ marginTop: 8, color: "#a10000" }}><b>Error:</b> {err}</div>}
      </section>

      {results && (
        <>
          <section className="kpis">
            <KPI label="Total Spend" value={results.totalSpend.toLocaleString()} />
            <KPI label="Total Emissions (kg CO₂e)" value={results.totalEm.toLocaleString()} />
            <KPI label="Categories" value={results.catTable.length} />
          </section>

          <section>
            <h3>By Category</h3>
            <div className="table-shell">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th style={{ textAlign: "right" }}>Spend</th>
                    <th style={{ textAlign: "right" }}>Emissions (kg CO₂e)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.catTable.map((r, i) => (
                    <tr key={i}>
                      <td>{r.category}</td>
                      <td style={{ textAlign: "right" }}>{r.spend.toLocaleString()}</td>
                      <td style={{ textAlign: "right" }}>{r.emission.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3>Preview (last 100 rows)</h3>
            <div className="table-shell">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th style={{ textAlign: "right" }}>Spend</th>
                    <th style={{ textAlign: "right" }}>Emission (kg CO₂e)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.withEmissions.slice(-100).map((r, i) => (
                    <tr key={i}>
                      <td>{r.date.toISOString().slice(0, 10)}</td>
                      <td>{r.category}</td>
                      <td style={{ textAlign: "right" }}>{r.spend}</td>
                      <td style={{ textAlign: "right" }}>{r.emission}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function KPI({ label, value }) {
  return (
    <div className="card">
      <div style={{ opacity: 0.7, fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
