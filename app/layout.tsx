// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- INI YANG PALING PENTING!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CetakDigital",
  description: "Sistem Fotokopi Online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}