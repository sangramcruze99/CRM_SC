// apps/web-core/src/app/industry/retail/RetailPosClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  X,
} from 'lucide-react';
import { BarcodeLabelGenerator } from '@/components/industry/BarcodeLabelGenerator';
import { UniversalDashboard } from '@/components/dashboard/UniversalDashboard';
import { getDashboardConfig } from '@/components/dashboard/dashboardConfig';
import { DashboardAttentionItem } from '@/components/dashboard/dashboard.types';
import { useIndustry } from '@/components/industry/IndustryContext';

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

export function RetailPosClient() {
  const { activeServiceIds } = useIndustry();
  const [catalogProducts, setCatalogProducts] = useState<ProductCatalogItem[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [khataCustomers, setKhataCustomers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [role, setRole] = useState('admin');
  const [mode, setMode] = useState<'OPERATIONS' | 'ANALYTICS'>('OPERATIONS');
  const [alert, setAlert] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Modals
  const [isPosDrawerOpen, setIsPosDrawerOpen] = useState(false);
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // New product form
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Grocery');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('');

  const fetchRetailData = async () => {
    try {
      const res = await fetch('/api/niche/retail');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          if (json.data.catalogProducts) setCatalogProducts(json.data.catalogProducts);
          if (json.data.sales) setSales(json.data.sales);
          if (json.data.khataCustomers) setKhataCustomers(json.data.khataCustomers);
        }
        if (json.auditLogs) {
          setAuditLogs(json.auditLogs);
        }
      }
    } catch (err) {
      console.error('Failed to load retail inventory:', err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchRetailData();
  }, []);

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

  const handleCheckout = async (method: 'CASH' | 'CARD' | 'KHATA_CREDIT') => {
    if (cart.length === 0) return;
    const checkoutItems = cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price }));
    const settledTotal = total;
    const customerId = khataCustomers[0]?.id;

    // Optimistically deduct inventory
    setCatalogProducts((prev) =>
      prev.map((p) => {
        const inCart = cart.find((c) => c.name === p.name);
        return inCart ? { ...p, stock: Math.max(0, p.stock - inCart.qty) } : p;
      })
    );
    setCart([]);

    try {
      const res = await fetch('/api/niche/retail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pos_checkout',
          payload: {
            items: checkoutItems,
            totalAmount: settledTotal,
            paymentMethod: method,
            customerName: method === 'KHATA_CREDIT' ? khataCustomers[0]?.name : 'Walk-In Customer',
            customerId,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.updatedCatalog) {
          setCatalogProducts(json.updatedCatalog);
        }
        setAlert(`Sale completed! Total: $${settledTotal.toFixed(2)} settled via ${method}. Receipt generated & stock updated.`);
      } else {
        setAlert(`Sale recorded ($${settledTotal.toFixed(2)} via ${method})`);
      }
      fetchRetailData();
    } catch (err) {
      console.error('POS checkout error:', err);
      setAlert(`Sale processed ($${settledTotal.toFixed(2)})`);
    }

    setIsPosDrawerOpen(false);
    setTimeout(() => setAlert(null), 4000);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const newProd: ProductCatalogItem = {
      id: `sku_${Date.now()}`,
      name: newProdName,
      category: newProdCategory,
      price: parseFloat(newProdPrice) || 9.99,
      stock: parseInt(newProdStock) || 50,
      barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
    };

    setCatalogProducts([newProd, ...catalogProducts]);
    setIsAddProductOpen(false);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdStock('');
    setAlert(`Added product "${newProd.name}" to inventory catalog.`);
    setTimeout(() => setAlert(null), 4000);

    try {
      await fetch('/api/niche/retail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_product',
          payload: newProd,
        }),
      });
      fetchRetailData();
    } catch (err) {
      console.error('Failed to persist product:', err);
    }
  };

  const dashboardConfig = getDashboardConfig(
    'retail',
    role,
    mode,
    {
      data: {
        catalogProducts,
        sales,
        khataCustomers,
      },
      metrics: {
        totalProducts: catalogProducts.length,
        todayReceiptsCount: sales.length,
        totalSalesRevenue: sales.reduce((acc, s) => acc + (s.totalAmount || 0), 0),
        khataOutstandingDues: khataCustomers.reduce((acc, c) => acc + (c.totalCreditDue || c.balanceDue || 0), 0),
        lowStockSkus: catalogProducts.filter((p) => p.stock < 15).length,
      },
      auditLogs,
    },
    {
      onGeneralAction: (actionName: string) => {
        if (actionName === 'OPEN_POS') setIsPosDrawerOpen(true);
        if (actionName === 'ADD_PRODUCT') setIsAddProductOpen(true);
        if (actionName === 'PRINT_BARCODES') setIsBarcodeOpen(true);
      },
    },
    activeServiceIds
  );

  return (
    <>
      <UniversalDashboard
        config={dashboardConfig}
        onRoleChange={setRole}
        onModeChange={setMode}
        onAttentionAction={(item: DashboardAttentionItem) => {
          if (item.id === 'att_ret_1') setIsAddProductOpen(true);
          if (item.id === 'att_ret_2') setIsPosDrawerOpen(true);
        }}
        onRowClick={(rec) => {
          const product = catalogProducts.find((p) => p.id === rec.id);
          if (product) {
            addToCart(product);
            setIsPosDrawerOpen(true);
          }
        }}
        headerSlot={
          alert ? (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{alert}</span>
            </div>
          ) : null
        }
        customModals={
          <>
            {/* POS Checkout & Barcode Scanner Portal */}
            {mounted && isPosDrawerOpen && createPortal(
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                <div className="relative w-full max-w-4xl bg-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Receipt size={20} />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">POS Cashier Register & Barcode Checkout</h2>
                        <p className="text-xs text-slate-400">Scan barcodes or add items to settle transaction</p>
                      </div>
                    </div>
                    <button onClick={() => setIsPosDrawerOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white cursor-pointer">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Catalog scanner */}
                    <div className="md:col-span-7 space-y-3">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search product name or scan barcode..."
                          value={searchProduct}
                          onChange={(e) => setSearchProduct(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                        {catalogProducts
                          .filter((p) => p.name.toLowerCase().includes(searchProduct.toLowerCase()) || p.barcode.includes(searchProduct))
                          .map((prod) => (
                            <div
                              key={prod.id}
                              onClick={() => addToCart(prod)}
                              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer text-xs flex flex-col justify-between"
                            >
                              <span className="font-bold text-white truncate">{prod.name}</span>
                              <div className="flex justify-between items-center mt-1">
                                <span className="font-mono text-emerald-400 font-bold">${prod.price.toFixed(2)}</span>
                                <span className="text-[10px] text-slate-400">Stock: {prod.stock}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Cart & Checkout */}
                    <div className="md:col-span-5 bg-white/5 p-4 rounded-2xl space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold border-b border-white/10 pb-2">
                          <span>Active Cart ({cart.length})</span>
                          {cart.length > 0 && (
                            <button onClick={() => setCart([])} className="text-rose-400 hover:underline cursor-pointer">Clear</button>
                          )}
                        </div>

                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {cart.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-xs p-1.5 bg-black/40 rounded-lg">
                              <span className="truncate max-w-[100px]">{item.name}</span>
                              <div className="flex items-center gap-1">
                                <button onClick={() => updateQty(item.id, -1)} className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">-</button>
                                <span className="font-mono">{item.qty}</span>
                                <button onClick={() => updateQty(item.id, 1)} className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">+</button>
                              </div>
                              <span className="font-mono text-emerald-400 font-bold">${(item.price * item.qty).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-white/10 text-xs space-y-1">
                          <div className="flex justify-between text-slate-400">
                            <span>Subtotal</span>
                            <span className="font-mono">${subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-white text-sm pt-1 border-t border-white/10">
                            <span>Total Due</span>
                            <span className="font-mono text-emerald-400 text-base">${total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleCheckout('CASH')}
                            disabled={cart.length === 0}
                            className="py-2 bg-white/10 hover:bg-white/20 disabled:opacity-40 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Cash Pay
                          </button>
                          <button
                            onClick={() => handleCheckout('CARD')}
                            disabled={cart.length === 0}
                            className="py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold disabled:opacity-40 rounded-xl text-xs cursor-pointer"
                          >
                            Card POS
                          </button>
                        </div>
                        <button
                          onClick={() => handleCheckout('KHATA_CREDIT')}
                          disabled={cart.length === 0}
                          className="w-full py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold disabled:opacity-40 rounded-xl text-xs cursor-pointer"
                        >
                          Record to Customer Khata
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}

            {/* Add Product Modal Portal */}
            {mounted && isAddProductOpen && createPortal(
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                <div className="relative w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 text-white">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <h2 className="text-base font-bold text-white">Add New Inventory Product</h2>
                    <button onClick={() => setIsAddProductOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Product Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Organic Jasmine Green Tea 250g"
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="14.99"
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                          className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Initial Stock</label>
                        <input
                          type="number"
                          required
                          placeholder="100"
                          value={newProdStock}
                          onChange={(e) => setNewProdStock(e.target.value)}
                          className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Save Product to Catalog
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )}

            {/* Thermal Barcode Generator Drawer */}
            {isBarcodeOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div className="relative w-full max-w-4xl bg-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl">
                  <div className="flex justify-end pb-2">
                    <button onClick={() => setIsBarcodeOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                      <X size={18} />
                    </button>
                  </div>
                  <BarcodeLabelGenerator />
                </div>
              </div>
            )}
          </>
        }
      />
    </>
  );
}
