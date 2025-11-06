"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, Filler);

function movingAvg(arr, window = 7) {
  if (!arr || arr.length === 0) return [];
  const out = new Array(arr.length).fill(null);
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    const v = Number(arr[i]);
    sum += Number.isFinite(v) ? v : 0;
    if (i >= window) {
      const old = Number(arr[i - window]);
      sum -= Number.isFinite(old) ? old : 0;
    }
    if (i >= window - 1) out[i] = +(sum / window).toFixed(2);
  }
  return out;
}

function downloadTemplate() {
  const csv = "date,sales\n2025-01-01,120\n2025-01-02,118\n2025-01-03,135\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "sales_template.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function RetailIQPage() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [forecast, setForecast] = useState(null);
  const [loadingFc, setLoadingFc] = useState(false);
  const [fcError, setFcError] = useState("");

  function onFile(file) {
    setErr("");
    setForecast(null);
    setFcError("");
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
              sales: Number(r.sales),
            }))
            .filter((r) => r.date.toString() !== "Invalid Date" && Number.isFinite(r.sales))
            .sort((a, b) => a.date - b.date);

          if (!parsed.length) throw new Error("No valid rows found (need columns: date,sales).");
          setRows(parsed);
        } catch (e) {
          setErr(e.message || "Could not read CSV.");
        }
      },
      error: (e) => setErr(e.message || "Failed to parse CSV."),
    });
  }

  async function getForecast() {
    try {
      if (!rows.length) return;
      setLoadingFc(true);
      setFcError("");

      const payload = {
        rows: rows.map((r) => ({
          date: r.date.toISOString().slice(0, 10),
          sales: r.sales,
        })),
        horizon: 30,
      };

      const res = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Forecast failed");
      setForecast(data.forecast || []);
    } catch (e) {
      setFcError(e.message);
    } finally {
      setLoadingFc(false);
    }
  }

  const metrics = useMemo(() => {
    if (!rows.length) return null;
    const total = rows.reduce((s, r) => s + r.sales, 0);
    const last30 = rows.slice(-30).reduce((s, r) => s + r.sales, 0);
    const avg = +(total / rows.length).toFixed(2);
    return { total, last30, avg, days: rows.length };
  }, [rows]);

  const chart = useMemo(() => {
    if (!rows.length) return null;
    const actual = rows.map((r) => ({ x: r.date, y: r.sales }));

    const values = rows.map((r) => r.sales);
    const ma7 = movingAvg(values, 7);
    const ma30 = movingAvg(values, 30);

    const ma7Pts = rows.map((r, i) => (ma7[i] == null ? null : { x: r.date, y: ma7[i] })).filter(Boolean);
    const ma30Pts = rows.map((r, i) => (ma30[i] == null ? null : { x: r.date, y: ma30[i] })).filter(Boolean);

    const fcPts = (forecast || []).map((f) => ({ x: new Date(f.date), y: f.forecast }));

    return {
      data: {
        datasets: [
          {
            label: "Sales",
            data: actual,
            parsing: false,
            borderColor: "#0b0f0c",
            backgroundColor: "rgba(11,15,12,0.05)",
            tension: 0.25,
            fill: true,
            pointRadius: 2
          },
          {
            label: "7-day MA",
            data: ma7Pts,
            parsing: false,
            borderColor: "#15803d",
            borderDash: [4, 4],
            fill: false,
            pointRadius: 0
          },
          {
            label: "30-day MA",
            data: ma30Pts,
            parsing: false,
            borderColor: "#4b8f5c",
            borderDash: [2, 6],
            fill: false,
            pointRadius: 0
          },
          ...(fcPts.length ? [{
            label: "Forecast (next 30d)",
            data: fcPts,
            parsing: false,
            borderColor: "#1d4ed8",
            backgroundColor: "rgba(29,78,216,0.04)",
            borderDash: [6, 6],
            tension: 0.2,
            fill: false,
            pointRadius: 0
          }] : [])
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { position: "top" } },
        scales: {
          x: { type: "time", time: { unit: "day" }, grid: { display: false } },
          y: { beginAtZero: true }
        }
      }
    };
  }, [rows, forecast]);

  function downloadForecastCSV() {
    if (!forecast?.length) return;
    const header = "date,forecast\n";
    const body = forecast.map((f) => `${f.date.slice(0, 10)},${f.forecast}`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "retailiq_forecast.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section>
        <h2 style={{ marginTop: 0 }}>RetailIQ — Sales Forecasting</h2>
        <p>Upload a CSV with columns: <b>date,sales</b>. View trends and run a 30-day forecast.</p>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} />
          <button type="button" onClick={downloadTemplate} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cdd5ce" }}>
            Download CSV template
          </button>
          <button type="button" onClick={getForecast} disabled={!rows.length || loadingFc} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cdd5ce" }}>
            {loadingFc ? "Forecasting..." : "Run 30-day forecast"}
          </button>
          {forecast?.length ? (
            <button type="button" onClick={downloadForecastCSV} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cdd5ce" }}>
              Download forecast CSV
            </button>
          ) : null}
        </div>

        {err && <div style={{ marginTop: 8, color: "#a10000" }}><b>Error:</b> {err}</div>}
        {fcError && <div style={{ marginTop: 8, color: "#a10000" }}><b>Forecast error:</b> {fcError}</div>}
      </section>

      {(() => {
        if (!rows.length) return null;
        const total = rows.reduce((s, r) => s + r.sales, 0);
        const last30 = rows.slice(-30).reduce((s, r) => s + r.sales, 0);
        const avg = +(total / rows.length).toFixed(2);
        return (
          <section className="kpis">
            <KPI label="History (days)" value={rows.length} />
            <KPI label="Total sales" value={total.toLocaleString()} />
            <KPI label="Last 30 days" value={last30.toLocaleString()} />
            <KPI label="Average / day" value={avg.toLocaleString()} />
          </section>
        );
      })()}

      {chart && (
        <section style={{ height: 460 }}>
          <Line data={chart.data} options={chart.options} />
        </section>
      )}

      {rows.length > 0 && (
        <section>
          <h3>Preview (last 100 rows)</h3>
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Sales</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(-100).map((r, i) => (
                  <tr key={i}>
                    <td>{r.date.toISOString().slice(0, 10)}</td>
                    <td style={{ textAlign: "right" }}>{r.sales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
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
