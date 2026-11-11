import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Download, CheckCircle, Package, Folder, X } from 'lucide-react';
import type { ModMetadata } from '../types';

interface ConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: number;
  statusText: string;
  isComplete: boolean;
  onDownload: () => void;
  metadata: ModMetadata;
  jarSize: number;
  fileName: string;
}

export const ConvertModal: React.FC<ConvertModalProps> = ({
  isOpen,
  onClose,
  progress,
  statusText,
  isComplete,
  onDownload,
  metadata,
  jarSize,
  fileName
}) => {
  useEffect(() => {
    if (isComplete) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#38bdf8', '#fbbf24', '#f43f5e']
        });
      } catch (e) {
        // confetti fallback
      }
    }
  }, [isComplete]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent="true"
        className="w-full max-w-xl bg-[#12161f] border border-white/15 rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-mc-glow">
              {isComplete ? (
                <CheckCircle className="w-8 h-8 text-emerald-400 animate-bounce" />
              ) : (
                <Package className="w-8 h-8 text-emerald-400 animate-pulse" />
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isComplete ? 'Mod JAR Ready!' : 'Compiling Mod JAR...'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              {statusText}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300 shadow-mc-glow"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>{statusText}</span>
              <span>{progress}%</span>
            </div>
          </div>

          {/* Complete State Actions */}
          {isComplete && (
            <div className="space-y-6 pt-2 animate-in fade-in duration-300">
              {/* Mod File Card */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-mono text-sm font-semibold text-white truncate">
                      {fileName}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {formatFileSize(jarSize)} • {metadata.loader.toUpperCase()} Ready
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onDownload}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30 flex-shrink-0 ml-3"
                >
                  <Download className="w-4 h-4" />
                  Download JAR
                </button>
              </div>

              {/* Installation Instructions */}
              <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-[#0a0d12] border border-white/10 text-xs text-slate-300">
                <h5 className="font-semibold text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Folder className="w-3.5 h-3.5 text-emerald-400" />
                  How to Install into Minecraft:
                </h5>

                <ol className="list-decimal list-inside space-y-2 text-slate-400 leading-relaxed">
                  <li>
                    Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px] text-white">Win + R</kbd> and type <code className="text-emerald-400 font-mono">%appdata%\.minecraft\mods</code>
                  </li>
                  <li>
                    Drop <span className="text-white font-mono">{fileName}</span> directly into your <code className="text-emerald-400">mods</code> folder.
                  </li>
                  <li>
                    Launch Minecraft with your mod loader (<strong>Fabric</strong> with Fabric API, <strong>NeoForge</strong>, or <strong>Forge</strong>).
                  </li>
                  <li>
                    Done! The datapack content, recipes, and functions will load automatically.
                  </li>
                </ol>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium transition-colors"
                >
                  Back to Editor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
