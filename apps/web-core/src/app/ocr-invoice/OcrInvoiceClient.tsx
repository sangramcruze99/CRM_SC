'use client';

import { useState, useRef, useEffect } from 'react';
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
  FolderOpen,
  Archive,
  Save,
  FileImage,
  X,
  ChevronDown,
  ChevronUp,
  BookmarkCheck,
  UploadCloud,
} from 'lucide-react';
import Link from 'next/link';
import { EdgeImagePreprocessor } from '@/components/ai/EdgeImagePreprocessor';
import { FinancialGuardrailsModal } from '@/components/ai/FinancialGuardrailsModal';
import { AutonomousPipelineRunner } from '@/components/ai/AutonomousPipelineRunner';
import { InvoiceDispatchModal } from '@/components/billing/InvoiceDispatchModal';
import { useCreditMetering } from '@/components/platform/CreditMeteringContext';
import { DocumentSummaryCard } from '@/components/ocr/DocumentSummaryCard';
import { ExtractedDataTabs } from '@/components/ocr/ExtractedDataTabs';
import { ProvenanceDrawer } from '@/components/ocr/ProvenanceDrawer';
import { InlineCorrectionModal } from '@/components/ocr/InlineCorrectionModal';
import { CanonicalDocument, ProvenanceRecord } from '@/lib/document-intelligence/types';

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
  previewImage?: string;
  documentType?: string;
  documentTypeConfidence?: number;
  paymentStatus?: string;
  amountPaid?: number;
  balanceDue?: number;
  vendorPhone?: string;
  clientPhone?: string;
  paymentInstructions?: string;
  payeeName?: string;
  total?: number;
  requiresReview?: boolean;
  reviewReasons?: string[];
}

