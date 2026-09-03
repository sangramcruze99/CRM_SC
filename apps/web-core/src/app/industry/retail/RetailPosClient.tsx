'use client';

import { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Barcode,
  Search,
  CheckCircle2,
  DollarSign,
  Receipt,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { BarcodeLabelGenerator } from '@/components/industry/BarcodeLabelGenerator';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  barcode: string;
}

interface ProductCatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  barcode: string;
}

const initialCatalog: ProductCatalogItem[] = [
  { id: 'PRD-01', name: 'Organic Almond Milk 1L', category: 'Dairy & Alternatives', price: 4.50, stock: 48, barcode: '890123456789' },
  { id: 'PRD-02', name: 'Artisan Sourdough Loaf', category: 'Bakery', price: 6.20, stock: 22, barcode: '890123456790' },
  { id: 'PRD-03', name: 'Single Origin Espresso Beans 500g', category: 'Coffee', price: 18.00, stock: 35, barcode: '890123456791' },
  { id: 'PRD-04', name: 'Extra Virgin Olive Oil 750ml', category: 'Pantry', price: 14.50, stock: 19, barcode: '890123456792' },
  { id: 'PRD-05', name: 'Himalayan Pink Salt Grinder', category: 'Spices', price: 5.80, stock: 60, barcode: '890123456793' },
  { id: 'PRD-06', name: 'Greek Organic Honey 350g', category: 'Spreads', price: 9.90, stock: 14, barcode: '890123456794' },
];

const initialKhataCustomers: Array<{ id: string; name: string; balanceDue: number; lastPaymentDate: string; phone: string; status: string }> = [];

export function RetailPosClient() {
  const [catalogProducts, setCatalogProducts] = useState<ProductCatalogItem[]>(initialCatalog);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [khataCustomers, setKhataCustomers] = useState(initialKhataCustomers);
  const [searchProduct, setSearchProduct] = useState('');
  const [alert, setAlert] = useState<string | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const addToCart = (product: ProductCatalogItem) => {
    const existing = cart.find((i) => i.id === product.id);
    if (existing) {
      setCart(cart.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.price, qty: 1, barcode: product.barcode }]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(
      cart
        .map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const handleCheckout = (method: 'CASH' | 'CARD' | 'KHATA_CREDIT') => {
    if (cart.length === 0) return;
    setAlert(`🎉 Sale completed! Total: $${total.toFixed(2)} settled via ${method}. Receipt generated & WhatsApp sync dispatched.`);
    setCart([]);
    setTimeout(() => setAlert(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              RETAIL & LOCAL STORE OS
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 mt-1">
            <ShoppingBag className="text-emerald-400" size={24} />
            Local Retail, Grocery & Khata POS Console
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Fast cashier checkout register, barcode product scanner, and digital customer Khata credit ledger.
          </p>
        </div>
      </div>

      {/* Main POS Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Catalog & Barcode Scanner (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Barcode size={16} className="text-emerald-400" />
                <span>Quick Item Catalog & Barcode Scanner</span>
              </h2>
              <span className="text-[11px] text-slate-500 font-mono">Terminal POS #1</span>
            </div>

            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Scan barcode or search product name..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08] font-medium"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {catalogProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => addToCart(prod)}
                  className="p-3 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-emerald-500/40 rounded-2xl transition-all cursor-pointer flex flex-col justify-between space-y-2 group shadow-2xs"
                >
                  <div>
                    <h3 className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                      {prod.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">Stock: {prod.stock}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                    <span className="font-mono font-extrabold text-xs text-emerald-400">
                      ${prod.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-950 font-bold bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 rounded-lg shadow-xs">
                      + Add
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Khata Ledger Widget */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="flex items-center gap-1.5">
                <Wallet size={15} className="text-emerald-400" />
                <span>Customer Khata Credit Book (Ledger)</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-bold cursor-pointer hover:underline">View All Ledgers →</span>
            </h3>

            <div className="space-y-2.5">
              {khataCustomers.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{c.phone} · Paid {c.lastPaymentDate}</span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-extrabold text-xs block ${
                        c.balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      ${c.balanceDue.toFixed(2)} Due
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Cart & Cashier Register (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Receipt size={16} className="text-emerald-400" />
                  <span>Current Cart ({cart.length} items)</span>
                </h3>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} className="text-[11px] text-rose-400 font-semibold hover:underline cursor-pointer">
                    Clear Cart
                  </button>
                )}
              </div>

              {/* Cart Line Items */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs font-medium">
                    Cart is empty. Click items on the left to scan.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex-1 mr-2">
                        <span className="font-bold text-white line-clamp-1">{item.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">${item.price.toFixed(2)} each</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 bg-white/[0.08] border border-white/10 rounded-md font-bold text-xs text-slate-300 hover:bg-white/[0.15] flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-xs px-1 text-white">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-6 h-6 bg-white/[0.08] border border-white/10 rounded-md font-bold text-xs text-slate-300 hover:bg-white/[0.15] flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="w-16 text-right font-mono font-extrabold text-xs text-emerald-400 ml-2">
                        ${(item.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals Calculation */}
              <div className="pt-3 border-t border-white/[0.06] space-y-1.5 text-xs font-medium">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Sales Tax (8%)</span>
                  <span className="font-mono text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-white/[0.08]">
                  <span>Total Amount Due</span>
                  <span className="font-mono text-lg text-emerald-400">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Actions */}
            <div className="space-y-2 pt-3 border-t border-white/[0.06]">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCheckout('CASH')}
                  disabled={cart.length === 0}
                  className="py-2.5 bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-40 text-slate-200 border border-white/[0.1] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <DollarSign size={14} />
                  <span>Cash Payment</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCheckout('CARD')}
                  disabled={cart.length === 0}
                  className="py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CreditCard size={14} />
                  <span>Card POS</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleCheckout('KHATA_CREDIT')}
                disabled={cart.length === 0}
                className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 disabled:opacity-40 text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Wallet size={14} />
                <span>Record to Customer Khata Credit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Thermal Barcode Label & Price Tag Generator */}
      <BarcodeLabelGenerator />
    </div>
  );
}
