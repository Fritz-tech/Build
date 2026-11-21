import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fritz builds – AI App Builder",
  description: "Transform your ideas into fully functional mobile apps with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={{ margin: 0, padding: 0 }}
        className="antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}