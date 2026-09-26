'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Layers,
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Truck,
  ArrowRightLeft,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Bot,
  Warehouse,
  ShieldCheck,
  Tag,
  Building2,
  Boxes,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

interface Category {
  id: string;
  name: string;
  description?: string;
  _count?: { products: number };
}

interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
}

interface Product {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  costPrice: number;
  quantity: number;
  reorderPoint: number;
  unit: string;
  status: string; // 'ACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED'
  categoryId?: string;
  supplierId?: string;
  barcode?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string };
  supplier?: { id: string; name: string; contactPerson?: string; phone?: string };
}

interface StockMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  previousQty: number;
  newQty: number;
  reason?: string;
  reference?: string;
  actor?: string;
  notes?: string;
  createdAt: string;
  product?: { id: string; name: string; sku: string; unit: string };
}

interface InventoryStats {
  totalProducts: number;
  totalQuantity: number;
  totalValuation: number;
  lowStockCount: number;
  outOfStockCount: number;
  healthyStockCount: number;
}

function InventoryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'products' | 'suppliers' | 'movements' | 'categories'>('products');

  // Sync tab with URL search parameter
  const tabParam = searchParams.get('tab');
  useEffect(() => {
    if (tabParam === 'suppliers' || tabParam === 'movements' || tabParam === 'categories') {
      setActiveTab(tabParam);
    } else {
      setActiveTab('products');
    }
  }, [tabParam]);

  const handleTabChange = useCallback((tab: 'products' | 'suppliers' | 'movements' | 'categories') => {
    setActiveTab(tab);
    const newUrl = tab === 'products' ? '/inventory' : `/inventory?tab=${tab}`;
    router.push(newUrl, { scroll: false });
  }, [router]);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState<boolean>(false);
  const [selectedProductForMovement, setSelectedProductForMovement] = useState<Product | null>(null);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState<boolean>(false);

  // Product Form state
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    description: '',
    price: 0,
    costPrice: 0,
    quantity: 0,
    reorderPoint: 10,
    unit: 'pcs',
    categoryId: '',
    supplierId: '',
    location: '',
    barcode: '',
  });

  // Movement Form state
  const [movementForm, setMovementForm] = useState({
    type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT',
    quantity: 10,
    reason: 'PURCHASE',
    reference: '',
    notes: '',
  });

  // Supplier Form state
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
  });

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  /* -------------------------------------------------------------------------- */
  /* DATA FETCHING                                                              */
  /* -------------------------------------------------------------------------- */

  const loadAllData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [prodsRes, catsRes, supsRes, movsRes, statsRes] = await Promise.all([
        fetch('/api/inventory/products'),
        fetch('/api/inventory/categories'),
        fetch('/api/inventory/suppliers'),
        fetch('/api/inventory/stock-movements'),
        fetch('/api/inventory/products/stats'),
      ]);

      if (prodsRes.ok) {
        const data = await prodsRes.json();
        setProducts(Array.isArray(data) ? data : []);
      }
      if (catsRes.ok) {
        const data = await catsRes.json();
        setCategories(Array.isArray(data) ? data : []);
      }
      if (supsRes.ok) {
        const data = await supsRes.json();
        setSuppliers(Array.isArray(data) ? data : []);
      }
      if (movsRes.ok) {
        const data = await movsRes.json();
        setMovements(Array.isArray(data) ? data : []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (err: any) {
      console.error('Failed loading inventory data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  /* -------------------------------------------------------------------------- */
  /* ACTIONS & HANDLERS                                                         */
  /* -------------------------------------------------------------------------- */

  const handleOpenNewProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      description: '',
      price: 99,
      costPrice: 65,
      quantity: 15,
      reorderPoint: 5,
      unit: 'pcs',
      categoryId: categories[0]?.id || '',
      supplierId: suppliers[0]?.id || '',
      location: 'Warehouse A - Bay 1',
      barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      price: product.price,
      costPrice: product.costPrice,
      quantity: product.quantity,
      reorderPoint: product.reorderPoint,
      unit: product.unit,
      categoryId: product.categoryId || '',
      supplierId: product.supplierId || '',
      location: product.location || '',
      barcode: product.barcode || '',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const res = await fetch(`/api/inventory/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productForm),
        });
        if (res.ok) {
          showToast(`Updated product "${productForm.name}"successfully!`);
          setIsProductModalOpen(false);
          loadAllData();
        } else {
          showToast('Failed to update product', 'error');
        }
      } else {
        const res = await fetch('/api/inventory/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productForm),
        });
        if (res.ok) {
          showToast(`Created product "${productForm.name}"successfully!`);
          setIsProductModalOpen(false);
          loadAllData();
        } else {
          showToast('Failed to create product', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Network error', 'error');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from inventory?`)) return;
    try {
      const res = await fetch(`/api/inventory/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(`Removed "${name}" from catalog.`);
        loadAllData();
      } else {
        showToast('Failed to delete product', 'error');
      }
    } catch (err: any) {
      showToast('Network error', 'error');
    }
  };

  const handleOpenMovementModal = (product: Product, defaultType: 'IN' | 'OUT' | 'ADJUSTMENT' = 'IN') => {
    setSelectedProductForMovement(product);
    setMovementForm({
      type: defaultType,
      quantity: defaultType === 'ADJUSTMENT' ? product.quantity : 10,
      reason: defaultType === 'IN' ? 'PURCHASE' : defaultType === 'OUT' ? 'DISPATCH' : 'AUDIT_CORRECTION',
      reference: defaultType === 'IN' ? `PO-${Date.now().toString().slice(-4)}` : `SO-${Date.now().toString().slice(-4)}`,
      notes: '',
    });
    setIsMovementModalOpen(true);
  };

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForMovement) return;

    try {
      const res = await fetch('/api/inventory/stock-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductForMovement.id,
          ...movementForm,
          quantity: Number(movementForm.quantity),
          actor: 'System Operator',
        }),
      });

      if (res.ok) {
        showToast(`Stock updated for "${selectedProductForMovement.name}"!`);
        setIsMovementModalOpen(false);
        loadAllData();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || 'Failed to record stock movement', 'error');
      }
    } catch (err: any) {
      showToast('Network error', 'error');
    }
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm),
      });
      if (res.ok) {
        showToast(`Supplier "${supplierForm.name}" registered!`);
        setIsSupplierModalOpen(false);
        setSupplierForm({ name: '', contactPerson: '', email: '', phone: '', address: '' });
        loadAllData();
      } else {
        showToast('Failed to register supplier', 'error');
      }
    } catch (err: any) {
      showToast('Network error', 'error');
    }
  };

  /* -------------------------------------------------------------------------- */
  /* FILTERED PRODUCTS                                                          */
  /* -------------------------------------------------------------------------- */

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;

      const matchesStatus =
        selectedStatus === 'ALL' ||
        p.status === selectedStatus ||
        (selectedStatus === 'LOW' && (p.status === 'LOW_STOCK' || p.quantity <= p.reorderPoint));

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.status === 'LOW_STOCK' || p.status === 'OUT_OF_STOCK' || p.quantity <= p.reorderPoint);
  }, [products]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 space-y-8 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 shadow-inner">
              <Boxes className="w-6 h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
              Inventory & Supply Chain
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                Live Port 3026
              </span>
            </h1>
          </div>
          <p className="text-sm text-slate-400 pl-11">
            Real-time SKU catalog, stock levels, warehouse locations, and automated reorder sentinel.
          </p>
        </div>

        <div className="flex items-center gap-3 pl-11 lg:pl-0 flex-wrap">
          <button
            onClick={() => loadAllData()}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/60 rounded-xl text-slate-300 hover:text-slate-100 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/60 rounded-xl text-slate-300 hover:text-slate-100 transition shadow-sm"
          >
            <Truck className="w-4 h-4 text-teal-400" /> Add Supplier
          </button>

          <button
            onClick={handleOpenNewProductModal}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold rounded-xl transition shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> New Product SKU
          </button>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total SKUs */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Products</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-slate-100">
              {stats?.totalProducts ?? products.length}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-medium">{stats?.totalQuantity ?? 0}</span> units in stock across {categories.length} categories
            </div>
          </div>
        </div>

        {/* Metric 2: Stock Valuation */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-teal-500/40 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Inventory Valuation</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-slate-100">
              ${(stats?.totalValuation ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-teal-400 font-medium">Asset value</span> based on current retail list price
            </div>
          </div>
        </div>

        {/* Metric 3: Low Stock Alerts */}
        <div
          onClick={() => {
            setSelectedStatus(selectedStatus === 'LOW' ? 'ALL' : 'LOW');
            setActiveTab('products');
          }}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/40 transition cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Low Stock Warnings</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-amber-400 flex items-center gap-2">
              {stats?.lowStockCount ?? lowStockProducts.length}
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                Attention Needed
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Click to filter products below reorder threshold
            </div>
          </div>
        </div>

        {/* Metric 4: Suppliers */}
        <div
          onClick={() => handleTabChange('suppliers')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/40 transition cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Suppliers</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-bold text-slate-100">
              {suppliers.length}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-medium">Verified vendors</span> with active supply agreements
            </div>
          </div>
        </div>
      </div>

      {/* AI SUPPLY CHAIN SENTINEL BANNER (if low stock exists) */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-emerald-950/20 border border-amber-500/30 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-3.5">
            <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 shrink-0 mt-0.5 md:mt-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <span>Gemma AI Stock Sentinel Alert</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {lowStockProducts.length} Items Below Safe Level
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Critical items like{' '}
                <span className="text-amber-300 font-medium">
                  {lowStockProducts.slice(0, 2).map((p) => p.name).join(', ')}
                </span>{' '}
                require immediate replenishment orders to prevent order backlogs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pl-11 md:pl-0">
            <button
              onClick={() => {
                const target = lowStockProducts[0];
                if (target) handleOpenMovementModal(target, 'IN');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg transition"
            >
              Order Replenishment
            </button>
            <button
              onClick={() => {
                setSelectedStatus('LOW');
                handleTabChange('products');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            > View All Low Stock ({lowStockProducts.length})
            </button>
          </div>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-px">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleTabChange('products')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            Products Catalog
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('suppliers')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'suppliers'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            Suppliers & Vendors
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {suppliers.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('movements')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'movements'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Stock Movement Ledger
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {movements.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            Categories ({categories.length})
          </button>
        </div>

        {activeTab === 'products' && (
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'table' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'grid' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Grid
            </button>
          </div>
        )}
      </div>

      {/* TAB CONTENT: PRODUCTS CATALOG */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search SKU, name, or bay location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                    selectedCategory === 'ALL'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg focus:outline-none focus:border-emerald-500/50"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Optimal (Active)</option>
                <option value="LOW">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* TABLE VIEW */}
          {viewMode === 'table' ? (
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/70 border-b border-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-4">SKU / Product Name</th>
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Stock Level</th>
                      <th className="px-5 py-4">Reorder Point</th>
                      <th className="px-5 py-4">Unit Price</th>
                      <th className="px-5 py-4">Storage Location</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                          <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                          No products found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const isLow = p.quantity <= p.reorderPoint && p.quantity > 0;
                        const isOut = p.quantity === 0;

                        return (
                          <tr key={p.id} className="hover:bg-slate-800/30 transition group">
                            <td className="px-5 py-4">
                              <div className="font-semibold text-slate-100">{p.name}</div>
                              <div className="text-xs text-emerald-400 font-mono flex items-center gap-2 mt-0.5">
                                <span>{p.sku}</span>
                                {p.supplier && (
                                  <span className="text-slate-500 font-sans">• {p.supplier.name}</span>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-slate-300">
                              <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700/60 text-xs font-medium">
                                {p.category?.name || 'Uncategorized'}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-base font-bold font-mono ${
                                    isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                                  }`}
                                >
                                  {p.quantity}
                                </span>
                                <span className="text-xs text-slate-500">{p.unit}</span>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-slate-400 text-xs font-mono">
                              {p.reorderPoint} {p.unit}
                            </td>

                            <td className="px-5 py-4">
                              <div className="font-semibold text-slate-100 font-mono">
                                ${p.price.toFixed(2)}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                Cost: ${p.costPrice.toFixed(2)}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-xs text-slate-400 flex items-center gap-1.5 mt-2">
                              <Warehouse className="w-3.5 h-3.5 text-slate-500" />
                              {p.location || 'Central Stock'}
                            </td>

                            <td className="px-5 py-4">
                              {isOut ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                                  Out of Stock
                                </span>
                              ) : isLow ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                  Low Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  Optimal
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenMovementModal(p, 'IN')}
                                  title="Receive Inventory (Stock In)"
                                  className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 transition"
                                >
                                  <ArrowDownLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenMovementModal(p, 'OUT')}
                                  title="Dispatch Inventory (Stock Out)"
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition"
                                >
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditProductModal(p)}
                                  title="Edit Product Details"
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  title="Delete Product"
                                  className="p-1.5 bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/40 rounded-lg text-slate-400 hover:text-rose-400 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((p) => {
                const isLow = p.quantity <= p.reorderPoint && p.quantity > 0;
                const isOut = p.quantity === 0;

                return (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between hover:border-emerald-500/40 transition group shadow-lg"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-mono text-emerald-400 font-medium">{p.sku}</div>
                          <h3 className="text-base font-bold text-slate-100 mt-0.5 line-clamp-1">{p.name}</h3>
                        </div>
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Out
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Low
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Optimal
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 min-h-[32px]">
                        {p.description || 'No description provided.'}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-slate-500">Quantity On Hand</div>
                          <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                            {p.quantity} <span className="text-xs font-normal text-slate-500">{p.unit}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500">Retail Price</div>
                          <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                            ${p.price.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Warehouse className="w-3.5 h-3.5" />
                          {p.location || 'Warehouse'}
                        </span>
                        <span>Reorder: {p.reorderPoint}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenMovementModal(p, 'IN')}
                        className="flex-1 py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        Receive
                      </button>
                      <button
                        onClick={() => handleOpenMovementModal(p, 'OUT')}
                        className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        Dispatch
                      </button>
                      <button
                        onClick={() => handleOpenEditProductModal(p)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-200">Registered Suppliers & Vendors</h2>
            <button
              onClick={() => setIsSupplierModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              Register New Supplier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl hover:border-emerald-500/40 transition shadow-lg space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{sup.name}</h3>
                      <div className="text-xs text-slate-400">Rep: {sup.contactPerson || 'General Contact'}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {sup.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/60 pt-3">
                  {sup.email && <div>Email: <span className="text-slate-200 font-mono">{sup.email}</span></div>}
                  {sup.phone && <div>Phone: <span className="text-slate-200 font-mono">{sup.phone}</span></div>}
                  {sup.address && <div>Address: <span className="text-slate-300">{sup.address}</span></div>}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Linked Products: {products.filter((p) => p.supplierId === sup.id).length}</span>
                  <button
                    onClick={() => {
                      setSelectedStatus('ALL');
                      handleTabChange('products');
                    }}
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  > View Catalog <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: STOCK MOVEMENTS LEDGER */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-200">Stock Movement Audit Ledger</h2>
            <span className="text-xs text-slate-500">Showing last 100 historical transactions</span>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/70 border-b border-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Timestamp</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Product / SKU</th>
                    <th className="px-5 py-4">Qty Changed</th>
                    <th className="px-5 py-4">Prev $\to$ New Qty</th>
                    <th className="px-5 py-4">Reason / Reference</th>
                    <th className="px-5 py-4">Actor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                        No stock movements logged yet.
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-800/20 transition font-sans">
                        <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                          {new Date(m.createdAt).toLocaleString()}
                        </td>

                        <td className="px-5 py-3.5">
                          {m.type === 'IN' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <ArrowDownLeft className="w-3 h-3" />
                              INBOUND
                            </span>
                          ) : m.type === 'OUT' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <ArrowUpRight className="w-3 h-3" />
                              OUTBOUND
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <RefreshCw className="w-3 h-3" />
                              ADJUSTMENT
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-200">
                            {m.product?.name || products.find((p) => p.id === m.productId)?.name || m.productId}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {m.product?.sku || products.find((p) => p.id === m.productId)?.sku}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 font-mono font-bold">
                          <span
                            className={
                              m.type === 'IN' ? 'text-emerald-400' : m.type === 'OUT' ? 'text-rose-400' : 'text-amber-400'
                            }
                          >
                            {m.type === 'IN' ? `+${m.quantity}` : m.type === 'OUT' ? `-${m.quantity}` : `${m.quantity}`}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 font-mono text-xs text-slate-400">
                          {m.previousQty} $\to$ <span className="text-slate-100 font-semibold">{m.newQty}</span>
                        </td>

                        <td className="px-5 py-3.5 text-xs text-slate-300">
                          <div>{m.reason || 'N/A'}</div>
                          {m.reference && <div className="text-slate-500 font-mono text-[11px]">{m.reference}</div>}
                        </td>

                        <td className="px-5 py-3.5 text-xs text-slate-400">
                          {m.actor || 'System'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-200">Product Categories & Taxonomy</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat) => {
              const productCount = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl hover:border-emerald-500/40 transition shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Tag className="w-5 h-5" />
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-300 font-mono">
                      {productCount} SKUs
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{cat.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{cat.description || 'Catalog category group'}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      handleTabChange('products');
                    }}
                    className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1 pt-2"
                  >
                    Filter Products $\to$
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100">
                {editingProduct ? 'Edit Product SKU' : 'Add New Inventory Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
              >
                
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Enterprise Cloud Server"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="e.g. SRV-ECR-900"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Detailed specifications or product notes..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Supplier</label>
                  <select
                    value={productForm.supplierId}
                    onChange={(e) => setProductForm({ ...productForm, supplierId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Unit of Measure</label>
                  <input
                    type="text"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="pcs, unit, kg, box"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Sell Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Current Qty</label>
                  <input
                    type="number"
                    value={productForm.quantity}
                    onChange={(e) => setProductForm({ ...productForm, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Reorder Alert At</label>
                  <input
                    type="number"
                    value={productForm.reorderPoint}
                    onChange={(e) => setProductForm({ ...productForm, reorderPoint: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Storage Location</label>
                  <input
                    type="text"
                    value={productForm.location}
                    onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
                    placeholder="Warehouse A - Bay 12"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Barcode / UPC</label>
                  <input
                    type="text"
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                    placeholder="840192830192"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold rounded-xl transition shadow-lg shadow-emerald-500/20"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STOCK MOVEMENT (RECEIVE / DISPATCH / ADJUST) */}
      {isMovementModalOpen && selectedProductForMovement && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Record Stock Movement</h3>
                <p className="text-xs text-emerald-400 font-mono mt-0.5">{selectedProductForMovement.name}</p>
              </div>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
              >
                
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Movement Direction *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementForm({ ...movementForm, type: 'IN', reason: 'PURCHASE' })}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                      movementForm.type === 'IN'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    + INBOUND
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementForm({ ...movementForm, type: 'OUT', reason: 'DISPATCH' })}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                      movementForm.type === 'OUT'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    - OUTBOUND
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementForm({ ...movementForm, type: 'ADJUSTMENT', reason: 'AUDIT_CORRECTION' })}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                      movementForm.type === 'ADJUSTMENT'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    = ADJUST
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {movementForm.type === 'ADJUSTMENT' ? 'New Target Quantity' : 'Quantity Units'} *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={movementForm.quantity}
                  onChange={(e) => setMovementForm({ ...movementForm, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-lg font-bold focus:outline-none focus:border-emerald-500"
                />
                <div className="text-xs text-slate-500 flex justify-between">
                  <span>Current On Hand: {selectedProductForMovement.quantity} {selectedProductForMovement.unit}</span>
                  {movementForm.type === 'IN' && (
                    <span className="text-emerald-400 font-mono">
                      Will become: {selectedProductForMovement.quantity + (Number(movementForm.quantity) || 0)}
                    </span>
                  )}
                  {movementForm.type === 'OUT' && (
                    <span className="text-rose-400 font-mono">
                      Will become: {Math.max(0, selectedProductForMovement.quantity - (Number(movementForm.quantity) || 0))}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Transaction Reason</label>
                <select
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="PURCHASE">Vendor Purchase Inbound</option>
                  <option value="DISPATCH">Customer Sales Dispatch</option>
                  <option value="CUSTOMER_RETURN">Customer Return</option>
                  <option value="DAMAGED">Damaged / Written-Off</option>
                  <option value="AUDIT_CORRECTION">Physical Stocktake Audit</option>
                  <option value="INTERNAL_TRANSFER">Internal Dept Transfer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">PO / SO Reference</label>
                <input
                  type="text"
                  value={movementForm.reference}
                  onChange={(e) => setMovementForm({ ...movementForm, reference: e.target.value })}
                  placeholder="e.g. PO-8921 or SO-4412"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold rounded-xl transition shadow-lg shadow-emerald-500/20"
                >
                  Post Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUPPLIER */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100">Register New Supplier</h3>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
              >
                
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="e.g. Cisco Systems Logistics"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Contact Person</label>
                <input
                  type="text"
                  value={supplierForm.contactPerson}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                  placeholder="e.g. Rachel Adams"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    placeholder="rep@supplier.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    placeholder="+1 (555) 019-2831"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Office / Facility Address</label>
                <input
                  type="text"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  placeholder="100 Silicon Way, San Jose, CA"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold rounded-xl transition shadow-lg shadow-emerald-500/20"
                >
                  Register Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-sm font-medium">Loading Inventory workspace...</span>
          </div>
        </div>
      }
    >
      <InventoryPageContent />
    </Suspense>
  );
}
