#!/usr/bin/env bash
# =============================================================
#  Velora Security Check
#  Cek kebocoran secret sebelum share repo GitHub.
#  Cara pakai:
#    1. Simpan file ini di dalam folder repo (yang ada .git)
#    2. Jalankan:  bash velora_security_check.sh
# =============================================================

set -u

RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'; BLU='\033[0;34m'; NC='\033[0m'
pass()  { echo -e "${GRN}[ AMAN ]${NC} $1"; }
warn()  { echo -e "${YLW}[ CEK  ]${NC} $1"; }
fail()  { echo -e "${RED}[BAHAYA]${NC} $1"; }
sec()   { echo -e "\n${BLU}==== $1 ====${NC}"; }

ISSUES=0

# Pola secret yang dicari
PATTERNS='gsk_[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{20,}|service_role|SUPABASE_SERVICE|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|(api[_-]?key|apikey|secret|passwd|password|access[_-]?token)[\"'"'"' ]*[:=][\"'"'"' ]*[A-Za-z0-9_\-]{8,}'

# ---------------------------------------------------------------
sec "0. Validasi repo"
if [ ! -d .git ]; then
  fail "Folder ini bukan root git repo (nggak ada .git). Jalanin di folder repo Velora lu."
  exit 1
fi
pass "Terdeteksi git repo."

# ---------------------------------------------------------------
sec "1. Cek .gitignore"
if [ -f .gitignore ]; then
  pass ".gitignore ada."
  for entry in ".env" "node_modules"; do
    if grep -qE "(^|/)${entry}(/|$)?" .gitignore; then
      pass "  '$entry' sudah di-ignore."
    else
      warn "  '$entry' belum ada di .gitignore — sebaiknya ditambahin."; ISSUES=$((ISSUES+1))
    fi
  done
else
  fail ".gitignore TIDAK ADA. Wajib bikin & masukin .env, node_modules, dll."; ISSUES=$((ISSUES+1))
fi

# ---------------------------------------------------------------
sec "2. Apakah .env sedang di-track git (working tree)?"
TRACKED_ENV=$(git ls-files | grep -E '(^|/)\.env($|\.)' | grep -viE '\.(example|sample|template|dist|md)$' || true)
if [ -n "$TRACKED_ENV" ]; then
  fail "File .env SEDANG di-track git:"; echo "$TRACKED_ENV" | sed 's/^/        /'
  echo "        -> jalankan: git rm --cached <file> lalu commit"
  ISSUES=$((ISSUES+1))
else
  pass "Tidak ada file .env yang di-track saat ini."
fi

# ---------------------------------------------------------------
sec "3. Scan secret di file saat ini (working tree)"
HITS=$(git ls-files | grep -vE '(^|/)(node_modules|\.git)/' \
  | while read -r f; do
      [ -f "$f" ] || continue
      grep -HnE "$PATTERNS" "$f" 2>/dev/null
    done)
if [ -n "$HITS" ]; then
  fail "Ada kemungkinan secret di file berikut (cek manual):"
  echo "$HITS" | sed 's/^/        /' | head -40
  ISSUES=$((ISSUES+1))
else
  pass "Tidak ada pola secret mencurigakan di file saat ini."
fi

# ---------------------------------------------------------------
sec "4. Scan git HISTORY (paling penting!)"
echo "     (ngecek semua commit lama, ini yang sering kelewat...)"
HIST_ENV=$(git log --all --pretty=format: --name-only --diff-filter=A 2>/dev/null | sort -u | grep -E '(^|/)\.env($|\.)' | grep -viE '\.(example|sample|template|dist|md)$' || true)
if [ -n "$HIST_ENV" ]; then
  fail "File .env PERNAH ke-commit di history:"; echo "$HIST_ENV" | sed 's/^/        /'
  echo "        -> secret di dalamnya HARUS dianggap bocor. Rotate semua key!"
  ISSUES=$((ISSUES+1))
else
  pass "Tidak menemukan file .env di history commit."
fi

HIST_HITS=$(git log --all -p 2>/dev/null | grep -aE "^\+" | grep -aE "$PATTERNS" | grep -avE '\.env\.example' | sort -u || true)
if [ -n "$HIST_HITS" ]; then
  fail "Ada pola secret di dalam history commit (baris yang pernah ditambah):"
  echo "$HIST_HITS" | sed 's/^/        /' | head -30
  echo "        -> kalau ini key asli, ROTATE key + bersihin history (git filter-repo / BFG)."
  ISSUES=$((ISSUES+1))
else
  pass "Tidak ada pola secret di history commit."
fi

# ---------------------------------------------------------------
sec "RINGKASAN"
if [ "$ISSUES" -eq 0 ]; then
  echo -e "${GRN}✅ Bersih! Tidak ada temuan. Repo aman buat di-share.${NC}"
else
  echo -e "${RED}⚠️  Ditemukan ${ISSUES} hal yang perlu diperhatikan (lihat di atas).${NC}"
  echo -e "${YLW}Langkah paling aman kalau ada key kebocor: ROTATE/regenerate semua key (Groq, Gemini, Supabase) lewat dashboard masing-masing.${NC}"
fi
echo
