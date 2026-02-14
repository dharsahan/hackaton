import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Farmertopia",
  description: "A comprehensive dashboard for farm management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        suppressHydrationWarning={true}
        className={`${inter.variable} antialiased bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 min-h-screen flex flex-col md:flex-row`}
      >
        <Providers>
          <Sidebar />

          <div className="flex-1 flex flex-col relative w-full h-screen overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar relative">
              {children}
            </div>

            <div className="md:hidden">
              <BottomNav />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
