"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, Camera, ImageIcon, AlertCircle } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

interface ImageUploaderProps {
  onScan: (file: File) => Promise<void>;
  isScanning: boolean;
  error?: string | null;
}

export function ImageUploader({ onScan, isScanning, error }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  const MAX_SIZE_MB = 10;

  const validateFile = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type) && !f.name.match(/\.(jpg|jpeg|png|webp|heic)$/i)) {
      return "Please upload a JPG, PNG, WebP, or HEIC image.";
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File is too large. Max size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const processFile = (f: File) => {
    const err = validateFile(f);
    if (err) {
      setDragError(err);
      return;
    }
    setDragError(null);
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) processFile(dropped);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  const handleRemove = () => {
    setPreview(null);
    setFile(null);
    setDragError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleScan = async () => {
    if (!file) return;
    await onScan(file);
  };

  const displayError = error || dragError;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Drop Zone */}
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300
            flex flex-col items-center justify-center gap-4 p-12 min-h-[260px]
            ${isDragging
              ? "border-brand-400 bg-brand-400/5 scale-[1.01]"
              : "border-white/10 hover:border-brand-500/40 hover:bg-white/3"
            }
          `}
        >
          {/* Corner accents */}
          <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-brand-500/40 rounded-tl-sm transition-all duration-300 group-hover:border-brand-400/60" />
          <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-brand-500/40 rounded-tr-sm transition-all duration-300 group-hover:border-brand-400/60" />
          <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-brand-500/40 rounded-bl-sm transition-all duration-300 group-hover:border-brand-400/60" />
          <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-brand-500/40 rounded-br-sm transition-all duration-300 group-hover:border-brand-400/60" />

          {/* Icon */}
          <div className={`
            w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
            ${isDragging ? "bg-brand-500/15 scale-110" : "bg-white/5 group-hover:bg-brand-500/10"}
          `}>
            {isDragging
              ? <ImageIcon className="w-6 h-6 text-brand-400 animate-bounce" />
              : <Upload className="w-6 h-6 text-slate-500 group-hover:text-brand-400 transition-colors duration-300" />
            }
          </div>

          {/* Text */}
          <div className="text-center space-y-1.5">
            <p className="text-white font-medium">
              {isDragging ? "Drop your image here" : "Upload medicine photo"}
            </p>
            <p className="text-slate-400 text-sm">
              Drag & drop, or <span className="text-brand-400 underline underline-offset-2">browse files</span>
            </p>
            <p className="text-slate-600 text-xs mt-2">JPG, PNG, WebP, HEIC · Max 10MB</p>
          </div>

          {/* Mobile camera hint */}
          <div className="flex items-center gap-2 text-slate-600 text-xs mt-1">
            <Camera className="w-3 h-3" />
            <span>On mobile, you can use your camera directly</span>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        /* Preview */
        <div className="relative rounded-2xl overflow-hidden glass-card group">
          <img
            src={preview}
            alt="Medicine preview"
            className="w-full max-h-[340px] object-contain bg-slate-950"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
            <button
              onClick={handleRemove}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-red-500/90 hover:bg-red-500 text-white rounded-full p-2.5 shadow-lg"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* File info */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-white/3 border-t border-white/5">
            <div className="flex items-center gap-2 min-w-0">
              <ImageIcon className="w-4 h-4 text-brand-400 shrink-0" />
              <span className="text-slate-300 text-sm truncate">{file?.name}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <span className="text-slate-500 text-xs">
                {file ? (file.size / 1024 / 1024).toFixed(2) : 0} MB
              </span>
              <button
                onClick={handleRemove}
                className="text-slate-500 hover:text-red-400 transition-colors"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {displayError && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-400 text-sm">{displayError}</p>
        </div>
      )}

      {/* Scan button */}
      <button
        onClick={handleScan}
        disabled={!file || isScanning}
        className={`
          w-full relative py-3.5 rounded-xl font-semibold text-sm transition-all duration-300
          flex items-center justify-center gap-2.5 overflow-hidden
          ${file && !isScanning
            ? "bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 text-slate-950 shadow-lg shadow-brand-500/20 hover:shadow-brand-400/30 hover:-translate-y-0.5 active:translate-y-0"
            : "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5"
          }
        `}
      >
        {/* Shimmer */}
        {file && !isScanning && (
          <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        )}

        {isScanning ? (
          <>
            <Spinner size="sm" />
            <span>Scanning medicine…</span>
          </>
        ) : (
          <>
            <Camera className="w-4 h-4" />
            <span>Scan Medicine</span>
          </>
        )}
      </button>
    </div>
  );
}