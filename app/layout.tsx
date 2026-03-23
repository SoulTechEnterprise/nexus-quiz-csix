import { GoogleTagManager } from '@next/third-parties/google'

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from '@/components/includes/footer';
import { Cookies } from '@/components/includes/cookies';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Empréstimo C6 Bank | Crédito na Conta em 7 Passos",
  description: "Responda 7 perguntas rápidas e receba o valor direto na sua conta. Simulação instantânea e liberação imediata após aprovação.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_CLIENT_ID!} gtmScriptUrl={process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_SERVER_URL!} />

      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
        </ThemeProvider>

        <Footer />

        <Cookies />
      </body>
    </html>
  );
}
