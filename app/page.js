export default function Home() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section style={{ background: "#f6f9f6", padding: 16, borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Welcome to AlgoGrass</h2>
        <p>
          AI-powered analytics that combine <b>business growth</b> with{" "}
          <b>sustainability intelligence</b>.
        </p>
        <ul>
          <li><b>RetailIQ</b> — upload sales and get 30–90 day forecasts.</li>
          <li><b>Greenlytics</b> — upload expenses and estimate CO₂ emissions.</li>
          <li>Export insights and share reports with stakeholders.</li>
        </ul>
        <div style={{ display: "flex", gap: 12 }}>
          <a
            href="/retailiq"
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: "#15803d",
              color: "white",
              textDecoration: "none",
            }}
          >
            Start RetailIQ
          </a>
          <a
            href="/greenlytics"
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #cdd5ce",
              textDecoration: "none",
            }}
          >
            Start Greenlytics
          </a>
        </div>
      </section>

      <section>
        <h3>How it works</h3>
        <ol>
          <li>Download the CSV template.</li>
          <li>Fill in your company’s data (date/sales or category/spend).</li>
          <li>Upload it and view instant forecasts & sustainability metrics.</li>
        </ol>
      </section>
    </div>
  );
}
