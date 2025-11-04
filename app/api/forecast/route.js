// app/api/forecast/route.js
// Simple linear-trend + weekday seasonality forecast (no external libs)

export async function POST(req) {
  try {
    const { rows, horizon = 30 } = await req.json();
    if (!Array.isArray(rows) || rows.length < 7) {
      return Response.json(
        { error: "Need at least 7 days of data (date,sales)." },
        { status: 400 }
      );
    }

    const hist = rows
      .map(r => ({
        d: new Date(String(r.date)),
        y: Number(r.sales)
      }))
      .filter(r => r.d.toString() !== "Invalid Date" && Number.isFinite(r.y))
      .sort((a, b) => a.d - b.d);

    if (!hist.length) {
      return Response.json({ error: "No valid rows." }, { status: 400 });
    }

    const N = hist.length;
    hist.forEach((r, i) => (r.t = i));

    // Linear regression
    let sumT = 0, sumY = 0, sumTT = 0, sumTY = 0;
    for (const r of hist) {
      sumT += r.t;
      sumY += r.y;
      sumTT += r.t * r.t;
      sumTY += r.t * r.y;
    }
    const denom = (N * sumTT - sumT * sumT) || 1e-9;
    const b = (N * sumTY - sumT * sumY) / denom;
    const a = (sumY - b * sumT) / N;

    // Seasonality (weekday)
    const wkSum = Array(7).fill(0);
    const wkCnt = Array(7).fill(0);
    for (const r of hist) {
      const wd = r.d.getDay();
      const res = r.y - (a + b * r.t);
      wkSum[wd] += res;
      wkCnt[wd] += 1;
    }
    const wkAdj = wkSum.map((s, i) => (wkCnt[i] > 0 ? s / wkCnt[i] : 0));
    const meanAdj = wkAdj.reduce((s, v) => s + v, 0) / 7;
    for (let i = 0; i < 7; i++) wkAdj[i] -= meanAdj;

    // Forecast future
    const lastDate = hist[N - 1].d;
    const out = [];
    for (let i = 1; i <= Math.max(1, Math.min(365, Number(horizon) || 30)); i++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + i);
      const t = N - 1 + i;
      const yhat = a + b * t;
      const wd = nextDate.getDay();
      const yhatSeasonal = yhat + (wkAdj[wd] || 0);
      out.push({
        date: nextDate.toISOString(),
        forecast: Math.max(0, +yhatSeasonal.toFixed(2))
      });
    }

    return Response.json({ forecast: out });
  } catch (e) {
    return Response.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
