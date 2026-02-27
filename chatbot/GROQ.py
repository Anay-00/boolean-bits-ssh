import os
from flask import Flask, request, jsonify, send_from_directory
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL")

client = Groq(api_key=GROQ_API_KEY)

app = Flask(__name__)
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    print(f"[DEBUG] Received user message: {user_message}")
    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "user",
                "content": user_message
            }
        ],
        temperature=1,
        max_completion_tokens=1024,
        top_p=1,
        stream=True,
        stop=None
    )
    reply = ""
    for chunk in completion:
        print(f"[DEBUG] Chunk: {chunk}")
        # Extract content from each chunk
        if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
            reply += chunk.choices[0].delta.content
    print(f"[DEBUG] Final reply: {reply}")
    return jsonify({"reply": reply})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
