import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY tidak ditemukan di environment variables / file .env")

genai.configure(api_key=GEMINI_API_KEY)

def get_ai_response(payload: list) -> str:
    try:
        # Pisahkan system prompt dan history
        system_instruction = ""
        history = []
        last_user_message = ""

        for msg in payload:
            if msg["role"] == "system":
                system_instruction = msg["content"]
            elif msg["role"] == "user":
                last_user_message = msg["content"]
                if history and history[-1]["role"] == "user":
                    history.append({"role": "model", "parts": ["..."]})
                history.append({"role": "user", "parts": [msg["content"]]})
            elif msg["role"] == "assistant":
                history.append({"role": "model", "parts": [msg["content"]]})

        # Hapus pesan user terakhir dari history karena akan dikirim via send_message
        if history and history[-1]["role"] == "user":
            history = history[:-1]

        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=system_instruction
        )

        chat = model.start_chat(history=history)
        response = chat.send_message(last_user_message)
        return response.text

    except Exception as e:
        return f"Terjadi kesalahan: {str(e)}"