import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({ variable: "--font-sans", subsets: ["latin"] });
const serif = Playfair_Display({ variable: "--font-serif", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "City Bites",
  description: "Find NYC restaurants with more confidence using clear, plain-language public inspection information.",
  other: { "codex-preview": "development" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable}`}>
        {children}
        <aside
          aria-label="City Bites data freshness"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px 28px",
            textAlign: "center",
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
            lineHeight: 1.5,
            color: "inherit",
            opacity: 0.72,
          }}
        >
          <strong>Data freshness:</strong> Restaurant searches use live NYC Open Data. Annual research review completed August 9, 2026 · Next scheduled review August 9, 2027.
        </aside>
      </body>
    </html>
  );
}
