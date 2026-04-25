# """MongoDB connection — gracefully degrades if DB unavailable."""

# from supabase import create_client
# import os

# SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# import os, logging
# from dotenv import load_dotenv
# load_dotenv()
# logger = logging.getLogger(__name__)

# class Database:
#     client = None
#     db = None

# db_instance = Database()

# async def connect_db():
#     mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
#     db_name   = os.getenv("DB_NAME", "eye_detection")
#     try:
#         from motor.motor_asyncio import AsyncIOMotorClient
#         client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=2000)
#         await client.admin.command("ping")
#         db_instance.client = client
#         db_instance.db = client[db_name]
#         logger.info(f"✅ MongoDB connected: {db_name}")
#     except Exception as e:
#         logger.warning(f"⚠️  MongoDB unavailable ({e}). Running without DB.")
#         db_instance.client = None
#         db_instance.db = None

# async def close_db():
#     if db_instance.client:
#         db_instance.client.close()

# def get_db():
#     return db_instance.db

# def get_predictions_collection():
#     db = get_db()
#     return db["predictions"] if db is not None else None



"""Database connection — Supabase + optional MongoDB fallback"""

import os
import logging
from dotenv import load_dotenv

# 🔥 Load .env FIRST (very important)
load_dotenv()

from supabase import create_client, Client

logger = logging.getLogger(__name__)

# ─── Supabase Setup ───────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client | None = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("✅ Supabase connected")
    except Exception as e:
        logger.warning(f"⚠️ Supabase connection failed: {e}")
        supabase = None
else:
    logger.warning("⚠️ Supabase credentials missing in .env")

# ─── MongoDB Setup (Optional fallback) ─────────────────────────────────────────
class Database:
    client = None
    db = None

db_instance = Database()

async def connect_db():
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name   = os.getenv("DB_NAME", "eye_detection")

    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=2000)
        await client.admin.command("ping")

        db_instance.client = client
        db_instance.db = client[db_name]

        logger.info(f"✅ MongoDB connected: {db_name}")

    except Exception as e:
        logger.warning(f"⚠️ MongoDB unavailable ({e}). Running without MongoDB.")
        db_instance.client = None
        db_instance.db = None

async def close_db():
    if db_instance.client:
        db_instance.client.close()

def get_db():
    return db_instance.db

def get_predictions_collection():
    db = get_db()
    return db["predictions"] if db is not None else None