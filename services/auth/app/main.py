import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    frontend_origin: str = "http://localhost:5173"
    token_secret: str = "change-me-before-production"
    token_ttl_seconds: int = 60 * 60 * 12
    auth_users: str = "admin:admin123:Admin"

    class Config:
        env_file = ".env"


settings = Settings()
app = FastAPI(title="Billing Auth API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    username: str
    password: str


class VerifyRequest(BaseModel):
    token: str


def parse_users() -> dict[str, dict[str, str]]:
    users = {}
    for raw_user in settings.auth_users.split(","):
        parts = raw_user.strip().split(":", 2)
        if len(parts) != 3:
            continue
        username, password, name = parts
        users[username] = {"password": password, "name": name}
    return users


def b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("ascii").rstrip("=")


def b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(f"{data}{padding}".encode("ascii"))


def sign(payload: str) -> str:
    digest = hmac.new(settings.token_secret.encode("utf-8"), payload.encode("ascii"), hashlib.sha256).digest()
    return b64encode(digest)


def create_token(username: str, name: str) -> str:
    payload = {
        "sub": username,
        "name": name,
        "iat": int(time.time()),
        "exp": int(time.time()) + settings.token_ttl_seconds,
    }
    encoded_payload = b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    return f"{encoded_payload}.{sign(encoded_payload)}"


def decode_token(token: str) -> dict[str, str | int]:
    try:
        encoded_payload, signature = token.split(".", 1)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc

    expected_signature = sign(encoded_payload)
    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=401, detail="Invalid token")

    payload = json.loads(b64decode(encoded_payload))
    if int(payload.get("exp", 0)) < int(time.time()):
        raise HTTPException(status_code=401, detail="Token expired")
    return payload


def bearer_token(authorization: Annotated[str | None, Header()] = None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    return authorization.split(" ", 1)[1]


@app.post("/api/auth/login")
def login(request: LoginRequest):
    users = parse_users()
    user = users.get(request.username)
    if not user or not secrets.compare_digest(user["password"], request.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_token(request.username, user["name"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"username": request.username, "name": user["name"]},
    }


@app.get("/api/auth/me")
def me(token: Annotated[str, Depends(bearer_token)]):
    payload = decode_token(token)
    return {"username": payload["sub"], "name": payload["name"]}


@app.post("/api/auth/verify")
def verify(request: VerifyRequest):
    payload = decode_token(request.token)
    return {"active": True, "username": payload["sub"], "name": payload["name"]}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
