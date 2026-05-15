import type { Metadata } from "next";
import { Inter, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { MainLayoutWrapper } from "@/components/MainLayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MyStudents - Modern Education Platform",
  description: "Next-generation student management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${beVietnamPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">
        <LanguageProvider>
          <AuthProvider>
            <MainLayoutWrapper>
              {children}
            </MainLayoutWrapper>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
