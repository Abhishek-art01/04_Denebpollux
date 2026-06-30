from typing import Annotated

import httpx
from fastapi import FastAPI, Header, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    frontend_origin: str = "http://localhost:5173"
    frontend_origin_regex: str | None = None
    auth_backend_url: str = "http://localhost:8010"
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


async def verify_token(authorization: Annotated[str | None, Header()] = None) -> None:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1]
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{settings.auth_backend_url.rstrip('/')}/api/auth/verify",
                json={"token": token},
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Auth service unavailable") from exc

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")


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


@app.api_route("/api/auth/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def auth_proxy(path: str, request: Request):
    target_url = f"{settings.auth_backend_url.rstrip('/')}/api/auth/{path}"
    return await proxy(request, target_url, preserve_authorization=True)


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
        "auth_backend": settings.auth_backend_url,
        "client_backends": sorted(CLIENT_BACKENDS),
    }
