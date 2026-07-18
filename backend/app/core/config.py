from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"
    APP_ENV: str = "development"
    CORS_ORIGINS: List[str] = ["http://localhost:8081", "http://localhost:19006"]

    class Config:
        env_file = ".env"


settings = Settings()
