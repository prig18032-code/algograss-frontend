// src/components/Nav.js
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavLink = ({ href, children }) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link href={href} className="nav-link" style={{ fontWeight: active ? 700 : 500 }}>
      {children}
    </Link>
  );
};

export default function Nav() {
  return (
    <nav className="nav">
      <NavLink href="/retailiq">RetailIQ</NavLink>
      <NavLink href="/greenlytics">Greenlytics</NavLink>
      <NavLink href="/reports">Reports</NavLink>
      <NavLink href="/about">About</NavLink>
      <NavLink href="/features">Features</NavLink>
      <NavLink href="/demo">Demo</NavLink>
      <NavLink href="/contact">Contact</NavLink>
    </nav>
  );
}
