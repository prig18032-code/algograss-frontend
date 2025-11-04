export const metadata = {
  title: "AlgoGrass",
  description: "AI Sustainability & Business Intelligence for SMEs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
            <a href="/" style={{ textDecoration: "none", color: "#0b0f0c" }}>
              <h1 style={{ margin: 0, fontSize: 22 }}>🌱 AlgoGrass</h1>
            </a>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Grow Smarter. Operate Greener.</div>
          </header>

          <nav style={{ display: "flex", gap: 16, fontSize: 15 }}>
            <a href="/retailiq">RetailIQ</a>
            <a href="/greenlytics">Greenlytics</a>
            <a href="/reports">Reports</a>
            <a href="/admin">Admin</a>
          </nav>

          <main style={{ marginTop: 8 }}>{children}</main>

          <footer style={{ marginTop: 40, paddingTop: 12, fontSize: 12, opacity: 0.7, textAlign: "center" }}>
            ©{new Date().getFullYear()} AlgoGrass Ltd · London, UK · Founder: Pinki Gaud ·{" "}
            <a href="mailto:gaudpinky10@gmail.com">Contact</a>
          </footer>
        </div>
      </body>
    </html>
  );
}
