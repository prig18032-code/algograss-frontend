"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/retailiq", label: "RetailIQ" },
  { href: "/greenlytics", label: "Greenlytics" },
  { href: "/reports", label: "Reports" },
  { href: "/admin", label: "Admin" }
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav style={{
      borderBottom: "1px solid #e7eee9",
      background: "#fff",
    }}>
      <div className="container" style={{ display: "flex", gap: 18, alignItems: "center" }}>
        <div style={{ fontWeight: 700, color: "#15803d" }}>🌱 AlgoGrass</div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {links.map(l => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: active ? "#f6f9f6" : "transparent",
                  border: active ? "1px solid #e7eee9" : "1px solid transparent"
                }}>
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
