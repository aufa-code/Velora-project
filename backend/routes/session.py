from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any

from backend.database.supabase import get_session, save_message, get_messages
from backend.services.prompt import build_final_prompt
from backend.services.groq import get_ai_response

router = APIRouter(prefix="/session", tags=["Session"])

class ChatRequest(BaseModel):
    session_id: str
    message: str

@router.post("/chat")
async def chat_with_velora(payload: ChatRequest):
    session_id = payload.session_id
    user_message = payload.message

    session = get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sesi belajar dengan ID {session_id} tidak ditemukan."
        )

    history = get_messages(session_id)
    history.append({"role": "user", "content": user_message})
    save_message(session_id=session_id, role="user", content=user_message)

    final_prompt = build_final_prompt(
        materi=session.get("materi"),
        tujuan=session.get("tujuan"),
        metode=session.get("metode"),
        messages=history,
        universe=session.get("universe")
    )

    ai_response = get_ai_response(final_prompt)
    save_message(session_id=session_id, role="assistant", content=ai_response)
    return {"response": ai_response}

@router.get("/{session_id}/history")
async def get_session_history(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Sesi belajar dengan ID {session_id} tidak ditemukan."
        )
        
    history = get_messages(session_id)
    return {"session_id": session_id, "history": history}