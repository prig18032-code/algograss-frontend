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

function downloadTemplate() {
  const csv = "date,sales\n2025-10-01,120\n2025-10-02,118\n2025-10-03,135\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "sales_template.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function RetailIQPage() {
  const [rows, setRows] = useState([]);            // [{date: Date, sales: number}]
  const [err, setErr] = useState("");
  const [horizon, setHorizon] = useState(30);
  const [forecast, setForecast] = useState([]);    // [{date: ISO string, forecast: number}]
  const [loading, setLoading] = useState(false);

  function onFile(file) {
    setErr("");
    setForecast([]);
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

  async function runForecast() {
    try {
      setErr("");
      setLoading(true);
      setForecast([]);
      if (rows.length < 7) {
        setErr("Please upload at least 7 days of history to run a forecast.");
        return;
      }
      const payload = {
        rows: rows.map((r) => ({
          date: r.date.toISOString().slice(0, 10),
          sales: r.sales,
        })),
        horizon: Number(horizon) || 30,
      };
      const resp = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Forecast failed");
      setForecast(data.forecast || []);
    } catch (e) {
      setErr(e.message || "Could not run forecast");
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
    const labels = rows.map((r) => r.date);
    const values = rows.map((r) => r.sales);
    const ma7 = movingAvg(values, 7);
    const ma30 = movingAvg(values, 30);

    return {
      data: {
        labels,
        datasets: [
          {
            label: "Sales",
            data: values,
            borderColor: "#0b0f0c",
            backgroundColor: "rgba(11,15,12,0.04)",
            tension: 0.25,
            fill: true,
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
  }, [rows]);

  function downloadForecastCSV() {
    const header = "date,forecast\n";
    const lines = (forecast || [])
      .map((r) => `${(r.date || "").slice(0, 10)},${r.forecast}`)
      .join("\n");
    const blob = new Blob([header + lines], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "retailiq_forecast.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section>
        <h2 style={{ marginTop: 0 }}>RetailIQ — Sales Forecasting (v1)</h2>
        <p>
          Upload a CSV with columns: <b>date,sales</b>. We’ll clean the data, plot history and show
          moving averages. Click <b>Run forecast</b> to generate a short-term forecast using the API.
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
          <input
            type="number"
            value={horizon}
            min={1}
            max={365}
            onChange={(e) => setHorizon(e.target.value)}
            style={{ width: 120, padding: 8, borderRadius: 8, border: "1px solid #cdd5ce" }}
            placeholder="Horizon (days)"
          />
          <button
            type="button"
            disabled={loading || rows.length < 7}
            onClick={runForecast}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #15803d",
              background: loading ? "#bcd8c5" : "#dff2e6",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Forecasting..." : "Run forecast"}
          </button>
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
          <div style={{ background: "#f6f9f6", padding: 12, borderRadius: 10 }}>
            <div style={{ opacity: 0.7, fontSize: 12 }}>History (days)</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{metrics.days}</div>
          </div>
          <div style={{ background: "#f6f9f6", padding: 12, borderRadius: 10 }}>
            <div style={{ opacity: 0.7, fontSize: 12 }}>Total sales</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{metrics.total.toLocaleString()}</div>
          </div>
          <div style={{ background: "#f6f9f6", padding: 12, borderRadius: 10 }}>
            <div style={{ opacity: 0.7, fontSize: 12 }}>Last 30 days</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{metrics.last30.toLocaleString()}</div>
          </div>
          <div style={{ background: "#f6f9f6", padding: 12, borderRadius: 10 }}>
            <div style={{ opacity: 0.7, fontSize: 12 }}>Average / day</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{metrics.avg.toLocaleString()}</div>
          </div>
        </section>
      )}

      {chart && (
        <section style={{ height: 420 }}>
          <Line data={chart.data} options={chart.options} />
        </section>
      )}

      {forecast.length > 0 && (
        <section>
          <h3>Forecast</h3>
          <div style={{ marginBottom: 8 }}>
            <button
              type="button"
              onClick={downloadForecastCSV}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cdd5ce" }}
            >
              Download forecast CSV
            </button>
          </div>
          <div style={{ overflow: "auto", border: "1px solid #e7eee9", borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f6f9f6" }}>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e7eee9" }}>
                    Date
                  </th>
                  <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #e7eee9" }}>
                    Forecast
                  </th>
                </tr>
              </thead>
              <tbody>
                {forecast.map((r, i) => (
                  <tr key={i}>
                    <td style={{ padding: 8, borderBottom: "1px solid #eef3f0" }}>
                      {(r.date || "").slice(0, 10)}
                    </td>
                    <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #eef3f0" }}>
                      {r.forecast}
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
