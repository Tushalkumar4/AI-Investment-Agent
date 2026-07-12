import "./globals.css";

export const metadata = {
  title: "Ledger — AI Investment Research Agent",
  description:
    "An autonomous research agent that studies a company across business model, financials, market, and risk — then makes the call.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink text-paper font-body antialiased">{children}</body>
    </html>
  );
}
