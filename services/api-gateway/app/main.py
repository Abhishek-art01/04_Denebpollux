import asyncio
from typing import Annotated

import httpx
from fastapi import FastAPI, Header, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    frontend_origin: str = "http://localhost:5173"
    frontend_origin_regex: str | None = None
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    client_backends: str = "agilent=http://localhost:8000,airindia=http://localhost:8001"
    request_timeout_seconds: float = 120

    class Config:
        env_file = ".env"


settings = Settings()
app = FastAPI(title="Billing API Gateway", version="1.0.0")

allowed_origins = [origin.strip() for origin in settings.frontend_origin.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=settings.frontend_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def parse_client_backends() -> dict[str, str]:
    backends = {}
    for item in settings.client_backends.split(","):
        if "=" not in item:
            continue
        client_id, url = item.split("=", 1)
        backends[client_id.strip()] = url.strip().rstrip("/")
    return backends


CLIENT_BACKENDS = parse_client_backends()
WAKE_RETRY_DELAYS_SECONDS = [0, 10, 20, 30, 45]
HOP_BY_HOP_HEADERS = {
    "accept-encoding",
    "connection",
    "content-encoding",
    "content-length",
    "host",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
}


def forwarded_headers(request: Request, preserve_authorization: bool = False) -> dict[str, str]:
    return {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in HOP_BY_HOP_HEADERS
        and (preserve_authorization or key.lower() != "authorization")
    }


def response_headers(response: httpx.Response) -> dict[str, str]:
    return {
        key: value
        for key, value in response.headers.items()
        if key.lower() not in HOP_BY_HOP_HEADERS
    }


async def wake_backend(name: str, base_url: str) -> dict[str, str | int]:
    health_url = f"{base_url.rstrip('/')}/api/health"
    last_error = "not attempted"

    async with httpx.AsyncClient(timeout=8, follow_redirects=False) as client:
        for attempt, delay in enumerate(WAKE_RETRY_DELAYS_SECONDS, start=1):
            if delay:
                await asyncio.sleep(delay)
            try:
                response = await client.get(health_url)
            except httpx.HTTPError as exc:
                last_error = str(exc)
                continue
            if response.status_code == 200:
                return {"name": name, "status": "awake", "attempts": attempt}
            last_error = f"HTTP {response.status_code}"

    return {"name": name, "status": "waking", "attempts": len(WAKE_RETRY_DELAYS_SECONDS), "error": last_error}


async def verify_token(authorization: Annotated[str | None, Header()] = None) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(status_code=500, detail="Supabase auth is not configured")

    token = authorization.split(" ", 1)[1]
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{settings.supabase_url.rstrip('/')}/auth/v1/user",
                headers={
                    "apikey": settings.supabase_service_role_key,
                    "authorization": f"Bearer {token}",
                    "accept": "application/json",
                },
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Supabase auth unavailable") from exc

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")
    return response.json()


async def proxy(request: Request, target_url: str, preserve_authorization: bool = False) -> Response:
    body = await request.body()
    async with httpx.AsyncClient(timeout=settings.request_timeout_seconds, follow_redirects=False) as client:
        upstream = await client.request(
            request.method,
            target_url,
            params=request.query_params,
            content=body,
            headers=forwarded_headers(request, preserve_authorization=preserve_authorization),
        )
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=response_headers(upstream),
        media_type=upstream.headers.get("content-type"),
    )


@app.get("/api/wake")
async def wake_services(
    target: str = Query("all", pattern="^(all|client)$"),
    client_id: str | None = None,
):
    checks = []
    if target in {"all", "client"}:
        if client_id:
            backend_url = CLIENT_BACKENDS.get(client_id)
            if not backend_url:
                raise HTTPException(status_code=404, detail=f"Unknown client backend: {client_id}")
            checks.append(wake_backend(client_id, backend_url))
        elif target == "all":
            checks.extend(
                wake_backend(client_id, backend_url)
                for client_id, backend_url in CLIENT_BACKENDS.items()
            )

    results = await asyncio.gather(*checks) if checks else []
    return {"status": "ok", "services": results}


@app.get("/api/auth/me")
async def auth_me(authorization: Annotated[str | None, Header()] = None):
    user = await verify_token(authorization)
    return {
        "id": user.get("id"),
        "email": user.get("email"),
        "name": user.get("user_metadata", {}).get("name") or user.get("email"),
        "role": user.get("app_metadata", {}).get("role") or user.get("user_metadata", {}).get("role") or "authenticated",
    }


@app.post("/api/auth/verify")
async def auth_verify(payload: dict):
    token = payload.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Missing token")
    user = await verify_token(f"Bearer {token}")
    return {
        "active": True,
        "id": user.get("id"),
        "email": user.get("email"),
        "name": user.get("user_metadata", {}).get("name") or user.get("email"),
        "role": user.get("app_metadata", {}).get("role") or user.get("user_metadata", {}).get("role") or "authenticated",
    }


@app.api_route("/api/clients/{client_id}/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def client_proxy(
    client_id: str,
    path: str,
    request: Request,
    authorization: Annotated[str | None, Header()] = None,
):
    await verify_token(authorization)
    backend_url = CLIENT_BACKENDS.get(client_id)
    if not backend_url:
        raise HTTPException(status_code=404, detail=f"Unknown client backend: {client_id}")
    return await proxy(request, f"{backend_url}/api/{path}")


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "auth": "supabase",
        "client_backends": sorted(CLIENT_BACKENDS),
    }
