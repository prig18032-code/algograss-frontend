import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        padding: 24,
        display: "grid",
        gap: 16,
        maxWidth: 720,
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ marginTop: 0, fontSize: 28 }}>AlgoGrass — AI Analytics for SMEs</h1>

      <p style={{ fontSize: 16 }}>
        Welcome to <b>AlgoGrass Ltd</b>. Choose a module below to explore data-driven insights and
        sustainability analytics.
      </p>

      <nav
        style={{
          display: "grid",
          gap: 12,
          marginTop: 12,
        }}
      >
        <Link href="/retailiq" style={linkStyle}>
          📈 RetailIQ — Sales Forecasting
        </Link>
        <Link href="/greenlytics" style={linkStyle}>
          ♻️ Greenlytics — Emissions Estimate
        </Link>
        <Link href="/reports" style={linkStyle}>
          📄 Reports — Export to PDF
        </Link>
        <Link href="/admin" style={linkStyle}>
          🛠️ Admin — Coming Soon
        </Link>
      </nav>

      <footer
        style={{
          marginTop: 40,
          opacity: 0.7,
          fontSize: 12,
          textAlign: "center",
          borderTop: "1px solid #e7eee9",
          paddingTop: 12,
        }}
      >
        © {new Date().getFullYear()} AlgoGrass Ltd · London, UK <br />
        Founder: <b>Pinki Gaud</b> ·{" "}
        <a href="mailto:gaudpinky10@gmail.com">gaudpinky10@gmail.com</a>
      </footer>
    </main>
  );
}

const linkStyle = {
  background: "#f6f9f6",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #cdd5ce",
  textDecoration: "none",
  color: "#0b0f0c",
  fontWeight: 500,
};
