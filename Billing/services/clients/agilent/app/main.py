"""
FastAPI application entrypoint. Creates DB tables on startup (for simple
deployments without Alembic), registers CORS, and includes all routers.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine, ensure_schema
from app import models  # noqa: F401 - ensures all models are registered on Base
from app.routers import upload, manual_inputs, expenses, reports, export, months, charge_mappings

app = FastAPI(title="Agilent Billing Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(manual_inputs.router)
app.include_router(expenses.router)
app.include_router(reports.router)
app.include_router(export.router)
app.include_router(months.router)
app.include_router(charge_mappings.router)


@app.on_event("startup")
def on_startup():
    ensure_schema()
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
