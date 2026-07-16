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
    """Membuat sesi belajar baru di tabel 'sessions'. Return session_id atau None."""
    try:
        data = {
            "materi": materi,
            "tujuan": tujuan,
            "metode": metode,
            "universe": universe,
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
    """Mengambil data sesi belajar berdasarkan session_id."""
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
    """Menyimpan satu pesan baru ke tabel 'messages'."""
    try:
        data = {
            "session_id": session_id,
            "role": role,
            "content": content,
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
    """Mengambil semua pesan berdasarkan session_id, urut kronologis (lama -> baru)."""
    try:
        response = (
            supabase.table("messages")
            .select("*")
            .eq("session_id", session_id)
            .order("created_at", desc=False)
            .execute()
        )
        return response.data if response.data else []
    except APIError as e:
        print(f"Error saat get_messages: {e.message}")
        return []
    except Exception as e:
        print(f"Unexpected error saat get_messages: {e}")
        return []


def get_all_sessions() -> List[Dict[str, Any]]:
    """Mengambil semua sesi belajar, urut dari yang terbaru."""
    try:
        response = (
            supabase.table("sessions")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        return response.data if response.data else []
    except APIError as e:
        print(f"Error saat get_all_sessions: {e.message}")
        return []
    except Exception as e:
        print(f"Unexpected error saat get_all_sessions: {e}")
        return []


def get_all_messages() -> List[Dict[str, Any]]:
    """Ambil semua pesan (session_id & role) dalam SATU query."""
    try:
        response = (
            supabase.table("messages")
            .select("session_id, role")
            .execute()
        )
        return response.data if response.data else []
    except Exception as e:
        print(f"Unexpected error saat get_all_messages: {e}")
        return []
