import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
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
