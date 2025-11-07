// app/waitlist/page.js
export const metadata = { title: "Join the Waitlist — AlgoGrass" };

export default function WaitlistPage() {
  return (
    <div className="card">
      <h2 style={{ marginTop: 0, color: "var(--ag-green)" }}>Join the Waitlist</h2>
      <p>Be first to try new forecasting & sustainability features.</p>

      <form
        method="POST"
        action="https://formspree.io/f/your_form_id"  // <- replace after creating a Formspree form
        className="cta-row"
        style={{ gap: 8 }}
      >
        <input
          type="email"
          name="email"
          required
          placeholder="you@company.com"
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid var(--ag-border)",
            minWidth: 260,
          }}
        />
        <button className="btn btn-primary" type="submit">Join</button>
      </form>

      <p style={{ marginTop: 12, fontSize: 13, opacity: 0.75 }}>
        We’ll only email about product updates. Unsubscribe anytime.
      </p>
    </div>
  );
}
