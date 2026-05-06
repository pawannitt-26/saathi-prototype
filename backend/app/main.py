from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from app.api import analytics, dashboard, leads, webhooks
from app.config import get_settings
from app.logging_config import configure_logging
from app.ws.call_session import handle_call_socket

configure_logging()


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Saathi API", lifespan=lifespan)
    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(leads.router, prefix="/api")
    app.include_router(dashboard.router, prefix="/api")
    app.include_router(analytics.router, prefix="/api")
    app.include_router(webhooks.router, prefix="/api")

    @app.get("/health")
    def health() -> dict:
        return {"ok": True}

    @app.websocket("/ws/call")
    async def ws_call(ws: WebSocket) -> None:
        await handle_call_socket(ws)

    return app


app = create_app()
