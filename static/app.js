/* ================= static/app.js ================= */
let currentChatId = null;
let selectedFile = null;

// Markdown and code block rendering helper
function markdownToHtml(text) {
  let html = text;
  
  // Escape HTML
  html = html.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&#039;');
  
  // Code blocks with language
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    lang = lang || 'plaintext';
    const escapedCode = code.trim();
    return `<pre><code class="language-${lang}">${escapedCode}</code></pre>`;
  });
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href=\"$2\" target=\"_blank\">$1</a>');
  
  // Line breaks
  html = html.replace(/\n/g, '<br>');
  
  return html;
}

// Render a message bubble with proper formatting
function renderBubble(text, side) {
  const box = document.getElementById('chat-box');
  
  const wrapper = document.createElement('div');
  wrapper.className = `message-wrapper ${side === 'right' ? 'user' : 'ai'}`;
  
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  
  // Process markdown and code blocks
  const html = markdownToHtml(text);
  bubble.innerHTML = html;
  
  // Highlight code blocks
  bubble.querySelectorAll('pre code').forEach(block => {
    hljs.highlightElement(block);
  });
  
  wrapper.appendChild(bubble);
  box.appendChild(wrapper);
  box.scrollTop = box.scrollHeight;
}

// Chats sidebar
async function refreshChatList() {
  const res = await fetch('/api/chats');
  const chats = await res.json();

  const list = document.getElementById('chat-list');
  list.innerHTML = '';

  chats.forEach(c => {
    const row = document.createElement('div');
    row.className = "chat-row";

    const title = document.createElement('button');
    title.textContent = c.title;
    title.className = currentChatId === c.id ? 'active' : '';
    title.onclick = () => loadChat(c.id);

    const del = document.createElement('button');
    del.textContent = "🗑";
    del.className = "delete-btn";

    del.onclick = async (e) => {
      e.stopPropagation();

      if (confirm('Delete this chat?')) {
        await fetch(`/api/delete_chat/${c.id}`, {
          method: "DELETE"
        });

        if (currentChatId === c.id) {
          currentChatId = null;
          document.getElementById("chat-box").innerHTML = "";
          document.getElementById("chat-title").textContent = "Start a new chat";
        }

        refreshChatList();
      }
    };

    row.appendChild(title);
    row.appendChild(del);
    list.appendChild(row);
  });
}

async function newChat() {
  const res = await fetch('/api/new_chat', { method: 'POST' });
  const data = await res.json();

  currentChatId = data.chat_id;

  document.getElementById('chat-box').innerHTML = '';
  document.getElementById('chat-title').textContent = 'New Chat';
  selectedFile = null;
  document.getElementById('file-preview').classList.remove('show');
  document.getElementById('file-preview').innerHTML = '';

  refreshChatList();
}

// Load existing chat
async function loadChat(id) {
  currentChatId = id;
  selectedFile = null;
  document.getElementById('file-preview').classList.remove('show');
  document.getElementById('file-preview').innerHTML = '';

  const box = document.getElementById('chat-box');
  box.innerHTML = '';

  const res = await fetch(`/api/chat/${id}`);
  const data = await res.json();

  // Update chat title
  const chats = await fetch('/api/chats').then(r => r.json());
  const chat = chats.find(c => c.id === id);
  if (chat) {
    document.getElementById('chat-title').textContent = chat.title;
  }

  data.messages.forEach(m => {
    if (m.role === "user") {
      renderBubble(m.content, "right");
    } else if (m.role === "assistant") {
      renderBubble(m.content, "left");
    }
  });

  refreshChatList();
}

// Sending messages
async function sendMessage() {
  const input = document.getElementById('user-input');
  const msg = input.value.trim();

  if (!msg && !selectedFile) return;

  if (!currentChatId) {
    await newChat();
  }

  // Render user message
  renderBubble(msg || `📎 ${selectedFile.name}`, 'right');
  input.value = '';
  
  // Clear file preview
  selectedFile = null;
  document.getElementById('file-preview').classList.remove('show');
  document.getElementById('file-preview').innerHTML = '';

  // Prepare form data if file is attached
  let body;
  if (selectedFile) {
    const formData = new FormData();
    formData.append('chat_id', currentChatId);
    formData.append('message', msg);
    formData.append('file', selectedFile);
    body = formData;
  } else {
    body = JSON.stringify({
      chat_id: currentChatId,
      message: msg
    });
  }

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: selectedFile ? {} : { 'Content-Type': 'application/json' },
    body: body
  });

  const data = await res.json();

  renderBubble(data.reply, 'left');

  refreshChatList();
}

// Init
document.getElementById('send-btn').onclick = sendMessage;

document.getElementById('new-chat-btn').onclick = newChat;

document.getElementById('user-input')
  .addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

// File upload handling
document.getElementById('file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile = file;
    
    const preview = document.getElementById('file-preview');
    preview.innerHTML = `
      <span>📎 ${file.name} (${(file.size / 1024).toFixed(2)} KB)</span>
      <button class="file-preview-remove" onclick="removeFile()">✕</button>
    `;
    preview.classList.add('show');
  }
});

function removeFile() {
  selectedFile = null;
  document.getElementById('file-input').value = '';
  document.getElementById('file-preview').classList.remove('show');
  document.getElementById('file-preview').innerHTML = '';
}

// Toggle sidebar on mobile
document.getElementById('toggle-sidebar').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
});

// Initialize
refreshChatList();
