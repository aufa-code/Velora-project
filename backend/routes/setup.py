from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict
from database.supabase import create_session

router = APIRouter(
    prefix="/setup",
    tags=["Setup Sesi Belajar"]
)

# Pydantic Schema untuk request body POST /setup/start
class SessionStartRequest(BaseModel):
    materi: str
    tujuan: str
    metode: str
    universe: Optional[str] = None

# Pydantic Schema untuk response POST /setup/start
class SessionStartResponse(BaseModel):
    session_id: str
    status: str

# Pydantic Schema untuk response GET /setup/methods
class StudyMethodDetail(BaseModel):
    name: str
    description: str

@router.post("/start", response_model=SessionStartResponse, status_code=status.HTTP_201_CREATED)
async def start_session(request: SessionStartRequest):
    try:
        # Memanggil fungsi create_session dari database.supabase
        session_id = create_session(
            materi=request.materi,
            tujuan=request.tujuan,
            metode=request.metode,
            universe=request.universe
        )
        
        if not session_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Gagal membuat sesi belajar baru di database."
            )
            
        return SessionStartResponse(session_id=str(session_id), status="success")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Terjadi kesalahan saat setup sesi: {str(e)}"
        )

@router.get("/methods", response_model=List[StudyMethodDetail])
async def get_study_methods():
    methods = [
        {
            "name": "Elaborative Interrogation",
            "description": "Metode belajar dengan cara menjelaskan mengapa sebuah fakta atau konsep itu benar secara mendalam."
        },
        {
            "name": "Spaced Repetition",
            "description": "Metode pembelajaran berbasis pengulangan dengan jeda waktu tertentu untuk memperkuat memori jangka panjang."
        },
        {
            "name": "Feynman Technique",
            "description": "Metode memahami konsep dengan cara menjelaskan materi tersebut menggunakan bahasa yang sangat sederhana seolah-olah sedang mengajar anak kecil."
        },
        {
            "name": "Concrete Examples",
            "description": "Metode memahami gagasan abstrak menggunakan contoh-contoh spesifik dan nyata di kehidupan sehari-hari."
        },
        {
            "name": "Interleaving",
            "description": "Metode belajar dengan mencampur atau mengacak beberapa topik/materi berbeda dalam satu sesi belajar agar otak lebih adaptif."
        }
    ]
    return methods