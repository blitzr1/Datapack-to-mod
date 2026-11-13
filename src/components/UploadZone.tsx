import { useState, useRef } from 'react';
import { FolderUp, FileArchive, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  onFileLoaded: (file: File) => void;
  onFilesListLoaded: (files: File[]) => void;
  isLoading: boolean;
  error: string | null;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileLoaded,
  onFilesListLoaded,
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
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded border border-dashed transition-colors ${
        isDragOver
          ? 'border-brass-500 bg-brass-950/20'
          : 'border-stone-700 hover:border-stone-600'
      }`}
    >
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

      <div className="flex items-center justify-between gap-3 h-10 px-4 sm:px-5 border-b border-rule">
        <span className="label">Input</span>
        <span className="font-mono text-[11px] text-muted">zip / folder</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-20">
          <div className="w-3.5 h-3.5 border-2 border-rule border-t-brass-400 rounded-full animate-spin" />
          <p className="font-mono text-xs text-muted">reading archive…</p>
        </div>
      ) : (
        <div className="px-5 sm:px-8 py-10 sm:py-12 flex flex-col items-center text-center">
          <p className="font-mono text-[15px] sm:text-base text-paper">
            drop <span className="text-brass-400">pack.zip</span> here
          </p>
          <p className="mt-2.5 text-xs text-muted leading-relaxed max-w-[46ch]">
            or read an unzipped folder. Everything stays in browser memory.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 h-10 px-4 rounded bg-brass-500 hover:bg-brass-400 text-[#1A1410] font-semibold text-sm transition-colors"
            >
              <FileArchive className="w-4 h-4" />
              Choose zip
            </button>

            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="inline-flex items-center gap-2 h-10 px-4 rounded border border-rule text-sm text-stone-300 hover:text-paper hover:border-stone-600 transition-colors"
            >
              <FolderUp className="w-4 h-4" />
              Choose folder
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mx-4 sm:mx-5 mb-4 flex items-start gap-2.5 rounded border border-bad/40 bg-bad/10 p-3">
          <AlertCircle className="w-4 h-4 text-bad flex-shrink-0 mt-px" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-paper">Could not read that archive</p>
            <p className="mt-0.5 text-xs text-stone-300 leading-relaxed break-words">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
