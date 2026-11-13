import React, { useState, useEffect } from 'react';
import type { PackFile, DatapackSummary } from '../types';
import {
  FileText,
  Image as ImageIcon,
  Search,
  Trash2,
  Eye,
  X,
  FileJson,
  ScrollText,
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
      return <ScrollText className="w-3.5 h-3.5 text-signal-400 flex-shrink-0" />;
    }
    if (lower.endsWith('.json') || lower.endsWith('.mcmeta')) {
      return <FileJson className="w-3.5 h-3.5 text-soft flex-shrink-0" />;
    }
    if (lower.endsWith('.png') || lower.endsWith('.jpg')) {
      return <ImageIcon className="w-3.5 h-3.5 text-muted flex-shrink-0" />;
    }
    return <FileText className="w-3.5 h-3.5 text-muted flex-shrink-0" />;
  };

  const handleCopyFileContent = () => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const stats: Array<[string, number | string]> = [
    ['Functions', summary.counts.functions],
    ['Recipes', summary.counts.recipes],
    ['Tags', summary.counts.tags],
    ['Advancements', summary.counts.advancements],
    ['Loot tables', summary.counts.lootTables],
    ['Namespaces', summary.namespaces.join(', ') || 'minecraft'],
  ];

  return (
    <div className="panel overflow-hidden">
      {/* Ruled stat strip */}
      <dl className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-rule border-b border-rule">
        {stats.map(([label, value]) => (
          <div key={label} className="px-3 py-2.5 min-w-0">
            <dt className="label truncate">{label}</dt>
            <dd className="mt-1 font-mono text-sm text-paper tnum truncate">{value}</dd>
          </div>
        ))}
      </dl>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 h-11 border-b border-rule">
        <Search className="w-3.5 h-3.5 text-muted flex-shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by path"
          className="flex-1 bg-transparent border-0 text-xs font-mono text-paper placeholder:text-faint focus:outline-none"
        />
        <span className="font-mono text-[11px] text-muted tnum flex-shrink-0">
          {filteredFiles.length}/{fileList.length}
        </span>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-muted hover:text-paper transition-colors flex-shrink-0"
            aria-label="Clear filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Files */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-rule">
        {filteredFiles.length === 0 ? (
          <p className="py-10 text-center text-xs text-muted">No files match that filter.</p>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.path}
              className="flex items-center gap-3 px-3 py-2 hover:bg-raised transition-colors group"
            >
              <button
                type="button"
                onClick={() => setSelectedFile(file)}
                className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
              >
                {getFileIcon(file.path)}
                <span className="font-mono text-[11px] text-soft truncate group-hover:text-paper transition-colors">
                  {file.path}
                </span>
              </button>

              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="font-mono text-[11px] text-muted tnum mr-1">
                  {formatFileSize(file.size)}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedFile(file)}
                  className="p-1.5 rounded text-muted hover:text-paper hover:bg-ground transition-colors"
                  title="View file content"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteFile(file.path)}
                  className="p-1.5 rounded text-muted hover:text-bad hover:bg-ground transition-colors"
                  title="Exclude file from the jar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* File viewer */}
      {selectedFile && (
        <div
          onClick={() => setSelectedFile(null)}
          className="fixed inset-0 z-50 bg-ground/90 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selectedFile.path}
            className="w-full max-w-3xl panel bg-panel shadow-panel overflow-hidden flex flex-col max-h-[85vh]"
          >
            <header className="flex items-center justify-between gap-3 px-4 h-12 border-b border-rule flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                {getFileIcon(selectedFile.path)}
                <span className="font-mono text-[11px] text-paper truncate">
                  {selectedFile.path}
                </span>
                <span className="font-mono text-[11px] text-muted tnum flex-shrink-0">
                  {formatFileSize(selectedFile.size)}
                </span>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {!selectedFile.isBinary && selectedFile.content && (
                  <button
                    type="button"
                    onClick={handleCopyFileContent}
                    className="inline-flex items-center gap-1.5 h-7 px-2 rounded border border-rule text-[11px] text-soft hover:text-paper hover:border-rule-strong transition-colors"
                  >
                    {hasCopied ? (
                      <>
                        <Check className="w-3 h-3 text-signal-400" />
                        <span className="text-signal-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1.5 rounded text-muted hover:text-paper transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            <div className="overflow-y-auto font-mono text-xs leading-relaxed bg-ground text-paper">
              {selectedFile.isBinary ? (
                selectedFile.path.endsWith('.png') && selectedFile.raw ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <img
                      src={`data:image/png;base64,${btoa(
                        String.fromCharCode(...Array.from(selectedFile.raw))
                      )}`}
                      alt={selectedFile.path}
                      className="max-w-[240px] border border-rule [image-rendering:pixelated]"
                    />
                    <span className="text-[11px] text-muted mt-3 font-mono">
                      PNG preview
                    </span>
                  </div>
                ) : (
                  <p className="py-16 px-6 text-center text-xs text-muted">
                    Binary file — no text preview.
                  </p>
                )
              ) : (
                <div className="code-line-numbers py-3 pr-4">
                  {selectedFile.content ? (
                    selectedFile.content.split('\n').map((line, idx) => (
                      <div key={idx} className="hover:bg-raised">
                        <span className="whitespace-pre">{line || ' '}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-muted italic">(empty)</span>
                  )}
                </div>
              )}
            </div>

            <footer className="px-4 h-10 border-t border-rule flex items-center justify-between flex-shrink-0">
              <span className="font-mono text-[11px] text-muted">ESC to close</span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="h-7 px-2.5 rounded border border-rule text-[11px] text-soft hover:text-paper hover:border-rule-strong transition-colors"
              >
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
