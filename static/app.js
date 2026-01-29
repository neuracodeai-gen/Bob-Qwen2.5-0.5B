/* ================= static/app.js ================= */
let currentChatId = null;
let selectedFile = null;
let currentUser = null;

// ============ AUTH SECTIONS ============
function showAuthSection(sectionId) {
  document.getElementById('auth-welcome').style.display = 'none';
  document.getElementById('auth-signin').style.display = 'none';
  document.getElementById('auth-signup').style.display = 'none';
  document.getElementById(sectionId).style.display = 'block';
}

// ============ AUTH ============
function getUsers() {
  const users = localStorage.getItem('bob_users');
  return users ? JSON.parse(users) : {};
}

function saveUsers(users) {
  localStorage.setItem('bob_users', JSON.stringify(users));
}

function showAuthError(msg) {
  const errorEl = document.getElementById('auth-error');
  errorEl.textContent = msg;
  setTimeout(() => { errorEl.textContent = ''; }, 3000);
}

// Sign In choice button
document.getElementById('btn-signin-choice').addEventListener('click', () => {
  showAuthSection('auth-signin');
  document.getElementById('login-username').focus();
});

// Sign Up choice button
document.getElementById('btn-signup-choice').addEventListener('click', () => {
  showAuthSection('auth-signup');
  document.getElementById('signup-username').focus();
});

// Back buttons
document.getElementById('back-to-welcome-1').addEventListener('click', (e) => {
  e.preventDefault();
  showAuthSection('auth-welcome');
});

document.getElementById('back-to-welcome-2').addEventListener('click', (e) => {
  e.preventDefault();
  showAuthSection('auth-welcome');
});

// Sign In button
document.getElementById('login-btn').addEventListener('click', () => {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!username || !password) {
    showAuthError('Please enter username and password');
    return;
  }

  const users = getUsers();
  const user = users[username];

  if (!user || user.password !== password) {
    showAuthError('Invalid username or password');
    return;
  }

  loginUser(username, user);
});

// Sign Up button
document.getElementById('signup-btn').addEventListener('click', () => {
  const username = document.getElementById('signup-username').value.trim();
  const password = document.getElementById('signup-password').value.trim();
  const about = document.getElementById('signup-about').value.trim();

  if (!username || !password) {
    showAuthError('Username and password required');
    return;
  }

  const users = getUsers();
  if (users[username]) {
    showAuthError('Username already exists');
    return;
  }

  users[username] = { password, about: about || '', chats: {} };
  saveUsers(users);

  loginUser(username, users[username]);
});

function loginUser(username, userData) {
  currentUser = { username, ...userData };
  localStorage.setItem('bob_current_user', username);
  
  document.getElementById('auth-page').style.display = 'none';
  document.getElementById('chat-app').style.display = 'flex';
  document.getElementById('user-label').textContent = `Logged in as ${username}`;
  
  loadUserChats();
  applyThemePreference();
}

function logoutUser() {
  if (confirm('Logout?')) {
    localStorage.removeItem('bob_current_user');
    currentUser = null;
    document.getElementById('auth-page').style.display = 'flex';
    document.getElementById('chat-app').style.display = 'none';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
  }
}

// ============ THEME ============
function applyThemePreference() {
  const isDark = localStorage.getItem('bob_theme') !== 'light';
  if (isDark) {
    document.body.classList.remove('light-mode');
    document.getElementById('theme-toggle').textContent = '🌙';
    document.getElementById('hljs-dark').disabled = false;
    document.getElementById('hljs-light').disabled = true;
  } else {
    document.body.classList.add('light-mode');
    document.getElementById('theme-toggle').textContent = '☀️';
    document.getElementById('hljs-dark').disabled = true;
    document.getElementById('hljs-light').disabled = false;
  }
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  const isDark = localStorage.getItem('bob_theme') !== 'light';
  if (isDark) {
    localStorage.setItem('bob_theme', 'light');
  } else {
    localStorage.setItem('bob_theme', 'dark');
  }
  applyThemePreference();
});

// ============ PROFILE ============
document.getElementById('user-profile-btn').addEventListener('click', () => {
  document.getElementById('profile-username').textContent = currentUser.username;
  document.getElementById('profile-about').value = currentUser.about || '';
  document.getElementById('profile-modal').style.display = 'flex';
});

document.getElementById('close-profile-btn').addEventListener('click', () => {
  document.getElementById('profile-modal').style.display = 'none';
});

document.getElementById('save-profile-btn').addEventListener('click', () => {
  const about = document.getElementById('profile-about').value.trim();
  currentUser.about = about;

  const users = getUsers();
  users[currentUser.username].about = about;
  saveUsers(users);

  document.getElementById('profile-modal').style.display = 'none';
});

document.getElementById('logout-btn').addEventListener('click', logoutUser);

// ============ MARKDOWN ============
function markdownToHtml(text) {
  let html = text;
  
  html = html.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&#039;');
  
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    lang = lang || 'plaintext';
    const escapedCode = code.trim();
    return `<pre><code class="language-${lang}">${escapedCode}</code></pre>`;
  });
  
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');
  html = html.replace(/\n/g, '<br>');
  
  return html;
}

function renderBubble(text, side) {
  const box = document.getElementById('chat-box');
  
  const wrapper = document.createElement('div');
  wrapper.className = `message-wrapper ${side === 'right' ? 'user' : 'ai'}`;
  
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  
  const html = markdownToHtml(text);
  bubble.innerHTML = html;
  
  bubble.querySelectorAll('pre code').forEach(block => {
    hljs.highlightElement(block);
  });
  
  wrapper.appendChild(bubble);
  box.appendChild(wrapper);
  box.scrollTop = box.scrollHeight;
}

