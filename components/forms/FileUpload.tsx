'use client';
import React, { useRef, useState } from 'react';

export default function FileUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFileName(e.target.files[0].name);
  };

  return (
    <div className="flex flex-col p-4 bg-[#f8f9fb] border-2 border-dashed border-[#d0d7e6] rounded-lg items-center gap-4">
      <p className="font-bold text-lg">{fileName ? 'File Terpilih' : 'Unggah File'}</p>
      <p className="text-sm text-gray-500">{fileName || 'PDF, DOCX, JPG (Max 50MB)'}</p>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-bold text-sm hover:bg-gray-50">
        {fileName ? 'Ganti File' : 'Pilih File'}
      </button>
    </div>
  );
}