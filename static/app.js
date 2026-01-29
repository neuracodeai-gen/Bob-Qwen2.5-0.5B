/* ================= static/app.js ================= */
let currentChatId = null;

// ------------------------------
// UI helpers
// ------------------------------

function renderBubble(text, side, label) {
  const box = document.getElementById('chat-box');

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.justifyContent = side === 'right' ? 'flex-end' : 'flex-start';

  const bubble = document.createElement('div');
  bubble.style.maxWidth = '65%';
  bubble.style.padding = '10px';
  bubble.style.borderRadius = '12px';
  bubble.style.background = side === 'right' ? '#0078ff' : '#1e1e1e';
  bubble.style.margin = '6px';

  // ---------- LIST FORMAT FIX ----------
  const lines = text.split("\n");
  const looksLikeList =
    lines.filter(l =>
      /^\s*\d+\./.test(l) ||
      /^\s*[-•]/.test(l)
    ).length >= 2;

  if (looksLikeList) {
    let html = `<b>${label}:</b><ul>`;
    for (const line of lines) {
      const cleaned = line
        .replace(/^\s*\d+\.\s*/, "")
        .replace(/^\s*[-•]\s*/, "");

      if (cleaned.trim()) {
        html += `<li>${cleaned}</li>`;
      }
    }
    html += "</ul>";
    bubble.innerHTML = html;
  } else {
    bubble.innerHTML = `<b>${label}:</b><br>${text}`;
  }

  wrap.appendChild(bubble);
  box.appendChild(wrap);
  box.scrollTop = box.scrollHeight;
}

// ------------------------------
// Chats sidebar
// ------------------------------

async function refreshChatList() {
  const res = await fetch('/api/chats');
  const chats = await res.json();

  const list = document.getElementById('chat-list');
  list.innerHTML = '';

  chats.forEach(c => {
    const row = document.createElement('div');
    row.className = "chat-row";

    const title = document.createElement('span');
    title.textContent = c.title;
    title.onclick = () => loadChat(c.id);

    const del = document.createElement('button');
    del.textContent = "🗑";
    del.className = "delete-btn";

    del.onclick = async (e) => {
      e.stopPropagation();

      await fetch(`/api/delete_chat/${c.id}`, {
        method: "DELETE"
      });

      if (currentChatId === c.id) {
        currentChatId = null;
        document.getElementById("chat-box").innerHTML = "";
      }

      refreshChatList();
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

  refreshChatList();
}

// ------------------------------
// Load existing chat
// ------------------------------

async function loadChat(id) {
  currentChatId = id;

  const box = document.getElementById('chat-box');
  box.innerHTML = '';

  const res = await fetch(`/api/chat/${id}`);
  const data = await res.json();

  data.messages.forEach(m => {
    if (m.role === "user") {
      renderBubble(m.content, "right", "User");
    } else if (m.role === "assistant") {
      renderBubble(m.content, "left", "AI");
    }
  });
}

// ------------------------------
// Sending messages
// ------------------------------

async function sendMessage() {
  const input = document.getElementById('user-input');
  const msg = input.value.trim();

  if (!msg) return;

  if (!currentChatId) {
    await newChat();
  }

  renderBubble(msg, 'right', 'User');
  input.value = '';

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: currentChatId,
      message: msg
    })
  });

  const data = await res.json();

  renderBubble(data.reply, 'left', 'AI');

  refreshChatList();
}

// ------------------------------
// Init
// ------------------------------

document.getElementById('send-btn').onclick = sendMessage;

document.getElementById('new-chat-btn').onclick = newChat;

document.getElementById('user-input')
  .addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

refreshChatList();
