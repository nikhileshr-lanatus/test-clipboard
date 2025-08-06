import React, { useState } from "react";

function ConnectionForm({ onConnect, connectionStatus }) {
  const [code, setCode] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{4}$/.test(code)) {
      return;
    }

    setIsConnecting(true);
    try {
      await onConnect(code);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCode(value);
  };

  const generateRandomCode = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setCode(randomCode);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Join Clipboard Session
          </h2>
          <p className="text-gray-600">
            Enter a 4-digit code to join an existing session or create a new one
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Session Code
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={handleCodeChange}
              placeholder="0000"
              className="w-full px-4 py-3 text-2xl font-mono text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength="4"
              pattern="\d{4}"
              required
              disabled={isConnecting}
            />
            <p className="text-xs text-gray-500 mt-1">Numbers only, 4 digits</p>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={code.length !== 4 || isConnecting}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isConnecting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Connecting...
                </span>
              ) : (
                "Join Session"
              )}
            </button>

            <button
              type="button"
              onClick={generateRandomCode}
              disabled={isConnecting}
              className="px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Generate random code"
            >
              🎲
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2">
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
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Enter the same 4-digit code as others to share a clipboard
            </li>
            <li>• Share unlimited text, files, and images instantly</li>
            <li>
              • Sessions automatically expire after 10 minutes of inactivity
            </li>
            <li>• No registration required, completely anonymous</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ConnectionForm;
