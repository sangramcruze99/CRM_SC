'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Upload,
  Image as ImageIcon,
  Palette,
  Sparkles,
  RotateCcw,
  Check,
  Trash2,
  Sliders,
  Eye,
  Layers,
  SunMedium,
} from 'lucide-react';
import { usePersonalization } from './PersonalizationContext';

interface PersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PersonalizationModal({ isOpen, onClose }: PersonalizationModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'wallpaper' | 'colors'>('wallpaper');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    wallpaperType,
    customWallpaperUrl,
    customWallpaperName,
    selectedPresetId,
    wallpaperBlur,
    wallpaperOpacity,
    ambientGlowIntensity,
    activePaletteId,
    activePalette,
    colorPalettes,
    presets,
    setWallpaperType,
    uploadCustomWallpaper,
    removeCustomWallpaper,
    setSelectedPreset,
    setWallpaperBlur,
    setWallpaperOpacity,
    setAmbientGlowIntensity,
    setColorPalette,
    resetToDefaults,
  } = usePersonalization();

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    await uploadCustomWallpaper(file);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setIsUploading(true);
    await uploadCustomWallpaper(file);
    setIsUploading(false);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-2xl bg-slate-950/98 border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-slate-100 overflow-hidden my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Specular Top Line Highlight */}
        <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-950 shadow-md font-bold"
              style={{ background: activePalette.primary }}
            >
              <Palette size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                Personalization & Appearance
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border"
                  style={{
                    backgroundColor: `${activePalette.primary}25`,
                    color: activePalette.primary,
                    borderColor: `${activePalette.primary}50`,
                  }}
                >
                  {activePalette.name.split(' ')[0]}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Customize your glass panels, background wallpaper, and UI accent plates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/10 bg-slate-900/40 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('wallpaper')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'wallpaper'
                ? 'text-white border-b-2 bg-white/[0.06]'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
            style={{
              borderColor: activeTab === 'wallpaper' ? activePalette.primary : 'transparent',
            }}
          >
            <ImageIcon size={15} style={{ color: activeTab === 'wallpaper' ? activePalette.primary : undefined }} />
            <span>Background Wallpaper & Glass</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'colors'
                ? 'text-white border-b-2 bg-white/[0.06]'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
            style={{
              borderColor: activeTab === 'colors' ? activePalette.primary : 'transparent',
            }}
          >
            <Palette size={15} style={{ color: activeTab === 'colors' ? activePalette.primary : undefined }} />
            <span>UI Color Plates ({colorPalettes.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'wallpaper' ? (
            <div className="space-y-6">
              {/* SECTION 1: Local PC Image Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Upload size={14} style={{ color: activePalette.primary }} />
                    <span>Upload Custom Wallpaper (From Local PC)</span>
                  </h3>
                  {wallpaperType === 'custom' && customWallpaperUrl && (
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${activePalette.primary}20`,
                        color: activePalette.primary,
                        borderColor: `${activePalette.primary}40`,
                      }}
                    >
                      Active Wallpaper
                    </span>
                  )}
                </div>

                {wallpaperType === 'custom' && customWallpaperUrl ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/10">
                    <div
                      className="w-full sm:w-36 h-20 rounded-lg bg-cover bg-center border border-white/20 shadow-md shrink-0 relative overflow-hidden"
                      style={{ backgroundImage: `url(${customWallpaperUrl})` }}
                    >
                      <div className="absolute inset-0 bg-black/20" />
                      <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/70 px-1.5 py-0.5 rounded text-white font-mono">
                        Custom
                      </span>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-xs font-bold text-white truncate max-w-xs">
                        {customWallpaperName || 'Custom Uploaded Wallpaper'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        High-resolution client wallpaper stored safely in your browser session.
                      </p>
                      <div className="mt-2.5 flex items-center gap-2 justify-center sm:justify-start">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-[11px] font-bold bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload size={12} /> Replace Image
                        </button>
                        <button
                          type="button"
                          onClick={removeCustomWallpaper}
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 size={12} /> Reset to Preset
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      isDragging
                        ? 'border-emerald-400 bg-emerald-500/10'
                        : 'border-white/15 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-inner"
                      style={{ backgroundColor: `${activePalette.primary}25` }}
                    >
                      <Upload size={18} style={{ color: activePalette.primary }} />
                    </div>
                    <p className="text-xs font-bold text-white">
                      {isUploading ? 'Compressing and loading...' : 'Click to browse image or drag and drop from PC'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Supports PNG, JPG, JPEG, WEBP. Optimized automatically for 1080p/4K displays.
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* SECTION 2: Curated Wallpaper Presets Gallery */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Layers size={14} style={{ color: activePalette.primary }} />
                  <span>Curated Wallpaper Presets</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {presets.map((preset) => {
                    const isSelected = wallpaperType === 'preset' && selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPreset(preset.id)}
                        className={`group relative flex flex-col rounded-xl overflow-hidden border text-left transition-all p-1 cursor-pointer ${
                          isSelected
                            ? 'ring-2 shadow-lg bg-white/[0.08]'
                            : 'border-white/10 hover:border-white/25 bg-white/[0.02] hover:bg-white/[0.05]'
                        }`}
                        style={{
                          borderColor: isSelected ? activePalette.primary : undefined,
                          boxShadow: isSelected ? `0 0 15px ${activePalette.glowHex}` : undefined,
                        }}
                      >
                        {/* Miniature Preview Box */}
                        <div
                          className="w-full h-16 rounded-lg relative overflow-hidden"
                          style={
                            preset.imageUrl
                              ? { backgroundImage: `url(${preset.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                              : { background: preset.cssBackground || preset.previewGradient }
                          }
                        >
                          {isSelected && (
                            <div
                              className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-slate-950 shadow-md"
                              style={{ backgroundColor: activePalette.primary }}
                            >
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div className="p-1.5 pt-2">
                          <p className="text-[11px] font-bold text-white truncate">{preset.name}</p>
                          <p className="text-[9px] text-slate-400 line-clamp-1">{preset.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: Glass Blur & Wallpaper Dimmer Sliders */}
              <div className="space-y-4 p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Sliders size={14} style={{ color: activePalette.primary }} />
                  <span>Glass Optics & Lighting Controls</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Glass Panel Blur */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <Eye size={12} /> Glass Blur
                      </span>
                      <span className="font-mono text-slate-400 font-bold">{wallpaperBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="32"
                      step="2"
                      value={wallpaperBlur}
                      onChange={(e) => setWallpaperBlur(Number(e.target.value))}
                      className="w-full accent-emerald-400 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                      style={{ accentColor: activePalette.primary }}
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>Sharp (0px)</span>
                      <span>Frosted (32px)</span>
                    </div>
                  </div>

                  {/* Wallpaper Brightness / Opacity */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <SunMedium size={12} /> Brightness / Dimmer
                      </span>
                      <span className="font-mono text-slate-400 font-bold">
                        {Math.round(wallpaperOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.15"
                      max="1.0"
                      step="0.05"
                      value={wallpaperOpacity}
                      onChange={(e) => setWallpaperOpacity(Number(e.target.value))}
                      className="w-full h-1.5 bg-white/20 rounded-lg cursor-pointer"
                      style={{ accentColor: activePalette.primary }}
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>Dim (15%)</span>
                      <span>Vibrant (100%)</span>
                    </div>
                  </div>

                  {/* Ambient Glow Intensity */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <Sparkles size={12} /> Aura Orbs Glow
                      </span>
                      <span className="font-mono text-slate-400 font-bold">
                        {Math.round(ambientGlowIntensity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1.0"
                      step="0.05"
                      value={ambientGlowIntensity}
                      onChange={(e) => setAmbientGlowIntensity(Number(e.target.value))}
                      className="w-full h-1.5 bg-white/20 rounded-lg cursor-pointer"
                      style={{ accentColor: activePalette.primary }}
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>Off (0%)</span>
                      <span>Radiant (100%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: UI Color Plates */
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Enterprise UI Accent Plates
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select an accent plate to restyle buttons, active indicators, focus rings, and ambient aura light fields.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {colorPalettes.map((palette) => {
                  const isSelected = activePaletteId === palette.id;
                  return (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => setColorPalette(palette.id)}
                      className={`relative flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/[0.08] ring-2 shadow-lg'
                          : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                      }`}
                      style={{
                        borderColor: isSelected ? palette.primary : undefined,
                        boxShadow: isSelected ? `0 0 20px ${palette.glowHex}` : undefined,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Swatch Circle */}
                        <div
                          className="w-8 h-8 rounded-xl shadow-md flex items-center justify-center text-slate-950 font-bold shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.hover} 100%)`,
                          }}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            {palette.name}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            {palette.primary}
                          </span>
                        </div>
                      </div>

                      {/* Mini Live Component Sample */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-md font-bold"
                          style={{
                            backgroundColor: `${palette.primary}25`,
                            color: palette.primary,
                          }}
                        >
                          Active
                        </span>
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: palette.primary }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Live UI Element Preview
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-slate-950 shadow-md transition-transform active:scale-95"
                    style={{ backgroundColor: activePalette.primary }}
                  >
                    Primary Action
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors"
                    style={{
                      borderColor: `${activePalette.primary}60`,
                      color: activePalette.primary,
                      backgroundColor: `${activePalette.primary}15`,
                    }}
                  >
                    Outlined Badge
                  </button>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border"
                    style={{
                      backgroundColor: `${activePalette.primary}15`,
                      color: activePalette.primary,
                      borderColor: `${activePalette.primary}30`,
                    }}
                  >
                    <Sparkles size={13} />
                    <span>Real-time CSS Injected</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-900/50 shrink-0">
          <button
            type="button"
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-extrabold text-slate-950 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
            style={{
              backgroundColor: activePalette.primary,
              boxShadow: `0 0 15px ${activePalette.glowHex}`,
            }}
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
