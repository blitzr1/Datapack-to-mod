import React, { useState } from 'react';
import { HelpCircle, RefreshCw, Box, Share2, Check } from 'lucide-react';

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
    <header className="border-b border-white/[0.08] bg-[#0c0f15]/70 backdrop-blur-xl sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-emerald-400/40 relative group cursor-pointer"
               onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Box className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 rounded-xl bg-emerald-400/20 blur-sm -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                Datapack <span className="text-emerald-400 font-mono">→</span> Mod
                <span className="text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono px-2 py-0.5 rounded-full font-medium shadow-sm shadow-emerald-500/10">
                  v2.0 Universal
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Convert Minecraft Datapacks into Fabric, NeoForge & Forge Mod JARs with full metadata control
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 active:scale-95 rounded-xl transition-all duration-200 border border-white/10 shadow-sm"
            title="Share this web app"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline text-emerald-400">Copied</span>
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
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 active:scale-95 rounded-xl transition-all duration-200 border border-white/10 shadow-sm"
              title="Upload another datapack"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Pack</span>
            </button>
          )}

          <button
            onClick={onOpenHelp}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 rounded-xl transition-all duration-200 border border-emerald-500/25 shadow-sm shadow-emerald-500/10"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How it Works</span>
          </button>
        </div>
      </div>
    </header>
  );
};
