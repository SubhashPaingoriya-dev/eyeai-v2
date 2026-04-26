import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "eye_detection")

client = AsyncIOMotorClient(MONGODB_URI)
db = client[DB_NAME]

def get_predictions_collection():
    return db["history"]

