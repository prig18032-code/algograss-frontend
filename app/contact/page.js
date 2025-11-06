// app/contact/page.js
export const metadata = { title: "Contact — AlgoGrass" };

export default function ContactPage() {
  return (
    <div className="card">
      <h2 style={{ marginTop: 0, color: "var(--ag-green)" }}>Get in touch</h2>
      <p>We’d love to hear from you. For demos or partnerships, write to us.</p>

      <div className="grid-3" style={{ marginTop: 8 }}>
        <div className="card">
          <h3>Email</h3>
          <p><a href="mailto:gaudpinky10@gmail.com">gaudpinky10@gmail.com</a></p>
        </div>
        <div className="card">
          <h3>HQ</h3>
          <p>London, UK</p>
        </div>
        <div className="card">
          <h3>Social</h3>
          <p>LinkedIn · Coming soon</p>
        </div>
      </div>
    </div>
  );
}
