'use client';

import React, { useState } from 'react';
import { ShoppingBag, QrCode, Printer, CheckCircle2, Sparkles, Plus, Layers } from 'lucide-react';

interface BarcodeLabel {
  id: string;
  sku: string;
  productName: string;
  price: number;
  category: string;
  barcode: string;
}

const INITIAL_LABELS: BarcodeLabel[] = [
  { id: 'lbl_01', sku: 'SKU-ORG-8821', productName: 'Organic Cold-Pressed Olive Oil 500ml', price: 14.99, category: 'Grocery', barcode: '890123456789' },
  { id: 'lbl_02', sku: 'SKU-TEA-4402', productName: 'Japanese Ceremonial Grade Matcha 100g', price: 28.50, category: 'Beverages', barcode: '890987654321' },
  { id: 'lbl_03', sku: 'SKU-HON-1190', productName: 'Wildflower Raw Mountain Honey 350g', price: 11.25, category: 'Pantry', barcode: '890554433221' },
];

export function BarcodeLabelGenerator() {
  const [labels, setLabels] = useState<BarcodeLabel[]>(INITIAL_LABELS);
  const [tagSize, setTagSize] = useState('Standard Shelf (50mm x 30mm)');
  const [alert, setAlert] = useState<string | null>(null);

  const handlePrintLabels = () => {
    window.print();
    setAlert('🏷️ Batch print dispatched to Zebra / Thermal Barcode Printer!');
    setTimeout(() => setAlert(null), 4000);
  };

  return (
    <div className="bg-white/[0.04] backdrop-blur-2xl border border-teal-500/30 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-6 text-white">
      {/* Alert */}
      {alert && (
        <div className="p-3 bg-teal-500/15 border border-teal-500/30 rounded-xl text-teal-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={15} />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Thermal Barcode Label & Shelf Price Tag Generator</h3>
            <span className="text-xs text-slate-400">EAN-13 / UPC-A Thermal Printer Batch Layout</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrintLabels}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/20 cursor-pointer"
        >
          <Printer size={14} />
          <span>Batch Print Shelf Labels</span>
        </button>
      </div>

      {/* Barcode Price Tags Preview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {labels.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white/[0.03] border border-teal-500/40 rounded-2xl space-y-3 shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">{item.sku}</span>
                <h4 className="font-bold text-xs text-white line-clamp-1">{item.productName}</h4>
              </div>
              <span className="text-lg font-mono font-extrabold text-teal-400">
                ${item.price.toFixed(2)}
              </span>
            </div>

            {/* Simulated Barcode Lines */}
            <div className="p-3 bg-white/[0.05] border border-white/[0.08] rounded-xl flex flex-col items-center space-y-1">
              <div className="flex items-center justify-center gap-0.5 h-10 w-full overflow-hidden">
                {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 2, 3, 1, 2, 4, 1].map((w, i) => (
                  <div
                    key={i}
                    className="bg-white h-full"
                    style={{ width: `${w * 2}px` }}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] tracking-widest text-slate-300">
                {item.barcode}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
