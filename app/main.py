from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from config.db import init_db
from routes.accounts import router as accounts_router
from routes.health import router as health_router
from routes.transactions import router as transactions_router

app = FastAPI(title="Movimientos")


@app.on_event("startup")
def on_startup() -> None:
    init_db()

app.include_router(health_router)
app.include_router(accounts_router)
app.include_router(transactions_router)

app.mount(
    "/static",
    StaticFiles(directory=Path(__file__).parent / "static"),
    name="static",
)

app.mount(
    "/",
    StaticFiles(directory=Path(__file__).parent / "templates", html=True),
    name="templates",
)
