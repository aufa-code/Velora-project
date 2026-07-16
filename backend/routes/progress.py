import traceback
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from collections import defaultdict
from backend.database.supabase import get_all_sessions, get_all_messages

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("")
async def get_progress():
    """Ringkasan progress belajar: daftar sesi + jumlah interaksi tiap sesi."""
    try:
        sessions = get_all_sessions()
        messages = get_all_messages()

        # Hitung jumlah pesan per sesi sekali jalan (tanpa query berulang)
        total_per_sesi = defaultdict(int)
        tanya_per_sesi = defaultdict(int)
        for m in messages:
            sid = m.get("session_id")
            total_per_sesi[sid] += 1
            if m.get("role") == "user":
                tanya_per_sesi[sid] += 1

        hasil = []
        for s in sessions:
            sid = s.get("id")
            hasil.append({
                "id": sid,
                "materi": s.get("materi"),
                "tujuan": s.get("tujuan"),
                "metode": s.get("metode"),
                "universe": s.get("universe"),
                "created_at": s.get("created_at"),
                "jumlah_pesan": total_per_sesi.get(sid, 0),
                "jumlah_tanya": tanya_per_sesi.get(sid, 0),
            })

        return {
            "total_sesi": len(sessions),
            "total_pesan": len(messages),
            "sessions": hasil,
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "error": str(e),
                "type": type(e).__name__,
                "trace": traceback.format_exc(),
            },
        )
