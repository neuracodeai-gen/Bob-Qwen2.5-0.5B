# 🚀 Quick Start Guide

## Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Make sure Ollama is running
ollama serve

# 3. In another terminal, start the app
python app.py

# 4. Open http://localhost:5000 in your browser
```

## What You Get

### Dark Mode Interface ✅
- Sleek dark theme with blue-cyan accents
- Professional, minimal design
- Beautiful animations and transitions

### Retractable Sidebar ✅
- Chat history on the left
- Click hamburger (☰) to collapse
- Hover over chats to delete
- Active chat highlighted in cyan

### File Attachment ✅
- Click 📎 icon to upload files
- Supports: txt, pdf, doc, py, js, json, md, etc.
- File preview shows before sending
- Content included in AI context

### Code Blocks ✅
- Automatic syntax highlighting
- Multiple language support
- Beautiful light syntax on dark background
- Proper indentation preserved

### Rich Formatting ✅
- **Bold** text
- *Italic* text
- `Inline code`
- [Links](https://example.com)
- Lists and more

## Usage Examples

### Chat with Code
```
You: How do I write a Python function?

Bob: Here's an example:
```python
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
```
```

### Attach and Analyze
```
1. Click 📎
2. Select file (e.g., code.py, data.txt)
3. Type your question
4. Send

Bob will include the file content in the response!
```

### Manage Chats
```
• Click "+ New Chat" for a new conversation
• Click a chat title to view it
• Hover and click 🗑 to delete
```

## Customization

### Change Colors
Edit `static/style.css`:
```css
:root {
  --primary: #06b6d4;        /* Main color */
  --primary-light: #22d3ee;  /* Lighter variant */
}
```

### Change Model
Edit `app.py`:
```python
MODEL = "qwen2.5:0.5b"  # Change this
```

### Adjust Context Window
Edit `app.py`:
```python
CONTEXT_WINDOW = 8  # Number of messages to remember
```

## Troubleshooting

### Issue: Page doesn't load
- Make sure Flask is running: `python app.py`
- Check http://localhost:5000

### Issue: Ollama errors
- Make sure Ollama is running: `ollama serve`
- Check model is installed: `ollama pull qwen2.5:0.5b`

### Issue: File upload not working
- Check file format is supported
- File must be under 50 MB
- Check browser console for errors

### Issue: Code highlighting not showing
- Highlight.js loads from CDN (needs internet)
- Check browser console for CDN errors

## Features Checklist

- [x] Dark mode with blue-cyan theme
- [x] Clean, minimal interface
- [x] Retractable sidebar
- [x] Chat history management
- [x] File attachment support
- [x] Syntax highlighting for code
- [x] Markdown formatting
- [x] Responsive design
- [x] Mobile friendly
- [x] Active chat highlighting
- [x] Auto-generated chat titles
- [x] Smooth animations
- [x] Modern UI components

## Browser Support

✅ Chrome/Chromium  
✅ Firefox  
✅ Safari  
✅ Edge  
✅ Mobile browsers  

## File Structure

```
Bob-Qwen2.5-0.5B/
├── app.py                    # Flask backend
├── requirements.txt          # Python dependencies
├── static/
│   ├── app.js               # Frontend logic
│   └── style.css            # All styling
├── templates/
│   └── index.html           # HTML structure
└── uploads/                 # File uploads (auto-created)
```

## Tips & Tricks

1. **Shift+Enter** for multi-line input (not implemented yet, but Enter sends)
2. Hover over chat titles to see delete button
3. Sidebar auto-collapses on mobile
4. Click chat title to switch conversations
5. File attachments persist in chat history
6. Chat titles auto-generate from first message

## Performance

- Lightweight CSS animations (GPU accelerated)
- Minimal JavaScript footprint
- Fast file uploads
- Smooth 60fps interactions

## Need Help?

Check the generated docs:
- `DESIGN_NOTES.md` - Design details
- `UI_VISUAL_GUIDE.md` - Visual reference
- `IMPLEMENTATION_SUMMARY.md` - Full feature list

Enjoy your new Bob UI! 🎉
