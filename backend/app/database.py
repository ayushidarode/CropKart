"""
database.py - Database connection and session management for CropKart

Connects FastAPI to Supabase PostgreSQL using DATABASE_URL.
"""

import logging
import os
from pathlib import Path
import re
from typing import Generator
import urllib.parse

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL, make_url
from sqlalchemy.orm import declarative_base, sessionmaker, Session

logger = logging.getLogger(__name__)

# Explicitly load backend/.env, falling back to root .env
backend_env = Path(__file__).resolve().parent.parent / ".env"
root_env = Path(__file__).resolve().parent.parent.parent / ".env"

if backend_env.exists():
    load_dotenv(dotenv_path=backend_env, override=True)
elif root_env.exists():
    load_dotenv(dotenv_path=root_env)
else:
    load_dotenv()


def sanitize_and_build_url(raw_url: str):
    """
    Sanitizes raw DATABASE_URL string and builds a valid SQLAlchemy URL.
    Handles:
    - Accidental duplicate key prefixes (e.g. DATABASE_URL=DATABASE_URL=...)
    - Surrounding single/double quotes and whitespace
    - Standardizing postgresql:// to postgresql+psycopg://
    - Passwords with URL-sensitive characters without exposing credentials
    """
    if not raw_url:
        raise RuntimeError(
            "DATABASE_URL is not set. "
            "Please add your Supabase PostgreSQL connection string to .env"
        )

    url_str = raw_url.strip()

    # Strip duplicate variable prefixes if present
    while url_str.startswith("DATABASE_URL="):
        url_str = url_str[len("DATABASE_URL="):].strip()

    url_str = url_str.strip("'\"").strip()

    if not url_str:
        raise RuntimeError("DATABASE_URL is empty.")

    # Normalize PostgreSQL driver to psycopg (Psycopg 3)
    if url_str.startswith("postgresql://"):
        url_str = "postgresql+psycopg://" + url_str[len("postgresql://"):]
    elif url_str.startswith("postgres://"):
        url_str = "postgresql+psycopg://" + url_str[len("postgres://"):]

    # SQLite is returned as-is
    if url_str.startswith("sqlite"):
        return url_str

    # Check if %40 was mistakenly used as the credential/host separator instead of @
    if "@" not in url_str and "%40" in url_str:
        url_str = url_str.replace("%40", "@", 1)

    # Try standard make_url
    try:
        return make_url(url_str)
    except Exception:
        pass

    # Robust regex parse in case password contains unescaped special characters
    match = re.match(r'^(?P<scheme>[a-zA-Z0-9+_]+)://(?P<auth>.+?)@(?P<endpoint>[^@/]+)(?:/(?P<db>.*))?$', url_str)
    if match:
        scheme = match.group("scheme")
        auth = match.group("auth")
        endpoint = match.group("endpoint")
        database = match.group("db") or ""

        # Username and password split on first colon
        if ":" in auth:
            user, password = auth.split(":", 1)
        else:
            user, password = auth, None

        # Host and port split on last colon
        if ":" in endpoint:
            host, port_str = endpoint.rsplit(":", 1)
            try:
                port = int(port_str)
            except ValueError:
                host, port = endpoint, None
        else:
            host, port = endpoint, None

        return URL.create(
            drivername=scheme,
            username=urllib.parse.unquote(user) if user else None,
            password=urllib.parse.unquote(password) if password else None,
            host=host,
            port=port,
            database=database if database else None,
        )

    return make_url(url_str)


# Get raw database URL from environment
RAW_DATABASE_URL = os.getenv("DATABASE_URL", "")
DATABASE_URL = sanitize_and_build_url(RAW_DATABASE_URL)


# SQLite needs special connection arguments.
# Supabase PostgreSQL does not.
connect_args = {}
if isinstance(DATABASE_URL, str) and DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif hasattr(DATABASE_URL, "drivername") and DATABASE_URL.drivername.startswith("sqlite"):
    connect_args = {"check_same_thread": False}


# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)


# Create database session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# Base class for SQLAlchemy models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Provides a database session to FastAPI endpoints.
    """
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Creates database tables defined by SQLAlchemy models
    if they don't already exist.
    """
    try:
        from app import models  # noqa: F401
    except ImportError:
        import models  # noqa: F401
    Base.metadata.create_all(bind=engine)


def test_db_connection() -> bool:
    """
    Tests whether the database connection is working.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.warning(f"Database connection test failed: {e}")
        return False