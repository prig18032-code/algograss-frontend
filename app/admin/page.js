export default function AdminPage() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2 style={{ marginTop: 0 }}>Admin — Coming Soon</h2>
      <p>Planned: authentication, usage analytics, plan limits, and billing.</p>
      <ul>
        <li>Email + password / OTP login</li>
        <li>Workspace selection</li>
        <li>Usage metering</li>
        <li>Stripe subscriptions</li>
      </ul>
    </div>
  );
}
