import { useState, useRef } from 'react';
import { FolderUp, FileArchive, AlertCircle } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Sample tray: ruled like a rack of blanks */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded border border-dashed p-6 sm:p-8 transition-colors ${
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

        {isLoading ? (
          <div className="flex items-center gap-3 py-6">
            <div className="w-3.5 h-3.5 border-2 border-rule border-t-brass-400 rounded-full animate-spin" />
            <p className="font-mono text-xs text-muted">reading archive…</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="min-w-0">
              <p className="font-mono text-sm text-paper">
                drop <span className="text-brass-400">pack.zip</span> here
              </p>
              <p className="mt-1.5 text-xs text-muted">
                or an unzipped folder. Only <span className="font-mono text-stone-300">.zip</span> and
                folder reads are accepted; everything is parsed in memory.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 h-9 px-3.5 rounded bg-brass-500 hover:bg-brass-400 text-[#1A1410] font-semibold text-xs transition-colors"
              >
                <FileArchive className="w-3.5 h-3.5" />
                Choose zip
              </button>

              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="inline-flex items-center gap-2 h-9 px-3.5 rounded border border-rule text-stone-300 hover:text-paper hover:border-stone-600 text-xs transition-colors"
              >
                <FolderUp className="w-3.5 h-3.5" />
                Choose folder
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-5 flex items-start gap-2.5 rounded border border-bad/40 bg-bad/10 p-3">
            <AlertCircle className="w-4 h-4 text-bad flex-shrink-0 mt-px" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-paper">Could not read that archive</p>
              <p className="mt-0.5 text-xs text-stone-300 leading-relaxed break-words">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Sample packs */}
      <div>
        <div className="flex items-baseline justify-between border-b border-rule pb-2">
          <span className="label">Sample packs</span>
          <span className="text-xs text-muted">no zip on hand? load one of these</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-rule">
          {SAMPLE_PACKS.map(sample => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSampleSelected(sample)}
              className="text-left px-0 sm:px-4 py-3.5 first:pl-0 last:pr-0 group"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium text-stone-200 group-hover:text-brass-400 transition-colors truncate">
                  {sample.name}
                </span>
                <span className="font-mono text-[11px] text-muted flex-shrink-0">
                  {Object.keys(sample.files).length} files
                </span>
              </div>
              <p className="mt-1 text-xs text-muted leading-relaxed line-clamp-2">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
