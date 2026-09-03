import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { IndustryProvider } from "../components/industry/IndustryContext";
import { FeatureFlagProvider } from "../components/platform/FeatureFlagContext";
import { RoleWorkspaceProvider } from "../components/platform/RoleWorkspaceContext";
import { AccessibilityProvider } from "../components/platform/AccessibilityContext";
import { CreditMeteringProvider } from "../components/platform/CreditMeteringContext";
import { LanguageProvider } from "../components/platform/LanguageContext";
import { ThemeProvider } from "../components/platform/ThemeContext";
import { SidebarProvider } from "../components/platform/SidebarContext";
import { WorkspaceShell } from "../components/platform/WorkspaceShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Business OS — Enterprise Workspace & CRM",
  description: "Unified Enterprise CRM & Business Operating System with Luxury Glassmorphism UI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Business OS",
  },
  themeColor: "#07090e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-[#07090e] text-slate-100 flex h-screen overflow-hidden antialiased selection:bg-emerald-500 selection:text-slate-950`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AccessibilityProvider>
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
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
