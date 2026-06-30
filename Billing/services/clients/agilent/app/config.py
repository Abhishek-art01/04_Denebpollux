"""
Application configuration, loaded from environment variables (.env file).
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://agilent_user:agilent_pass@localhost:5432/agilent_billing"
    frontend_origin: str = "http://localhost:5173"
    db_schema: str | None = None

    class Config:
        env_file = ".env"


settings = Settings()
