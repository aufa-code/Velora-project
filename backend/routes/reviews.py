import traceback
from datetime import datetime, timezone, timedelta
from collections import defaultdict
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from backend.database.supabase import get_all_sessions, get_messages
from backend.services.groq import get_ai_response

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


class SummaryRequest(BaseModel):
    materi: str


@router.post("/summary")
async def review_summary(req: SummaryRequest):
    """Rangkuman review sebuah topik, dibuat AI dari riwayat sesi belajar user."""
    try:
        materi = (req.materi or "").strip()
        if not materi:
            return JSONResponse(status_code=400, content={"error": "materi kosong"})

        sessions = get_all_sessions()
        matched = [
            s for s in sessions
            if (s.get("materi") or "").strip().lower() == materi.lower()
        ]

        parts = []
        for s in matched[:5]:  # batasi biar prompt nggak kepanjangan
            sid = s.get("id")
            if not sid:
                continue
            try:
                msgs = get_messages(sid)
            except Exception:
                msgs = []
            for m in msgs:
                role = m.get("role", "")
                content = (m.get("content") or "").strip()
                if content:
                    parts.append(f"{role}: {content}")

        transcript = "\n".join(parts)
        if len(transcript) > 8000:
            transcript = transcript[-8000:]  # ambil bagian paling akhir (terbaru)

        if transcript:
            user_prompt = (
                f"Topik: {materi}\n\n"
                f"Berikut riwayat percakapan belajar user:\n{transcript}\n\n"
                "Buatkan rangkuman review singkat dalam 5-8 poin bullet (awali tiap poin dengan '- ') "
                "tentang konsep penting yang sudah dipelajari. Bahasa Indonesia santai, padat, dan mudah diingat. "
                "Jangan pakai heading, langsung poin-poinnya saja."
            )
        else:
            user_prompt = (
                f"Topik: {materi}\n\n"
                "User belum punya riwayat percakapan detail. Buatkan rangkuman konsep inti topik ini "
                "dalam 5-8 poin bullet (awali tiap poin dengan '- '), bahasa Indonesia santai, padat, mudah diingat. "
                "Jangan pakai heading, langsung poin-poinnya saja."
            )

        payload = [
            {
                "role": "system",
                "content": "Kamu tutor Velora. Tugasmu bikin rangkuman review yang ringkas dan gampang diingat buat murid yang mau mengulang materi.",
            },
            {"role": "user", "content": user_prompt},
        ]
        ringkasan = get_ai_response(payload)

        return {
            "materi": materi,
            "jumlah_sesi": len(matched),
            "ringkasan": ringkasan,
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
