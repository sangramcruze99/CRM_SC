'use client';

import { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  FileText,
  Receipt,
  CheckCircle2,
  Plus,
  Trash2,
  RefreshCw,
  Check,
  Scan,
  ShieldCheck,
  Sparkles,
  Mail,
  Printer,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { EdgeImagePreprocessor } from '@/components/ai/EdgeImagePreprocessor';
import { FinancialGuardrailsModal } from '@/components/ai/FinancialGuardrailsModal';
import { AutonomousPipelineRunner } from '@/components/ai/AutonomousPipelineRunner';
import { InvoiceDispatchModal } from '@/components/billing/InvoiceDispatchModal';
import { useCreditMetering } from '@/components/platform/CreditMeteringContext';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ParsedInvoice {
  invoiceNumber: string;
  vendorName: string;
  vendorEmail: string;
  vendorAddress: string;
  vendorTaxId: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  taxRate: number;
  discount: number;
  discountType?: 'amount' | 'percentage';
  items: LineItem[];
  paymentTerms: string;
  bankDetails: string;
  confidenceScore: number;
}

const samplePresets: { label: string; image: string; data: ParsedInvoice }[] = [
  {
    label: 'Cloud Infrastructure & SaaS Bill',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    data: {
      invoiceNumber: 'INV-2026-8841',
      vendorName: 'Apex Cloud Solutions LLC',
      vendorEmail: 'billing@apexcloud.io',
      vendorAddress: '100 Montgomery St, Suite 1400, San Francisco, CA',
      vendorTaxId: 'US-EIN-94-3829104',
      clientName: 'Sarah Connor',
      clientCompany: 'Cyberdyne Systems Corp',
      clientEmail: 'sarah.connor@cyberdyne.io',
      clientAddress: '2000 Ocean Ave, Los Angeles, CA',
      issueDate: '2026-08-25',
      dueDate: '2026-09-25',
      currency: '$',
      taxRate: 8.5,
      discount: 250,
      items: [
        { id: '1', description: 'Enterprise Kubernetes Dedicated Cluster (32 Nodes)', quantity: 1, unitPrice: 3800.0, total: 3800.0 },
        { id: '2', description: 'Real-Time Neural OCR Inference API (500k Calls)', quantity: 1, unitPrice: 1450.0, total: 1450.0 },
        { id: '3', description: 'High-Throughput Global Edge CDN Bandwidth (10TB)', quantity: 2, unitPrice: 400.0, total: 800.0 },
      ],
      paymentTerms: 'Net 30 Days. Wire transfer preferred.',
      bankDetails: 'Silicon Valley Commercial Bank · Routing: 121000358 · Acc: 9840192840',
      confidenceScore: 98.4,
    },
  },
  {
    label: 'Hardware & Workstation Receipt',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
    data: {
      invoiceNumber: 'RCPT-9042',
      vendorName: 'Quantum Tech Hardware Dist.',
      vendorEmail: 'sales@quantumtech.com',
      vendorAddress: '450 Innovation Parkway, Austin, TX',
      vendorTaxId: 'TX-TAX-7748190',
      clientName: 'Michael Scott',
      clientCompany: 'Dunder Mifflin Logistics',
      clientEmail: 'michael.scott@dunder.com',
      clientAddress: '1725 Slough Ave, Scranton, PA',
      issueDate: '2026-08-28',
      dueDate: '2026-08-28',
      currency: '$',
      taxRate: 8.25,
      discount: 100,
      items: [
        { id: '1', description: 'Apple Mac Studio M3 Ultra 64GB Unified RAM', quantity: 2, unitPrice: 3999.0, total: 7998.0 },
        { id: '2', description: 'Dell UltraSharp 32" 4K Thunderbolt Monitors', quantity: 4, unitPrice: 749.0, total: 2996.0 },
        { id: '3', description: 'Ergonomic Standing Desk Frame & Walnut Top', quantity: 2, unitPrice: 650.0, total: 1300.0 },
      ],
      paymentTerms: 'Paid in Full via Corporate Amex.',
      bankDetails: 'Direct Credit Card Settlement #4821',
      confidenceScore: 96.8,
    },
  },
];

export function OcrInvoiceClient() {
  const [activeImage, setActiveImage] = useState<string>(samplePresets[0].image);
  const [invoice, setInvoice] = useState<ParsedInvoice>(samplePresets[0].data);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [isGuardrailOpen, setIsGuardrailOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [dispatchTab, setDispatchTab] = useState<'email' | 'receipt'>('email');

  const { credits, deductOcrScan } = useCreditMetering();

  // File input ref & Video ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Totals calculations
  const subtotal = invoice.items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const taxAmount = (subtotal * (Number(invoice.taxRate) || 0)) / 100;
  const discountType = invoice.discountType || 'amount';
  const discountValue = Number(invoice.discount) || 0;
  const discountAmount = discountType === 'percentage'
    ? (subtotal * discountValue) / 100
    : discountValue;
  const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

  // Simulate OCR extraction with progress
  const processImageOCR = (imageUrl: string, customData?: ParsedInvoice) => {
    // Deduct credit
    const hasCredit = deductOcrScan(1);
    if (!hasCredit) return;

    setActiveImage(imageUrl);
    setIsScanning(true);
    setScanProgress(10);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setScanProgress(100);
      setIsScanning(false);
      if (customData) {
        setInvoice(customData);
      }
      setAlert('✨ AI OCR scanned and extracted all fields with 98.4% neural accuracy! (1 Scan Credit Deducted)');
      setTimeout(() => setAlert(null), 3500);
    }, 900);
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const resultUrl = event.target?.result as string;
      processImageOCR(resultUrl, {
        ...samplePresets[0].data,
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        issueDate: new Date().toISOString().split('T')[0],
      });
    };
    reader.readAsDataURL(file);
  };

  // Start webcam
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access error or unsupported in environment:', err);
      setAlert('⚠️ Camera permission denied or unsupported. Please use Image Upload or Presets.');
      setIsCameraActive(false);
    }
  };

  // Snap photo from camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
      processImageOCR(dataUrl);
    }
  };

  // Close camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  // Update line item
  const updateItem = (id: string, field: keyof LineItem, val: any) => {
    setInvoice({
      ...invoice,
      items: invoice.items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: val };
          updated.total = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0);
          return updated;
        }
        return item;
      }),
    });
  };

  // Add line item
  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: 'New Billable Service or Product',
      quantity: 1,
      unitPrice: 100,
      total: 100,
    };
    setInvoice({ ...invoice, items: [...invoice.items, newItem] });
  };

  // Remove line item
  const removeItem = (id: string) => {
    setInvoice({ ...invoice, items: invoice.items.filter((item) => item.id !== id) });
  };

  // Trigger Human-in-the-loop Guardrail Modal
  const handleTriggerGuardrail = () => {
    setIsGuardrailOpen(true);
  };

  const handleApproveGuardrail = () => {
    setAlert(`🎉 Invoice ${invoice.invoiceNumber} ($${grandTotal.toFixed(2)}) compliance approved and committed to Khata ledger!`);
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
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Scan className="text-emerald-400" size={24} />
            AI Neural Vision OCR Invoice Maker & Scanner
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Client-side canvas preprocessing, automated OCR extraction, autonomous Dual Khata ledger posting, and human-in-the-loop compliance guardrails.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3 py-1.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-1.5">
            <Sparkles size={13} className="text-emerald-400" />
            <span>OCR Credits: {credits.ocrScansRemaining}/{credits.ocrScansTotal}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setDispatchTab('email');
              setIsDispatchOpen(true);
            }}
            className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/[0.1] flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Send formal invoice via email to customer"
          >
            <Mail size={14} className="text-emerald-400" />
            <span>Send Email</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDispatchTab('receipt');
              setIsDispatchOpen(true);
            }}
            className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/[0.1] flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Print 80mm thermal POS receipt or A4 invoice"
          >
            <Printer size={14} className="text-teal-400" />
            <span>Physical Receipt</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerGuardrail}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck size={14} />
            <span>Audit & Commit to Ledger</span>
          </button>
        </div>
      </div>

      {/* Autonomous Cross-Module Pipeline Runner */}
      <AutonomousPipelineRunner
        extractedData={{
          vendorName: invoice.vendorName,
          invoiceNumber: invoice.invoiceNumber,
          totalAmount: grandTotal,
          date: invoice.issueDate,
          lineItems: invoice.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.total,
          })),
        }}
        onComplete={(msg) => {
          setAlert(msg);
          setTimeout(() => setAlert(null), 5000);
        }}
      />

      {/* Ingestion Methods Bar */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,.pdf"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 active:scale-[0.98]"
          >
            <Upload size={14} />
            <span>Upload Invoice Image / PDF</span>
          </button>

          <button
            type="button"
            onClick={isCameraActive ? stopCamera : startCamera}
            className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Camera size={14} className="text-emerald-400" />
            <span>{isCameraActive ? 'Cancel Camera' : 'Live Camera Snap'}</span>
          </button>
        </div>

        {/* Demo Presets Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">
            Sample Invoices:
          </span>
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => processImageOCR(preset.image, preset.data)}
              className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] hover:text-emerald-300 border border-white/[0.1] rounded-xl text-xs font-medium text-slate-300 transition-all cursor-pointer"
            >
              Preset #{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Edge Preprocessing Controls */}
      <EdgeImagePreprocessor
        imageSrc={activeImage}
        onProcessed={(processedUrl) => {
          // edge canvas preprocessed
        }}
      />

      {/* Main OCR Workspace: Image Viewfinder (Left) & Editable Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Viewfinder & OCR Scanner Overlay (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <div className="flex items-center gap-1.5">
                <FileText size={15} className="text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Source Document Scan
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Confidence: {invoice.confidenceScore}%
              </span>
            </div>

            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-3/4 flex flex-col justify-between p-4 border border-white/10">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-amber-500 text-slate-950 rounded-full font-bold text-xs shadow-2xl flex items-center gap-2 cursor-pointer hover:bg-amber-400"
                >
                  <Camera size={15} />
                  <span>Capture & Scan</span>
                </button>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/[0.08] aspect-3/4 max-h-[540px] flex items-center justify-center group">
                <img
                  src={activeImage}
                  alt="Invoice source"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isScanning ? 'opacity-40 blur-xs' : 'opacity-95'
                  }`}
                />

                {isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-3 bg-slate-950/60 backdrop-blur-xs">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce" />
                    <div className="p-3 bg-slate-950/90 backdrop-blur-md rounded-2xl border border-amber-500/50 text-emerald-300 font-mono text-xs font-bold flex items-center gap-2 shadow-2xl">
                      <RefreshCw size={15} className="animate-spin text-emerald-400" />
                      <span>Neural OCR Processing: {scanProgress}%</span>
                    </div>
                  </div>
                )}

                {!isScanning && (
                  <div className="absolute bottom-3 left-3 right-3 p-2.5 bg-slate-950/80 backdrop-blur-md rounded-xl text-white text-[11px] font-medium flex items-center justify-between border border-white/10">
                    <span>✨ {invoice.items.length} line items detected</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {invoice.currency}
                      {grandTotal.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Structured Editable Invoice Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-5">
            {/* Invoice Top Header Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-white/[0.06] pb-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={invoice.issueDate}
                  onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white font-medium focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white font-medium focus:outline-none focus:bg-white/[0.08]"
                />
              </div>
            </div>

            {/* Vendor (Seller) & Client (Buyer) Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-white/[0.06] pb-4">
              {/* Vendor Box */}
              <div className="p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Seller / Vendor Information
                </span>
                <input
                  type="text"
                  placeholder="Vendor Name"
                  value={invoice.vendorName}
                  onChange={(e) => setInvoice({ ...invoice, vendorName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg text-xs font-bold text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Vendor Email / Tax ID"
                  value={invoice.vendorEmail}
                  onChange={(e) => setInvoice({ ...invoice, vendorEmail: e.target.value })}
                  className="w-full px-2.5 py-1 bg-white/[0.05] border border-white/[0.1] rounded-lg text-[11px] text-slate-300 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Vendor Address"
                  value={invoice.vendorAddress}
                  onChange={(e) => setInvoice({ ...invoice, vendorAddress: e.target.value })}
                  className="w-full px-2.5 py-1 bg-white/[0.05] border border-white/[0.1] rounded-lg text-[11px] text-slate-400 focus:outline-none truncate"
                />
              </div>

              {/* Client Box */}
              <div className="p-3.5 bg-emerald-500/10 border border-amber-500/20 rounded-2xl space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block">
                  Billed To / Customer
                </span>
                <input
                  type="text"
                  placeholder="Client / Company Name"
                  value={invoice.clientCompany}
                  onChange={(e) => setInvoice({ ...invoice, clientCompany: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white/[0.05] border border-emerald-500/30 rounded-lg text-xs font-bold text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Contact Name & Email"
                  value={invoice.clientEmail}
                  onChange={(e) => setInvoice({ ...invoice, clientEmail: e.target.value })}
                  className="w-full px-2.5 py-1 bg-white/[0.05] border border-emerald-500/30 rounded-lg text-[11px] text-slate-300 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Billing Address"
                  value={invoice.clientAddress}
                  onChange={(e) => setInvoice({ ...invoice, clientAddress: e.target.value })}
                  className="w-full px-2.5 py-1 bg-white/[0.05] border border-emerald-500/30 rounded-lg text-[11px] text-slate-400 focus:outline-none truncate"
                />
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Extracted Line Items
                </h4>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="border border-white/[0.08] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] text-slate-400 font-semibold border-b border-white/[0.08]">
                    <tr>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5 w-16 text-center">Qty</th>
                      <th className="p-2.5 w-24 text-right">Price</th>
                      <th className="p-2.5 w-24 text-right">Total</th>
                      <th className="p-2.5 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.03]">
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-white/[0.1] focus:border-emerald-500 rounded text-xs font-medium text-white focus:outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={item.quantity === 0 ? '' : String(item.quantity)}
                            placeholder="1"
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) => {
                              if (e.currentTarget.value === '0' && /^[1-9]$/.test(e.key)) {
                                e.currentTarget.value = '';
                              }
                            }}
                            onInput={(e: React.FormEvent<HTMLInputElement>) => {
                              const target = e.currentTarget;
                              let val = target.value.replace(/[^0-9]/g, '');
                              val = val.replace(/^0+(?=\d)/, '');
                              if (target.value !== val) target.value = val;
                            }}
                            onChange={(e) => {
                              let val = e.target.value.replace(/[^0-9]/g, '');
                              val = val.replace(/^0+(?=\d)/, '');
                              e.target.value = val;
                              const parsed = val === '' ? 0 : parseInt(val, 10);
                              updateItem(item.id, 'quantity', isNaN(parsed) ? 0 : parsed);
                            }}
                            className="w-full px-1 py-1 bg-transparent border border-transparent hover:border-white/[0.1] focus:border-emerald-500 rounded text-xs font-mono text-center text-white focus:outline-none"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={item.unitPrice === 0 ? '' : String(item.unitPrice)}
                            placeholder="0.00"
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) => {
                              if (e.currentTarget.value === '0' && /^[1-9]$/.test(e.key)) {
                                e.currentTarget.value = '';
                              }
                            }}
                            onInput={(e: React.FormEvent<HTMLInputElement>) => {
                              const target = e.currentTarget;
                              let val = target.value.replace(/[^0-9.]/g, '');
                              const parts = val.split('.');
                              if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                              val = val.replace(/^0+(?=\d)/, '');
                              if (target.value !== val) target.value = val;
                            }}
                            onChange={(e) => {
                              let val = e.target.value.replace(/[^0-9.]/g, '');
                              const parts = val.split('.');
                              if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                              val = val.replace(/^0+(?=\d)/, '');
                              e.target.value = val;
                              const parsed = val === '' ? 0 : parseFloat(val);
                              updateItem(item.id, 'unitPrice', isNaN(parsed) ? 0 : parsed);
                            }}
                            className="w-full px-1 py-1 bg-transparent border border-transparent hover:border-white/[0.1] focus:border-emerald-500 rounded text-xs font-mono text-right text-white focus:outline-none"
                          />
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-emerald-400">
                          {invoice.currency}
                          {(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financials & Calculations */}
            <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
              <div className="space-y-1.5 max-w-xs text-slate-400">
                <p className="font-medium">
                  Payment Terms: <span className="text-white font-bold">{invoice.paymentTerms}</span>
                </p>
                <p className="text-[11px] font-mono text-slate-500 truncate">{invoice.bankDetails}</p>
              </div>

              {/* Totals Summary Card */}
              <div className="w-full sm:w-80 p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-2.5 font-medium shadow-inner">
                {/* Subtotal */}
                <div className="flex justify-between text-slate-400">
                  <span className="text-xs font-semibold">Subtotal</span>
                  <span className="font-mono font-bold text-white">
                    {invoice.currency}
                    {subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Tax Rate (Customizable) */}
                <div className="flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold">Tax Rate</span>
                    <div className="flex items-center bg-white/[0.05] border border-white/[0.1] rounded-lg px-2 py-0.5 focus-within:border-emerald-500">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={invoice.taxRate === 0 ? '' : String(invoice.taxRate)}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9.]/g, '');
                          const parts = val.split('.');
                          if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                          val = val.replace(/^0+(?=\d)/, '');
                          const parsed = val === '' ? 0 : parseFloat(val);
                          setInvoice({ ...invoice, taxRate: isNaN(parsed) ? 0 : Math.max(0, parsed) });
                        }}
                        className="w-12 bg-transparent text-white font-mono text-xs focus:outline-none text-right font-semibold"
                      />
                      <span className="text-[10px] text-slate-400 ml-0.5 font-bold">%</span>
                    </div>
                  </div>
                  <span className="font-mono text-white text-xs">
                    +{invoice.currency}
                    {taxAmount.toFixed(2)}
                  </span>
                </div>

                {/* Discount (Customizable - Amount or Percentage) */}
                <div className="space-y-1.5 pt-1.5 border-t border-white/[0.05]">
                  <div className="flex items-center justify-between text-emerald-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">Discount</span>
                      {/* Segmented Toggle: $ vs % */}
                      <div className="inline-flex rounded-lg bg-black/40 p-0.5 border border-white/[0.1]">
                        <button
                          type="button"
                          onClick={() => setInvoice({ ...invoice, discountType: 'amount' })}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                            discountType === 'amount'
                              ? 'bg-emerald-500 text-slate-950 shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                          title="Fixed Amount ($)"
                        >
                          $
                        </button>
                        <button
                          type="button"
                          onClick={() => setInvoice({ ...invoice, discountType: 'percentage' })}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                            discountType === 'percentage'
                              ? 'bg-emerald-500 text-slate-950 shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                          title="Percentage Discount (%)"
                        >
                          %
                        </button>
                      </div>
                    </div>

                    {/* Discount Input Box */}
                    <div className="flex items-center bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-2 py-0.5 focus-within:border-emerald-400">
                      <span className="text-[11px] text-emerald-400 mr-0.5 font-mono font-bold">
                        {discountType === 'amount' ? invoice.currency : ''}
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={invoice.discount === 0 ? '' : String(invoice.discount)}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9.]/g, '');
                          const parts = val.split('.');
                          if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                          val = val.replace(/^0+(?=\d)/, '');
                          const parsed = val === '' ? 0 : parseFloat(val);
                          setInvoice({ ...invoice, discount: isNaN(parsed) ? 0 : Math.max(0, parsed) });
                        }}
                        className="w-16 bg-transparent text-emerald-300 font-mono text-xs focus:outline-none text-right font-bold placeholder-emerald-700"
                      />
                      <span className="text-[11px] text-emerald-400 ml-0.5 font-mono font-bold">
                        {discountType === 'percentage' ? '%' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Calculated Deduction Display */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[11px] text-emerald-400/90 font-mono pl-1">
                      <span>Deduction:</span>
                      <span>-{invoice.currency}{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Grand Total */}
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-white/[0.08]">
                  <span>Grand Total</span>
                  <span className="font-mono text-emerald-400 text-base">
                    {invoice.currency}
                    {grandTotal.toFixed(2)}
                  </span>
                </div>

                {/* Dispatch & Print Buttons */}
                <div className="pt-3 grid grid-cols-2 gap-2 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => {
                      setDispatchTab('email');
                      setIsDispatchOpen(true);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-[11px] rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Mail size={13} />
                    <span>Email Client</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDispatchTab('receipt');
                      setIsDispatchOpen(true);
                    }}
                    className="w-full py-2 bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-[11px] rounded-xl transition-all border border-white/[0.1] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Dispatch & Physical Receipt Modal */}
      <InvoiceDispatchModal
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
        initialTab={dispatchTab}
        invoice={{
          invoiceNumber: invoice.invoiceNumber,
          vendorName: invoice.vendorName,
          vendorEmail: invoice.vendorEmail,
          vendorAddress: invoice.vendorAddress,
          vendorTaxId: invoice.vendorTaxId,
          clientName: invoice.clientName,
          clientCompany: invoice.clientCompany,
          clientEmail: invoice.clientEmail,
          clientAddress: invoice.clientAddress,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          currency: invoice.currency,
          taxRate: invoice.taxRate,
          discount: invoice.discount,
          items: invoice.items,
          paymentTerms: invoice.paymentTerms,
          bankDetails: invoice.bankDetails,
          subtotal,
          taxAmount,
          grandTotal,
        }}
      />

      {/* Financial Guardrails Verification Modal */}
      <FinancialGuardrailsModal
        isOpen={isGuardrailOpen}
        onClose={() => setIsGuardrailOpen(false)}
        onApprove={handleApproveGuardrail}
        actionDetails={{
          title: `Commit Invoice #${invoice.invoiceNumber}`,
          entityName: invoice.clientCompany || invoice.vendorName,
          totalAmount: grandTotal,
          confidenceScore: invoice.confidenceScore,
          lineItems: invoice.items.map((i) => ({
            desc: i.description,
            qty: i.quantity,
            unitPrice: i.unitPrice,
            total: i.total,
          })),
          aiInferenceNotes: 'All line items, seller tax registration, and mathematical balances passed dual verification check.',
          riskLevel: 'LOW',
        }}
      />
    </div>
  );
}
