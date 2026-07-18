"use client";

import Link from "next/link";

export default function Nav() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backdropFilter: "blur(16px)",
        background: "rgba(8,8,8,0.8)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--max-width)",
          margin: "0 auto",
          padding: "0 32px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "15px",
            color: "#fff",
            letterSpacing: "-0.01em",
          }}
        >
          Orbit Stellar
        </span>

        {/* Center links - hidden on mobile */}
        <div className="hidden md:flex" style={{ gap: "32px", alignItems: "center" }}>
          {["Docs", "SDKs", "Changelog", "GitHub"].map((label) => (
            <Link
              key={label}
              href="#"
              style={{
                fontSize: "14px",
                color: "var(--muted2)",
                textDecoration: "none",
                transition: "color 0.15s",
                fontFamily: "var(--font-sans)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted2)")}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="#"
          style={{
            background: "var(--accent)",
            color: "#000",
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: "13px",
            padding: "8px 20px",
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}
        >
          Get started
        </Link>
      </div>
    </nav>
  );
}
