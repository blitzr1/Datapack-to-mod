import React, { useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}

        className="w-full max-w-2xl bg-[#12161f] border border-white/15 rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0e1118]/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">How Datapack-to-Mod Conversion Works</h3>
              <p className="text-xs text-slate-400">Under the hood of Minecraft Mod Loaders</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed scroll-smooth">
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs">
            💡 <strong>The Secret Behind It:</strong> Modern Minecraft mod loaders (Fabric, NeoForge, Forge, Quilt) natively support loading data packs embedded directly inside <code className="font-mono text-emerald-200">.jar</code> mod files!
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              1. Native Data Pack Injection
            </h4>
            <p className="text-xs text-slate-300/90 leading-relaxed">
              In Minecraft, every mod JAR can contain a <code className="text-emerald-400 font-mono">data/</code> directory.
              When Minecraft starts up, mod loaders register the JAR in Minecraft's <code className="text-slate-200 font-mono">PackRepository</code>.
              Your functions, recipes, advancements, loot tables, and tags are injected into every world automatically.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              2. Universal Loader Manifests
            </h4>
            <p className="text-xs text-slate-300/90 leading-relaxed">
              Our converter creates standard mod descriptors for each platform:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-400 pl-2">
              <li><strong className="text-white">fabric.mod.json</strong>: For Fabric Loader (reads dependencies, icons, authors).</li>
              <li><strong className="text-white">META-INF/neoforge.mods.toml</strong>: For NeoForge 1.20.4+ and 1.21+.</li>
              <li><strong className="text-white">META-INF/mods.toml</strong>: For standard Forge 1.16 - 1.20.1.</li>
              <li><strong className="text-white">quilt.mod.json</strong>: For the Quilt Loader ecosystem.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              3. Key Advantages of Converting to a Mod
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-xs">
                <span className="font-semibold text-emerald-400 block mb-1">Global Application</span>
                Players install the mod once in <code className="text-slate-300">.minecraft/mods</code>. It automatically activates for all worlds and servers!
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-xs">
                <span className="font-semibold text-emerald-400 block mb-1">Modpack Friendly</span>
                Allows datapacks to be distributed on CurseForge and Modrinth inside standard modpacks.
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-xs">
                <span className="font-semibold text-emerald-400 block mb-1">In-Game Mod Menu</span>
                Appears in ModMenu with your custom icon, author credits, version, and homepage links.
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-xs">
                <span className="font-semibold text-emerald-400 block mb-1">Version Protection</span>
                Prevents players from running incompatible Minecraft versions via manifest constraints.
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-400 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Privacy First</strong>
              This tool runs 100% locally in your web browser. No files, code, or assets are ever uploaded to any server.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#0e1118]/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
