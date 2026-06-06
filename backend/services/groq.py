import os
from dotenv import load_dotenv
from groq import Groq, GroqError, APIConnectionError, APITimeoutError

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY tidak ditemukan di environment variables / file .env")

client = Groq(api_key=GROQ_API_KEY)

def get_ai_response(payload: list) -> str:
    try:
        completion = client.chat.completions.create(
            model="gemma2-9b-it",
            messages=payload,
            temperature=0.3,
        )
        return completion.choices[0].message.content

    except APITimeoutError:
        return "Error: Koneksi ke Groq API kehabisan waktu (Timeout). Silakan coba lagi."
    except APIConnectionError:
        return "Error: Gagal terhubung ke server Groq API. Periksa koneksi internet Anda."
    except GroqError as e:
        return f"Groq API Error: {str(e)}"
    except Exception as e:
        return f"Terjadi kesalahan sistem yang tidak terduga: {str(e)}"