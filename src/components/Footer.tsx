import React from 'react';
import { ShieldCheck, Heart, Box, Share2, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Minecraft Datapack to Mod Converter',
        text: 'Convert any Minecraft Datapack into a native Mod JAR directly in your browser!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <footer className="border-t border-white/[0.08] bg-[#07090d]/80 backdrop-blur-xl mt-auto transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-tight">
                Datapack <span className="text-emerald-400">→</span> Mod Converter
              </span>
              <p className="text-xs text-slate-400">
                Universal in-browser Minecraft mod packaging tool
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
              🧵 Fabric
            </span>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
              🔨 NeoForge
            </span>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
              ⚒️ Forge
            </span>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
              🪡 Quilt
            </span>
            
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium transition-all ml-1 shadow-sm"
              title="Share Web App Link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3 h-3" />
                  <span>Share App</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security & Privacy Notice */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>100% Client-Side Privacy:</strong> All conversions are executed locally in your browser memory. No datapacks, files, or textures are sent to any remote server.
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500 flex-shrink-0">
            <span>Built with</span>
            <Heart className="w-3 h-3 text-red-400 fill-red-400" />
            <span>for the Minecraft community</span>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="text-[10px] text-slate-500 text-center leading-relaxed max-w-3xl mx-auto space-y-1">
          <p>
            NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.
          </p>
          <p>
            Minecraft is a trademark of Mojang Synergies AB. All other trademarks, registered trademarks, and logos are the properties of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
};
