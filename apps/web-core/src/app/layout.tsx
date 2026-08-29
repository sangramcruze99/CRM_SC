import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalSearch } from "../components/GlobalSearch";
import { AskAICopilot } from "../components/AskAICopilot";
import { UserNav } from "../components/UserNav";
import { SidebarNav } from "../components/SidebarNav";
import { IndustryProvider } from "../components/industry/IndustryContext";
import { IndustrySwitcher } from "../components/industry/IndustrySwitcher";
import { FeatureFlagProvider } from "../components/platform/FeatureFlagContext";
import { RoleWorkspaceProvider } from "../components/platform/RoleWorkspaceContext";
import { AccessibilityProvider } from "../components/platform/AccessibilityContext";
import { CreditMeteringProvider } from "../components/platform/CreditMeteringContext";
import { CreditUsageDrawer } from "../components/billing/CreditUsageDrawer";
import { GlowingOrbitalBackground } from "../components/platform/GlowingOrbitalBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Business OS — Enterprise Workspace & CRM",
  description: "Unified Enterprise CRM & Business Operating System with Luxury Glassmorphism UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-[#07090e] text-slate-100 flex h-screen overflow-hidden antialiased selection:bg-amber-500 selection:text-slate-950`}
        suppressHydrationWarning
      >
        <AccessibilityProvider>
          <CreditMeteringProvider>
            <FeatureFlagProvider>
              <RoleWorkspaceProvider>
                <IndustryProvider>
                  {/* Dynamic Niche-Adapted & Role-Filtered Dark Frosted Sidebar */}
                  <SidebarNav />

                  {/* Glowing Cosmic Orbital Background with Up & Down Floating Light Waves */}
                  <GlowingOrbitalBackground />

                  {/* Main Workspace Area with Ambient Warm Lighting & Dark Glass Backdrop */}
                  <main className="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative z-0">

                    {/* Floating Frosted Glass Topbar */}
                    <header className="h-16 border-b border-white/[0.08] flex items-center justify-between px-8 bg-slate-950/60 backdrop-blur-2xl z-10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                      <div className="flex items-center text-sm font-medium text-slate-400">
                        <span className="hover:text-white transition-colors cursor-pointer font-medium">Business OS</span>
                        <span className="mx-2.5 text-slate-600">/</span>
                        <span className="text-white font-bold">Workspace</span>
                      </div>
                      <div className="flex items-center space-x-3.5">
                        <IndustrySwitcher />
                        <GlobalSearch />
                        <div className="h-5 w-px bg-white/10" />
                        <UserNav />
                      </div>
                    </header>

                    {/* Main View Container */}
                    <div className="flex-1 overflow-auto p-8">{children}</div>

                    <AskAICopilot />
                    <CreditUsageDrawer />
                  </main>
                </IndustryProvider>
              </RoleWorkspaceProvider>
            </FeatureFlagProvider>
          </CreditMeteringProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
