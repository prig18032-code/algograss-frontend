"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef, useState } from "react";

export default function ReportsPage() {
  const ref = useRef(null);
  const [saving, setSaving] = useState(false);

  async function exportPDF() {
    if (!ref.current) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(ref.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
      const imgW = canvas.width * ratio;
      const imgH = canvas.height * ratio;
      const x = (pageW - imgW) / 2;
      const y = 24;

      pdf.text("AlgoGrass Report Snapshot", 24, 24);
      pdf.addImage(imgData, "PNG", x, y + 10, imgW, imgH);
      pdf.save("algograss_report.pdf");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2 style={{ marginTop: 0 }}>Reports — Export PDF</h2>
      <p>Click Export to save a PDF snapshot of this page’s content.</p>
      <div ref={ref} className="card">
        <h3 style={{ marginTop: 0 }}>Snapshot Content</h3>
        <ul>
          <li>Business: <b>AlgoGrass</b></li>
          <li>Date: {new Date().toISOString().slice(0,10)}</li>
          <li>Summary: Sales & ESG summaries will be added here (v2).</li>
        </ul>
      </div>
      <div>
        <button onClick={exportPDF} disabled={saving} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cdd5ce" }}>
          {saving ? "Exporting..." : "Export PDF"}
        </button>
      </div>
    </div>
  );
}
