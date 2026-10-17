import type { Metadata } from "next";
import { Inter, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { MainLayoutWrapper } from "@/components/MainLayoutWrapper";
import Script from "next/script";
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from "@/lib/language";

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
      lang={DEFAULT_LANGUAGE}
      suppressHydrationWarning
      className={`${inter.variable} ${beVietnamPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">
        <Script id="language-bootstrap" strategy="beforeInteractive">
          {`try {
            const savedLanguage = window.localStorage.getItem("${LANGUAGE_STORAGE_KEY}");
            if (savedLanguage === "vi" || savedLanguage === "en") {
              document.documentElement.lang = savedLanguage;
            }
          } catch {
            // Keep the server-rendered default language when storage is unavailable.
          }`}
        </Script>
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
