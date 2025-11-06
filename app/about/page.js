// app/about/page.js
export const metadata = { title: "About — AlgoGrass" };

export default function AboutPage() {
  return (
    <div className="card">
      <h2 style={{ marginTop: 0, color: "var(--ag-green)" }}>About AlgoGrass</h2>
      <p>
        AlgoGrass helps SMEs grow sustainably with AI-driven forecasts and CO₂ insights.
        We believe profitability and planet can move together.
      </p>

      <h3>Team</h3>
      <ul>
        <li><b>Pinki Gaud</b> — Founder & CEO</li>
        <li>Advisors — Data Science, Climate Policy, and FinOps veterans</li>
      </ul>

      <h3>Values</h3>
      <ul>
        <li>Clarity over complexity</li>
        <li>Actionable insights</li>
        <li>Measurable impact</li>
      </ul>
    </div>
  );
}
