# # """MongoDB connection — gracefully degrades if DB unavailable."""

# # from supabase import create_client
# # import os

# # SUPABASE_URL = os.getenv("SUPABASE_URL")
# # SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# # supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# # import os, logging
# # from dotenv import load_dotenv
# # load_dotenv()
# # logger = logging.getLogger(__name__)

# # class Database:
# #     client = None
# #     db = None

# # db_instance = Database()

# # async def connect_db():
# #     mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
# #     db_name   = os.getenv("DB_NAME", "eye_detection")
# #     try:
# #         from motor.motor_asyncio import AsyncIOMotorClient
# #         client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=2000)
# #         await client.admin.command("ping")
# #         db_instance.client = client
# #         db_instance.db = client[db_name]
# #         logger.info(f"✅ MongoDB connected: {db_name}")
# #     except Exception as e:
# #         logger.warning(f"⚠️  MongoDB unavailable ({e}). Running without DB.")
# #         db_instance.client = None
# #         db_instance.db = None

# # async def close_db():
# #     if db_instance.client:
# #         db_instance.client.close()

# # def get_db():
# #     return db_instance.db

# # def get_predictions_collection():
# #     db = get_db()
# #     return db["predictions"] if db is not None else None



# """Database connection — Supabase + optional MongoDB fallback"""

# # import os
# # import logging
# # from dotenv import load_dotenv

# # # 🔥 Load .env FIRST (very important)
# # load_dotenv()

# # from supabase import create_client, Client

# # logger = logging.getLogger(__name__)

# # # ─── Supabase Setup ───────────────────────────────────────────────────────────
# # SUPABASE_URL = os.getenv("SUPABASE_URL")
# # SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# # supabase: Client | None = None

# # if SUPABASE_URL and SUPABASE_KEY:
# #     try:
# #         supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
# #         logger.info("✅ Supabase connected")
# #     except Exception as e:
# #         logger.warning(f"⚠️ Supabase connection failed: {e}")
# #         supabase = None
# # else:
# #     logger.warning("⚠️ Supabase credentials missing in .env")

# # # ─── MongoDB Setup (Optional fallback) ─────────────────────────────────────────
# # class Database:
# #     client = None
# #     db = None

# # db_instance = Database()

# # async def connect_db():
# #     mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
# #     db_name   = os.getenv("DB_NAME", "eye_detection")

# #     try:
# #         from motor.motor_asyncio import AsyncIOMotorClient
# #         client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=2000)
# #         await client.admin.command("ping")

# #         db_instance.client = client
# #         db_instance.db = client[db_name]

# #         logger.info(f"✅ MongoDB connected: {db_name}")

# #     except Exception as e:
# #         logger.warning(f"⚠️ MongoDB unavailable ({e}). Running without MongoDB.")
# #         db_instance.client = None
# #         db_instance.db = None

# # async def close_db():
# #     if db_instance.client:
# #         db_instance.client.close()

# # def get_db():
# #     return db_instance.db

# # def get_predictions_collection():
# #     db = get_db()
# #     return db["predictions"] if db is not None else None


# import os
# import logging
# from dotenv import load_dotenv
# from supabase import create_client

# # Load environment variables
# load_dotenv()

# logger = logging.getLogger(__name__)

# # Supabase config
# SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# supabase = None

# try:
#     if SUPABASE_URL and SUPABASE_KEY:
#         supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
#         logger.info("Supabase connected")
#     else:
#         logger.warning("Supabase env variables missing")
# except Exception as e:
#     logger.error(f"Supabase init failed: {e}")
#     supabase = None


# # Helper functions

# def get_supabase():
#     return supabase


# def insert_prediction(data: dict):
#     if supabase is None:
#         logger.warning("DB not available")
#         return None

#     try:
#         response = supabase.table("history").insert(data).execute()
#         return response
#     except Exception as e:
#         logger.error(f"Insert failed: {e}")
#         return None


# def fetch_history(limit=20):
#     if supabase is None:
#         return []

#     try:
#         response = (
#             supabase
#             .table("history")
#             .select("*")
#             .order("timestamp", desc=True)
#             .limit(limit)
#             .execute()
#         )
#         return response.data
#     except Exception as e:
#         logger.error(f"Fetch failed: {e}")
#         return []


# def get_prediction_by_id(prediction_id: str):
#     if supabase is None:
#         return None

#     try:
#         response = (
#             supabase
#             .table("history")
#             .select("*")
#             .eq("id", prediction_id)
#             .single()
#             .execute()
#         )
#         return response.data
#     except Exception as e:
#         logger.error(f"Fetch by id failed: {e}")
#         return None

# import os
# from dotenv import load_dotenv
# from supabase import create_client

# load_dotenv()

# SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# supabase = None

# if SUPABASE_URL and SUPABASE_KEY:
#     try:
#         supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
#         print("✅ Supabase connected")
#     except Exception as e:
#         print("❌ Supabase error:", e)
#         supabase = None


# def insert_prediction(data: dict):
#     if not supabase:
#         return None
#     return supabase.table("history").insert(data).execute()



import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase = None

try:
    if SUPABASE_URL and SUPABASE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase connected")
    else:
        print("❌ Missing Supabase credentials")
except Exception as e:
    print("❌ Supabase error:", e)
    supabase = None

print("🔥 SUPABASE URL:", SUPABASE_URL)

def insert_prediction(data: dict):
    if not supabase:
        print("⚠️ Supabase not available")
        return None

    try:
        response = supabase.table("history").insert(data).execute()
        return response
    except Exception as e:
        print("❌ Insert error:", e)
        return None