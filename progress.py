import traceback
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from collections import defaultdict

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("")
async def get_progress():
    """VERSI DEBUG: kalau ada error, tampilkan detailnya langsung di response."""
    debug = {"step": "start"}
    try:
        debug["step"] = "import supabase"
        from backend.database.supabase import get_all_sessions, get_all_messages

        debug["step"] = "get_all_sessions()"
        sessions = get_all_sessions()
        debug["sessions_count"] = len(sessions)

        debug["step"] = "get_all_messages()"
        messages = get_all_messages()
        debug["messages_count"] = len(messages)

        debug["step"] = "aggregate"
        total_per_sesi = defaultdict(int)
        tanya_per_sesi = defaultdict(int)
        for m in messages:
            sid = m.get("session_id")
            total_per_sesi[sid] += 1
            if m.get("role") == "user":
                tanya_per_sesi[sid] += 1

        debug["step"] = "build hasil"
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
            status_code=200,
            content={
                "DEBUG_ERROR": str(e),
                "type": type(e).__name__,
                "last_step": debug,
                "trace": traceback.format_exc(),
            },
        )
