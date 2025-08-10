from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

import os

# Prefer ``DATABASE_URL`` and fallback to ``DB_DSN`` for backward compatibility
DB_DSN = os.getenv("DATABASE_URL") or os.getenv("DB_DSN")
if not DB_DSN:
    raise RuntimeError("DATABASE_URL not set")

engine = create_engine(DB_DSN, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
