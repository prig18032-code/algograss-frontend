// app/layout.js
import "./globals.css";
import Nav from "@/components/Nav";
import Script from "next/script"; // ✅ Add this import

export const metadata = {
  title: "AlgoGrass",
  description: "AI Sustainability & Business Intelligence for SMEs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "var(--ag-bg)", color: "var(--ag-text)" }}>
        <header className="header">
          <div className="container header-inner">
            <a href="/" className="brand">AlgoGrass</a>
            <Nav />
          </div>
        </header>

        <main className="container">{children}</main>

        <footer className="footer">
          <div className="container">
            {new Date().getFullYear()} AlgoGrass Ltd · London, UK · Founder: Pinki Gaud ·{" "}
            <a href="mailto:gaudpinky10@gmail.com">Contact</a>
          </div>
        </footer>

        {/* ✅ Plausible Analytics script (safe way in Next.js) */}
        <Script
          defer
          data-domain="algograss-frontend.vercel.app" // use your live domain here
          src="https://plausible.io/js/script.js"
        />
      </body>
    </html>
  );
}
