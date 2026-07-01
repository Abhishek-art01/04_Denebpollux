"""
SQLAlchemy engine, session factory, and declarative base.
"""
from sqlalchemy import create_engine
from sqlalchemy import MetaData, text
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

metadata = MetaData(schema=settings.db_schema) if settings.db_schema else MetaData()
Base = declarative_base(metadata=metadata)


def ensure_schema():
    if not settings.db_schema:
        return
    with engine.begin() as connection:
        connection.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{settings.db_schema}"'))


def get_db():
    """FastAPI dependency that yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