// ============ CHAT ============
function loadUserChats() {
  const users = getUsers();
  const userData = users[currentUser.username];
  currentUser.chats = userData.chats || {};
  refreshChatList();
}

function refreshChatList() {
  const list = document.getElementById('chat-list');
  list.innerHTML = '';

  Object.entries(currentUser.chats || {}).forEach(([cid, chat]) => {
    const row = document.createElement('div');
    row.className = "chat-row";

    const title = document.createElement('button');
    title.textContent = chat.title;
    title.className = currentChatId === cid ? 'active' : '';
    title.onclick = () => loadChat(cid);

    const del = document.createElement('button');
    del.textContent = "🗑";
    del.className = "delete-btn";

    del.onclick = (e) => {
      e.stopPropagation();

      if (confirm('Delete this chat?')) {
        delete currentUser.chats[cid];
        saveUserData();

        if (currentChatId === cid) {
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

function saveUserData() {
  const users = getUsers();
  users[currentUser.username].chats = currentUser.chats;
  users[currentUser.username].about = currentUser.about;
  saveUsers(users);
}

function newChat() {
  const chat_id = 'chat_' + Date.now();
  currentChatId = chat_id;
  selectedFile = null;
  document.getElementById('file-preview').classList.remove('show');
  document.getElementById('file-preview').innerHTML = '';
  currentUser.chats[chat_id] = {
    title: "New Chat",
    messages: []
  };
  saveUserData();

  const box = document.getElementById('chat-box');
  box.innerHTML = '';
  document.getElementById('chat-title').textContent = 'New Chat';
  refreshChatList();

  // Show centered welcome placeholder with randomized greetings
  const phrases = [
    'Nice to meet you {{username}}',
    'Hi {{username}}',
    'Hello {{username}}, how can I help today?',
    'Hey {{username}} — tell me what you need'
  ];

  const name = currentUser && currentUser.username ? currentUser.username : '';
  const pick = phrases[Math.floor(Math.random() * phrases.length)].replace('{{username}}', name);

  const placeholder = document.createElement('div');
  placeholder.className = 'welcome-placeholder';
  placeholder.innerHTML = `
    <div class="bob-title">Bob</div>
    <div class="greeting">${pick}</div>
  `;

  box.appendChild(placeholder);
}

function loadChat(id) {
  currentChatId = id;
  selectedFile = null;
  document.getElementById('file-preview').classList.remove('show');
  document.getElementById('file-preview').innerHTML = '';

  const box = document.getElementById('chat-box');
  box.innerHTML = '';

  const chat = currentUser.chats[id];
  if (!chat) return;

  document.getElementById('chat-title').textContent = chat.title;

  chat.messages.forEach(m => {
    if (m.role === "user") {
      renderBubble(m.content, "right");
    } else if (m.role === "assistant") {
      renderBubble(m.content, "left");
    }
  });

  refreshChatList();
}

async function sendMessage() {
  const input = document.getElementById('user-input');
  const msg = input.value.trim();

  if (!msg && !selectedFile) return;

  if (!currentChatId) {
    newChat();
  }

  // If a welcome placeholder exists, remove it before showing messages
  const box = document.getElementById('chat-box');
  const ph = box.querySelector('.welcome-placeholder');
  if (ph) ph.remove();

  // Preserve the file reference before we clear it
  const fileToSend = selectedFile;

  // Render user bubble (message or file placeholder)
  renderBubble(msg || (fileToSend ? `📎 ${fileToSend.name}` : ''), 'right');
  input.value = '';

  const chat = currentUser.chats[currentChatId];

  chat.messages.push({
    role: "user",
    content: msg || (fileToSend ? `📎 ${fileToSend.name}` : '')
  });

  const formData = new FormData();
  formData.append('message', msg);
  formData.append('username', currentUser.username);
  formData.append('about', currentUser.about || '');

  if (fileToSend) {
    formData.append('file', fileToSend);
  }

  // Now clear selection and preview
  selectedFile = null;
  document.getElementById('file-preview').classList.remove('show');
  document.getElementById('file-preview').innerHTML = '';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.error) {
      renderBubble('Error: ' + data.error, 'left');
      return;
    }

    chat.messages.push({
      role: "assistant",
      content: data.reply
    });

    renderBubble(data.reply, 'left');

    if (chat.title === "New Chat") {
      chat.title = generateTitle(msg);
      document.getElementById('chat-title').textContent = chat.title;
    }

    saveUserData();
    refreshChatList();
  } catch (err) {
    renderBubble('Connection error: ' + err.message, 'left');
  }
}

function generateTitle(msg) {
  const words = msg.split(' ').slice(0, 5).join(' ');
  return words || "Chat";
}

// ============ FILE UPLOAD ============
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

// ============ INIT ============
document.getElementById('send-btn').onclick = sendMessage;
document.getElementById('new-chat-btn').onclick = newChat;

document.getElementById('user-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

document.getElementById('toggle-sidebar').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
});

const savedUser = localStorage.getItem('bob_current_user');
if (savedUser) {
  const users = getUsers();
  if (users[savedUser]) {
    loginUser(savedUser, users[savedUser]);
  } else {
    localStorage.removeItem('bob_current_user');
  }
}
