import React, { useState, useEffect } from 'react';
import type { PackFile, DatapackSummary } from '../types';
import {
  FileText,
  Image as ImageIcon,
  Search,
  Code2,
  Trash2,
  FileCheck,
  Eye,
  X,
  FileJson,
  ScrollText,
  BookOpen,
  Boxes,
  Compass,
  Tag,
  Copy,
  Check
} from 'lucide-react';

interface FileExplorerProps {
  files: Map<string, PackFile>;
  summary: DatapackSummary;
  onDeleteFile: (path: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  summary,
  onDeleteFile
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<PackFile | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedFile(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fileList = Array.from(files.values());

  const filteredFiles = fileList.filter((f) =>
    f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (path: string) => {
    const lower = path.toLowerCase();
    if (lower.endsWith('.mcfunction')) {
      return <ScrollText className="w-4 h-4 text-emerald-400" />;
    }
    if (lower.endsWith('.json') || lower.endsWith('.mcmeta')) {
      return <FileJson className="w-4 h-4 text-amber-400" />;
    }
    if (lower.endsWith('.png') || lower.endsWith('.jpg')) {
      return <ImageIcon className="w-4 h-4 text-cyan-400" />;
    }
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  const handleCopyFileContent = () => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <div className="glass-panel-elevated rounded-3xl border border-white/10 overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8">
      {/* Header and Summary stats */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
              <Boxes className="w-5 h-5 text-emerald-400" />
              Datapack Contents & Analysis
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {summary.totalFiles} files across {summary.namespaces.length || 1} namespace(s) • Total size: {formatFileSize(summary.totalSize)}
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pack files..."
              className="w-full glass-input rounded-xl pl-10 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Feature Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3 transition-colors hover:bg-white/[0.05]">
            <ScrollText className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Functions</span>
              <span className="text-sm font-bold text-white">{summary.counts.functions}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3 transition-colors hover:bg-white/[0.05]">
            <BookOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Recipes</span>
              <span className="text-sm font-bold text-white">{summary.counts.recipes}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3 transition-colors hover:bg-white/[0.05]">
            <Tag className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Tags</span>
              <span className="text-sm font-bold text-white">{summary.counts.tags}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3 transition-colors hover:bg-white/[0.05]">
            <FileCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Advancements</span>
              <span className="text-sm font-bold text-white">{summary.counts.advancements}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3 transition-colors hover:bg-white/[0.05]">
            <Compass className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Loot Tables</span>
              <span className="text-sm font-bold text-white">{summary.counts.lootTables}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3 transition-colors hover:bg-white/[0.05]">
            <Code2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <div className="min-w-0 truncate">
              <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Namespaces</span>
              <span className="text-sm font-bold text-white truncate block">{summary.namespaces.join(', ') || 'minecraft'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#0d1016]/80 backdrop-blur-md">
        <div className="max-h-80 overflow-y-auto divide-y divide-white/5 scroll-smooth">
          {filteredFiles.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No files match your search query.
            </div>
          ) : (
            filteredFiles.map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.04] transition-colors group text-xs"
              >
                <div
                  onClick={() => setSelectedFile(file)}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  {getFileIcon(file.path)}
                  <span className="font-mono text-slate-300 truncate group-hover:text-emerald-400 transition-colors">
                    {file.path}
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatFileSize(file.size)}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedFile(file)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="View file content"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteFile(file.path)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remove file from JAR"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* File Viewer Modal */}
      {selectedFile && (
        <div
          onClick={() => setSelectedFile(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}

            className="w-full max-w-3xl bg-[#12161f] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0e1118]/80 backdrop-blur-md">
              <div className="flex items-center gap-2.5 min-w-0">
                {getFileIcon(selectedFile.path)}
                <span className="font-mono text-xs sm:text-sm font-semibold text-white truncate">
                  {selectedFile.path}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ({formatFileSize(selectedFile.size)})
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {!selectedFile.isBinary && selectedFile.content && (
                  <button
                    type="button"
                    onClick={handleCopyFileContent}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                  >
                    {hasCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto font-mono text-xs leading-relaxed bg-[#0a0d12] text-slate-200 scroll-smooth">
              {selectedFile.isBinary ? (
                selectedFile.path.endsWith('.png') && selectedFile.raw ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <img
                      src={`data:image/png;base64,${btoa(
                        String.fromCharCode(...Array.from(selectedFile.raw))
                      )}`}
                      alt={selectedFile.path}
                      className="max-w-[240px] border border-white/20 rounded-2xl [image-rendering:pixelated] shadow-xl"
                    />
                    <span className="text-xs text-slate-400 mt-3 font-mono">Binary PNG Texture / Icon</span>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400">
                    Binary file format. Cannot preview raw binary contents in text viewer.
                  </div>
                )
              ) : (
                <div className="code-line-numbers divide-y divide-white/[0.02]">
                  {selectedFile.content ? (
                    selectedFile.content.split('\n').map((line, idx) => (
                      <div key={idx} className="hover:bg-white/[0.02] py-0.5">
                        <span className="whitespace-pre">{line || ' '}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">(Empty file)</span>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-white/10 bg-[#0e1118]/80 flex justify-between items-center text-xs text-slate-400">
              <span className="font-mono text-[11px]">Press ESC to close</span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-medium transition-colors"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
