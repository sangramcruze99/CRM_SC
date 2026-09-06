import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { IndustryProvider } from "../components/industry/IndustryContext";
import { FeatureFlagProvider } from "../components/platform/FeatureFlagContext";
import { RoleWorkspaceProvider } from "../components/platform/RoleWorkspaceContext";
import { AccessibilityProvider } from "../components/platform/AccessibilityContext";
import { CreditMeteringProvider } from "../components/platform/CreditMeteringContext";
import { LanguageProvider } from "../components/platform/LanguageContext";
import { ThemeProvider } from "../components/platform/ThemeContext";
import { PersonalizationProvider } from "../components/platform/PersonalizationContext";
import { SidebarProvider } from "../components/platform/SidebarContext";
import { WorkspaceShell } from "../components/platform/WorkspaceShell";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#07090e",
};

export const metadata: Metadata = {
  title: "Business OS — Enterprise Workspace & CRM",
  description: "Unified Enterprise CRM & Business Operating System with Luxury Glassmorphism UI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Business OS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-[#f8fafc] dark:bg-[#07090e] text-slate-900 dark:text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-slate-950`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AccessibilityProvider>
            <PersonalizationProvider>
              <LanguageProvider>
                <SidebarProvider>
                  <CreditMeteringProvider>
                    <FeatureFlagProvider>
                      <RoleWorkspaceProvider>
                        <IndustryProvider>
                          <WorkspaceShell>{children}</WorkspaceShell>
                        </IndustryProvider>
                      </RoleWorkspaceProvider>
                    </FeatureFlagProvider>
                  </CreditMeteringProvider>
                </SidebarProvider>
              </LanguageProvider>
            </PersonalizationProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
