import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "./globals.css";

const ui = Inter({
  variable: "--font-ui",
  subsets: ["latin", "cyrillic"],
});

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "Mafia League — Грац, Австрия",
    template: "%s · Mafia League",
  },
  description:
    "Клуб спортивной Мафии в Граце: игровые вечера, рейтинг игроков и обучение для новичков.",
};

export const viewport: Viewport = {
  themeColor: "#090a0c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${ui.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
