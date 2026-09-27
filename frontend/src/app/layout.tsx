import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ServerNoticeBanner } from "@/components/ui/Banner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Elite Ingressos | Plataforma de Eventos e Ingressos",
  description:
    "Compre ingressos para shows e filmes, acesse seus ingressos via QR Code autenticado e faça a gestão completa de eventos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-zinc-950 text-zinc-100 antialiased selection:bg-red-600 selection:text-white`}
      >
        <Navbar />

        <div className="fixed top-16 left-0 w-full z-30">
          <ServerNoticeBanner />
        </div>

        <main className="flex-1 flex flex-col">{children}</main>

        <Footer />

      </body>
    </html>
  );
}
