import React, { useEffect } from 'react';
import { Download, Package, X } from 'lucide-react';
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
      className="fixed inset-0 z-50 bg-ground/90 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isComplete ? 'Mod jar ready' : 'Building mod jar'}
        className="w-full max-w-lg panel bg-panel shadow-panel overflow-hidden"
      >
        <header className="flex items-center justify-between gap-3 px-5 h-12 border-b border-rule">
          <span className="label">{isComplete ? 'Build complete' : 'Building'}</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 -mr-1 rounded text-muted hover:text-paper transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="p-5 space-y-5">
          <div>
            <p className="font-mono text-sm text-paper break-all">
              {isComplete ? fileName : 'assembling descriptors and payload…'}
            </p>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">{statusText}</p>
          </div>

          {/* Progress: a ruled track, not a glowing pill */}
          <div>
            <div className="h-1 w-full bg-rule overflow-hidden">
              <div
                className="h-full bg-brass-500 transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[11px] text-muted tnum">
              <span>{isComplete ? formatFileSize(jarSize) : 'working'}</span>
              <span>{progress}%</span>
            </div>
          </div>

          {isComplete && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3 rounded border border-rule bg-ground px-3 py-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Package className="w-4 h-4 text-brass-400 flex-shrink-0" />
                  <span className="font-mono text-[11px] text-stone-300 truncate">
                    {metadata.loader === 'universal' ? '4 manifests + payload' : `${metadata.loader} manifest + payload`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onDownload}
                  className="inline-flex items-center gap-2 h-9 px-3.5 rounded bg-brass-500 hover:bg-brass-400 text-[#1A1410] font-semibold text-xs transition-colors flex-shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download jar
                </button>
              </div>

              <div className="border-t border-rule pt-4">
                <h3 className="label">Install</h3>
                <ol className="mt-2.5 space-y-2 text-xs text-stone-300 leading-relaxed">
                  <li className="flex gap-2.5">
                    <span className="font-mono text-[11px] text-muted pt-0.5">01</span>
                    <span>
                      Open <code className="font-mono text-stone-200">%appdata%\.minecraft\mods</code> —
                      or the <code className="font-mono text-stone-200">mods</code> folder of your instance.
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="font-mono text-[11px] text-muted pt-0.5">02</span>
                    <span>Place <span className="font-mono text-stone-200 break-all">{fileName}</span> inside it.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="font-mono text-[11px] text-muted pt-0.5">03</span>
                    <span>
                      Start the loader you targeted. Fabric also needs the resource-loader mod named in
                      <code className="font-mono text-stone-200"> fabric.mod.json</code>.
                    </span>
                  </li>
                </ol>
                <p className="mt-3 text-[11px] text-muted leading-relaxed">
                  Loading was not tested against a real game instance — if the jar does not appear in the
                  mod list, check the loader log before reporting the pack as broken.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 px-3.5 rounded border border-rule text-xs text-stone-300 hover:text-paper hover:border-stone-600 transition-colors"
                >
                  Back to editor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
