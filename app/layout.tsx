import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BnBCoach.ai - Il tuo coach AI per Airbnb",
  description:
    "Guida step-by-step per nuovi host Airbnb: ottimizza il tuo annuncio con AI coaching personalizzato.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
