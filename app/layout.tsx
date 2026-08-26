export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import CustomProvider from "../providers/CustomProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ROZNE | Premium Knitwear & Hosiery",
  description: "Crafting warmth, stitch by stitch. Premium sweaters, cardigans and woollen wear direct from Ludhiana.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <CustomProvider>
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </CustomProvider>
    </html>
  );
}
