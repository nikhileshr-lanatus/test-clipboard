import React, { useState, useRef } from "react";
import ClipboardItem from "./ClipboardItem";
import TextInput from "./TextInput";
import FileUpload from "./FileUpload";

function ClipboardInterface({
  sessionCode,
  clipboardItems,
  onAddText,
  onFileUpload,
  onClearClipboard,
  onDisconnect,
  connectionStatus,
}) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => onFileUpload(file));
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          onFileUpload(file);
        }
      } else if (item.type === "text/plain") {
        item.getAsString((text) => {
          if (text.trim()) {
            onAddText(text);
          }
        });
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div
      className={`min-h-96 ${dragOver ? "drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
      tabIndex={0}
    >
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">📋</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Session: {sessionCode}
              </h2>
              <p className="text-sm text-gray-600">
                Share this code with others to join your clipboard
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "connecting"
                    ? "bg-yellow-500"
                    : connectionStatus === "error"
                    ? "bg-red-500"
                    : "bg-gray-300"
                }`}
              ></div>
              <span className="text-sm text-gray-600">
                {connectionStatus === "connected"
                  ? "Connected"
                  : connectionStatus === "connecting"
                  ? "Connecting..."
                  : connectionStatus === "error"
                  ? "Connection Error"
                  : "Disconnected"}
              </span>
            </div>

            <button
              onClick={onClearClipboard}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              title="Clear all items"
            >
              🗑️ Clear
            </button>

            <button
              onClick={onDisconnect}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TextInput onAddText={onAddText} />
        <FileUpload onFileUpload={onFileUpload} />
      </div>

      {/* Clipboard Items */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Clipboard Items ({clipboardItems.length})
          </h3>
          <p className="text-sm text-gray-600">
            Items are shared in real-time and auto-expire after 10 minutes of
            inactivity
          </p>
        </div>

        <div className="p-4">
          {clipboardItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg mb-2">
                No items in clipboard yet
              </p>
              <p className="text-gray-400">
                Add text, drag & drop files, or paste images to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {clipboardItems.map((item) => (
                <ClipboardItem
                  key={item.id}
                  item={item}
                  sessionCode={sessionCode}
                  formatFileSize={formatFileSize}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drag and Drop Overlay */}
      {dragOver && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-lg p-8 shadow-xl">
            <div className="text-center">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-xl font-semibold text-gray-900">
                Drop files here
              </p>
              <p className="text-gray-600">
                Files will be shared with everyone in the session
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • <strong>Drag & drop</strong> files anywhere on this page to upload
          </li>
          <li>
            • <strong>Ctrl+V / Cmd+V</strong> to paste text or images directly
          </li>
          <li>
            • <strong>Copy text</strong> by clicking on any text item
          </li>
          <li>
            • <strong>Download files</strong> by clicking the download button
          </li>
          <li>
            • <strong>Session expires</strong> after 10 minutes of inactivity
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ClipboardInterface;
