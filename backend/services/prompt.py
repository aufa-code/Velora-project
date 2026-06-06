# backend/services/prompt.py

def build_system_prompt() -> str:
    """
    Menghasilkan instruksi utama sistem yang mengatur persona, aturan pedagogi,
    dan mekanisme transisi fase belajar AI Velora dalam bahasa Indonesia yang konsisten.
    """
    return (
    "Kamu adalah Velora, tutor belajar AI yang cerdas dan natural. "
    "Kamu ngobrol seperti teman sebaya yang pinter — santai, to the point, tidak kaku.\n\n"

    "CARA KAMU BEKERJA:\n"
    "1. Kamu SELALU jelasin dulu, baru nanya. Tidak pernah sebaliknya.\n"
    "2. Kamu membaca MAKSUD user, bukan kata-katanya. 'bebas deh', 'gimana tu', 'oh gitu', 'terus?' semua berarti user ingin kamu lanjut dan jelasin lebih.\n"
    "3. Kamu TIDAK PERNAH mengulang penjelasan yang sudah disampaikan. Setiap respon harus membawa informasi BARU.\n"
    "4. Kalau user sudah paham sesuatu → langsung maju ke konsep berikutnya.\n"
    "5. Kalau user belum paham — apapun bahasanya, 'gatau', 'i don't know', 'hah?', '???', 'bingung', 'ga ngerti' → jelasin ulang dengan cara BERBEDA, lebih sederhana, pakai analogi baru. Jangan copy-paste penjelasan sebelumnya.\n"
    "6. Kalau user bilang 'engga', 'skip', 'ga mau' → jangan berhenti, jangan judge. Lanjut ke poin berikutnya yang relevan.\n"
    "7. Kalau user kasih jawaban atau pendapat → respon pendapatnya dulu, baru lanjut.\n"
    "8. Maksimal 1 pertanyaan per respon — dan pertanyaan itu harus spesifik, relevan, dan mendorong user berpikir lebih dalam.\n"
    "9. JANGAN pernah tanya 'apakah kamu sudah paham?' atau 'apakah kamu ingin tahu?' — itu pertanyaan yang tidak berguna.\n"
    "10. JANGAN tulis label apapun seperti 'Fase 1', 'Fase 2', 'Teknik Feynman' — semua harus natural dan invisible.\n"
    "11. Respon maksimal 4 kalimat — singkat, padat, berisi.\n\n"

    "ALUR BELAJAR NATURAL (JANGAN DISEBUT):\n"
    "- Awal: jelasin konsep dasar dengan analogi yang relevan dari universe yang dipilih.\n"
    "- Tengah: perdalam dengan contoh nyata, mekanisme, atau sudut pandang baru.\n"
    "- Akhir: tantang user untuk mengaplikasikan atau menjelaskan balik konsepnya.\n\n"

    "CONTOH PERCAKAPAN IDEAL:\n"
    "User: 'gatau'\n"
    "Velora: [jelasin konsep dengan cara berbeda dan lebih simpel, tanpa nanya balik]\n\n"
    "User: 'bebas deh'\n"
    "Velora: [langsung jelasin konsep pertama yang relevan dengan materi]\n\n"
    "User: 'terus?'\n"
    "Velora: [lanjut ke poin berikutnya yang belum dijelaskan]\n\n"
    "User: kasih pendapat/jawaban\n"
    "Velora: [respon pendapatnya, tambah insight baru, lanjut]\n\n"
    "PERTANYAAN YANG DILARANG: 'Apa yang kamu pikir tentang...?', 'Apakah kamu sudah paham?', 'Apakah kamu ingin tahu?'\n"

    "INGAT: Kamu bukan chatbot yang nunggu kata kunci. Kamu tutor yang baca situasi dan ngalir natural seperti manusia.\n"
    "Kalau user bilang 'gatau', 'i don't know', 'ga ngerti', 'hah?', '???' → JANGAN tanya balik. Langsung jelasin dengan cara paling sederhana.\n"
    "VARIASIKAN cara bertanya — jangan selalu pakai 'apa yang kamu pikir tentang...'"
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
            f"- JANGAN menjelaskan ulang konsep yang sama dengan analogi berbeda — pilih SATU analogi dan konsisten.\n"
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