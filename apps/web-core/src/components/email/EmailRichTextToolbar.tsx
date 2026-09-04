'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Quote,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Tag,
  Check,
  Palette,
  Eye,
  Edit3,
  Code2,
  Link2,
  Unlink,
  ExternalLink,
  X,
} from 'lucide-react';
import { renderRichEmailContent } from '../../lib/richTextRenderer';

export interface EmailRichTextToolbarProps {
  value: string;
  onChange: (newValue: string) => void;
  editorRef?: React.RefObject<HTMLDivElement | null>;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  onFontChange?: (font: string) => void;
  onAlignChange?: (align: 'left' | 'center' | 'right') => void;
  showAiSmoother?: boolean;
  className?: string;
  compact?: boolean;
}

export interface EmailRichTextEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  onAlignChange?: (align: 'left' | 'center' | 'right') => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}

const FONT_OPTIONS = [
  { id: 'sans-serif', label: 'Sans Serif', css: 'Arial, Helvetica, sans-serif' },
  { id: 'serif', label: 'Serif', css: 'Georgia, serif' },
  { id: 'mono', label: 'Fixed Width', css: 'Courier New, monospace' },
  { id: 'inter', label: 'Inter Modern', css: 'Inter, sans-serif' },
  { id: 'georgia', label: 'Georgia Editorial', css: 'Georgia, serif' },
];

const SIZE_OPTIONS = [
  { id: 'small', label: 'Small', sizeNum: '1', tag: 'small' },
  { id: 'normal', label: 'Normal', sizeNum: '3', tag: 'p' },
  { id: 'large', label: 'Large', sizeNum: '5', tag: 'h3' },
  { id: 'huge', label: 'Huge', sizeNum: '6', tag: 'h2' },
];

const COLOR_SWATCHES = [
  { label: 'White', hex: '#ffffff' },
  { label: 'Emerald Green', hex: '#10b981' },
  { label: 'Teal Cyan', hex: '#14b8a6' },
  { label: 'Amber Gold', hex: '#f59e0b' },
  { label: 'Sky Blue', hex: '#38bdf8' },
  { label: 'Rose Red', hex: '#f43f5e' },
  { label: 'Slate Muted', hex: '#94a3b8' },
  { label: 'Purple Accent', hex: '#a855f7' },
];

const MERGE_TAGS = [
  { label: 'First Name', tag: '{{firstName}}' },
  { label: 'Last Name', tag: '{{lastName}}' },
  { label: 'Company Name', tag: '{{company}}' },
  { label: 'Job Title', tag: '{{jobTitle}}' },
  { label: 'Industry', tag: '{{industry}}' },
  { label: 'Deal Value', tag: '{{dealValue}}' },
  { label: 'Calendar Link', tag: '{{calendarLink}}' },
  { label: 'Sender Name', tag: '{{senderName}}' },
];

