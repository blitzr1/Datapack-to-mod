import React, { useEffect } from 'react';
import { X } from 'lucide-react';

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
      className="fixed inset-0 z-50 bg-ground/90 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="How conversion works"
        className="w-full max-w-2xl panel bg-panel shadow-panel overflow-hidden max-h-[88vh] flex flex-col"
      >
        <header className="flex items-center justify-between gap-3 px-5 h-12 border-b border-rule flex-shrink-0">
          <span className="label">How conversion works</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 -mr-1 rounded text-muted hover:text-paper transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          <p className="text-sm text-stone-200 leading-relaxed">
            Mod loaders already read a <code className="font-mono text-brass-400">data/</code> directory
            from any jar on the classpath and register it as a built-in pack. A datapack that ships inside
            a mod jar therefore behaves like a datapack, without a separate install step.
          </p>

          <section>
            <h3 className="label">1 — Payload copied as-is</h3>
            <p className="mt-1.5 text-xs text-stone-300 leading-relaxed">
              Every entry in your zip — functions, recipes, advancements, loot tables, tags, structures,
              assets, PNGs — is written into the jar byte for byte. The converter adds descriptors; it does
              not rewrite your data files.
            </p>
          </section>

          <section>
            <h3 className="label">2 — One jar, four descriptors</h3>
            <dl className="mt-2 divide-y divide-rule border-y border-rule">
              {[
                ['fabric.mod.json', 'Fabric Loader. Declares the resource-loader dependency the pack needs.'],
                ['quilt.mod.json', 'Quilt Loader, with the same entry shape Quilt expects.'],
                ['META-INF/mods.toml', 'Forge, loaded as lowcodefml so a datapack-only jar is accepted.'],
                ['META-INF/neoforge.mods.toml', 'NeoForge 1.20.4 and newer, loaded as javafml.'],
              ].map(([file, detail]) => (
                <div key={file} className="grid grid-cols-1 sm:grid-cols-[210px_1fr] gap-1 sm:gap-4 py-2.5">
                  <dt className="font-mono text-[11px] text-brass-400 break-all">{file}</dt>
                  <dd className="text-xs text-stone-300 leading-relaxed">{detail}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h3 className="label">3 — What changes for players</h3>
            <ul className="mt-2 space-y-2 text-xs text-stone-300 leading-relaxed">
              <li className="flex gap-2.5">
                <span className="w-px bg-rule flex-shrink-0" />
                <span>Install once in <code className="font-mono text-stone-200">mods</code>; it applies to every world and server profile.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-px bg-rule flex-shrink-0" />
                <span>The pack can be listed on CurseForge or Modrinth and shipped inside a modpack.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-px bg-rule flex-shrink-0" />
                <span>The id, name, version, authors and links come from the metadata you set here.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-px bg-rule flex-shrink-0" />
                <span><code className="font-mono text-stone-200">pack.mcmeta</code> keeps the pack_format your pack already declares; nothing is guessed.</span>
              </li>
            </ul>
          </section>

          <p className="text-xs text-muted leading-relaxed border-t border-rule pt-4">
            Conversions run in your browser. No archive, file, or texture is uploaded anywhere.
            Loading in a real game client is not part of this tool's pipeline.
          </p>
        </div>

        <footer className="px-5 py-3 border-t border-rule flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded border border-rule text-xs text-stone-300 hover:text-paper hover:border-stone-600 transition-colors"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};
