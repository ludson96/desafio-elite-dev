import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
