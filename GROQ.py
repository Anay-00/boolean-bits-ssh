import os
from flask import Flask, request, jsonify, send_from_directory
from groq import Groq
from dotenv import load_dotenv

# --------------------------------------------------
# Load Environment Variables
# --------------------------------------------------
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama3-8b-8192")

client = Groq(api_key=GROQ_API_KEY)

# --------------------------------------------------
# Flask App
# --------------------------------------------------
app = Flask(__name__)

# --------------------------------------------------
# In-Memory Conversation History
# --------------------------------------------------
conversation_history = [
    {
        "role": "system",
        "content": "You are a helpful AI assistant. Answer clearly and politely."
    }
]

MAX_HISTORY_MESSAGES = 15  # prevent token overflow

# --------------------------------------------------
# Routes
# --------------------------------------------------
@app.route('/')
def index():
    return send_from_directory('.', 'GROQ index.html')


@app.route('/chat', methods=['POST'])
def chat():
    global conversation_history

    data = request.get_json()
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"reply": "Please enter a message."})

    print(f"[DEBUG] User: {user_message}")

    # 1️⃣ Add user message to history
    conversation_history.append({
        "role": "user",
        "content": user_message
    })

    # 2️⃣ Trim old messages (keep system + recent)
    if len(conversation_history) > MAX_HISTORY_MESSAGES:
        conversation_history = (
            conversation_history[:1] +
            conversation_history[-(MAX_HISTORY_MESSAGES - 1):]
        )

    # 3️⃣ Call Groq with full history
    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=conversation_history,
        temperature=1,
        max_completion_tokens=1024,
        top_p=1,
        stream=True
    )

    reply = ""

    # 4️⃣ Stream response
    for chunk in completion:
        if (
            chunk.choices
            and chunk.choices[0].delta
            and chunk.choices[0].delta.content
        ):
            reply += chunk.choices[0].delta.content

    print(f"[DEBUG] Assistant: {reply}")

    # 5️⃣ Save assistant reply to history
    conversation_history.append({
        "role": "assistant",
        "content": reply
    })

    return jsonify({"reply": reply})


# --------------------------------------------------
# Run App (Windows-safe)
# --------------------------------------------------
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
        use_reloader=False  # 🔥 FIXES YOUR ERROR
    )