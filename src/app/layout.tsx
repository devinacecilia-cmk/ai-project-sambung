import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { AppProviders } from "@/components/shared/app-providers";
import { metadata } from "@/config/metadata";

import "./globals.css";

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
