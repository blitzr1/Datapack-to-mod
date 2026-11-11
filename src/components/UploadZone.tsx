import { useState, useRef } from 'react';
import { Upload, FolderUp, FileArchive, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SAMPLE_PACKS } from '../utils/samplePacks';
import type { SamplePack } from '../types';

interface UploadZoneProps {
  onFileLoaded: (file: File) => void;
  onFilesListLoaded: (files: File[]) => void;
  onSampleSelected: (sample: SamplePack) => void;
  isLoading: boolean;
  error: string | null;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileLoaded,
  onFilesListLoaded,
  onSampleSelected,
  isLoading,
  error
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      if (files.length === 1 && files[0].name.toLowerCase().endsWith('.zip')) {
        onFileLoaded(files[0]);
      } else {
        onFilesListLoaded(files);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileLoaded(e.target.files[0]);
    }
  };

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFilesListLoaded(Array.from(e.target.files));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Hero Intro */}
      <div className="text-center space-y-3 pt-4 sm:pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium shadow-sm shadow-emerald-500/10">
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Universal JARs for Fabric, NeoForge & Forge</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Convert Any <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Datapack to Mod</span>
        </h2>
        
        <p className="text-sm sm:text-base text-slate-300/90 max-w-2xl mx-auto leading-relaxed">
          Wrap your Minecraft datapack into a native <strong className="text-white font-semibold">.JAR mod</strong> with fully customizable Mod ID, version, description, authors, license, and custom icon.
        </p>
      </div>

      {/* Main Drag & Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center transition-all duration-300 glass-panel-elevated overflow-hidden ${
          isDragOver
            ? 'border-emerald-400 bg-emerald-950/25 shadow-mc-glow scale-[1.01]'
            : 'border-white/15 hover:border-emerald-500/40 hover:bg-white/[0.03]'
        }`}
      >
        {/* Subtle glowing corner accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-expect-error webkitdirectory standard property in modern browsers
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleFolderInputChange}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-md animate-pulse" />
            </div>
            <p className="text-sm font-medium text-emerald-400">Inspecting datapack structures and functions...</p>
          </div>
        ) : (
          <div className="space-y-6 relative z-10">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10 group cursor-pointer transition-transform duration-300 hover:scale-105"
                 onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-9 h-9 transition-transform duration-300 group-hover:-translate-y-1" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Drag & drop your Datapack <span className="text-emerald-400 font-mono">.ZIP</span> here
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Drop your zip file or select an unzipped folder to extract and configure its mod metadata instantly
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/25 active:scale-95"
              >
                <FileArchive className="w-4 h-4" />
                Select .ZIP File
              </button>

              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-sm transition-all border border-white/10 active:scale-95 hover:border-white/20"
              >
                <FolderUp className="w-4 h-4" />
                Select Folder
              </button>
            </div>

            <div className="text-xs text-slate-400 pt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <span className="flex items-center gap-1.5 text-emerald-400/90 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Client-Side Privacy
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                Zero upload limits
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                Instant compilation
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-center gap-3 text-left animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <div>
              <p className="font-semibold text-red-200">Unable to load datapack</p>
              <p className="text-slate-300/90">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Preset / Sample Packs */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Don't have a datapack ready? Test with a sample:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {SAMPLE_PACKS.map(sample => (
            <button
              key={sample.id}
              onClick={() => onSampleSelected(sample)}
              className="text-left p-4 sm:p-5 rounded-2xl glass-panel glass-panel-hover group transition-all duration-200 border border-white/10 flex flex-col justify-between"
            >
              <div>
                <div className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                  <span>{sample.name}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 text-emerald-400" />
                </div>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Click to test
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
