import traceback
from datetime import datetime, timezone, timedelta
from collections import defaultdict
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from backend.database.supabase import get_all_sessions

router = APIRouter(prefix="/reviews", tags=["Spaced Repetition"])

# Interval review (hari) berdasarkan berapa kali topik sudah dipelajari (repetisi).
# Makin sering dipelajari, jeda review makin panjang -> lawan kurva lupa.
INTERVAL_HARI = {1: 1, 2: 3, 3: 7, 4: 14}
INTERVAL_MAX = 30


def _parse_dt(s):
    """Parse timestamp ISO dari Supabase jadi datetime aware (UTC)."""
    if not s:
        return None
    try:
        s2 = str(s).replace("Z", "+00:00")
        dt = datetime.fromisoformat(s2)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None


@router.get("/due")
async def get_due_reviews():
    """Jadwal spaced repetition per topik, dihitung dari riwayat sesi belajar."""
    try:
        sessions = get_all_sessions()

        by_topic = defaultdict(list)
        for s in sessions:
            materi = (s.get("materi") or "").strip()
            if not materi:
                continue
            dt = _parse_dt(s.get("created_at"))
            if dt:
                by_topic[materi].append(dt)

        now = datetime.now(timezone.utc)
        hasil = []
        for materi, dates in by_topic.items():
            reps = len(dates)
            last = max(dates)
            interval = INTERVAL_HARI.get(reps, INTERVAL_MAX)
            next_review = last + timedelta(days=interval)
            sisa_hari = (next_review.date() - now.date()).days
            hasil.append({
                "materi": materi,
                "repetisi": reps,
                "terakhir_belajar": last.isoformat(),
                "next_review": next_review.isoformat(),
                "interval_hari": interval,
                "sisa_hari": sisa_hari,
                "due": sisa_hari <= 0,
            })

        hasil.sort(key=lambda x: x["sisa_hari"])
        due = [h for h in hasil if h["due"]]
        upcoming = [h for h in hasil if not h["due"]]

        return {
            "total_topik": len(hasil),
            "due_count": len(due),
            "due": due,
            "upcoming": upcoming,
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
