"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ReportsPage() {
  const ref = useRef(null);

  async function downloadPDF() {
    const el = ref.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imgW = canvas.width * ratio;
    const imgH = canvas.height * ratio;
    const x = (pageWidth - imgW) / 2;
    const y = 20;
    pdf.addImage(imgData, "PNG", x, y, imgW, imgH);
    pdf.save("algograss-report.pdf");
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2 style={{ marginTop: 0 }}>Reports — Export to PDF</h2>
      <p>Snapshot the content below into a nicely formatted PDF.</p>

      <div
        ref={ref}
        style={{
          border: "1px solid #e7eee9",
          borderRadius: 12,
          padding: 16,
          background: "#fff",
        }}
      >
        <h3 style={{ marginTop: 0 }}>AlgoGrass — Executive Summary</h3>
        <p>
          This is a placeholder. In v2 we will render the latest KPIs from RetailIQ and Greenlytics
          and include charts and commentary.
        </p>
        <ul>
          <li>RetailIQ: Sales trending moderately upwards.</li>
          <li>Greenlytics: Emissions concentrated in Electricity and Materials.</li>
        </ul>
        <div style={{ opacity: 0.7, fontSize: 12, marginTop: 12 }}>
          © {new Date().getFullYear()} AlgoGrass Ltd
        </div>
      </div>

      <div>
        <button
          onClick={downloadPDF}
          style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #cdd5ce" }}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}
