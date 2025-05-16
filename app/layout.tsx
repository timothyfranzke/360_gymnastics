import type { Metadata } from "next";
import { Poppins, Open_Sans } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const openSans = Open_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "360 Gymnastics - Olathe, KS",
  description: "Recreational and competitive gymnastics in Olathe, Kansas.",
  keywords: ["gymnastics", "Olathe", "Kansas", "360 Gymnastics", "children sports", "competitive gymnastics"],
  openGraph: {
    title: "360 Gymnastics - Olathe, KS",
    description: "Recreational and competitive gymnastics in Olathe, Kansas.",
    url: "https://kc360gym.com",
    siteName: "360 Gymnastics",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${poppins.variable} ${openSans.variable} antialiased font-sans`}>
        <Header />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
