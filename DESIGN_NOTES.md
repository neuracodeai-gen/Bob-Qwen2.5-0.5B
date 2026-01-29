# Bob UI - Modern Design Implementation

## Overview
Your Ollama Bot now features a **clean, minimal dark mode interface** with **blue-cyan highlights** and modern UX patterns.

## Key Features Implemented

### 🎨 Design
- **Dark Mode**: Sleek dark theme (#020617 to #0f172a) throughout
- **Blue-Cyan Highlight**: Primary color #06b6d4 / #22d3ee with smooth gradients
- **Minimal & Clean**: Reduced clutter, maximum readability
- **Modern Animations**: Smooth transitions and slide-in effects
- **Custom Scrollbars**: Styled to match the theme

### 🎯 User Interface
- **Retractable Sidebar**: Collapsible on the left with smooth animations
  - Shows chat history
  - Logo branding at the top
  - Footer with model info
  - Hovers over chat items show delete button
- **Chat Header**: Displays current chat title
- **Modern Input Area**: 
  - Focused state shows blue-cyan glow
  - Smooth input transitions
  - Clear visual feedback

### 💾 File Attachment
- **Upload Button**: Paperclip icon next to input
- **File Preview**: Shows filename and size before sending
- **File Handling**: Backend processes and includes file content in context
- **Supported Formats**: txt, pdf, doc, docx, py, js, java, cpp, c, md, json, xml, csv, log, html, css
- **Max Size**: 50 MB file limit

### 📝 Code Block Rendering
- **Markdown Support**: Automatic parsing of markdown syntax
- **Syntax Highlighting**: Uses Highlight.js for beautiful code blocks
  - Light syntax highlighting on dark backgrounds
  - Language-specific highlighting
  - Proper indentation preservation
- **Inline Code**: Backticks render as inline code
- **Lists**: Numbered and bullet points render properly
- **Links**: Clickable links in markdown format

### 📱 Responsive Design
- **Desktop**: Full sidebar visible (280px width)
- **Tablet**: Sidebar can be toggled
- **Mobile**: Sidebar collapses to 70px or hides completely
- **Touch-Friendly**: Larger hit targets on mobile

## Color Scheme
```
Primary Colors:
--primary: #06b6d4 (Cyan)
--primary-light: #22d3ee (Light Cyan)
--primary-dark: #0891b2 (Dark Cyan)

Background Colors:
--bg-dark: #0f172a (Main background)
--bg-darker: #020617 (Darker background)
--bg-card: #0f172a (Card background)

Text Colors:
--text-primary: #f1f5f9 (Primary text)
--text-secondary: #cbd5e1 (Secondary text)

UI Colors:
--border: #1e293b (Borders)
--hover: #1e293b (Hover state)
```

## File Structure
```
/workspaces/Bob-Qwen2.5-0.5B/
├── app.py                 (Flask backend with file upload support)
├── requirements.txt       (Dependencies)
├── static/
│   ├── app.js            (Modern JS with markdown rendering)
│   └── style.css         (Comprehensive styling)
└── templates/
    └── index.html        (Semantic HTML5)
```

## Technical Improvements

### Frontend
- Clean, maintainable CSS with CSS variables
- Markdown-to-HTML parser for rich text
- Highlight.js integration for syntax highlighting
- File upload with preview
- Dynamic active chat highlighting
- Smooth animations and transitions

### Backend
- File upload handling with validation
- File content extraction for AI context
- Secure filename handling
- Error handling and validation
- Delete chat functionality

## How to Use

### Sending Messages
1. Type in the input field at the bottom
2. Press Enter or click the send button (blue-cyan arrow)

### Attaching Files
1. Click the paperclip icon (📎)
2. Select a file from your computer
3. File preview appears below the input
4. Click send to include the file with your message

### Managing Chats
1. **New Chat**: Click the "New Chat" button in the sidebar
2. **Switch Chat**: Click any chat title in the left sidebar
3. **Delete Chat**: Hover over a chat and click the trash icon (🗑)

### Sidebar Toggle
- Click the hamburger menu (☰) to collapse/expand sidebar
- Auto-collapses on mobile devices

## Features Notes
- Messages are syntax-highlighted automatically
- Markdown formatting is preserved
- Code blocks show language tags
- File attachments are included in AI context (up to 5000 chars)
- Chat history persists in memory during session
- Auto-generates short chat titles from first message

## Browser Compatibility
- Chrome/Edge: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Full support
- Mobile browsers: ✓ Responsive design
