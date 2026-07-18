"use client";

import { useState, useEffect, useRef } from "react";

type Tab = "simple" | "medium" | "complex";

// Each token: [className | null, text]
type Token = [string | null, string];
type CodeLine = Token[];

const SNIPPETS: Record<Tab, CodeLine[]> = {
  simple: [
    [
      [null, "pulse."],
      ["fn", "watch"],
      [null, "("],
      ["s", "'GABC...1234'"],
      [null, ", (event) => {"],
    ],
    [
      [null, "  console."],
      ["fn", "log"],
      [null, "("],
      ["s", "'something happened'"],
      [null, ", event)"],
    ],
    [[null, "})"]],
  ],
  medium: [
    [
      [null, "pulse."],
      ["fn", "watch"],
      [null, "("],
      ["s", "'GABC...1234'"],
      [null, ")"],
    ],
    [
      [null, "  ."],
      ["fn", "on"],
      [null, "("],
      ["s", "'payment.received'"],
      [null, ", (event) => {"],
    ],
    [
      [null, "    "],
      ["fn", "notifyUser"],
      [null, "(event."],
      ["p", "amount"],
      [null, ")"],
    ],
    [[null, "  })"]],
  ],
  complex: [
    [
      [null, "pulse."],
      ["fn", "watch"],
      [null, "("],
      ["s", "'GABC...1234'"],
      [null, ", {"],
    ],
    [
      [null, "  "],
      ["p", "events"],
      [null, ": ["],
      ["s", "'payment.received'"],
      [null, ", "],
      ["s", "'contract.invoked'"],
      [null, "],"],
    ],
    [
      [null, "  "],
      ["p", "filters"],
      [null, ": { asset: "],
      ["s", "'USDC'"],
      [null, ", minAmount: 100 },"],
    ],
    [
      [null, "  "],
      ["p", "delivery"],
      [null, ": {"],
    ],
    [
      [null, "    "],
      ["p", "webhook"],
      [null, ": "],
      ["s", "'https://myapp.com/hooks/stellar'"],
      [null, ","],
    ],
    [
      [null, "    "],
      ["p", "retries"],
      [null, ": 3,"],
    ],
    [
      [null, "    "],
      ["p", "signingSecret"],
      [null, ": "],
      ["s", "'whsec_...'"],
    ],
    [[null, "  },"]],
    [
      [null, "  "],
      ["p", "onEvent"],
      [null, ": (event) => { ... }"],
    ],
    [[null, "})"]],
  ],
};

const FILENAMES: Record<Tab, string> = {
  simple: "pulse.simple.ts",
  medium: "pulse.medium.ts",
  complex: "pulse.complex.ts",
};

const DOTS = [{ color: "#FF5F57" }, { color: "#FEBC2E" }, { color: "#28C840" }];

function renderLine(tokens: Token[]) {
  return tokens.map(([cls, text], i) =>
    cls ? (
      <span key={i} className={cls}>
        {text}
      </span>
    ) : (
      <span key={i}>{text}</span>
    ),
  );
}

export default function CodeSection() {
  const [activeTab, setActiveTab] = useState<Tab>("simple");
  const [highlightedLine, setHighlightedLine] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setHighlightedLine(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const lines = SNIPPETS[activeTab];
    intervalRef.current = setInterval(() => {
      setHighlightedLine((prev) => (prev + 1) % lines.length);
    }, 900);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeTab]);

  const lines = SNIPPETS[activeTab];

  return (
    <section style={{ padding: "120px 32px" }}>
      <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
        {/* Two-column layout */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 0,
            border: "1px solid var(--border)",
          }}
        >
          {/* Left column - tabs */}
          <div
            style={{
              width: "280px",
              flexShrink: 0,
              borderRight: "1px solid var(--border)",
              padding: "24px 0",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--muted)",
                padding: "0 20px",
                marginBottom: "16px",
              }}
            >
              API
            </p>
            {(["simple", "medium", "complex"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 20px",
                  fontSize: "14px",
                  fontFamily: "var(--font-sans)",
                  background: activeTab === tab ? "var(--surface)" : "transparent",
                  color: activeTab === tab ? "#fff" : "var(--muted2)",
                  borderTop: "none",
                  borderRight: "none",
                  borderBottom: "none",
                  borderLeft:
                    activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
                  cursor: "pointer",
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Right column - code window */}
          <div style={{ flex: 1, background: "var(--surface)" }}>
            {/* Window header */}
            <div
              style={{
                height: "48px",
                background: "var(--surface2)",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                {DOTS.map((dot) => (
                  <span
                    key={dot.color}
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: dot.color,
                      display: "inline-block",
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  color: "var(--muted)",
                }}
              >
                {FILENAMES[activeTab]}
              </span>
            </div>

            {/* Code body */}
            <pre
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "14px",
                lineHeight: 1.8,
                padding: "24px",
                margin: 0,
                overflowX: "auto",
                color: "var(--text)",
              }}
            >
              {lines.map((line, i) => (
                <div
                  key={`${activeTab}-${i}`}
                  style={{
                    background: i === highlightedLine ? "rgba(232,255,71,0.06)" : "transparent",
                    padding: "0 8px",
                    margin: "0 -8px",
                    display: "block",
                    whiteSpace: "pre",
                  }}
                >
                  {renderLine(line)}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
