'use client';

import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, SunMedium, Sparkles, Check, RefreshCcw, Crop } from 'lucide-react';

interface EdgeImagePreprocessorProps {
  imageSrc: string;
  onProcessed: (processedBase64: string) => void;
}

export function EdgeImagePreprocessor({ imageSrc, onProcessed }: EdgeImagePreprocessorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(120); // 100% is normal
  const [brightness, setBrightness] = useState<number>(105);
  const [isBinarized, setIsBinarized] = useState(false);
  const [processedPreview, setProcessedPreview] = useState<string>(imageSrc);

  const applyCanvasFilters = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      // Calculate dimensions with rotation
      const rads = (rotation * Math.PI) / 180;
      const isVertical = rotation === 90 || rotation === 270;
      
      canvas.width = isVertical ? img.height : img.width;
      canvas.height = isVertical ? img.width : img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rads);
      
      // CSS filter for contrast & brightness
      ctx.filter = `contrast(${contrast}%) brightness(${brightness}%)`;
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // If Binarization (black/white high contrast for OCR) is active
      if (isBinarized) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const v = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
          const threshold = v > 128 ? 255 : 0;
          d[i] = threshold;
          d[i + 1] = threshold;
          d[i + 2] = threshold;
        }
        ctx.putImageData(imgData, 0, 0);
      }

      const updatedBase64 = canvas.toDataURL('image/jpeg', 0.92);
      setProcessedPreview(updatedBase64);
      onProcessed(updatedBase64);
    };
  };

  useEffect(() => {
    applyCanvasFilters();
  }, [rotation, contrast, brightness, isBinarized, imageSrc]);

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Edge Preprocessing (Client Canvas)
          </span>
        </div>
        <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-md font-mono font-bold">
          -45% Vision API Payload
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setRotation((prev) => (prev + 90) % 360)}
          className="px-2.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.1] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCw size={13} />
          <span>Rotate 90° ({rotation}°)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setContrast((c) => (c === 140 ? 100 : 140));
            setBrightness((b) => (b === 115 ? 100 : 115));
          }}
          className={`px-2.5 py-1.5 border rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            contrast > 100
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-white/[0.06] text-slate-300 border-white/[0.1]'
          }`}
        >
          <SunMedium size={13} />
          <span>Auto Contrast</span>
        </button>

        <button
          type="button"
          onClick={() => setIsBinarized(!isBinarized)}
          className={`px-2.5 py-1.5 border rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            isBinarized
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-white/[0.06] text-slate-300 border-white/[0.1]'
          }`}
        >
          <Crop size={13} />
          <span>Binarize B&W</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRotation(0);
            setContrast(100);
            setBrightness(100);
            setIsBinarized(false);
          }}
          className="px-2.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-400 hover:text-slate-200 border border-white/[0.1] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