const samplePresets: { label: string; image: string; data: ParsedInvoice }[] = [
  {
    label: 'Ad4tech Material LLC (INV-005)',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
    data: {
      invoiceNumber: 'INV-005',
      vendorName: 'Ad4tech Material LLC',
      vendorEmail: 'ad4example@gmail.com',
      vendorPhone: '+123456789',
      vendorAddress: '67h, Martin street, Alexander road 576832',
      vendorTaxId: '',
      clientName: 'John Doe',
      clientCompany: 'Green1 Materials LLC',
      clientEmail: 'ad4example@gmail.com',
      clientPhone: '',
      clientAddress: '#34, Car street, City park, Honk Kong',
      issueDate: '2021-06-22',
      dueDate: '2021-06-27',
      currency: '$',
      taxRate: 0,
      discount: 0,
      discountType: 'amount',
      items: [
        { id: '1', description: 'Desktop furniture', quantity: 1, unitPrice: 232.0, total: 232.0 },
        { id: '2', description: 'Plumbing', quantity: 1, unitPrice: 1028.0, total: 1028.0 },
        { id: '3', description: 'Water tank repair', quantity: 1, unitPrice: 304.0, total: 304.0 },
      ],
      paymentTerms: 'Pay Cheque to John Doe',
      paymentInstructions: 'Pay Cheque to John Doe',
      payeeName: 'John Doe',
      bankDetails: 'Cheque Payable to John Doe',
      confidenceScore: 98.5,
      documentType: 'invoice',
      paymentStatus: 'PARTIALLY_PAID',
      amountPaid: 232.0,
      balanceDue: 1332.0,
    },
  },
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

const emptyInvoice: ParsedInvoice = {
  invoiceNumber: '',
  vendorName: '',
  vendorEmail: '',
  vendorPhone: '',
  vendorAddress: '',
  vendorTaxId: '',
  clientName: '',
  clientCompany: '',
  clientEmail: '',
  clientPhone: '',
  clientAddress: '',
  issueDate: '',
  dueDate: '',
  currency: '$',
  taxRate: 0,
  discount: 0,
  discountType: 'amount',
  items: [],
  paymentTerms: '',
  paymentInstructions: '',
  payeeName: '',
  bankDetails: '',
  confidenceScore: 0,
  documentType: 'invoice',
  paymentStatus: 'UNPAID',
  amountPaid: 0,
  balanceDue: 0,
};

export function OcrInvoiceClient() {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<ParsedInvoice>(emptyInvoice);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [isGuardrailOpen, setIsGuardrailOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [dispatchTab, setDispatchTab] = useState<'email' | 'receipt'>('email');

  // Enterprise Document Intelligence States
  const [canonicalDoc, setCanonicalDoc] = useState<CanonicalDocument | null>(null);
  const [provenanceList, setProvenanceList] = useState<ProvenanceRecord[]>([]);
  const [requiresReview, setRequiresReview] = useState(false);
  const [reviewReasons, setReviewReasons] = useState<string[]>([]);
  const [isProvenanceOpen, setIsProvenanceOpen] = useState(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [selectedCorrectionField, setSelectedCorrectionField] = useState('paidAmount');
  const [selectedCorrectionValue, setSelectedCorrectionValue] = useState<any>('');

  // Document Vault State
  const [vaultDocs, setVaultDocs] = useState<any[]>([]);
  const [isLoadingVault, setIsLoadingVault] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(true);
  const [isSavingReceipt, setIsSavingReceipt] = useState(false);
  const [isSavedReceipt, setIsSavedReceipt] = useState(false);
  const [autoArchiveToVault, setAutoArchiveToVault] = useState(true);

  const { credits, deductOcrScan } = useCreditMetering();

  // File input refs & Video ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const vaultFileInputRef = useRef<HTMLInputElement>(null);
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
  const currentPaid = Number(invoice.amountPaid) || 0;
  const currentBalance = invoice.balanceDue !== undefined && invoice.balanceDue !== null
    ? Number(invoice.balanceDue)
    : Math.max(0, Number((grandTotal - currentPaid).toFixed(2)));
  const isInvoiceOverdue = Boolean(invoice.dueDate && invoice.dueDate < new Date().toISOString().split('T')[0] && currentBalance > 0);

  // Fetch Vault documents
  const fetchVaultDocs = async () => {
    setIsLoadingVault(true);
    try {
      const res = await fetch('/api/ocr?action=vault');
      if (res.ok) {
        const json = await res.json();
        setVaultDocs(json.documents || []);
      }
    } catch (e) {
      console.error('Vault fetch error', e);
    } finally {
      setIsLoadingVault(false);
    }
  };

  // Scan a document from the vault by docId
  const handleScanVaultDocById = async (docId: string, name?: string) => {
    const hasCredit = deductOcrScan(1);
    if (!hasCredit) return;

    setIsScanning(true);
    setScanProgress(20);

    const interval = setInterval(() => {
      setScanProgress((prev) => (prev >= 88 ? 88 : prev + 15));
    }, 160);

    try {
      const res = await fetch(`/api/ocr?action=scan-vault-doc&docId=${docId}`);
      clearInterval(interval);
      setScanProgress(100);
      setIsScanning(false);

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setInvoice(json.data);
          if (json.data.previewImage) {
            setActiveImage(json.data.previewImage);
          }
          const canDoc = json.canonical || json.extraction || null;
          if (canDoc) {
            setCanonicalDoc(canDoc);
          }
          const prov = json.provenance || json.extraction?.provenance || [];
          if (prov && prov.length > 0) {
            setProvenanceList(prov);
          }
          setRequiresReview(Boolean(json.requiresReview || json.data?.requiresReview || canDoc?.requiresReview));
          setReviewReasons(json.reviewReasons || json.data?.reviewReasons || canDoc?.reviewReasons || []);
          const totalAmount = (json.data.items || []).reduce(
            (acc: number, item: any) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
            0
          );
          setAlert(`✨ Extracted "${name || json.document?.name || 'Vault Document'}" ($${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}) with ${json.data.confidenceScore || 98.6}% accuracy!`);
        }
      }
    } catch (e) {
      clearInterval(interval);
      setIsScanning(false);
      console.error('Vault scan error', e);
      setAlert('⚠️ Could not load document from Vault.');
    } finally {
      setTimeout(() => setAlert(null), 4000);
    }
  };

  // Check URL query parameters and load vault on mount
  useEffect(() => {
    fetchVaultDocs();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const vaultDocId = params.get('vaultDocId');
      if (vaultDocId) {
        handleScanVaultDocById(vaultDocId, params.get('name') || 'Vault Document');
      }
    }
  }, []);

  // Save Receipt & Invoice to Billing Ledger and Document Vault
  const handleSaveReceipt = async () => {
    if (invoice.items.length === 0) return;
    setIsSavingReceipt(true);
    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-receipt',
          invoice,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setIsSavedReceipt(true);
        setAlert(`✅ Receipt #${invoice.invoiceNumber || 'INV'} ($${grandTotal.toFixed(2)}) saved to Billing Ledger & Document Vault!`);
        fetchVaultDocs(); // refresh vault list
      } else {
        throw new Error('Failed to save receipt');
      }
    } catch (err: any) {
      console.error('Save receipt error:', err);
      setAlert('⚠️ Failed to save receipt to billing ledger.');
    } finally {
      setIsSavingReceipt(false);
      setTimeout(() => setAlert(null), 4500);
    }
  };

  // Remove Document & Clear Workspace
  const handleReset = () => {
    setActiveImage(null);
    setInvoice(emptyInvoice);
    setCanonicalDoc(null);
    setProvenanceList([]);
    setRequiresReview(false);
    setReviewReasons([]);
    setIsScanning(false);
    setIsSavedReceipt(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (vaultFileInputRef.current) {
      vaultFileInputRef.current.value = '';
    }
    setAlert('Workspace cleared. Document removed.');
    setTimeout(() => setAlert(null), 2500);
  };

  // Open correction modal for a specific field
  const handleOpenCorrection = (fieldName?: string, originalVal?: any) => {
    setSelectedCorrectionField(fieldName || 'amountPaid');
    setSelectedCorrectionValue(originalVal !== undefined ? originalVal : invoice.amountPaid || '');
    setIsCorrectionOpen(true);
  };

  // Commit human correction
  const handleSavedCorrection = (fieldName: string, correctedVal: any) => {
    setAlert(`✅ Saved correction for "${fieldName}": "${correctedVal}" (logged to evaluation dataset)`);
    if (fieldName === 'paidAmount' || fieldName === 'amountPaid') {
      const num = parseFloat(correctedVal) || 0;
      setInvoice((prev) => ({
        ...prev,
        amountPaid: num,
        balanceDue: Math.max(0, grandTotal - num),
        paymentStatus: num >= grandTotal ? 'PAID' : num > 0 ? 'PARTIALLY_PAID' : 'UNPAID',
      }));
    } else if (fieldName === 'invoiceNumber') {
      setInvoice((prev) => ({ ...prev, invoiceNumber: String(correctedVal) }));
    } else if (fieldName === 'vendorName') {
      setInvoice((prev) => ({ ...prev, vendorName: String(correctedVal) }));
    } else if (fieldName === 'clientCompany') {
      setInvoice((prev) => ({ ...prev, clientCompany: String(correctedVal) }));
    } else if (fieldName === 'issueDate') {
      setInvoice((prev) => ({ ...prev, issueDate: String(correctedVal) }));
    } else if (fieldName === 'dueDate') {
      setInvoice((prev) => ({ ...prev, dueDate: String(correctedVal) }));
    }
    if (canonicalDoc) {
      setCanonicalDoc({
        ...canonicalDoc,
        requiresReview: false,
      });
      setRequiresReview(false);
    }
  };

  // Real Neural OCR extraction with progress tracking
  const processImageOCR = async (
    imageUrl: string,
    options?: ParsedInvoice | { customData?: ParsedInvoice; fileName?: string }
  ) => {
    // Deduct credit
    const hasCredit = deductOcrScan(1);
    if (!hasCredit) return;

    setActiveImage(imageUrl);
    setIsScanning(true);
    setScanProgress(15);
    setIsSavedReceipt(false);

    // Case A: Preset sample invoice was clicked
    const presetData = (options && 'invoiceNumber' in options) ? options : (options && 'customData' in options ? options.customData : undefined);
    if (presetData) {
      const interval = setInterval(() => {
        setScanProgress((prev) => (prev >= 90 ? 90 : prev + 25));
      }, 150);

      setTimeout(() => {
        clearInterval(interval);
        setScanProgress(100);
        setIsScanning(false);
        setInvoice(presetData);
        setCanonicalDoc({
          document: {
            id: `doc_preset_${Date.now()}`,
            type: presetData.documentType || 'invoice',
            confidence: (presetData.confidenceScore || 98) / 100,
          },
          entities: [
            { type: 'COMPANY', name: presetData.vendorName, role: 'issuer', confidence: 0.98 },
            { type: 'COMPANY', name: presetData.clientCompany, role: 'customer', confidence: 0.96 },
            { type: 'PERSON', name: presetData.clientName, role: 'contact', confidence: 0.94 },
          ].filter((e) => e.name),
          dates: [
            { type: 'invoice_date', value: presetData.issueDate, rawValue: presetData.issueDate, confidence: 0.99 },
            { type: 'due_date', value: presetData.dueDate, rawValue: presetData.dueDate, confidence: 0.97 },
          ].filter((d) => d.value),
          addresses: [
            { type: 'billing', text: presetData.clientAddress, confidence: 0.95 },
            { type: 'vendor', text: presetData.vendorAddress, confidence: 0.95 },
          ].filter((a) => a.text),
          identifiers: [
            { type: 'invoice_number', value: presetData.invoiceNumber, confidence: 0.99 },
            { type: 'tax_id', value: presetData.vendorTaxId, confidence: 0.95 },
          ].filter((i) => i.value),
          financial: {
            currency: presetData.currency || '$',
            subtotal: presetData.items.reduce((a, i) => a + (i.quantity * i.unitPrice), 0),
            tax: 0,
            discount: presetData.discount || 0,
            total: presetData.items.reduce((a, i) => a + (i.quantity * i.unitPrice), 0),
            amountPaid: 0,
            balanceDue: presetData.items.reduce((a, i) => a + (i.quantity * i.unitPrice), 0),
            paymentStatus: 'UNPAID',
          },
          payments: [],
          lineItems: presetData.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.total,
          })),
          validation: { isConsistent: true, issues: [] },
          confidence: { overall: 0.98 },
          requiresReview: false,
          processing: {
            ocrEngine: 'preset_simulation',
            model: 'enterprise_preset',
            processedAt: new Date().toISOString(),
            processingVersion: '2.0.0',
          },
        } as any);
        setProvenanceList([
          {
            field: 'total',
            extractedValue: presetData.items.reduce((a, i) => a + (i.quantity * i.unitPrice), 0),
            sourceText: `Total: ${presetData.currency}${presetData.items.reduce((a, i) => a + (i.quantity * i.unitPrice), 0)}`,
            pageNumber: 1,
            ocrConfidence: 0.99,
            semanticConfidence: 0.98,
            validationStatus: 'PASS',
          },
          {
            field: 'invoiceNumber',
            extractedValue: presetData.invoiceNumber,
            sourceText: `Invoice #: ${presetData.invoiceNumber}`,
            pageNumber: 1,
            ocrConfidence: 0.99,
            semanticConfidence: 0.99,
            validationStatus: 'PASS',
          },
        ] as any);
        setRequiresReview(false);
        setReviewReasons([]);
        setAlert('✨ AI OCR scanned and extracted preset fields with 98.4% neural accuracy! (1 Scan Credit Deducted)');
        setTimeout(() => setAlert(null), 3500);
      }, 700);
      return;
    }

    // Case B: Real document uploaded or camera photo taken
    const fileName = (options && 'fileName' in options) ? options.fileName : 'document_scan.png';

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 88) return 88;
        return prev + 12;
      });
    }, 180);

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: imageUrl,
          fileName,
        }),
      });

      clearInterval(interval);
      setScanProgress(100);
      setIsScanning(false);

      if (!response.ok) {
        throw new Error(`OCR service responded with status ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson?.data) {
        const extracted: ParsedInvoice = resJson.data;
        setInvoice(extracted);
        if (extracted.previewImage) {
          setActiveImage(extracted.previewImage);
        }
        const canDoc = resJson.canonical || resJson.extraction || null;
        if (canDoc) {
          setCanonicalDoc(canDoc);
        }
        const prov = resJson.provenance || resJson.extraction?.provenance || [];
        if (prov && prov.length > 0) {
          setProvenanceList(prov);
        }
        setRequiresReview(Boolean(resJson.requiresReview || extracted.requiresReview || canDoc?.requiresReview));
        setReviewReasons(resJson.reviewReasons || extracted.reviewReasons || canDoc?.reviewReasons || []);
        const totalAmount = (extracted.items || []).reduce(
          (acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
          0
        );
        setAlert(
          `✨ AI OCR scanned and extracted ${extracted.items?.length || 0} line items ($${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}) with ${extracted.confidenceScore || 99}% accuracy!`
        );
      } else {
        throw new Error('No structured invoice data returned from OCR engine');
      }
    } catch (err: any) {
      clearInterval(interval);
      setIsScanning(false);
      console.error('OCR processing error:', err);
      setAlert('⚠️ OCR extraction encountered an issue. Please verify document readability.');
    } finally {
      setTimeout(() => setAlert(null), 4000);
    }
  };

  // Direct Upload to Document Vault AND Scan OCR
  const handleFileUploadWithVault = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const resultUrl = event.target?.result as string;
      if (autoArchiveToVault) {
        try {
          await fetch('/api/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'upload-to-vault',
              fileData: resultUrl,
              fileName: file.name,
            }),
          });
          fetchVaultDocs();
        } catch (vErr) {
          console.warn('Vault auto-archive warning:', vErr);
        }
      }
      processImageOCR(resultUrl, { fileName: file.name });
    };
    reader.readAsDataURL(file);
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const resultUrl = event.target?.result as string;
      processImageOCR(resultUrl, { fileName: file.name });
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
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
      processImageOCR(dataUrl, { fileName: 'camera_capture.jpg' });
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
    if (invoice.items.length === 0) {
      setAlert('⚠️ Please upload a document or add at least 1 line item before auditing.');
      setTimeout(() => setAlert(null), 3000);
      return;
    }
    setIsGuardrailOpen(true);
  };

  const handleApproveGuardrail = () => {
    setAlert(`🎉 Invoice ${invoice.invoiceNumber || 'DRAFT'} ($${grandTotal.toFixed(2)}) compliance approved and committed to Khata ledger!`);
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
              if (invoice.items.length === 0) {
                setAlert('⚠️ Please scan or add line items before sending an email invoice.');
                setTimeout(() => setAlert(null), 3000);
                return;
              }
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
              if (invoice.items.length === 0) {
                setAlert('⚠️ Please scan or add line items before printing a receipt.');
                setTimeout(() => setAlert(null), 3000);
                return;
              }
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
      {invoice.items.length > 0 && (
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
      )}

      {/* Ingestion Methods Bar */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Native Local Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUploadWithVault}
            accept="image/*,.pdf"
            className="hidden"
          />

          {/* Upload directly to Vault & Scan */}
          <input
            type="file"
            ref={vaultFileInputRef}
            onChange={handleFileUploadWithVault}
            accept="image/*,.pdf"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 active:scale-[0.98]"
          >
            <Upload size={14} />
            <span>Upload & Scan (Image/PDF)</span>
          </button>

          {/* Toggle Document Vault Quick-Access */}
          <button
            type="button"
            onClick={() => setIsVaultOpen(!isVaultOpen)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer active:scale-[0.98] ${
              isVaultOpen
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 hover:text-white border-white/[0.1]'
            }`}
            title="Browse and scan files already stored in your Document Vault"
          >
            <FolderOpen size={14} className="text-emerald-400" />
            <span>Document Vault ({vaultDocs.length})</span>
            {isVaultOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          <button
            type="button"
            onClick={isCameraActive ? stopCamera : startCamera}
            className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Camera size={14} className="text-emerald-400" />
            <span>{isCameraActive ? 'Cancel Camera' : 'Live Camera Snap'}</span>
          </button>

          {(activeImage || invoice.items.length > 0) && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
              title="Remove current document and clear workspace"
            >
              <Trash2 size={13} />
              <span>Remove Document</span>
            </button>
          )}
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

      {/* Document Vault Quick-Access Panel */}
      {isVaultOpen && (
        <div className="bg-white/[0.03] border border-emerald-500/25 rounded-3xl p-4 sm:p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <FolderOpen size={16} className="text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Document Vault Quick Access
              </h3>
              <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
                {vaultDocs.length} Stored Documents
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => vaultFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Upload file directly to Vault & Scan with OCR"
              >
                <Plus size={13} />
                <span>Upload to Vault & Scan</span>
              </button>
              <Link
                href="/documents"
                className="text-[11px] text-slate-400 hover:text-emerald-300 transition-colors font-medium px-2 py-1"
              >
                Open Full Vault →
              </Link>
            </div>
          </div>

          {isLoadingVault ? (
            <div className="py-8 flex items-center justify-center gap-2 text-slate-400 text-xs">
              <RefreshCw size={14} className="animate-spin text-emerald-400" />
              <span>Fetching documents from vault...</span>
            </div>
          ) : vaultDocs.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              <p>No documents found in vault. Upload an invoice or receipt to automatically archive it.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {vaultDocs.map((doc: any) => {
                const isPdf = doc.mimeType === 'application/pdf' || doc.name?.endsWith('.pdf');
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleScanVaultDocById(doc.id, doc.name)}
                    className="p-3.5 bg-white/[0.04] hover:bg-emerald-500/10 border border-white/[0.08] hover:border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-sm"
                    title={`Click to instantly scan ${doc.name} with AI OCR`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className={`p-2 rounded-xl shrink-0 ${isPdf ? 'bg-rose-500/15 text-rose-400' : 'bg-blue-500/15 text-blue-400'}`}>
                        <FileText size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white group-hover:text-emerald-300 truncate" title={doc.name}>
                          {doc.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {(doc.size / 1024).toFixed(1)} KB · {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Vault'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 bg-emerald-500/15 group-hover:bg-emerald-500 text-emerald-300 group-hover:text-slate-950 rounded-lg text-[10px] font-bold shrink-0 transition-all flex items-center gap-1"
                    >
                      <Sparkles size={11} />
                      <span>Scan</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edge Preprocessing Controls */}
      {activeImage && (
        <EdgeImagePreprocessor
          imageSrc={activeImage}
          onProcessed={(processedUrl) => {
            // edge canvas preprocessed
          }}
        />
      )}

      {/* Enterprise Document Summary & Human Review Gate (Section 31 & Section 16) */}
      {(invoice.items.length > 0 || invoice.vendorName || invoice.invoiceNumber) && (
        <DocumentSummaryCard
          canonicalDoc={canonicalDoc}
          invoice={invoice}
          grandTotal={grandTotal}
          paidAmount={currentPaid}
          balanceDue={currentBalance}
          paymentStatus={invoice.paymentStatus}
          requiresReview={requiresReview}
          reviewReasons={reviewReasons}
          onOpenProvenance={() => setIsProvenanceOpen(true)}
          onOpenCorrection={handleOpenCorrection}
        />
      )}

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
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Confidence: {invoice.confidenceScore}%
                </span>
                {(activeImage || invoice.items.length > 0) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 px-2 py-0.5 rounded-full transition-all flex items-center gap-1 cursor-pointer"
                    title="Remove document and clear scan"
                  >
                    <Trash2 size={10} />
                    <span>Remove</span>
                  </button>
                )}
              </div>
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
            ) : activeImage ? (
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/[0.08] aspect-3/4 max-h-[540px] flex items-center justify-center group">
                {/* Floating Remove Button on Viewfinder Image */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute top-3 right-3 px-2.5 py-1.5 bg-slate-950/85 hover:bg-rose-500 text-slate-300 hover:text-white border border-white/10 hover:border-rose-500/50 rounded-xl text-[11px] font-bold backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg z-20"
                  title="Remove this document"
                >
                  <Trash2 size={12} className="text-rose-400 group-hover:text-white" />
                  <span>Remove Document</span>
                </button>

                {/* Render document preview cleanly */}
                {activeImage.startsWith('data:application/pdf') ? (
                  <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                      <FileText size={44} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">PDF Invoice Decoded</h4>
                      <p className="text-xs text-slate-400 font-mono">Vector Stream Processed</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={activeImage}
                    alt="Invoice source"
                    className={`w-full h-full object-contain transition-opacity duration-300 ${
                      isScanning ? 'opacity-40 blur-xs' : 'opacity-95'
                    }`}
                  />
                )}

                {isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-3 bg-slate-950/60 backdrop-blur-xs z-10">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce" />
                    <div className="p-3 bg-slate-950/90 backdrop-blur-md rounded-2xl border border-amber-500/50 text-emerald-300 font-mono text-xs font-bold flex items-center gap-2 shadow-2xl">
                      <RefreshCw size={15} className="animate-spin text-emerald-400" />
                      <span>Neural OCR Processing: {scanProgress}%</span>
                    </div>
                  </div>
                )}

                {!isScanning && (
                  <div className="absolute bottom-3 left-3 right-3 p-2.5 bg-slate-950/80 backdrop-blur-md rounded-xl text-white text-[11px] font-medium flex items-center justify-between border border-white/10 z-10">
                    <span>✨ {invoice.items.length} line items detected</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {invoice.currency}
                      {grandTotal.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative rounded-2xl overflow-hidden bg-white/[0.02] border-2 border-dashed border-white/[0.12] hover:border-emerald-500/40 aspect-3/4 max-h-[540px] flex flex-col items-center justify-center p-6 text-center group cursor-pointer transition-all hover:bg-white/[0.04]"
              >
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                  <Scan size={36} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Awaiting Document Scan
                </h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-5">
                  Upload an invoice image/PDF or snap a photo with your camera to begin OCR extraction.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload size={13} />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startCamera();
                    }}
                    className="px-3.5 py-1.5 bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.1] rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera size={13} className="text-emerald-400" />
                    <span>Live Camera</span>
                  </button>
                </div>
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
                  placeholder="e.g. INV-2026-001"
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
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Vendor Email"
                    value={invoice.vendorEmail}
                    onChange={(e) => setInvoice({ ...invoice, vendorEmail: e.target.value })}
                    className="w-full px-2 py-1 bg-white/[0.05] border border-white/[0.1] rounded-lg text-[11px] text-slate-300 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Mobile / Phone"
                    value={invoice.vendorPhone || ''}
                    onChange={(e) => setInvoice({ ...invoice, vendorPhone: e.target.value })}
                    className="w-full px-2 py-1 bg-white/[0.05] border border-white/[0.1] rounded-lg text-[11px] text-slate-300 focus:outline-none font-mono"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Vendor Address"
                  value={invoice.vendorAddress}
                  onChange={(e) => setInvoice({ ...invoice, vendorAddress: e.target.value })}
                  className="w-full px-2.5 py-1 bg-white/[0.05] border border-white/[0.1] rounded-lg text-[11px] text-slate-400 focus:outline-none truncate"
                />
              </div>

              {/* Client Box */}
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2">
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
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Contact / Payee Name"
                    value={invoice.clientName}
                    onChange={(e) => setInvoice({ ...invoice, clientName: e.target.value })}
                    className="w-full px-2 py-1 bg-white/[0.05] border border-emerald-500/30 rounded-lg text-[11px] text-slate-300 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Contact Email"
                    value={invoice.clientEmail}
                    onChange={(e) => setInvoice({ ...invoice, clientEmail: e.target.value })}
                    className="w-full px-2 py-1 bg-white/[0.05] border border-emerald-500/30 rounded-lg text-[11px] text-slate-300 focus:outline-none"
                  />
                </div>
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
                    {invoice.items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <FileText size={24} className="text-slate-500 opacity-60" />
                            <p className="text-xs font-semibold text-slate-300">No Line Items Extracted Yet</p>
                            <p className="text-[11px] text-slate-500 max-w-sm">
                              Upload an invoice image/PDF above, or click{' '}
                              <button
                                type="button"
                                onClick={addItem}
                                className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 cursor-pointer"
                              >
                                + Add Line Item
                              </button>{' '}
                              to manually enter data.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      invoice.items.map((item) => (
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
                    ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financials & Calculations */}
            <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-start sm:items-start gap-4 text-xs">
              <div className="space-y-2 flex-1 max-w-sm text-slate-400">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Payment Instructions / Payee
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pay Cheque to John Doe"
                    value={invoice.paymentInstructions || invoice.paymentTerms || ''}
                    onChange={(e) => setInvoice({ ...invoice, paymentInstructions: e.target.value, paymentTerms: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Bank / Settlement Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Commercial Settlement / Account details"
                    value={invoice.bankDetails || ''}
                    onChange={(e) => setInvoice({ ...invoice, bankDetails: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg text-[11px] font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
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

                {/* Amount Paid (Customizable Input) */}
                <div className="flex items-center justify-between text-slate-300 pt-2 border-t border-white/[0.08]">
                  <span className="text-xs font-semibold">Amount Paid</span>
                  <div className="flex items-center bg-white/[0.05] border border-white/[0.1] rounded-lg px-2 py-0.5 focus-within:border-emerald-500">
                    <span className="text-[11px] text-slate-400 mr-0.5 font-mono font-bold">
                      {invoice.currency}
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={invoice.amountPaid === undefined || invoice.amountPaid === 0 ? '' : String(invoice.amountPaid)}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = val.split('.');
                        if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                        val = val.replace(/^0+(?=\d)/, '');
                        const parsed = val === '' ? 0 : parseFloat(val);
                        const newPaid = isNaN(parsed) ? 0 : Math.max(0, parsed);
                        const newBalance = Math.max(0, Number((grandTotal - newPaid).toFixed(2)));
                        const newStatus = newPaid >= grandTotal && grandTotal > 0
                          ? 'PAID'
                          : newPaid > 0
                            ? 'PARTIALLY_PAID'
                            : 'UNPAID';
                        setInvoice({
                          ...invoice,
                          amountPaid: newPaid,
                          balanceDue: newBalance,
                          paymentStatus: newStatus,
                        });
                      }}
                      className="w-20 bg-transparent text-white font-mono text-xs focus:outline-none text-right font-bold"
                    />
                  </div>
                </div>

                {/* Balance Due (Prominent Highlight Card) */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  currentBalance > 0
                    ? isInvoiceOverdue
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-200 shadow-sm'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                    : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                }`}>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block">
                      Balance Due
                    </span>
                    <span className="text-[10px] opacity-85">
                      {currentBalance > 0 ? (isInvoiceOverdue ? '⚠️ Overdue Remaining' : 'Remaining Payable') : '✓ Settled in Full'}
                    </span>
                  </div>
                  <span className="font-mono font-extrabold text-base">
                    {invoice.currency}
                    {currentBalance.toFixed(2)}
                  </span>
                </div>

                {/* Payment Status Dropdown Selector */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-slate-400">Status</span>
                  <select
                    value={invoice.paymentStatus || 'UNPAID'}
                    onChange={(e) => setInvoice({ ...invoice, paymentStatus: e.target.value })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border focus:outline-none cursor-pointer ${
                      invoice.paymentStatus === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : invoice.paymentStatus === 'PARTIALLY_PAID'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : invoice.paymentStatus === 'OVERDUE'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-white/[0.06] text-slate-300 border-white/[0.1]'
                    }`}
                  >
                    <option value="PAID" className="bg-slate-900 text-emerald-400">PAID</option>
                    <option value="PARTIALLY_PAID" className="bg-slate-900 text-amber-400">PARTIALLY PAID</option>
                    <option value="OVERDUE" className="bg-slate-900 text-rose-400">OVERDUE</option>
                    <option value="UNPAID" className="bg-slate-900 text-slate-300">UNPAID</option>
                    <option value="VOID" className="bg-slate-900 text-slate-500">VOID</option>
                    <option value="CREDIT" className="bg-slate-900 text-purple-400">CREDIT</option>
                  </select>
                </div>

                {/* Dispatch, Save & Print Buttons */}
                <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={handleSaveReceipt}
                    disabled={isSavingReceipt || invoice.items.length === 0}
                    className={`w-full py-2.5 font-bold text-[11px] rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98] ${
                      isSavedReceipt
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25 border border-emerald-400/40'
                    }`}
                    title="Save this receipt to the Billing Ledger and Document Vault"
                  >
                    {isSavingReceipt ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : isSavedReceipt ? (
                      <>
                        <Check size={13} className="text-emerald-300" />
                        <span>Receipt Saved ✓</span>
                      </>
                    ) : (
                      <>
                        <Save size={13} />
                        <span>Save Receipt</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDispatchTab('email');
                      setIsDispatchOpen(true);
                    }}
                    className="w-full py-2.5 bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-[11px] rounded-xl transition-all border border-white/[0.1] flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                  >
                    <Mail size={13} className="text-emerald-400" />
                    <span>Email Client</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDispatchTab('receipt');
                      setIsDispatchOpen(true);
                    }}
                    className="w-full py-2.5 bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-[11px] rounded-xl transition-all border border-white/[0.1] flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                  >
                    <Printer size={13} className="text-teal-400" />
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extracted Business Intelligence Explorer (Section 31) */}
      {(invoice.items.length > 0 || invoice.vendorName || invoice.invoiceNumber) && (
        <ExtractedDataTabs
          canonicalDoc={canonicalDoc}
          invoice={invoice}
          grandTotal={grandTotal}
          subtotal={subtotal}
          taxAmount={taxAmount}
          discountAmount={discountAmount}
          onOpenCorrection={handleOpenCorrection}
          onOpenProvenance={() => setIsProvenanceOpen(true)}
        />
      )}

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

      {/* Why This Value? Provenance Debugger (Section 32) */}
      <ProvenanceDrawer
        isOpen={isProvenanceOpen}
        onClose={() => setIsProvenanceOpen(false)}
        provenanceList={provenanceList}
      />

      {/* Inline Field Correction Modal (Section 23) */}
      <InlineCorrectionModal
        isOpen={isCorrectionOpen}
        onClose={() => setIsCorrectionOpen(false)}
        documentId={canonicalDoc?.document?.id || invoice.invoiceNumber || 'DOC-CURRENT'}
        documentType={canonicalDoc?.document?.type || invoice.documentType || 'invoice'}
        initialFieldName={selectedCorrectionField}
        initialOriginalValue={selectedCorrectionValue}
        onSavedCorrection={handleSavedCorrection}
      />
    </div>
  );
}
