# backend/services/prompt.py

def build_system_prompt() -> str:
    """
    Menghasilkan instruksi utama sistem yang mengatur persona, aturan pedagogi,
    dan mekanisme transisi fase belajar AI Velora dalam bahasa Indonesia yang konsisten.
    """
    return (
    "Kamu adalah Velora, fasilitator belajar AI. "
    "Gaya bicaramu: santai, singkat, langsung ke poin — seperti teman sebaya yang cerdas, bukan dosen.\n\n"
    
    "ATURAN UTAMA:\n"
    "1. JANGAN mulai pesan dengan 'Halo' jika percakapan sudah berjalan.\n"
    "2. Satu pesan = satu ide. Maksimal 3-4 kalimat per respon.\n"
    "3. Jangan spoon-feed — pancing user berpikir sendiri dengan satu pertanyaan tajam di akhir.\n"
    "4. Ingat semua jawaban user sebelumnya dan lanjutkan dari situ — jangan mulai ulang.\n\n"
    
    "FASE BELAJAR (RAHASIA):\n"
    "- FASE 1: Jelasin konsep bertahap pakai universe yang dipilih. Singkat, maksimal 3 kalimat.\n"
    "- FASE 2: Setelah user nunjukin mereka ngerti dasarnya, switch natural ke diskusi — tanya balik, tantang pemahaman mereka.\n"
    "- Transisi harus natural, JANGAN bilang 'kita masuk fase 2'.\n\n"
    
    "GAYA BAHASA: Bahasa Indonesia santai. Boleh pakai 'kamu', 'aku'. Hindari kata formal seperti 'Anda'."
    )


def build_context_prompt(materi: str, tujuan: str, metode: str, universe: str = None) -> str:
    """
    Menyuntikkan metadata sesi (materi, tujuan, metode, dan universe) 
    ke dalam prompt dengan fallback instruksi yang aman jika input tujuan di luar opsi standar.
    """
    # Pemetaan tujuan belajar ke instruksi internal yang baku
    tujuan_map = {
        "ujian": "fokus pada pemahaman konsep kunci, rumus/teori penting, dan kesiapan menjawab soal.",
        "ngerti dalam": "fokus pada prinsip pertama (first principles), mekanisme mendasar, dan penalaran mengapa sesuatu terjadi.",
        "jelasin ke orang lain": "fokus pada teknik Feynman, penyederhanaan bahasa, analogi sederhana, dan kemampuan menstrukturkan penjelasan."
    }
    
    # Penerapan Catatan 1: Jika tidak cocok dengan opsi, gunakan fallback aman berbasis materi
    tujuan_desc = tujuan_map.get(
        tujuan.lower(), 
        f"memahami {materi} secara menyeluruh sesuai kebutuhan user."
    )
    
    context = (
        f"--- KONTEKS SESI BELAJAR ---\n"
        f"Materi yang Dipelajari: {materi}\n"
        f"Tujuan Belajar: User ingin {tujuan_desc}\n"
        f"Metode Belajar: {metode}\n"
    )
    
    # Jika user memilih menggunakan universe/karakter favorit
    if universe and universe.strip():
        context += (
            f"Sistem Semesta/Karakter (Universe): {universe}\n"
            f"INSTRUKSI SEMESTA BERKELANJUTAN:\n"
            f"- Anda WAJIB membungkus seluruh penjelasan, analogi, studi kasus, dan gaya bicara menggunakan elemen dari semesta '{universe}' secara konsisten.\n"
            f"- Gunakan latar cerita, istilah, atau analogi karakter dari semesta tersebut untuk menjelaskan konsep {materi}.\n"
            f"- JANGAN keluar dari ranah semesta ini sampai sesi selesai.\n"
        )
    else:
        context += "Sistem Semesta: Tidak menggunakan semesta khusus. Gunakan analogi dunia nyata yang relevan dan menarik.\n"
        
    context += "----------------------------\n"
    return context


def build_conversation_history(messages: list) -> list:
    """
    Memformat ulang riwayat pesan dari database/frontend ke format yang dikenali oleh Groq API.
    Menerima list of dict dengan key 'role' (user/assistant) dan 'content'.
    """
    formatted_history = []
    for msg in messages:
        formatted_history.append({
            "role": msg.get("role"),
            "content": msg.get("content")
        })
    return formatted_history


def build_final_prompt(materi: str, tujuan: str, metode: str, messages: list, universe: str = None) -> list:
    """
    Menggabungkan seluruh layer (System Prompt, Context, dan History) 
    menjadi satu payload prompt final yang siap ditembak ke Groq API.
    """
    # 1. Gabungkan instruksi utama sistem dan konteks spesifik sesi
    system_content = build_system_prompt()
    context_content = build_context_prompt(materi, tujuan, metode, universe)
    full_system_instruction = f"{system_content}\n\n{context_content}"
    
    payload = [
        {
            "role": "system",
            "content": full_system_instruction
        }
    ]
    
    # 2. Masukkan riwayat percakapan lengkap tanpa ringkasan
    history = build_conversation_history(messages)
    payload.extend(history)
    
    return payload