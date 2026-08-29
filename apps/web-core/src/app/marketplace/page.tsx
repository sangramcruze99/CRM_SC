import { getTenantHeaders, safeFetch } from "../../lib/auth";
import { Download, CheckCircle, Star, Package, Building } from "lucide-react";

export const dynamic = 'force-dynamic';

const demoPlugins = [
  { id: 'plg_01', name: 'Stripe Payments Pro', version: '2.4.0', price: 0, description: 'Accept global credit cards, recurring direct debits, and automated billing synchronization.', isInstalled: true },
  { id: 'plg_02', name: 'Slack Realtime Bot Sync', version: '1.8.2', price: 15, description: 'Stream CRM deal updates, ticket escalations, and automated bot digests directly to Slack channels.', isInstalled: true },
  { id: 'plg_03', name: 'AWS S3 Cloud Storage Vault', version: '3.1.0', price: 0, description: 'Direct IAM multipart storage for large PDF contracts, backups, and customer assets.', isInstalled: true },
  { id: 'plg_04', name: 'DocuSign & E-Sign Engine', version: '2.0.1', price: 29, description: 'Certified cryptographic signatures, audit trail logging, and tamper-proof PDF generation.', isInstalled: false },
  { id: 'plg_05', name: 'HubSpot & Salesforce Exporter', version: '1.2.0', price: 49, description: 'Bi-directional ETL pipeline for contacts, leads, and account histories.', isInstalled: false },
  { id: 'plg_06', name: 'WhatsApp Business Automations', version: '1.5.4', price: 25, description: 'Send instant transaction receipts, Khata payment reminders, and customer support pings.', isInstalled: true },
];

export default async function MarketplacePage() {
  const headers = await getTenantHeaders();
  const fetchedPlugins = await safeFetch(
    "http://localhost:3012/plugins",
    { headers, cache: 'no-store' },
    []
  );

  const plugins = fetchedPlugins.length > 0 ? fetchedPlugins : demoPlugins;

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Building className="text-amber-400" size={24} />
            App Marketplace & Ecosystem Integrations
          </h1>
          <p className="text-sm text-slate-400 mt-1">Discover, install, and extend your Business OS with verified connectors.</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-6">
        {plugins.map((plugin: any) => (
          <div key={plugin.id} className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 flex flex-col hover:border-amber-500/40 hover:shadow-xl transition-all shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-2xs">
                  <Package size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">{plugin.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">v{plugin.version} • {plugin.price > 0 ? `$${plugin.price}/mo` : 'Free Tier'}</p>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-slate-300 mb-6 flex-1 leading-relaxed font-normal">
              {plugin.description}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.06]">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span className="font-bold text-white">4.9</span>
                <span className="text-slate-500">(120+ reviews)</span>
              </div>
              
              {plugin.isInstalled ? (
                <span className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold shadow-2xs">
                  <CheckCircle size={13} />
                  <span>Installed</span>
                </span>
              ) : (
                <button className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 active:scale-[0.98] cursor-pointer">
                  <Download size={13} />
                  <span>Install App</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
