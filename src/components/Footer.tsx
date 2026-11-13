import React from 'react';
import { ShieldCheck } from 'lucide-react';

const LOADERS = [
  ['Fabric', '#C8A97E'],
  ['Quilt', '#A98BB8'],
  ['Forge', '#C08155'],
  ['NeoForge', '#7C9FAE'],
] as const;

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-rule mt-auto">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-1 h-4 bg-signal-500" />
            <span className="font-mono text-[13px] text-paper">datapack→mod</span>
            <span className="text-[11px] text-muted">in-browser packaging</span>
          </div>

          <ul className="flex items-center gap-4 flex-wrap">
            {LOADERS.map(([name, color]) => (
              <li key={name} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-muted">{name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-t border-rule pt-5">
          <div className="flex items-start gap-2 max-w-2xl">
            <ShieldCheck className="w-3.5 h-3.5 text-signal-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted leading-relaxed">
              <span className="text-soft">Nothing is uploaded.</span> Archives are read in browser
              memory; no datapack, file, or texture is sent to a server.
            </p>
          </div>

          <div className="text-[10px] text-muted leading-relaxed sm:text-right">
            <p>NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.</p>
            <p>Minecraft is a trademark of Mojang Synergies AB.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
