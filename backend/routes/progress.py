from fastapi import APIRouter
from backend.database.supabase import get_all_sessions, get_messages

router = APIRouter(prefix="/progress", tags=["Progress"])

@router.get("")
async def get_progress():
    """
    Ringkasan progress belajar: daftar sesi + jumlah interaksi tiap sesi.
    """
    sessions = get_all_sessions()
    hasil = []
    total_pesan = 0

    for s in sessions:
        messages = get_messages(s["id"])
        jumlah_tanya = len([m for m in messages if m.get("role") == "user"])
        total_pesan += len(messages)
        hasil.append({
            "id": s.get("id"),
            "materi": s.get("materi"),
            "tujuan": s.get("tujuan"),
            "metode": s.get("metode"),
            "universe": s.get("universe"),
            "created_at": s.get("created_at"),
            "jumlah_pesan": len(messages),
            "jumlah_tanya": jumlah_tanya,
        })

    return {
        "total_sesi": len(sessions),
        "total_pesan": total_pesan,
        "sessions": hasil,
    }