export function EmailRichTextToolbar({
  value,
  onChange,
  editorRef,
  textareaRef,
  onFontChange,
  onAlignChange,
  showAiSmoother = true,
  className = '',
  compact = true,
}: EmailRichTextToolbarProps) {
  const [selectedFont, setSelectedFont] = useState('Sans Serif');
  const [selectedSize, setSelectedSize] = useState('Normal');
  const [selectedAlign, setSelectedAlign] = useState<'left' | 'center' | 'right'>('left');

  // Popovers
  const [openDropdown, setOpenDropdown] = useState<'font' | 'size' | 'color' | 'align' | 'merge' | 'ai' | 'link' | null>(null);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkText, setLinkText] = useState('');
  const savedRangeRef = useRef<Range | null>(null);
  const [isSmoothing, setIsSmoothing] = useState(false);
  const [smoothSuccess, setSmoothSuccess] = useState(false);

  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Find target editable container
  const getTargetEditor = (): HTMLDivElement | null => {
    if (editorRef?.current) return editorRef.current;
    if (toolbarRef.current) {
      const container = toolbarRef.current.closest('[data-rich-editor]') || toolbarRef.current.parentElement;
      if (container) {
        const found = container.querySelector('[contenteditable="true"]') as HTMLDivElement;
        if (found) return found;
      }
    }
    return null;
  };

  const getTargetTextarea = (): HTMLTextAreaElement | null => {
    if (textareaRef?.current) return textareaRef.current;
    if (toolbarRef.current) {
      const container = toolbarRef.current.closest('[data-rich-editor]') || toolbarRef.current.parentElement;
      if (container) {
        const found = container.querySelector('textarea');
        if (found) return found;
      }
    }
    return null;
  };

  /**
   * Execute real browser WYSIWYG command
   * Uses e.preventDefault() on button mousedown to keep editor focus and text selection active!
   */
  const execCmd = (cmd: string, val: string | null = null) => {
    const editor = getTargetEditor();
    if (editor) {
      editor.focus();
      document.execCommand(cmd, false, val || undefined);
      onChange(editor.innerHTML);
      return;
    }

    // Fallback for textarea mode if ever in raw code view
    const textarea = getTargetTextarea();
    if (textarea) {
      applyTextareaWrap(cmd, val);
    }
  };

  const applyTextareaWrap = (cmd: string, val: string | null = null) => {
    const textarea = getTargetTextarea();
    if (!textarea) return;

    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const selectedText = value.substring(start, end);

    let prefix = '';
    let suffix = '';
    let placeholder = 'text';

    if (cmd === 'bold') {
      prefix = '<b>';
      suffix = '</b>';
      placeholder = 'bold text';
    } else if (cmd === 'italic') {
      prefix = '<i>';
      suffix = '</i>';
      placeholder = 'italic text';
    } else if (cmd === 'underline') {
      prefix = '<u>';
      suffix = '</u>';
      placeholder = 'underlined text';
    } else if (cmd === 'strikeThrough') {
      prefix = '<s>';
      suffix = '</s>';
      placeholder = 'strikethrough text';
    } else if (cmd === 'foreColor' && val) {
      prefix = `<span style="color: ${val};">`;
      suffix = '</span>';
      placeholder = 'colored text';
    } else if (cmd === 'fontName' && val) {
      prefix = `<span style="font-family: ${val};">`;
      suffix = '</span>';
      placeholder = 'styled text';
    }

    const content = selectedText || placeholder;
    const updated = value.substring(0, start) + prefix + content + suffix + value.substring(end);
    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + content.length);
    }, 10);
  };

  const insertMergeTag = (tag: string) => {
    const editor = getTargetEditor();
    if (editor) {
      editor.focus();
      document.execCommand('insertText', false, tag);
      onChange(editor.innerHTML);
      return;
    }

    const textarea = getTargetTextarea();
    if (textarea) {
      const start = textarea.selectionStart ?? value.length;
      const end = textarea.selectionEnd ?? value.length;
      const updated = value.substring(0, start) + tag + value.substring(end);
      onChange(updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 10);
    } else {
      onChange(`${value} ${tag}`);
    }
  };

  // Open Link Modal with saved selection
  const handleOpenLinkModal = () => {
    const sel = window.getSelection();
    let selected = '';
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      selected = sel.toString().trim();
    } else {
      savedRangeRef.current = null;
    }
    if (selected) {
      setLinkText(selected);
    }
    setOpenDropdown(openDropdown === 'link' ? null : 'link');
  };

  // Apply or insert hyperlink into Visual WYSIWYG or Textarea
  const applyHyperlink = (urlOverride?: string, textOverride?: string) => {
    const finalUrl = (urlOverride ?? linkUrl ?? '').trim();
    const finalText = (textOverride ?? linkText ?? '').trim();

    if (!finalUrl || finalUrl === 'https://') {
      setOpenDropdown(null);
      return;
    }

    let formattedUrl = finalUrl;
    if (
      !formattedUrl.startsWith('http://') &&
      !formattedUrl.startsWith('https://') &&
      !formattedUrl.startsWith('mailto:') &&
      !formattedUrl.startsWith('tel:') &&
      !formattedUrl.startsWith('{{') &&
      !formattedUrl.startsWith('#')
    ) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const editor = getTargetEditor();
    if (editor) {
      editor.focus();
      const sel = window.getSelection();
      if (sel && savedRangeRef.current) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }

      const selectedRangeText = savedRangeRef.current ? savedRangeRef.current.toString().trim() : '';
      const displayText = finalText || selectedRangeText || formattedUrl;
      const linkHtml = `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer" style="color: #10b981; text-decoration: underline; font-weight: 500;">${displayText}</a>`;

      document.execCommand('insertHTML', false, linkHtml);
      onChange(editor.innerHTML);
      setOpenDropdown(null);
      return;
    }

    const textarea = getTargetTextarea();
    if (textarea) {
      const start = textarea.selectionStart ?? value.length;
      const end = textarea.selectionEnd ?? value.length;
      const selected = value.substring(start, end).trim();
      const displayText = finalText || selected || formattedUrl;
      const linkHtml = `<a href="${formattedUrl}" target="_blank" style="color: #10b981; text-decoration: underline; font-weight: 500;">${displayText}</a>`;
      const updated = value.substring(0, start) + linkHtml + value.substring(end);
      onChange(updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + linkHtml.length, start + linkHtml.length);
      }, 10);
      setOpenDropdown(null);
      return;
    }

    // Fallback
    onChange(`${value} <a href="${formattedUrl}" target="_blank" style="color: #10b981; text-decoration: underline; font-weight: 500;">${finalText || formattedUrl}</a>`);
    setOpenDropdown(null);
  };

  // Remove hyperlink from current selection
  const removeHyperlink = () => {
    const editor = getTargetEditor();
    if (editor) {
      editor.focus();
      const sel = window.getSelection();
      if (sel && savedRangeRef.current) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
      document.execCommand('unlink', false);
      onChange(editor.innerHTML);
    }
    setOpenDropdown(null);
  };

  // AI Text Smoother
  const handleAiPolish = async (mode: 'smooth' | 'punchy' | 'friendly' | 'grammar') => {
    const editor = getTargetEditor();
    const rawText = editor ? editor.innerText.trim() : value.replace(/<[^>]+>/g, ' ').trim();
    if (!rawText) return;

    setIsSmoothing(true);
    setOpenDropdown(null);

    const promptMap = {
      smooth: 'Rewrite the following email text to make the flow natural, professional, smooth, and engaging without changing the core offer or meaning:',
      punchy: 'Make this email text significantly punchier, concise, high-converting, and executive-ready. Remove fluff:',
      friendly: 'Make this email text warm, consultative, friendly, and approachable:',
      grammar: 'Polish the grammar, syntax, tone, and punctuation of this email text to enterprise perfection:',
    };

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `${promptMap[mode]}\n\n"${rawText}"\n\nReturn ONLY the rewritten email copy text with no quotes, no explanations, and preserve any {{variables}} intact.`,
          provider: 'groq',
        }),
      });

      if (!res.ok) throw new Error('Failed to smooth copy');
      const data = await res.json();
      let replyText = (data.reply || '').trim();

      const codeBlockMatch = replyText.match(/```(?:markdown|email|text)?\s*([\s\S]*?)```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        replyText = codeBlockMatch[1].trim();
      } else {
        replyText = replyText.replace(/^(?:Here (?:is|are) (?:the )?(?:rewritten|smoothed|polished|version).*?:\s*)+/i, '');
      }
      replyText = replyText.replace(/^["']|["']$/g, '').trim();

      if (replyText) {
        if (editor) {
          editor.innerHTML = replyText.replace(/\n/g, '<br/>');
          onChange(editor.innerHTML);
        } else {
          onChange(replyText);
        }
        setSmoothSuccess(true);
        setTimeout(() => setSmoothSuccess(false), 3000);
      }
    } catch (e) {
      console.error('AI smooth error:', e);
    } finally {
      setIsSmoothing(false);
    }
  };

  return (
    <div ref={toolbarRef} className={`relative select-none ${className}`}>
      {/* Container: 2 structured rows in compact mode, or single pill in wide mode */}
      <div className="bg-[#eef3fb] dark:bg-slate-900/95 border border-[#d2dfef] dark:border-slate-800 rounded-2xl p-1.5 shadow-sm space-y-1.5">
        {/* ROW 1: Typography & Inline Styles */}
        <div className="flex items-center justify-between gap-1 flex-wrap">
          {/* Font Family Dropdown */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setOpenDropdown(openDropdown === 'font' ? null : 'font')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 font-medium text-[11px] transition-colors cursor-pointer"
              title="Font Family"
            >
              <span className="truncate max-w-[80px]">{selectedFont}</span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>

            {openDropdown === 'font' && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedFont(f.label);
                      execCmd('fontName', f.css);
                      onFontChange?.(f.id);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                      selectedFont === f.label ? 'text-emerald-500 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{f.label}</span>
                    {selectedFont === f.label && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="h-3.5 w-px bg-slate-300 dark:bg-slate-700" />

          {/* Font Size (TT) Dropdown */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setOpenDropdown(openDropdown === 'size' ? null : 'size')}
              className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 font-bold text-xs text-slate-800 dark:text-slate-100 transition-colors cursor-pointer"
              title="Font Size"
            >
              <span className="font-serif tracking-tight font-extrabold text-[12px]">TT</span>
              <ChevronDown size={10} className="text-slate-400" />
            </button>

            {openDropdown === 'size' && (
              <div className="absolute top-full left-0 mt-1 w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50">
                {SIZE_OPTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedSize(s.label);
                      execCmd('fontSize', s.sizeNum);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                      selectedSize === s.label ? 'text-emerald-500 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{s.label}</span>
                    {selectedSize === s.label && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="h-3.5 w-px bg-slate-300 dark:bg-slate-700" />

          {/* B - Bold: Visually bolds the selected text */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCmd('bold')}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer font-black text-xs font-serif active:scale-95"
            title="Bold (Ctrl+B)"
          >
            B
          </button>

          {/* I - Italic: Visually italicizes the selected text */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCmd('italic')}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer italic font-serif text-xs font-semibold active:scale-95"
            title="Italic (Ctrl+I)"
          >
            I
          </button>

          {/* U - Underline: Visually underlines the selected text */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCmd('underline')}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer underline font-serif text-xs font-semibold active:scale-95"
            title="Underline (Ctrl+U)"
          >
            U
          </button>

          {/* S - Strikethrough: Visually strikes through selected text */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCmd('strikeThrough')}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer line-through text-xs font-semibold active:scale-95"
            title="Strikethrough"
          >
            S
          </button>

          {/* Hyperlink (🔗) Button & Popover */}
          <div className="relative">
            <button
              type="button"
              data-link-trigger
              onMouseDown={() => {
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                  savedRangeRef.current = sel.getRangeAt(0).cloneRange();
                  const str = sel.toString().trim();
                  if (str) setLinkText(str);
                }
              }}
              onClick={handleOpenLinkModal}
              className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all cursor-pointer text-xs active:scale-95 ${
                openDropdown === 'link'
                  ? 'bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold ring-1 ring-emerald-500/50'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100'
              }`}
              title="Insert Hyperlink (Ctrl+K)"
            >
              <Link2 size={13} />
            </button>

            {openDropdown === 'link' && (
              <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-900 dark:text-white">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Link2 size={12} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Insert Hyperlink</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">Ctrl+K</span>
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 rounded-md cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {/* Text to Display */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Text to display
                    </label>
                    <input
                      type="text"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder="e.g. Schedule a Demo, Click here..."
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Destination URL */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Link Destination (URL or Variable)
                    </label>
                    <input
                      type="text"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com or {{calendarLink}}"
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          applyHyperlink();
                        }
                      }}
                    />
                  </div>

                  {/* Quick CRM Variable Insert Pills */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Quick CRM Link Presets:</span>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setLinkUrl('{{calendarLink}}');
                          if (!linkText) setLinkText('Book a Call on My Calendar');
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20 cursor-pointer"
                      >
                        📅 Calendar Link
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLinkUrl('{{website}}');
                          if (!linkText) setLinkText('Visit Our Website');
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 font-medium border border-teal-500/20 cursor-pointer"
                      >
                        🌐 Lead Website
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLinkUrl('{{unsubscribeUrl}}');
                          if (!linkText) setLinkText('Unsubscribe from updates');
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-500/10 hover:bg-slate-500/20 text-slate-600 dark:text-slate-400 font-medium border border-slate-500/20 cursor-pointer"
                      >
                        🔕 Unsubscribe
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={removeHyperlink}
                      className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium cursor-pointer"
                      title="Remove link from selection"
                    >
                      <Unlink size={12} />
                      <span>Unlink</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(null)}
                        className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => applyHyperlink()}
                        className="flex items-center gap-1 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        <ExternalLink size={12} />
                        <span>Apply Link</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <span className="h-3.5 w-px bg-slate-300 dark:bg-slate-700" />

          {/* A - Text Color Dropdown */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setOpenDropdown(openDropdown === 'color' ? null : 'color')}
              className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer"
              title="Text Color"
            >
              <div className="flex flex-col items-center leading-none">
                <span className="font-extrabold text-[11px]">A</span>
                <span className="w-2.5 h-0.5 bg-emerald-500 rounded-full mt-0.5" />
              </div>
              <ChevronDown size={9} className="text-slate-400 ml-0.5" />
            </button>

            {openDropdown === 'color' && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Color Palette</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {COLOR_SWATCHES.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        execCmd('foreColor', c.hex);
                        setOpenDropdown(null);
                      }}
                      className="w-6 h-6 rounded-md border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Alignment Dropdown */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setOpenDropdown(openDropdown === 'align' ? null : 'align')}
              className="flex items-center gap-0.5 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer"
              title="Text Alignment"
            >
              {selectedAlign === 'left' && <AlignLeft size={13} />}
              {selectedAlign === 'center' && <AlignCenter size={13} />}
              {selectedAlign === 'right' && <AlignRight size={13} />}
              <ChevronDown size={9} className="text-slate-400" />
            </button>

            {openDropdown === 'align' && (
              <div className="absolute top-full right-0 mt-1 w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50">
                {(['left', 'center', 'right'] as const).map((al) => (
                  <button
                    key={al}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedAlign(al);
                      if (al === 'left') execCmd('justifyLeft');
                      else if (al === 'center') execCmd('justifyCenter');
                      else if (al === 'right') execCmd('justifyRight');
                      onAlignChange?.(al);
                      setOpenDropdown(null);
                    }}
                    className="w-full px-2.5 py-1.5 text-left text-xs capitalize flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {al === 'left' && <AlignLeft size={12} />}
                    {al === 'center' && <AlignCenter size={12} />}
                    {al === 'right' && <AlignRight size={12} />}
                    <span>{al}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ROW 2: Structure, CRM Tags & AI Smoother */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-0.5">
            {/* Numbered List */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('insertOrderedList')}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Numbered List"
            >
              <ListOrdered size={13} />
            </button>

            {/* Bullet List */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('insertUnorderedList')}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Bulleted List"
            >
              <List size={13} />
            </button>

            {/* Outdent */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('outdent')}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Decrease Indent"
            >
              <Outdent size={13} />
            </button>

            {/* Indent */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('indent')}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Increase Indent"
            >
              <Indent size={13} />
            </button>

            {/* Quote */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCmd('formatBlock', '<blockquote>')}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Blockquote"
            >
              <Quote size={13} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Merge Tags Dropdown */}
            <div className="relative">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setOpenDropdown(openDropdown === 'merge' ? null : 'merge')}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-semibold transition-colors cursor-pointer border border-emerald-500/20"
                title="Insert CRM Field Tag"
              >
                <Tag size={10} />
                <span>{`{ }`} Tags</span>
                <ChevronDown size={9} />
              </button>

              {openDropdown === 'merge' && (
                <div className="absolute top-full right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50 max-h-56 overflow-y-auto">
                  <div className="px-2.5 py-1 text-[9px] uppercase font-bold text-slate-400">Personalize With Lead Data</div>
                  {MERGE_TAGS.map((t) => (
                    <button
                      key={t.tag}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        insertMergeTag(t.tag);
                        setOpenDropdown(null);
                      }}
                      className="w-full px-2.5 py-1.5 text-left text-xs hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 flex items-center justify-between cursor-pointer"
                    >
                      <span>{t.label}</span>
                      <code className="text-[10px] text-emerald-500 font-mono">{t.tag}</code>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* AI Text Smoother */}
            {showAiSmoother && (
              <div className="relative">
                <button
                  type="button"
                  disabled={isSmoothing}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setOpenDropdown(openDropdown === 'ai' ? null : 'ai')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 hover:from-emerald-500/25 hover:to-cyan-500/25 text-emerald-600 dark:text-emerald-300 font-bold text-[10px] transition-all cursor-pointer border border-emerald-500/30 shadow-xs disabled:opacity-50"
                  title="AI Text Smoother"
                >
                  {isSmoothing ? (
                    <RefreshCw size={10} className="animate-spin text-emerald-500" />
                  ) : smoothSuccess ? (
                    <Check size={10} className="text-emerald-500" />
                  ) : (
                    <Sparkles size={10} className="text-amber-500 fill-amber-400" />
                  )}
                  <span>{isSmoothing ? 'Smoothing...' : smoothSuccess ? 'Smoothed!' : 'Make Smoother'}</span>
                  <ChevronDown size={9} />
                </button>

                {openDropdown === 'ai' && (
                  <div className="absolute top-full right-0 mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50">
                    <div className="px-2.5 py-1 text-[9px] uppercase font-bold text-slate-400 flex items-center justify-between">
                      <span>AI Copy Polisher</span>
                      <span className="text-emerald-500 font-mono">Groq Live</span>
                    </div>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleAiPolish('smooth')}
                      className="w-full px-2.5 py-1.5 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200"
                    >
                      <span>🌊</span>
                      <div>
                        <div className="font-semibold">Make Flow Smoother</div>
                        <div className="text-[10px] text-slate-400">Natural cadence & tone</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleAiPolish('punchy')}
                      className="w-full px-2.5 py-1.5 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200"
                    >
                      <span>⚡</span>
                      <div>
                        <div className="font-semibold">Make Punchier & Concise</div>
                        <div className="text-[10px] text-slate-400">Removes fluff, high conversion</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleAiPolish('friendly')}
                      className="w-full px-2.5 py-1.5 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200"
                    >
                      <span>🤝</span>
                      <div>
                        <div className="font-semibold">Warm & Consultative</div>
                        <div className="text-[10px] text-slate-400">Approachable B2B phrasing</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleAiPolish('grammar')}
                      className="w-full px-2.5 py-1.5 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200"
                    >
                      <span>✓</span>
                      <div>
                        <div className="font-semibold">Perfect Grammar & Syntax</div>
                        <div className="text-[10px] text-slate-400">Enterprise editorial standard</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * True WYSIWYG Visual Rich Text Editor:
 * Uses contentEditable so bold, italic, underline, colors, and fonts are visually styled right inside the editor!
 * Zero raw tags like <b>bold text</b> typed out.
 */
export function EmailRichTextEditor({
  value,
  onChange,
  onAlignChange,
  label = 'Content / Body',
  placeholder = 'Type your email body here or use the toolbar above to format & smooth...',
  rows = 6,
  className = '',
}: EmailRichTextEditorProps) {
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const editorRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);

  // Sync value to contentEditable div when value changes externally (e.g. template load or block switch)
  useEffect(() => {
    if (editorRef.current && !isTypingRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    isTypingRef.current = true;
    const html = editorRef.current.innerHTML;
    // Normalize empty content
    const normalized = (html === '<br>' || html === '<p><br></p>' || html === '<div><br></div>') ? '' : html;
    onChange(normalized);
    setTimeout(() => {
      isTypingRef.current = false;
    }, 50);
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const trigger = editorRef.current?.closest('[data-rich-editor]')?.querySelector('[data-link-trigger]') as HTMLButtonElement;
      if (trigger) trigger.click();
    }
  };

  return (
    <div data-rich-editor className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-400">{label}</label>
        
        {/* Toggle Mode: Visual WYSIWYG vs Raw HTML Code */}
        <div className="inline-flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[10px]">
          <button
            type="button"
            onClick={() => setViewMode('visual')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              viewMode === 'visual'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 size={10} />
            <span>Visual (WYSIWYG)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              viewMode === 'code'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 size={10} />
            <span>HTML Code</span>
          </button>
        </div>
      </div>

      {/* The Formatting Toolbar */}
      <EmailRichTextToolbar
        value={value}
        onChange={onChange}
        editorRef={editorRef}
        onAlignChange={onAlignChange}
      />

      {/* Visual WYSIWYG Mode (Default) */}
      {viewMode === 'visual' ? (
        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onBlur={handleInput}
            onKeyDown={handleKeyDown}
            data-placeholder={placeholder}
            className="w-full min-h-[140px] max-h-[380px] overflow-y-auto px-4 py-3 bg-white/[0.05] dark:bg-slate-900 border border-white/10 dark:border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50 leading-relaxed font-sans empty:before:content-[attr(data-placeholder)] empty:before:text-slate-500 empty:before:pointer-events-none"
            style={{ minHeight: `${rows * 24}px` }}
          />
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 px-1">
            <span>💡 Select text and click <b>B</b>, <i>I</i>, <u>U</u>, <s>S</s>, or <b>🔗 Link (Ctrl+K)</b></span>
            <span className="text-emerald-400/80 font-mono">Live Visual WYSIWYG</span>
          </div>
        </div>
      ) : (
        /* Raw HTML Code Mode */
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-emerald-300 outline-none leading-relaxed resize-y font-mono"
        />
      )}
    </div>
  );
}
