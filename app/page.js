// app/page.js
import Link from "next/link";

export const metadata = {
  title: "AlgoGrass - AI Sustainability Intelligence",
  description: "AI-powered sustainability and business forecasting tools for SMEs.",
};

export default function Home() {
  return (
    <div style={{ padding: "24px" }}>
      <section
        style={{
          background: "var(--ag-bg-2)",
          border: "1px solid var(--ag-border)",
          borderRadius: "12px",
          padding: "32px",
          textAlign: "left",
        }}
      >
        <h1 style={{ fontSize: "1.8rem", fontWeight: "700", marginBottom: "12px" }}>
          Welcome to AlgoGrass
        </h1>
        <p style={{ fontSize: "1.1rem", opacity: 0.9, marginBottom: "16px" }}>
          AI-powered analytics that combine <b>business growth</b> with{" "}
          <b>sustainability intelligence</b>.
        </p>

        <ul style={{ lineHeight: 1.7 }}>
          <li>
            <b>RetailIQ</b> — upload sales and get 30–90 day forecasts.
          </li>
          <li>
            <b>Greenlytics</b> — upload expenses and estimate CO₂ emissions.
          </li>
          <li>
            Export insights and share reports with stakeholders.
          </li>
        </ul>

        <div style={{ marginTop: "20px" }}>
          <Link
            href="/retailiq"
            style={{
              background: "var(--ag-green)",
              color: "white",
              padding: "10px 20px",
              borderRadius: "6px",
              textDecoration: "none",
              marginRight: "10px",
            }}
          >
            Start RetailIQ
          </Link>

          <Link
            href="/greenlytics"
            style={{
              background: "#ddd",
              color: "black",
              padding: "10px 20px",
              borderRadius: "6px",
              textDecoration: "none",
            }}
          >
            Start Greenlytics
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ marginTop: "40px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>How it works</h2>
        <ol style={{ lineHeight: 1.8 }}>
          <li>Download the CSV template.</li>
          <li>Fill in your company’s data (date/sales or category/spend).</li>
          <li>Upload it and view instant forecasts & sustainability metrics.</li>
        </ol>
      </section>

      {/* DOWNLOAD CSV TEMPLATE SECTION */}
      <section style={{ marginTop: "24px" }}>
        <h3 style={{ fontSize: "1.3rem", marginBottom: "8px" }}>
          Download CSV Templates
        </h3>
        <p>Use these templates to upload your data easily:</p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a
            href="/sales_template.csv"
            download
            style={{
              background: "var(--ag-green)",
              color: "white",
              padding: "10px 16px",
              borderRadius: "6px",
              textDecoration: "none",
            }}
          >
            📈 RetailIQ Template
          </a>

          <a
            href="/expenses_template.csv"
            download
            style={{
              background: "var(--ag-green-2)",
              color: "white",
              padding: "10px 16px",
              borderRadius: "6px",
              textDecoration: "none",
            }}
          >
            🌱 Greenlytics Template
          </a>
        </div>
      </section>

      <footer
        style={{
          textAlign: "center",
          opacity: 0.7,
          marginTop: "60px",
          fontSize: "0.9rem",
        }}
      >
        © {new Date().getFullYear()} AlgoGrass Ltd · London, UK · Founder: Pinki Gaud
      </footer>
    </div>
  );
}
