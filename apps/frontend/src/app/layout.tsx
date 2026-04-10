import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import QueryProvider from "@/providers/QueryProvider"; // Import ở đây

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 flex`} suppressHydrationWarning>
        <Sidebar />
        <main className="ml-64 flex-1 min-h-screen">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 text-gray-800 font-bold text-lg">
             GroupFlow Automator Control Panel
          </header>
          <div className="p-8">
            {/* Bọc QueryProvider ở đây */}
            <QueryProvider>
              {children}
            </QueryProvider>
          </div>
        </main>
      </body>
    </html>
  );
}