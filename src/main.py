from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="TestMe API", description="API para a plataforma TestMe - Mundo do Conhecimento")

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

@app.get("/testeme/activities/history", summary="Get activity history")
async def get_activity_history():
    """Get user's activity history"""
    return {"message": "Histórico de atividades", "activities": []}

@app.get("/testeme/activities/{activity_id}", summary="Get activity by ID")
async def get_activity_by_id(activity_id: int):
    """Get a specific activity by ID"""
    return {"id": activity_id, "title": f"Atividade {activity_id}", "category": "Conhecimento"}

@app.post("/testeme/activities/{activity_id}/start", summary="Start activity")
async def start_activity(activity_id: int):
    """Start an activity"""
    return {"status": "started", "activity_id": activity_id}

@app.post("/testeme/activities/{activity_id}/submit", summary="Submit activity answer")
async def submit_activity(activity_id: int):
    """Submit activity answer"""
    return {"status": "submitted", "activity_id": activity_id, "correct": True}

@app.get("/testeme/map", summary="Get world map data")
async def testeme_map():
    """Get world map data with spots and NPCs"""
    # Spots distribuídos pelo mapa com diferentes raridades e categorias
    spots = [
        # Região inicial - Vila do Saber
        {"id": 1, "name": "Spot Comum - Matematica", "x": 150, "y": 200, "rarity": "comum", "category": "Matematica"},
        {"id": 2, "name": "Spot Comum - Portugues", "x": 300, "y": 150, "rarity": "comum", "category": "Português"},
        {"id": 3, "name": "Spot Incomum - Logica", "x": 450, "y": 250, "rarity": "incomum", "category": "Lógica"},
        {"id": 4, "name": "Spot Incomum - Programação", "x": 600, "y": 350, "rarity": "incomum", "category": "Programação"},
        
        # Região média - Bosque Antigo
        {"id": 5, "name": "Spot Raro - Ciências", "x": 800, "y": 400, "rarity": "raro", "category": "Ciências"},
        {"id": 6, "name": "Spot Raro - História", "x": 950, "y": 350, "rarity": "raro", "category": "História"},
        
        # Região avançada - Ruínas da Lógica
        {"id": 7, "name": "Spot Épico - Geografia", "x": 1200, "y": 500, "rarity": "épico", "category": "Geografia"},
        {"id": 8, "name": "Spot Lendário - Conhecimentos Gerais", "x": 1400, "y": 450, "rarity": "lendário", "category": "Conhecimentos Gerais"},
        
        # Áreas especiais
        {"id": 9, "name": "Spot Comum - Inglês", "x": 50, "y": 500, "rarity": "comum", "category": "Inglês"},
        {"id": 10, "name": "Spot Incomum - Raciocínio", "x": 1800, "y": 100, "rarity": "incomum", "category": "Raciocínio"},
    ]
    
    npcs = [
        {"id": 1, "name": "Guia do Conhecimento", "x": 350, "y": 300},
        {"id": 2, "name": "Professora Ada", "x": 700, "y": 550},
        {"id": 3, "name": "Desafiante Rex", "x": 1000, "y": 400},
        {"id": 4, "name": "Explorador Leo", "x": 500, "y": 150},
    ]
    
    return {"spots": spots, "npcs": npcs}

@app.get("/testeme/spots", summary="Get spots data")
async def testeme_spots():
    """Get spots data"""
    return [{"id": 1, "name": "Spot Teste", "x": 100, "y": 100}]

@app.get("/testeme/npcs", summary="Get NPCs data")
async def testeme_npcs():
    """Get NPCs data"""
    return [{"id": 1, "name": "NPC Teste"}]

@app.get("/testeme/ranking/global", summary="Get global ranking")
async def testeme_ranking_global():
    """Get global ranking"""
    return [
        {"rank": 1, "nick": "Player1", "xp": 5000, "level": 10},
        {"rank": 2, "nick": "Player2", "xp": 4500, "level": 9},
        {"rank": 3, "nick": "Player3", "xp": 4000, "level": 8},
    ]

@app.post("/testeme/logar", summary="User login")
async def testeme_login(nick: str = ""):
    """User login endpoint"""
    if not nick:
        raise HTTPException(status_code=400, detail="Nick is required")
    return {"token": "fake_jwt_token", "user": {"nick": nick, "level": 1}}

@app.post("/testeme/cadastrar", summary="User registration")
async def testeme_cadastrar(nick: str = ""):
    """User registration endpoint"""
    if not nick:
        raise HTTPException(status_code=400, detail="Nick is required")
    return {"status": "registered", "nick": nick, "message": "Conta criada com sucesso"}

@app.get("/testeme/users/me", summary="Get current user")
async def testeme_users_me():
    """Get current authenticated user info"""
    return {"nick": "jogador", "xp": 1500, "level": 5}

@app.get("/testeme/characters/me", summary="Get current character")
async def testeme_characters_me():
    """Get current character information"""
    return {"name": "Herói", "level": 5, "xp": 1500}

@app.get("/testeme/progress/me", summary="Get user progress")
async def testeme_progress_me():
    """Get user progress data"""
    return {"activities_completed": 3, "xp_earned": 500, "level": 5}

@app.get("/testeme/ai/generate-activity", summary="Generate activity by AI")
async def testeme_ai_generate_activity():
    """Generate a new activity using AI"""
    return {
        "activity": "Quebra-cabeça de conhecimento",
        "category": "Conhecimento",
        "difficulty": "Média"
    }

@app.get("/")
async def root():
    {"message": "Bem-vindo ao TestMe API"}  # type: ignore

