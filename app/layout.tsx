import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CompareProvider } from "@/context/CompareContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import Analytics from "@/components/Analytics";
import CompareBar from "@/components/ui/CompareBar";
import PWAInstallPrompt from "@/components/ui/PWAInstallPrompt";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "BKAM – اشتري بدماغك | Shop Smart | بكام؟",
  description:
    "اشتري بدماغك — قارن أسعار البقالة والصيدليات في كارفور ومترو ماركت وسعودي وأكثر في مصر. بكام؟ منصة مقارنة الأسعار الأولى في مصر. Compare grocery and pharmacy prices across Egypt.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <LanguageProvider>
          <AuthProvider>
            <WishlistProvider>
              <CompareProvider>
                <ServiceWorkerRegister />
                <Analytics />
                <Navbar />
                {children}
                <CompareBar />
                <PWAInstallPrompt />
                <Footer />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    style: {
                      borderRadius: "14px",
                      background: "#1e293b",
                      color: "#f8fafc",
                      fontSize: "14px",
                      padding: "12px 16px",
                    },
                    success: {
                      iconTheme: { primary: "#10b981", secondary: "#f8fafc" },
                    },
                    error: {
                      iconTheme: { primary: "#ef4444", secondary: "#f8fafc" },
                    },
                  }}
                />
              </CompareProvider>
            </WishlistProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
