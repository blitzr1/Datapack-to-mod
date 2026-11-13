import React, { useState } from 'react';
import { HelpCircle, RefreshCw, Share2, Check } from 'lucide-react';

interface HeaderProps {
  hasPack: boolean;
  onReset: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasPack,
  onReset,
  onOpenHelp
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Minecraft Datapack to Mod Converter',
        text: 'Convert any Minecraft Datapack into a native Mod JAR directly in your browser!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="h-14 border-b border-rule bg-ground sticky top-0 z-40">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 text-left"
        >
          <span className="w-1 h-4 bg-brass-500" />
          <span className="font-mono text-[13px] text-paper tracking-[0.02em]">
            datapack<span className="text-brass-500 px-1">→</span>mod
          </span>
          <span className="label hidden sm:inline border-l border-rule pl-2.5">
            converter
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenHelp}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded text-xs text-muted hover:text-paper hover:bg-raised transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">How it works</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            title="Copy this app's link"
            className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded border border-rule text-xs text-muted hover:text-paper hover:border-stone-600 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-brass-400" />
                <span className="hidden sm:inline text-brass-400">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          {hasPack && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded border border-rule text-xs text-muted hover:text-paper hover:border-stone-600 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New pack</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
