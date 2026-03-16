import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agrégateur Offres Emploi",
  description: "Suivi des offres d'emploi et leads Mantiks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
