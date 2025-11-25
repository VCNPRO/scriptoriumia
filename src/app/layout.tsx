import type { Metadata } from "next";
import { Literata, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scriptorium AI - Plataforma Institucional de Digitalización Documental",
  description: "Solución empresarial para bibliotecas nacionales, archivos históricos y administraciones públicas. Transcripción masiva de documentos manuscritos, análisis de contenido y preservación digital con tecnología de IA avanzada.",
  keywords: ["Scriptorium AI", "digitalización documental", "bibliotecas nacionales", "archivos históricos", "administración pública", "transcripción masiva", "preservación digital", "IA institucional"],
  authors: [{ name: "Scriptorium AI - Enterprise Solutions" }],
  openGraph: {
    title: "Scriptorium AI - Digitalización Documental Institucional",
    description: "Plataforma empresarial para la digitalización y análisis de fondos documentales históricos con IA",
    url: "https://scriptoriumia.eu",
    siteName: "Scriptorium AI Enterprise",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scriptorium AI - Digitalización Documental Institucional",
    description: "Solución empresarial para bibliotecas, archivos y administraciones públicas",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${literata.variable} ${inter.variable} ${jetbrainsMono.variable} font-serif antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
