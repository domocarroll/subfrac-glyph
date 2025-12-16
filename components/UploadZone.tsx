import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  onFileSelected: (base64: string) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Only image files are accepted.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be under 5MB.");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      onFileSelected(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`
        relative group border border-dashed p-12 text-center transition-all duration-300
        flex flex-col items-center justify-center h-80
        ${isDragging
          ? 'border-white bg-white/5'
          : 'border-neutral-800/50 hover:border-neutral-700 bg-neutral-900/30'
        }
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />

      <div className={`
        w-12 h-12 flex items-center justify-center mb-6 transition-colors duration-300
        ${isDragging ? 'bg-white text-neutral-950' : 'bg-neutral-800/50 text-neutral-500 group-hover:bg-neutral-800'}
      `}>
        <Upload className="w-5 h-5" />
      </div>

      <p className="text-neutral-500 font-mono text-xs uppercase tracking-wider mb-2">Drop sketch here</p>
      <p className="text-neutral-700 font-mono text-[10px]">
        or click to browse
      </p>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <span className="text-[9px] text-neutral-700 font-mono uppercase tracking-wider">
          JPG, PNG — Max 5MB
        </span>
      </div>

      {error && (
        <div className="absolute bottom-4 left-0 right-0 mx-auto w-fit flex items-center gap-2 text-red-400 text-[10px] font-mono bg-red-900/20 px-4 py-2">
          <AlertCircle size={10} />
          {error}
        </div>
      )}
    </div>
  );
};
