# 🖥️ Desktop Online Clipboard

A real-time clipboard sharing application for desktop users. Share text, files, and images instantly using simple 4-digit codes.

## ✨ Features

- **🔐 Simple Access**: Join sessions with 4-digit numeric codes
- **📝 Text Sharing**: Share unlimited text content in real-time
- **📁 File Upload**: Upload and share any file type (up to 100MB)
- **🖼️ Image Preview**: Upload images with built-in preview functionality
- **⚡ Real-time Sync**: Changes appear instantly via WebSocket connections
- **🧹 Auto-cleanup**: Sessions automatically expire after 10 minutes of inactivity
- **🔒 Privacy First**: No registration, no persistent storage, all data in memory
- **💻 Desktop Only**: Optimized exclusively for desktop use

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
2. **Install dependencies**:

   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. **Start the application**:

   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:3000`

### Production Build

```bash
# Build the React frontend
npm run build

# Start the production server
npm start
```

## 🎯 How to Use

### Starting a Session

1. Open the application in your browser
2. Enter a 4-digit number (e.g., `1234`)
3. Click "Join Session" or press Enter
4. Share the code with others who want to join

### Adding Content

- **Text**: Type in the text area and click "Add to Clipboard"
- **Files**: Click the upload area or drag & drop files anywhere on the page
- **Images**: Drag & drop images or paste them with Ctrl+V / Cmd+V

### Sharing Content

- **Copy Text**: Click the "Copy" button on any text item
- **Download Files**: Click the "Download" button on file items
- **View Images**: Click on image items to see a preview

### Session Management

- **Clear All**: Use the "Clear" button to remove all items
- **Disconnect**: Use the "Disconnect" button to leave the session
- **Auto-expire**: Sessions automatically end after 10 minutes of inactivity

## 🛠️ Technical Details

### Architecture

- **Frontend**: React 18 + TailwindCSS
- **Backend**: Node.js + Express + WebSocket
- **Storage**: In-memory (no database required)
- **File Handling**: Base64 encoding for in-memory storage

### File Structure

```
├── server/
│   └── index.js          # Express server with WebSocket support
├── client/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks (WebSocket)
│   │   └── App.js        # Main application
│   └── package.json      # Client dependencies
├── package.json          # Server dependencies
└── README.md
```

### API Endpoints

- `POST /api/session/join` - Join or create a session
- `POST /api/upload/:code` - Upload files to a session
- `GET /api/download/:code/:fileId` - Download files
- `GET /api/file/:code/:fileId` - Get file data (for previews)

### WebSocket Events

- `join_session` - Join a clipboard session
- `add_text` - Add text to clipboard
- `clear_clipboard` - Clear all items
- `item_added` - Broadcast new items
- `session_ended` - Session expired/ended

## 🔒 Privacy & Security

- **No Registration**: No user accounts or personal information required
- **Temporary Storage**: All data stored in server memory only
- **Auto-deletion**: Sessions and data automatically deleted after 10 minutes
- **No Persistence**: Server restart clears all data
- **Anonymous**: No tracking or logging of user activities

## ⚠️ Limitations

- **Desktop Only**: Mobile devices are intentionally blocked
- **Memory Storage**: Large files consume server memory
- **Session Timeout**: 10-minute inactivity limit
- **No Persistence**: Data lost on server restart
- **File Size Limit**: 100MB maximum per file

## 🖥️ Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔧 Development

### Start Development Server

```bash
npm run dev
```

This starts both the backend server (port 3001) and React development server (port 3000) concurrently.

### Environment Variables

- `PORT` - Server port (default: 3001)

### Customization

- **Session Timeout**: Modify the 10-minute timeout in `server/index.js`
- **File Size Limit**: Adjust the 100MB limit in multer configuration
- **Styling**: Customize TailwindCSS classes in React components

## 📝 License

MIT License - feel free to use this project for any purpose.

## 🤝 Contributing

This is a demonstration project. Feel free to fork and modify as needed for your use case.

---

**Note**: This application is designed for trusted networks and users. While it includes basic security measures, it's not intended for sharing sensitive or confidential information.
