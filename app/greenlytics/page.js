"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";

const DEFAULT_FACTORS = {
  Electricity: 0.25, // kg CO2e per £
  Travel: 0.18,
  Logistics: 0.22,
  Materials: 0.30,
  Services: 0.12,
  Other: 0.15,
};

function downloadTemplate() {
  const csv = "category,spend\nElectricity,320\nTravel,180\nMaterials,540\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "expenses_template.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function GreenlyticsPage() {
  const [rows, setRows] = useState([]); // [{category, spend}]
  const [factors, setFactors] = useState(DEFAULT_FACTORS);
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
              category: String(r.category || "").trim() || "Other",
              spend: Number(r.spend),
            }))
            .filter((r) => Number.isFinite(r.spend) && r.spend >= 0);

          if (!parsed.length) throw new Error("No valid rows (need columns: category,spend).");
          setRows(parsed);
        } catch (e) {
          setErr(e.message || "Could not read CSV.");
        }
      },
      error: (e) => setErr(e.message || "Failed to parse CSV."),
    });
  }

  const summary = useMemo(() => {
    if (!rows.length) return null;
    const byCat = new Map();
    for (const r of rows) {
      const k = r.category;
      byCat.set(k, (byCat.get(k) || 0) + r.spend);
    }
    const table = Array.from(byCat.entries()).map(([category, spend]) => {
      const factor = factors[category] ?? factors["Other"] ?? 0.15;
      return {
        category,
        spend: +spend.toFixed(2),
        factor,
        emission: +(spend * factor).toFixed(2),
      };
    });
    const totals = table.reduce(
      (acc, r) => {
        acc.spend += r.spend;
        acc.emission += r.emission;
        return acc;
      },
      { spend: 0, emission: 0 }
    );
    totals.spend = +totals.spend.toFixed(2);
    totals.emission = +totals.emission.toFixed(2);
    return { table, totals };
  }, [rows, factors]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section>
        <h2 style={{ marginTop: 0 }}>Greenlytics — Carbon & ESG Estimate (v1)</h2>
        <p>
          Upload a CSV with columns: <b>category,spend</b> (spend in £). We apply simple emission
          factors per category to estimate kg CO₂e. You can tweak factors below.
        </p>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} />
          <button
            type="button"
            onClick={downloadTemplate}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cdd5ce" }}
          >
            Download CSV template
          </button>
        </div>

        {err && (
          <div style={{ marginTop: 8, color: "#a10000" }}>
            <b>Error:</b> {err}
          </div>
        )}
      </section>

      <section style={{ display: "grid", gap: 8 }}>
        <h3>Emission factors (kg CO₂e per £)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8 }}>
          {Object.keys({ ...DEFAULT_FACTORS, ...factors }).map((k) => (
            <label key={k} style={{ background: "#f6f9f6", padding: 12, borderRadius: 10 }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{k}</div>
              <input
                type="number"
                step="0.01"
                value={factors[k] ?? ""}
                onChange={(e) =>
                  setFactors((old) => ({ ...old, [k]: Number(e.target.value || 0) }))
                }
                style={{ marginTop: 6, width: "100%", padding: 8, borderRadius: 8, border: "1px solid #cdd5ce" }}
              />
            </label>
          ))}
        </div>
      </section>

      {summary && (
        <>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <div style={{ background: "#f6f9f6", padding: 12, borderRadius: 10 }}>
              <div style={{ opacity: 0.7, fontSize: 12 }}>Total spend (£)</div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>
                {summary.totals.spend.toLocaleString()}
              </div>
            </div>
            <div style={{ background: "#f6f9f6", padding: 12, borderRadius: 10 }}>
              <div style={{ opacity: 0.7, fontSize: 12 }}>Estimated emissions (kg CO₂e)</div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>
                {summary.totals.emission.toLocaleString()}
              </div>
            </div>
          </section>

          <section>
            <h3>Breakdown</h3>
            <div style={{ overflow: "auto", border: "1px solid #e7eee9", borderRadius: 10 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f6f9f6" }}>
                    <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e7eee9" }}>
                      Category
                    </th>
                    <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #e7eee9" }}>
                      Spend (£)
                    </th>
                    <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #e7eee9" }}>
                      Factor
                    </th>
                    <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #e7eee9" }}>
                      Emissions (kg CO₂e)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary.table.map((r, i) => (
                    <tr key={i}>
                      <td style={{ padding: 8, borderBottom: "1px solid #eef3f0" }}>{r.category}</td>
                      <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #eef3f0" }}>
                        {r.spend.toLocaleString()}
                      </td>
                      <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #eef3f0" }}>
                        {r.factor}
                      </td>
                      <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #eef3f0" }}>
                        {r.emission.toLocaleString()}
                      </td>
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
