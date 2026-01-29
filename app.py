# app.py
from flask import Flask, render_template, request, jsonify
import uuid
import ollama

app = Flask(__name__)

MODEL = "qwen2.5:0.5b"
CONTEXT_WINDOW = 8

SYSTEM_PROMPT = {
    "role": "system",
    "content": "You are a friendly AI assistant named Bob."
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
    data = request.json
    chat_id = data["chat_id"]
    user_msg = data["message"]

    chat = chats[chat_id]

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
    return jsonify({
        "messages": chats[chat_id]["messages"]
    })

if __name__ == "__main__":
    app.run(debug=True)

