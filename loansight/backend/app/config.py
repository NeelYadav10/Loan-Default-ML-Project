import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LoanSight API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Paths using relative pathlib
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    MODEL_DIR: Path = BASE_DIR / "model"
    
    PORT: int = 8001
    
    # CORS Origins
    CORS_ORIGINS: list[str] = [
        "https://loandefault-seven.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:8001",
        "http://127.0.0.1:8001",
        "http://localhost:3000"
    ]
    
    class Config:
        case_sensitive = True

settings = Settings()
