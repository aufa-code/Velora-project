import os
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY tidak ditemukan di environment variables")

def get_ai_response(payload: list) -> str:
    try:
        response = requests.post(
            url="https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openai/gpt-oss-120b",
                "messages": payload,
                "temperature": 0.3,
            }
        )
        data = response.json()
        if "choices" not in data:
            return f"Error dari Groq: {data}"
        return data["choices"][0]["message"]["content"]

    except Exception as e:
        return f"Terjadi kesalahan sistem: {str(e)}"
    # Using GPT-OSS 120B via Groq
