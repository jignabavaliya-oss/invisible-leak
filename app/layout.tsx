import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Invisible Leak — Cloud Spend AI",
  description: "Identify and explain invisible cloud spend with project-based AI analysis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
      </body>
    </html>
  );
}
