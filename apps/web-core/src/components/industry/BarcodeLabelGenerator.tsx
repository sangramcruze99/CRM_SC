'use client';

import React, { useState } from 'react';
import { ShoppingBag, QrCode, Printer, CheckCircle2, Sparkles, Plus, Layers, Tag, DollarSign, Package } from 'lucide-react';

interface BarcodeLabel {
  id: string;
  sku: string;
  productName: string;
  price: number;
  category: string;
  barcode: string;
}

const INITIAL_LABELS: BarcodeLabel[] = [];

export function BarcodeLabelGenerator() {
  const [labels, setLabels] = useState<BarcodeLabel[]>(INITIAL_LABELS);
  const [sku, setSku] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !price) return;

    const newLabel: BarcodeLabel = {
      id: `lbl_${Date.now()}`,
      sku: sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      productName,
      price: parseFloat(price) || 0,
      category: 'General Retail',
      barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
    };

    setLabels([...labels, newLabel]);
    setProductName('');
    setSku('');
    setPrice('');
    setIsAdding(false);
    setAlert(`🏷️ Added "${newLabel.productName}" barcode tag!`);
    setTimeout(() => setAlert(null), 3000);
  };

  const handlePrintLabels = () => {
    if (labels.length === 0) {
      setAlert('No barcode labels in print queue. Please add SKU tags first.');
      setTimeout(() => setAlert(null), 3000);
      return;
    }
    window.print();
    setAlert('🏷️ Batch print dispatched to Zebra / Thermal Barcode Printer!');
    setTimeout(() => setAlert(null), 4000);
  };

  return (
    <div className="relative bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl space-y-6 text-white overflow-hidden">
      {/* Top Specular Glow Lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

      {/* Alert */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 relative z-10">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.08] pb-5 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-400/20 to-emerald-500/10 border border-teal-400/30 flex items-center justify-center text-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
            <ShoppingBag size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/30 text-[9px] font-black tracking-widest text-teal-300 uppercase">
                RETAIL POS
              </span>
            </div>
            <h3 className="font-bold text-base text-white tracking-tight mt-0.5">
              Thermal Barcode Label & Shelf Price Tag Generator
            </h3>
            <span className="text-xs text-slate-400 font-medium">EAN-13 / UPC-A Thermal Printer Batch Layout</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-white/[0.1] flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Plus size={14} />
            <span>Add SKU Tag</span>
          </button>
          <button
            type="button"
            onClick={handlePrintLabels}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/25 cursor-pointer transition-all active:scale-[0.98] border border-teal-400/40"
          >
            <Printer size={14} />
            <span>Batch Print Labels</span>
          </button>
        </div>
      </div>

      {/* Add SKU Inline Form */}
      {isAdding && (
        <form onSubmit={handleAddLabel} className="p-5 bg-black/40 border border-white/[0.12] rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs animate-in fade-in relative z-10">
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Product Name</label>
            <div className="relative">
              <Package size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="e.g. Organic Honey 500g"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-black/50 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">SKU Code</label>
            <div className="relative">
              <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. SKU-HON-882"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-black/50 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all font-mono font-bold"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Retail Price ($)</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 14.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-black/50 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all font-mono font-bold"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-teal-500/20 cursor-pointer transition-all active:scale-[0.98]"
            >
              Generate Barcode
            </button>
          </div>
        </form>
      )}

      {/* Barcode Price Tags Preview Grid */}
      {labels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
          {labels.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-black/40 border border-white/[0.12] hover:border-teal-400/50 rounded-2xl space-y-3.5 shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">{item.sku}</span>
                  <h4 className="font-bold text-xs text-white line-clamp-1">{item.productName}</h4>
                </div>
                <span className="text-lg font-mono font-black text-teal-400">
                  ${item.price.toFixed(2)}
                </span>
              </div>

              {/* Simulated Barcode Lines */}
              <div className="p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl flex flex-col items-center space-y-1.5">
                <div className="flex items-center justify-center gap-0.5 h-10 w-full overflow-hidden">
                  {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 2, 3, 1, 2, 4, 1].map((w, i) => (
                    <div
                      key={i}
                      className="bg-white h-full"
                      style={{ width: `${w * 2}px` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[10px] tracking-widest text-slate-300 font-bold">
                  {item.barcode}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-white/[0.08] rounded-2xl relative z-10">
          <QrCode size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="font-bold text-slate-300">No Barcode Labels Created Yet</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Click "Add SKU Tag" to generate thermal shelf labels for your store inventory.</p>
        </div>
      )}
    </div>
  );
}
