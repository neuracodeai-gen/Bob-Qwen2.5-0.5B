# app.py
from flask import Flask, render_template, request, jsonify
import uuid
import ollama
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

# File upload configuration
UPLOAD_FOLDER = 'uploads'
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx', 'py', 'js', 'java', 'cpp', 'c', 'md', 'json', 'xml', 'csv', 'log', 'html', 'css'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

MODEL = "qwen2.5:0.5b"
CONTEXT_WINDOW = 8

SYSTEM_PROMPT = {
    "role": "system",
    "content": "You are a friendly AI assistant named Bob. You provide helpful, accurate, and concise answers. When showing code, use proper markdown code blocks with language specification. Format your responses clearly with proper markdown."
}

def get_system_prompt(username="", about=""):
    base = "You are a friendly AI assistant named Bob. You provide helpful, accurate, and concise answers. When showing code, use proper markdown code blocks with language specification. Format your responses clearly with proper markdown."
    
    if username:
        base += f"\n\nUser: {username}"
    if about:
        base += f"\nAbout the user: {about}"
    
    return {
        "role": "system",
        "content": base
    }

def generate_title(first_user_message):
    prompt = [
        {
            "role": "system",
            "content": "Generate a very short chat title (max 5 words). No quotes."
        },
        {
            "role": "user",
            "content": first_user_message
        }
    ]

    res = ollama.chat(model=MODEL, messages=prompt)

    return res["message"]["content"].strip()

def allowed_file(filename):
    # Accept all files for local/offline usage; server will attempt to read text
    # and fall back to attaching filename when binary/unreadable.
    return True

# chat_id -> { title: str, messages: [] }
chats = {}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/chats")
def list_chats():
    return jsonify([
        {"id": cid, "title": chats[cid]["title"]}
        for cid in chats
    ])

@app.route("/api/new_chat", methods=["POST"])
def new_chat():
    chat_id = str(uuid.uuid4())
    chats[chat_id] = {
        "title": "New Chat",
        "messages": [SYSTEM_PROMPT]
    }
    return jsonify({"chat_id": chat_id})

@app.route("/api/chat", methods=["POST"])
def chat():
    msg = request.form.get("message", "")
    username = request.form.get("username", "")
    about = request.form.get("about", "")
    
    # Handle file upload
    file_content = ""
    if 'file' in request.files:
        file = request.files['file']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{username}_{filename}")
            file.save(filepath)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    file_content = f.read()[:5000]
                msg += f"\n\n[Attached file: {filename}]\n{file_content}"
            except:
                msg += f"\n\n[Attached file: {filename}]"

    if not msg:
        return jsonify({"error": "No message provided"}), 400

    messages = [get_system_prompt(username, about)]
    
    response = ollama.chat(
        model=MODEL,
        messages=messages + [{"role": "user", "content": msg}]
    )

    ai_msg = response["message"]["content"]
    return jsonify({"reply": ai_msg})

@app.route("/api/generate_title", methods=["POST"])
def generate_title_endpoint():
    data = request.json
    msg = data.get("message", "")
    
    prompt = [
        {
            "role": "system",
            "content": "Generate a very short chat title (max 5 words). No quotes."
        },
        {
            "role": "user",
            "content": msg
        }
    ]

    res = ollama.chat(model=MODEL, messages=prompt)
    return jsonify({"title": res["message"]["content"].strip()})

@app.route("/api/chat/<chat_id>")
def get_chat(chat_id):
    if chat_id not in chats:
        return jsonify({"error": "Chat not found"}), 404
    return jsonify({
        "messages": chats[chat_id]["messages"]
    })

@app.route("/api/delete_chat/<chat_id>", methods=["DELETE"])
def delete_chat(chat_id):
    if chat_id in chats:
        del chats[chat_id]
        return jsonify({"success": True})
    return jsonify({"error": "Chat not found"}), 404

if __name__ == "__main__":
    app.run(debug=True)

