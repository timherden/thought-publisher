import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

/* Relative og:image paths — a whitepaper cover, say — are resolved against this. Without
   it they would resolve against localhost and no social preview would ever load.
   Vercel sets VERCEL_PROJECT_PRODUCTION_URL; SITE_URL overrides once a domain is pointed. */
const siteUrl =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Tim Herden — independent writing on integration",
  description:
    "Essays and long-form guides on systems integration: agreeing what the data means, writing it down, and holding the agreement once the project is over."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <SiteHeader />
          <main style={{ flex: "1 1 auto" }}>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
