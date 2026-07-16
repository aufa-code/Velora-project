import traceback
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from backend.database.supabase import supabase

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("")
async def get_progress():
    """Ringkasan progress belajar. Versi CEPAT: total dihitung langsung di
    database (count), jadi aman walau pesannya ribuan."""
    try:
        # 1) Total sesi & total pesan -> dihitung di DB, tanpa narik semua baris
        sesi_count = (
            supabase.table("sessions").select("id", count="exact").limit(1).execute()
        )
        pesan_count = (
            supabase.table("messages").select("id", count="exact").limit(1).execute()
        )
        total_sesi = sesi_count.count or 0
        total_pesan = pesan_count.count or 0

        # 2) Daftar sesi (dibatasi 200 biar aman & cepat)
        sessions_resp = (
            supabase.table("sessions")
            .select("*")
            .order("created_at", ascending=False)
            .limit(200)
            .execute()
        )
        sessions = sessions_resp.data or []

        hasil = []
        for s in sessions:
            hasil.append({
                "id": s.get("id"),
                "materi": s.get("materi"),
                "tujuan": s.get("tujuan"),
                "metode": s.get("metode"),
                "universe": s.get("universe"),
                "created_at": s.get("created_at"),
            })

        return {
            "total_sesi": total_sesi,
            "total_pesan": total_pesan,
            "jumlah_sesi_ditampilkan": len(hasil),
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
