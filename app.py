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

def analyze_file_content(file):
    """Extract and describe file content for the bot to analyze."""
    if not file or not file.filename:
        return None
    
    filename = secure_filename(file.filename)
    file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'unknown'
    
    try:
        # Try to read as text
        file_bytes = file.read()
        file.seek(0)  # Reset file pointer
        
        try:
            content = file_bytes.decode('utf-8')
        except:
            content = f"[Binary file - {file_ext}]"
        
        # Limit to first 3000 chars for context
        if len(content) > 3000:
            content = content[:3000] + "\n... (truncated)"
        
        return {
            "filename": filename,
            "extension": file_ext,
            "content": content,
            "size": len(file_bytes)
        }
    except Exception as e:
        return {
            "filename": filename,
            "extension": file_ext,
            "content": f"[Could not read file: {str(e)}]",
            "size": 0
        }

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

@app.route("/api/analyze_file", methods=["POST"])
def analyze_file():
    """Analyze and describe an uploaded file."""
    if 'file' not in request.files:
        print("ERROR: No file in request")
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    print(f"Received file: {file.filename}")
    
    analysis = analyze_file_content(file)
    
    if analysis is None:
        print("ERROR: Analysis returned None")
        return jsonify({"error": "Invalid file"}), 400
    
    print(f"Analysis complete: {analysis['filename']} ({analysis['extension']})")
    return jsonify(analysis)

@app.route("/api/chat", methods=["POST"])
def chat():
    msg = request.form.get("message", "")
    username = request.form.get("username", "")
    about = request.form.get("about", "")
    file_analysis = request.form.get("file_analysis", "")
    
    print(f"Chat request - User: {username}, Message: {msg[:50] if msg else 'EMPTY'}, File Analysis: {'YES' if file_analysis else 'NO'}")
    
    # Include file analysis in the message if provided
    if file_analysis:
        msg += f"\n\n{file_analysis}"
        print(f"File analysis appended to message, total length: {len(msg)}")

    if not msg:
        print("ERROR: Empty message")
        return jsonify({"error": "No message provided"}), 400

    messages = [get_system_prompt(username, about)]
    
    print(f"Calling Ollama with {len(messages) + 1} messages")
    response = ollama.chat(
        model=MODEL,
        messages=messages + [{"role": "user", "content": msg}]
    )

    ai_msg = response["message"]["content"]
    print(f"Ollama response received, length: {len(ai_msg)}")
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

