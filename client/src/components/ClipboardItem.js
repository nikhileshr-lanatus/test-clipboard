import React, { useState } from "react";

function ClipboardItem({ item, sessionCode, formatFileSize }) {
  const [imageData, setImageData] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadFile = () => {
    const downloadUrl = `/api/download/${sessionCode}/${item.id}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadImagePreview = async () => {
    if (imageData || imageLoading) return;

    setImageLoading(true);
    try {
      const response = await fetch(`/api/file/${sessionCode}/${item.id}`);
      const fileData = await response.json();
      setImageData(`data:${fileData.mimeType};base64,${fileData.data}`);
    } catch (err) {
      console.error("Failed to load image:", err);
    } finally {
      setImageLoading(false);
    }
  };

  const renderTextItem = () => (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📝</span>
          <span className="text-sm font-medium text-gray-600">Text</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {formatTime(item.timestamp)}
          </span>
          <button
            onClick={() => copyToClipboard(item.content)}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            {copied ? "✓ Copied!" : "📋 Copy"}
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded p-3 border-l-4 border-blue-500">
        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono break-words">
          {item.content}
        </pre>
      </div>
    </div>
  );

  const renderImageItem = () => (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🖼️</span>
          <div>
            <span className="text-sm font-medium text-gray-900">
              {item.name}
            </span>
            <div className="text-xs text-gray-500">
              {formatFileSize(item.size)} • {item.mimeType}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {formatTime(item.timestamp)}
          </span>
          <button
            onClick={downloadFile}
            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            ⬇️ Download
          </button>
        </div>
      </div>

      <div className="mt-2">
        {!imageData && !imageLoading && (
          <button
            onClick={loadImagePreview}
            className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🖼️</div>
              <p className="text-gray-600">Click to preview image</p>
            </div>
          </button>
        )}

        {imageLoading && (
          <div className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <div className="animate-spin text-2xl mb-2">⏳</div>
              <p className="text-gray-600">Loading preview...</p>
            </div>
          </div>
        )}

        {imageData && (
          <div className="relative">
            <img
              src={imageData}
              alt={item.name}
              className="max-w-full max-h-64 rounded-lg border border-gray-200"
              style={{ objectFit: "contain" }}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderFileItem = () => (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📄</span>
          <div>
            <div className="font-medium text-gray-900">{item.name}</div>
            <div className="text-sm text-gray-500">
              {formatFileSize(item.size)} • {item.mimeType}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {formatTime(item.timestamp)}
          </span>
          <button
            onClick={downloadFile}
            className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
          >
            ⬇️ Download
          </button>
        </div>
      </div>
    </div>
  );

  switch (item.type) {
    case "text":
      return renderTextItem();
    case "image":
      return renderImageItem();
    case "file":
      return renderFileItem();
    default:
      return null;
  }
}

export default ClipboardItem;
