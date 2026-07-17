import io
import json
import re

from fastapi import APIRouter, UploadFile, File, HTTPException
from pypdf import PdfReader

from backend.services.groq import get_ai_response

router = APIRouter(prefix="/import", tags=["Import Materi"])

MAX_CHARS = 12000


def _extract_json(raw: str):
    """Ambil objek JSON pertama dari balasan AI (buang markdown/teks lain)."""
    if not raw:
        return {}
    m = re.search(r"\{.*\}", raw, re.DOTALL)
    if not m:
        return {}
    try:
        return json.loads(m.group(0))
    except Exception:
        return {}


@router.post("/pdf")
async def import_pdf(file: UploadFile = File(...)):
    """Terima file PDF, ekstrak teksnya, lalu minta AI bikin topik + ringkasan."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File harus berformat PDF.")

    try:
        data = await file.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Gagal membaca file.")

    try:
        reader = PdfReader(io.BytesIO(data))
        jumlah_halaman = len(reader.pages)
        potongan = []
        for page in reader.pages:
            potongan.append(page.extract_text() or "")
        teks = "\n".join(potongan).strip()
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"PDF tidak bisa dibaca: {e}")

    if not teks:
        raise HTTPException(
            status_code=422,
            detail="Tidak ada teks yang bisa diekstrak (kemungkinan PDF hasil scan/gambar).",
        )

    teks_potong = teks[:MAX_CHARS]

    prompt = [
        {
            "role": "system",
            "content": (
                "Kamu asisten yang merangkum materi belajar dalam Bahasa Indonesia. "
                "Balas HANYA dengan JSON valid, tanpa markdown atau teks lain."
            ),
        },
        {
            "role": "user",
            "content": (
                "Dari materi berikut, buat JSON dengan dua field:\n"
                '- "topik": judul singkat materi (3-6 kata)\n'
                '- "ringkasan": 5-7 poin inti materi, berupa satu string; '
                "tiap poin di baris baru diawali '- '.\n\n"
                f"Materi:\n{teks_potong}"
            ),
        },
    ]

    try:
        raw = get_ai_response(prompt)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI gagal merangkum: {e}")

    parsed = _extract_json(raw)
    topik_default = file.filename.rsplit(".", 1)[0]

    return {
        "nama_file": file.filename,
        "jumlah_halaman": jumlah_halaman,
        "jumlah_karakter": len(teks),
        "terpotong": len(teks) > MAX_CHARS,
        "topik": (parsed.get("topik") or topik_default).strip(),
        "ringkasan": (parsed.get("ringkasan") or "").strip(),
    }
