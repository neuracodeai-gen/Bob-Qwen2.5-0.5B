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
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
    data = request.form if request.files else request.json
    chat_id = data.get("chat_id")
    user_msg = data.get("message", "")
    
    # Handle file upload
    file_content = ""
    if 'file' in request.files:
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{chat_id}_{filename}")
            file.save(filepath)
            
            # Read file content for context
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    file_content = f.read()[:5000]  # Limit to 5000 chars
                user_msg += f"\n\n[Attached file: {filename}]\n{file_content}"
            except:
                user_msg += f"\n\n[Attached file: {filename}]"

    if not user_msg:
        return jsonify({"error": "No message or file provided"}), 400

    chat = chats.get(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404

    chat["messages"].append({
        "role": "user",
        "content": user_msg
    })

    chat["messages"] = chat["messages"][-CONTEXT_WINDOW:]

    response = ollama.chat(
        model=MODEL,
        messages=chat["messages"]
    )

    ai_msg = response["message"]["content"]

    chat["messages"].append({
        "role": "assistant",
        "content": ai_msg
    })

    # ---- generate title once ----
    if chat["title"] == "New Chat":
        chat["title"] = generate_title(user_msg)

    return jsonify({"reply": ai_msg})

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

