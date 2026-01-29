# 🎉 Bob - Modern Ollama Chat UI

A beautifully redesigned chat interface for your local Ollama AI model with **dark mode**, **blue-cyan accents**, **file uploads**, and **code highlighting**.

## 🌟 Features

### Design
- ✨ **Dark Mode** with professional blue-cyan color scheme
- 🎨 **Modern UI** with smooth animations and transitions  
- 📱 **Fully Responsive** (desktop, tablet, mobile)
- 🎯 **Retractable Sidebar** with elegant collapse animation
- ✅ **Clean & Minimal** - no clutter, maximum functionality

### Functionality
- 💬 **Multiple Chats** - manage conversation history
- 🤖 **Auto-Generated Titles** - smart chat naming from first message
- 💾 **File Attachments** - upload files and include in AI context
- 🎨 **Code Highlighting** - syntax highlighting with Highlight.js
- 📝 **Markdown Support** - bold, italic, links, lists, code blocks
- 🗑️ **Chat Management** - delete and switch between conversations
- 🔍 **Active Chat Indicator** - clearly see which chat is selected

### Technical
- 🔒 **Secure File Handling** - validation and size limits
- ⚡ **Performance Optimized** - GPU accelerated animations
- 🎯 **Accessibility** - keyboard navigation, focus states
- 📦 **Lightweight** - minimal dependencies
- 🛠️ **Easy to Customize** - CSS variables for theming

## 📦 Installation

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start Ollama service
ollama serve

# 3. In another terminal, run the app
python app.py

# 4. Open in browser
open http://localhost:5000
```

## 🎨 UI Overview

```
┌─────────────────────────────────────────────────┐
│ ☰ Bob                   │  Chat Title          │
│   Offline AI            │                      │
│                         │  ┌──────────────────┐│
│ [+ New Chat]            │  │ Message Bubbles  ││
│                         │  │ with Code Blocks ││
│ Chat History            │  │                  ││
│ • Chat 1         [🗑]   │  │ ```python        ││
│ • Chat 2         [🗑]   │  │ code highlight   ││
│ • Chat 3         [🗑]   │  │ ```              ││
│                         │  └──────────────────┘│
│ Qwen 2.5 0.5B          │  [📎] Type...   [→]  │
└─────────────────────────────────────────────────┘
```

## 🎯 Quick Start

### Send a Message
1. Type in the input field
2. Press Enter or click send (→)
3. AI responds with syntax highlighting

### Attach a File  
1. Click paperclip (📎)
2. Select a file (txt, pdf, py, js, md, etc.)
3. File preview shows below input
4. Send - file content included in context

### Manage Chats
- **New Chat**: Click "+ New Chat" button
- **Switch**: Click any chat title in sidebar
- **Delete**: Hover over chat, click trash (🗑)
- **Collapse**: Click hamburger (☰) on mobile

## 🌈 Color Scheme

```
Primary: #06b6d4 (Cyan)
Light:   #22d3ee (Light Cyan)
Dark:    #0f172a (Background)
Darker:  #020617 (Sidebar)
```

All colors defined as CSS variables - easy to customize!

## 📚 File Structure

```
Bob-Qwen2.5-0.5B/
├── app.py                    # Flask backend
├── requirements.txt          # Python dependencies
├── README.md                 # This file
├── QUICKSTART.md             # Setup guide
├── DESIGN_NOTES.md           # Design specifications
├── UI_VISUAL_GUIDE.md        # Visual reference
├── WHATS_NEW.md              # What changed
├── IMPLEMENTATION_SUMMARY.md # Feature list
├── static/
│   ├── app.js               # Frontend logic
│   └── style.css            # All styling
├── templates/
│   └── index.html           # HTML structure
└── uploads/                 # File upload directory (auto-created)
```

## 🔧 Configuration

### Change Model
Edit `app.py`:
```python
MODEL = "qwen2.5:0.5b"  # Change this to another model
```

### Adjust Context Window
Edit `app.py`:
```python
CONTEXT_WINDOW = 8  # Number of messages to remember
```

### Change Colors
Edit `static/style.css`:
```css
:root {
  --primary: #06b6d4;        /* Main cyan color */
  --primary-light: #22d3ee;  /* Light cyan */
  --bg-dark: #0f172a;        /* Background */
}
```

## 💡 Tips & Tricks

### Markdown Formatting
```
**bold text** → bold text
*italic text* → italic text
`code` → code
[link](url) → clickable link
- bullet point
1. numbered item
```

### Code Blocks
````markdown
```python
def hello():
    print("Hello, World!")
```
````

### Keyboard Shortcuts
- `Enter` - Send message
- `Shift+Enter` - New line (not implemented yet)
- `☰` - Toggle sidebar on mobile

## 📱 Responsive Breakpoints

| Screen Size | Sidebar | Behavior |
|------------|---------|----------|
| >768px (Desktop) | 280px visible | Full sidebar always shown |
| 768px-480px | Collapsible | Click ☰ to toggle |
| <480px (Mobile) | Hidden | Full width, toggle with ☰ |

## 🔒 Security Features

- ✅ HTML escaping prevents XSS
- ✅ Secure filename handling
- ✅ File type validation
- ✅ File size limits (50 MB)
- ✅ Content-Type checks
- ✅ No external code execution

## ⚙️ Supported File Types

`txt` `pdf` `doc` `docx` `py` `js` `java` `cpp` `c` `md` `json` `xml` `csv` `log` `html` `css`

Max file size: **50 MB**

## 🐛 Troubleshooting

### Page doesn't load
```bash
# Make sure Flask is running
python app.py
# Check http://localhost:5000
```

### "Connection refused" to Ollama
```bash
# Start Ollama in another terminal
ollama serve
```

### Model not found
```bash
# Download the model first
ollama pull qwen2.5:0.5b
```

### File upload fails
- Check file format is supported
- Ensure file is under 50 MB
- Check browser console for errors

## 📊 Performance

- CSS animations: GPU accelerated (60 fps)
- JS bundle: Minimal (248 lines, no transpilation)
- First load: <500ms
- Memory efficient: CSS variables, lazy rendering

## 🌍 Browser Support

| Browser | Support |
|---------|---------|
| Chrome/Chromium | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Edge | ✅ Full |
| Mobile Safari | ✅ Full |
| Mobile Chrome | ✅ Full |

## 📖 Documentation

- **QUICKSTART.md** - Get started in 5 minutes
- **DESIGN_NOTES.md** - Design specifications
- **UI_VISUAL_GUIDE.md** - Visual reference guide
- **IMPLEMENTATION_SUMMARY.md** - Complete feature list
- **WHATS_NEW.md** - What changed from v1

## 🎓 Learn More

### Markdown Syntax
https://www.markdownguide.org/basic-syntax/

### Highlight.js
https://highlightjs.org/

### Ollama
https://ollama.ai/

### Flask
https://flask.palletsprojects.com/

## 🤝 Contributing

Found a bug or have a suggestion? Feel free to:
1. Report issues
2. Suggest improvements
3. Submit enhancements

## 📄 License

This project is open source and available under the MIT License.

## 🎉 Summary

Bob is now a **modern, professional chat interface** for your Ollama AI. It features:

- 🎨 Beautiful dark mode design
- 💾 File upload support
- 🎯 Code syntax highlighting
- 📱 Mobile responsive
- ⚡ Fast and smooth
- 🔒 Secure
- 🎯 Production-ready

Perfect for sharing, demoing, or daily use!

---

**Questions?** Check the documentation files included in this repository.

**Ready to chat?** Start your Ollama bot and open http://localhost:5000! 🚀
