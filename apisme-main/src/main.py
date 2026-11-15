from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="TestMe API - Apisme", description="Backend API para a plataforma TestMe - Mundo do Conhecimento")

# CORS configuration - origins from environment variable or defaults
cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://127.0.0.1:5500,http://127.0.0.1:8000,http://localhost:5500,http://localhost:8000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    {"message": "Bem-vindo ao TestMe API - Apisme"}

@app.get("/health")
async def health():
    {"status": "ok"}