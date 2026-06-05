import os
from pathlib import Path
from dotenv import load_dotenv
from typing import Dict, List, Any, Optional
from supabase import create_client, Client
from postgrest.exceptions import APIError

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

# Load environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL dan SUPABASE_KEY harus diatur di environment variables.")

# Inisialisasi Supabase Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def create_session(materi: str, tujuan: str, metode: str, universe: str) -> Optional[str]:
    """
    Membuat sesi belajar baru di tabel 'sessions'.
    Mengembalikan session_id (str) jika berhasil, atau None jika gagal.
    """
    try:
        data = {
            "materi": materi,
            "tujuan": tujuan,
            "metode": metode,
            "universe": universe
        }
        response = supabase.table("sessions").insert(data).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0].get("id")
        return None
    except APIError as e:
        print(f"Error saat create_session: {e.message}")
        return None
    except Exception as e:
        print(f"Unexpected error saat create_session: {e}")
        return None


def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    """
    Mengambil data sesi belajar berdasarkan session_id dari tabel 'sessions'.
    Mengembalikan dictionary data sesi, atau None jika tidak ditemukan/gagal.
    """
    try:
        response = supabase.table("sessions").select("*").eq("id", session_id).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except APIError as e:
        print(f"Error saat get_session: {e.message}")
        return None
    except Exception as e:
        print(f"Unexpected error saat get_session: {e}")
        return None


def save_message(session_id: str, role: str, content: str) -> Optional[Dict[str, Any]]:
    """
    Menyimpan satu pesan baru ke tabel 'messages'.
    Mengembalikan data pesan yang disimpan, atau None jika gagal.
    """
    try:
        data = {
            "session_id": session_id,
            "role": role,
            "content": content
        }
        response = supabase.table("messages").insert(data).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except APIError as e:
        print(f"Error saat save_message: {e.message}")
        return None
    except Exception as e:
        print(f"Unexpected error saat save_message: {e}")
        return None


def get_messages(session_id: str) -> List[Dict[str, Any]]:
    """
    Mengambil semua pesan berdasarkan session_id dari tabel 'messages',
    diurutkan dari yang paling lama (kronologis berdasarkan created_at).
    Mengembalikan list dari dictionary pesan.
    """
    try:
        response = (
            supabase.table("messages")
            .select("*")
            .eq("session_id", session_id)
            .order("created_at", ascending=True)
            .execute()
        )
        return response.data if response.data else []
    except APIError as e:
        print(f"Error saat get_messages: {e.message}")
        return []
    except Exception as e:
        print(f"Unexpected error saat get_messages: {e}")
        return []