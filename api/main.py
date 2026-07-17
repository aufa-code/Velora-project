import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import setup, session, progress, quiz, reviews, stats, materi

app = FastAPI(
    title="Velora API",
    version="1.0.0"
)

# Setup CORS - Izinkan request dari React development server
origins = [
    "http://localhost:3000",
    "https://velora-frontend-phi.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(setup.router)
app.include_router(session.router)
app.include_router(progress.router)
app.include_router(quiz.router)
app.include_router(reviews.router)
app.include_router(stats.router)
app.include_router(materi.router)

# Root Endpoint
@app.get("/")
async def root():
    return {
        "status": "running",
        "message": "FastAPI server is running smoothly"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
