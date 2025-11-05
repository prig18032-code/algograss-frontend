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
  const out = [];
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
    if (i >= window) sum -= arr[i - window];
    out.push(i >= window - 1 ? +(sum / window).toFixed(2) : null);
  }
  return out;
}

function downloadCSV(rows, filename = "retailiq_forecast.csv") {
  const header = "date,forecast\n";
  const body = rows.map(r => `${r.date.slice(0, 10)},${r.forecast}`).join("\n");
  const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function RetailIQPage() {
  const [rows, setRows] = useState([]);          // [{date: Date, sales: number}]
  const [err, setErr] = useState("");
  const [horizon, setHorizon] = useState(30);
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null); // [{date, forecast}]

  function onFile(file) {
    setErr("");
    setForecast(null);
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

  async function generateForecast() {
    setErr("");
    setForecast(null);
    if (rows.length < 7) {
      setErr("Please upload at least 7 days of data.");
      return;
    }
    setLoading(true);
    try {
      // prepare payload for API
      const payload = {
        rows: rows.map(r => ({ date: r.date.toISOString(), sales: r.sales })),
        horizon: horizon,
      };
      const res = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to forecast.");
      setForecast(data.forecast || []);
    } catch (e) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
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
    const histLabels = rows.map((r) => r.date);
    const values = rows.map((r) => r.sales);
    const ma7 = movingAvg(values, 7);
    const ma30 = movingAvg(values, 30);

    // merge forecast labels/points to extend the series
    let labels = histLabels;
    let forecastPoints = [];
    if (forecast && forecast.length) {
      const futureDates = forecast.map(f => new Date(f.date));
      labels = histLabels.concat(futureDates);
      forecastPoints = Array(histLabels.length).fill(null).concat(forecast.map(f => f.forecast));
    }

    return {
      data: {
        labels,
        datasets: [
          {
            label: "Sales (history)",
            data: values,
            borderColor: "#0b0f0c",
            backgroundColor: "rgba(11,15,12,0.05)",
            tension: 0.25,
            fill: true,
            pointRadius: 2,
          },
          {
            label: "7-day MA",
            data: ma7,
            borderColor: "#15803d",
            borderDash: [4, 4],
            pointRadius: 0,
          },
          {
            label: "30-day MA",
            data: ma30,
            borderColor: "#4b8f5c",
            borderDash: [2, 6],
            pointRadius: 0,
          },
          ...(forecast
            ? [
                {
                  label: "Forecast",
                  data: forecastPoints,
                  borderColor: "#2563eb",
                  backgroundColor: "rgba(37,99,235,0.06)",
                  tension: 0.25,
                  fill: true,
                  pointRadius: 0,
                },
              ]
            : []),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { position: "top" } },
        scales: {
          x: { type: "time", time: { unit: "day" }, grid: { display: false } },
          y: { beginAtZero: true },
        },
      },
    };
  }, [rows, forecast]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section>
        <h2 style={{ marginTop: 0 }}>RetailIQ — Sales Forecasting</h2>
        <p>
          Upload a CSV with columns: <b>date,sales</b>. We’ll plot history, show moving averages,
          and generate a short-term forecast using the simple backend model.
        </p>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} />
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span>Horizon (days)</span>
            <input
              type="number"
              min={1}
              max={365}
              value={horizon}
              onChange={(e) => setHorizon(Math.max(1, Math.min(365, Number(e.target.value) || 1)))}
              style={{ width: 80 }}
            />
          </label>
          <button
            type="button"
            disabled={loading || rows.length < 7}
            onClick={generateForecast}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cdd5ce" }}
          >
            {loading ? "Forecasting…" : "Generate forecast"}
          </button>
          {forecast?.length ? (
            <button
              type="button"
              onClick={() => downloadCSV(forecast)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cdd5ce" }}
            >
              Download forecast CSV
            </button>
          ) : null}
        </div>
        {err && (
          <div style={{ marginTop: 8, color: "#a10000" }}>
            <b>Error:</b> {err}
          </div>
        )}
      </section>

      {metrics && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <KPI label="History (days)" value={metrics.days} />
          <KPI label="Total sales" value={metrics.total.toLocaleString()} />
          <KPI label="Last 30 days" value={metrics.last30.toLocaleString()} />
          <KPI label="Average / day" value={metrics.avg.toLocaleString()} />
        </section>
      )}

      {chart && (
        <section style={{ height: 420 }}>
          <Line data={chart.data} options={chart.options} />
        </section>
      )}

      {rows.length > 0 && (
        <section>
          <h3>Preview (last 100 rows)</h3>
          <div style={{ overflow: "auto", border: "1px solid #e7eee9", borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f6f9f6" }}>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e7eee9" }}>
                    Date
                  </th>
                  <th
                    style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #e7eee9" }}
                  >
                    Sales
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(-100).map((r, i) => (
                  <tr key={i}>
                    <td style={{ padding: 8, borderBottom: "1px solid #eef3f0" }}>
                      {r.date.toISOString().slice(0, 10)}
                    </td>
                    <td
                      style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #eef3f0" }}
                    >
                      {r.sales}
                    </td>
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
    <div style={{ background: "#f6f9f6", padding: 12, borderRadius: 10 }}>
      <div style={{ opacity: 0.7, fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
