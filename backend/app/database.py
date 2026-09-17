"""
database.py - Database connection and session management for CropKart

Configures the SQLAlchemy engine and provides the session generator get_db()
for FastAPI dependency injection.

Supports PostgreSQL via the DATABASE_URL environment variable:
Example: DATABASE_URL=postgresql://username:password@localhost:5432/cropkart

Defaults to SQLite when DATABASE_URL is not set so the prototype can start
immediately in local development.
"""

import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# Fetch database URL from environment variable
# If not provided, fallback to local SQLite database file for SIH prototype development
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "sqlite:///./cropkart.db"
)

# Connect arguments (required for SQLite to allow multiple threads)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# Initialize SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)

# Session factory bound to engine
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for declarative database models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency generator for FastAPI endpoints.
    Yields a database session and guarantees closure after the request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
