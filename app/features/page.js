// app/features/page.js
export const metadata = { title: "Features — AlgoGrass" };

export default function FeaturesPage() {
  return (
    <div className="card">
      <h2 style={{ marginTop: 0, color: "var(--ag-green)" }}>Platform Features</h2>

      <div className="grid-3" style={{ marginTop: 12 }}>
        <div className="card">
          <h3>RetailIQ</h3>
          <p>Upload sales CSV, clean the data, and see 30–90 day forecasts instantly.</p>
          <a className="btn" href="/retailiq">Open RetailIQ</a>
        </div>
        <div className="card">
          <h3>Greenlytics</h3>
          <p>Upload expenses, categorize spend, and estimate CO₂ emissions.</p>
          <a className="btn" href="/greenlytics">Open Greenlytics</a>
        </div>
        <div className="card">
          <h3>Reports</h3>
          <p>Generate shareable insight reports for executives and customers.</p>
          <a className="btn" href="/reports">Open Reports</a>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: 12 }}>
        <div className="card">
          <h3>AI Insight Box</h3>
          <p>Readable summaries like “Forecast suggests +12% next month.” (coming soon)</p>
        </div>
        <div className="card">
          <h3>What-if Simulator</h3>
          <p>Drag sliders to simulate CO₂ cuts and revenue effects. (coming soon)</p>
        </div>
        <div className="card">
          <h3>Chat With Your Data</h3>
          <p>Ask “Why did sales dip on Fridays?” — get answers. (coming soon)</p>
        </div>
      </div>
    </div>
  );
}
