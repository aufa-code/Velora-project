import os
from dotenv import load_dotenv
from groq import Groq, GroqError, APIConnectionError, APITimeoutError

# Load environment variables dari file .env
load_dotenv()

# Ambil API key dari .env
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Validasi pastikan API key tersedia sebelum inisialisasi client
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY tidak ditemukan di environment variables / file .env")

# Inisialisasi Groq client
client = Groq(api_key=GROQ_API_KEY)


def get_ai_response(payload: list) -> str:
    """
    Mengirimkan payload berupa list of messages ke Groq API 
    dan mengembalikan response berupa teks.
    
    :param payload: List of dict messages hasil dari fungsi build_final_prompt()
                    Contoh: [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}]
    :return: String teks response dari AI atau pesan error jika terjadi masalah
    """
    try:
        # Memanggil Groq Chat Completion dengan langsung memasukkan payload ke messages
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=payload,
            temperature=0.7, 
        )
        
        # Mengambil string teks konten saja dari objek response
        return completion.choices[0].message.content

    except APITimeoutError:
        # Handle error jika request timeout
        return "Error: Koneksi ke Groq API kehabisan waktu (Timeout). Silakan coba lagi."
        
    except APIConnectionError:
        # Handle error jika gagal terhubung ke server Groq
        return "Error: Gagal terhubung ke server Groq API. Periksa koneksi internet Anda."
        
    except GroqError as e:
        # Handle error spesifik dari Groq (misal: API key salah, rate limit, dll)
        return f"Groq API Error: {str(e)}"
        
    except Exception as e:
        # Catch-all untuk error tidak terduga lainnya
        return f"Terjadi kesalahan sistem yang tidak terduga: {str(e)}"