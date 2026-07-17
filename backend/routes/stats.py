import traceback
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from backend.database.supabase import get_all_sessions, get_all_messages

router = APIRouter(prefix="/stats", tags=["Gamifikasi"])

JAKARTA = timezone(timedelta(hours=7))


def _local_date(s):
    """Konversi timestamp Supabase (UTC) ke tanggal lokal Jakarta."""
    if not s:
        return None
    try:
        dt = datetime.fromisoformat(str(s).replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(JAKARTA).date()
    except Exception:
        return None


def _hitung_streak(dates_set, today):
    """Hitung streak hari berturut-turut yang ada aktivitas belajar."""
    if not dates_set:
        return 0
    if today in dates_set:
        cur = today
    elif (today - timedelta(days=1)) in dates_set:
        cur = today - timedelta(days=1)
    else:
        return 0
    streak = 0
    while cur in dates_set:
        streak += 1
        cur = cur - timedelta(days=1)
    return streak


@router.get("/gamifikasi")
async def get_gamifikasi():
    """Statistik gamifikasi (XP, level, streak, badge) dari riwayat belajar user."""
    try:
        sessions = get_all_sessions()
        try:
            messages = get_all_messages()
        except Exception:
            messages = []

        total_sesi = len(sessions)
        topik = set()
        dates = set()
        for s in sessions:
            m = (s.get("materi") or "").strip().lower()
            if m:
                topik.add(m)
            d = _local_date(s.get("created_at"))
            if d:
                dates.add(d)
        total_topik = len(topik)

        total_pesan = sum(1 for m in messages if (m.get("role") or "") == "user")
        if total_pesan == 0:
            total_pesan = len(messages)  # fallback kalau role kosong

        # ----- XP & Level -----
        xp = total_sesi * 20 + total_pesan * 3 + total_topik * 15
        xp_butuh = 150
        level = xp // xp_butuh + 1
        xp_di_level = xp % xp_butuh
        progress_persen = round(xp_di_level / xp_butuh * 100)

        # ----- Streak -----
        today = datetime.now(JAKARTA).date()
        streak = _hitung_streak(dates, today)

        # ----- Badges -----
        badges = [
            {"nama": "Langkah Pertama", "icon": "\U0001F331", "desc": "Mulai 1 sesi belajar", "unlocked": total_sesi >= 1},
            {"nama": "Konsisten", "icon": "\U0001F525", "desc": "Streak 3 hari berturut-turut", "unlocked": streak >= 3},
            {"nama": "Penjelajah", "icon": "\U0001F9ED", "desc": "Belajar 5 topik berbeda", "unlocked": total_topik >= 5},
            {"nama": "Kutu Buku", "icon": "\U0001F4DA", "desc": "Selesaikan 10 sesi belajar", "unlocked": total_sesi >= 10},
            {"nama": "Rajin Bertanya", "icon": "\U0001F4AC", "desc": "Kirim 50 pesan ke Velora", "unlocked": total_pesan >= 50},
            {"nama": "Sang Master", "icon": "\U0001F3C6", "desc": "Capai Level 5", "unlocked": level >= 5},
        ]

        return {
            "xp": xp,
            "level": level,
            "xp_di_level": xp_di_level,
            "xp_butuh_level": xp_butuh,
            "progress_persen": progress_persen,
            "streak": streak,
            "total_sesi": total_sesi,
            "total_topik": total_topik,
            "total_pesan": total_pesan,
            "badge_terbuka": sum(1 for b in badges if b["unlocked"]),
            "badges": badges,
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "type": type(e).__name__, "trace": traceback.format_exc()},
        )
