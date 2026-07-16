import traceback
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("")
async def get_progress():
    """VERSI DETEKTIF: ambil sedikit data + tampilkan error kalau ada."""
    debug = {"step": "start"}
    try:
        debug["step"] = "import supabase client"
        from backend.database.supabase import supabase

        debug["step"] = "query sessions (limit 5)"
        sess_resp = supabase.table("sessions").select("*").limit(5).execute()
        sessions = sess_resp.data or []
        debug["sessions_count"] = len(sessions)

        debug["step"] = "query messages (limit 5)"
        msg_resp = (
            supabase.table("messages").select("session_id, role").limit(5).execute()
        )
        messages = msg_resp.data or []
        debug["messages_count"] = len(messages)

        return {
            "ok": True,
            "debug": debug,
            "sample_sessions": sessions,
            "sample_messages": messages,
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
