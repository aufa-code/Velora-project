import os
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY tidak ditemukan di environment variables")

def get_ai_response(payload: list) -> str:
    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "google/gemini-2.0-flash-exp:free",
                "messages": payload,
                "temperature": 0.3,
            }
        )
        data = response.json()
        if "choices" not in data:
            return f"Error dari OpenRouter: {data}"
        return data["choices"][0]["message"]["content"]

    except Exception as e:
        return f"Terjadi kesalahan sistem: {str(e)}"