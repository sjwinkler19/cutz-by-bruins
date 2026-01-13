import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CutzByBruins - UCLA Student Barber Marketplace",
  description: "Connect with UCLA student barbers for affordable, quality haircuts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
