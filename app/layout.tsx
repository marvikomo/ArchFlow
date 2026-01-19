import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DiagramAI - AI-Powered Diagram Editor",
  description: "Create diagrams and architectures with AI assistance using draw.io",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
