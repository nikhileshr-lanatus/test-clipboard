import React, { useRef } from "react";

function FileUpload({ onFileUpload }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => onFileUpload(file));
    e.target.value = ""; // Reset input
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📁 Upload Files
      </h3>

      <div className="space-y-4">
        <div
          onClick={handleClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
        >
          <div className="text-4xl mb-2">⬆️</div>
          <p className="text-gray-600 font-medium">Click to select files</p>
          <p className="text-gray-500 text-sm">or drag and drop anywhere</p>
          <p className="text-gray-400 text-xs mt-2">
            Images, documents, any file type (100MB max)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-2">Supported:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>🖼️ Images (JPG, PNG, GIF...)</div>
            <div>📄 Documents (PDF, DOC, TXT...)</div>
            <div>📊 Spreadsheets (XLS, CSV...)</div>
            <div>🎵 Media files (MP3, MP4...)</div>
            <div>📦 Archives (ZIP, RAR...)</div>
            <div>💻 Code files (JS, PY, HTML...)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
