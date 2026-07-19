from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gpt-oss:120b-cloud"
    APP_ENV: str = "development"
    CORS_ORIGINS: List[str] = ["http://localhost:8081", "http://localhost:19006"]

    ENABLE_REAL_IMAGE: bool = False
    ENABLE_REAL_VIDEO: bool = False
    IMAGE_MODEL: str = "stabilityai/sdxl-turbo"
    IMAGE_DEVICE: str = "cpu" # cuda | mps | cpu


settings = Settings()
