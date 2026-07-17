import json
import re
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

from backend.database.supabase import get_session
from backend.services.groq import get_ai_response

router = APIRouter(prefix="/quiz", tags=["Quiz & Flashcard"])

# ---------- Pydantic Schemas ----------
class QuizGenerateRequest(BaseModel):
    session_id: Optional[str] = None
    materi: Optional[str] = None
    jumlah: int = 5
    level: Optional[str] = "sedang"

class FlashcardRequest(BaseModel):
    session_id: Optional[str] = None
    materi: Optional[str] = None
    jumlah: int = 5

# ---------- Helpers ----------
def _extract_json(text: str):
    """Ambil blok JSON pertama dari output AI, buang code-fence / teks basa-basi."""
    if not text or not text.strip():
        raise ValueError("Respon AI kosong.")
    cleaned = text.strip()

    # Buang code fence ```json ... ``` kalau ada
    fence = re.search(r"```(?:json)?\s*(.*?)```", cleaned, re.DOTALL)
    if fence:
        cleaned = fence.group(1).strip()

    # Ambil dari '[' pertama sampai ']' terakhir (array JSON)
    start = cleaned.find("[")
    end = cleaned.rfind("]")
    if start != -1 and end != -1 and end > start:
        cleaned = cleaned[start:end + 1]

    return json.loads(cleaned)

def _resolve_materi(session_id: Optional[str], materi: Optional[str]) -> str:
    """Tentukan materi dari input langsung atau dari session_id."""
    if materi and materi.strip():
        return materi.strip()
    if session_id:
        session = get_session(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Sesi belajar dengan ID {session_id} tidak ditemukan.",
            )
        materi_sesi = session.get("materi")
        if materi_sesi:
            return materi_sesi
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Wajib mengisi 'materi' atau 'session_id' yang valid.",
    )

def _clamp_jumlah(jumlah: int) -> int:
    """Batasi jumlah item 1..15 biar aman & cepat."""
    try:
        n = int(jumlah)
    except (TypeError, ValueError):
        n = 5
    return max(1, min(n, 15))

# Instruksi tingkat kesulitan (adaptive difficulty)
_LEVEL_INSTRUKSI = {
    "mudah": (
        "TINGKAT KESULITAN: MUDAH. Fokus pada definisi, istilah, dan konsep dasar. "
        "Pertanyaan langsung tanpa perhitungan rumit atau jebakan."
    ),
    "sedang": (
        "TINGKAT KESULITAN: SEDANG. Uji penerapan konsep dengan sedikit analisis "
        "atau perhitungan sederhana. Opsi jawaban cukup mirip agar menantang."
    ),
    "sulit": (
        "TINGKAT KESULITAN: SULIT. Buat soal analitis multi-langkah, studi kasus, "
        "atau perhitungan menantang. Sertakan pengecoh (distraktor) yang masuk akal."
    ),
}

def _resolve_level(level: Optional[str]) -> str:
    """Normalisasi level ke salah satu dari mudah/sedang/sulit."""
    lv = (level or "sedang").strip().lower()
    return lv if lv in _LEVEL_INSTRUKSI else "sedang"

# ---------- Endpoints ----------
@router.post("/generate")
async def generate_quiz(request: QuizGenerateRequest):
    """Generate soal pilihan ganda dari materi (langsung / dari session_id)."""
    materi = _resolve_materi(request.session_id, request.materi)
    jumlah = _clamp_jumlah(request.jumlah)
    level = _resolve_level(request.level)

    system_prompt = (
        "Kamu adalah generator soal kuis edukatif berbahasa Indonesia. "
        "Tugasmu membuat soal pilihan ganda yang menguji pemahaman konsep, bukan hafalan. "
        "Output HANYA berupa JSON array valid, tanpa teks pembuka, tanpa penutup, tanpa markdown."
    )
    user_prompt = (
        f"Buatkan {jumlah} soal pilihan ganda tentang topik: \"{materi}\".\n"
        f"{_LEVEL_INSTRUKSI[level]}\n"
        "Setiap soal WAJIB punya tepat 4 opsi jawaban dan hanya 1 yang benar.\n"
        "Balas HANYA dengan JSON array. Format tiap elemen:\n"
        "{\n"
        '  "pertanyaan": "teks pertanyaan",\n'
        '  "opsi": ["opsi A", "opsi B", "opsi C", "opsi D"],\n'
        '  "jawaban_benar": 0,\n'
        '  "penjelasan": "penjelasan singkat kenapa jawaban itu benar"\n'
        "}\n"
        "Ketentuan: 'jawaban_benar' adalah index (0-3) dari opsi yang benar. "
        "Bahasa Indonesia dan jelas."
    )

    payload = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    raw = get_ai_response(payload)

    try:
        data = _extract_json(raw)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gagal memproses soal dari AI: {str(e)}",
        )

    # Validasi & bersihkan tiap soal
    soal_valid = []
    for item in data if isinstance(data, list) else []:
        if not isinstance(item, dict):
            continue
        pertanyaan = item.get("pertanyaan")
        opsi = item.get("opsi")
        jawaban = item.get("jawaban_benar")
        if not pertanyaan or not isinstance(opsi, list) or len(opsi) != 4:
            continue
        try:
            jawaban = int(jawaban)
        except (TypeError, ValueError):
            continue
        if jawaban < 0 or jawaban > 3:
            continue
        soal_valid.append({
            "pertanyaan": str(pertanyaan),
            "opsi": [str(o) for o in opsi],
            "jawaban_benar": jawaban,
            "penjelasan": str(item.get("penjelasan", "")),
        })

    if not soal_valid:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI tidak menghasilkan soal yang valid. Coba lagi.",
        )

    return {
        "materi": materi,
        "level": level,
        "jumlah": len(soal_valid),
        "soal": soal_valid,
    }

@router.post("/flashcards")
async def generate_flashcards(request: FlashcardRequest):
    """Generate flashcard (depan/belakang) dari materi."""
    materi = _resolve_materi(request.session_id, request.materi)
    jumlah = _clamp_jumlah(request.jumlah)

    system_prompt = (
        "Kamu adalah generator flashcard belajar berbahasa Indonesia. "
        "Buat kartu hafalan ringkas: sisi depan istilah/konsep/pertanyaan, sisi belakang penjelasan singkat. "
        "Output HANYA berupa JSON array valid, tanpa teks lain, tanpa markdown."
    )
    user_prompt = (
        f"Buatkan {jumlah} flashcard tentang topik: \"{materi}\".\n"
        "Balas HANYA dengan JSON array. Format tiap elemen:\n"
        "{\n"
        '  "depan": "istilah / konsep / pertanyaan singkat",\n'
        '  "belakang": "penjelasan / jawaban ringkas dan mudah diingat"\n'
        "}\n"
        "Bahasa Indonesia, padat, dan mudah diingat."
    )

    payload = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    raw = get_ai_response(payload)

    try:
        data = _extract_json(raw)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gagal memproses flashcard dari AI: {str(e)}",
        )

    kartu_valid = []
    for item in data if isinstance(data, list) else []:
        if not isinstance(item, dict):
            continue
        depan = item.get("depan")
        belakang = item.get("belakang")
        if not depan or not belakang:
            continue
        kartu_valid.append({
            "depan": str(depan),
            "belakang": str(belakang),
        })

    if not kartu_valid:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI tidak menghasilkan flashcard yang valid. Coba lagi.",
        )

    return {
        "materi": materi,
        "jumlah": len(kartu_valid),
        "kartu": kartu_valid,
    }
