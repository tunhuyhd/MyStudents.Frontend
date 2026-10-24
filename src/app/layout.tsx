import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { MainLayoutWrapper } from "@/components/MainLayoutWrapper";
import Script from "next/script";
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from "@/lib/language";

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
      className="h-full antialiased"
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
