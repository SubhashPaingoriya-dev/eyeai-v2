# # """
# # History Routes
# # GET /api/history - Get prediction history
# # DELETE /api/history/{id} - Delete prediction
# # """

# # import logging
# # from typing import Optional
# # from fastapi import APIRouter, Query, HTTPException
# # from app.database import get_predictions_collection

# # router = APIRouter()
# # logger = logging.getLogger(__name__)


# # @router.get("/history")
# # async def get_history(
# #     limit: int = Query(default=20, ge=1, le=100),
# #     skip: int = Query(default=0, ge=0),
# #     session_id: Optional[str] = Query(default=None),
# #     disease: Optional[str] = Query(default=None),
# # ):
# #     """
# #     Get prediction history.
# #     - **limit**: Max records to return (1-100)
# #     - **skip**: Pagination offset
# #     - **session_id**: Filter by session
# #     - **disease**: Filter by disease type
# #     """
# #     collection = get_predictions_collection()

# #     if collection is None:
# #         # Return empty history when DB not available
# #         return {"history": [], "total": 0, "db_available": False}

# #     try:
# #         query = {}
# #         if session_id:
# #             query["session_id"] = session_id
# #         if disease:
# #             query["disease"] = disease

# #         cursor = collection.find(query, {"_id": 1, "timestamp": 1, "filename": 1,
# #                                          "disease": 1, "confidence": 1, "session_id": 1})
# #         cursor = cursor.sort("timestamp", -1).skip(skip).limit(limit)

# #         records = []
# #         async for doc in cursor:
# #             doc["id"] = doc.pop("_id")
# #             records.append(doc)

# #         total = await collection.count_documents(query)

# #         return {
# #             "history": records,
# #             "total": total,
# #             "limit": limit,
# #             "skip": skip,
# #             "db_available": True
# #         }

# #     except Exception as e:
# #         logger.error(f"History query failed: {e}")
# #         return {"history": [], "total": 0, "error": str(e)}


# # @router.delete("/history/{prediction_id}")
# # async def delete_prediction(prediction_id: str):
# #     """Delete a specific prediction from history."""
# #     collection = get_predictions_collection()

# #     if collection is None:
# #         raise HTTPException(status_code=503, detail="Database not available")

# #     result = await collection.delete_one({"_id": prediction_id})

# #     if result.deleted_count == 0:
# #         raise HTTPException(status_code=404, detail="Prediction not found")

# #     return {"message": "Prediction deleted successfully", "id": prediction_id}


# # @router.delete("/history")
# # async def clear_history(session_id: Optional[str] = Query(default=None)):
# #     """Clear all history (optionally filter by session)."""
# #     collection = get_predictions_collection()

# #     if collection is None:
# #         raise HTTPException(status_code=503, detail="Database not available")

# #     query = {}
# #     if session_id:
# #         query["session_id"] = session_id

# #     result = await collection.delete_many(query)
# #     return {"message": f"Deleted {result.deleted_count} records"}



# from fastapi import APIRouter, HTTPException
# from app.database import supabase

# router = APIRouter()

# # 🔥 GET HISTORY
# @router.get("/history")
# def get_history():
#     if not supabase:
#         return {"history": [], "total": 0, "db_available": False}

#     try:
#         response = supabase.table("history").select("*").order("created_at", desc=True).execute()

#         data = response.data if response.data else []

#         return {
#             "history": data,
#             "total": len(data),
#             "db_available": True
#         }

#     except Exception as e:
#         return {"history": [], "total": 0, "error": str(e)}


# # 🔥 DELETE ONE
# @router.delete("/history/{prediction_id}")
# def delete_prediction(prediction_id: str):
#     if not supabase:
#         raise HTTPException(status_code=503, detail="Database not available")

#     supabase.table("history").delete().eq("id", prediction_id).execute()

#     return {"message": "Deleted", "id": prediction_id}


# # 🔥 CLEAR ALL
# @router.delete("/history")
# def clear_history():
#     if not supabase:
#         raise HTTPException(status_code=503, detail="Database not available")

#     supabase.table("history").delete().neq("id", "").execute()

#     return {"message": "All history cleared"}

# from fastapi import APIRouter, HTTPException
# from app.database import supabase

# router = APIRouter()

# # @router.get("/history")
# # def get_history():
# #     if not supabase:
# #         return {"history": [], "total": 0, "db_available": False}

# #     try:
# #         response = supabase.table("history").select("*").order("created_at", desc=True).execute()

# #         data = response.data if response.data else []

# #         return {
# #             "history": data,
# #             "total": len(data),
# #             "db_available": True
# #         }

# #     except Exception as e:
# #         return {"history": [], "total": 0, "error": str(e)}

# @router.get("/history")
# async def get_history():

#     if not supabase:
#         return {"history": [], "total": 0}

#     try:
#         response = supabase.table("history").select("*").order("timestamp", desc=True).execute()

#         return {
#             "history": response.data,
#             "total": len(response.data)
#         }

#     except Exception as e:
#         return {"history": [], "error": str(e)}


# @router.delete("/history/{prediction_id}")
# def delete_prediction(prediction_id: str):
#     if not supabase:
#         raise HTTPException(status_code=503, detail="Database not available")

#     supabase.table("history").delete().eq("id", prediction_id).execute()

#     return {"message": "Deleted", "id": prediction_id}


# @router.delete("/history")
# def clear_history():
#     if not supabase:
#         raise HTTPException(status_code=503, detail="Database not available")

#     supabase.table("history").delete().neq("id", "").execute()

#     return {"message": "All history cleared"}

from fastapi import APIRouter, HTTPException
from app.database import supabase

router = APIRouter()

# @router.get("/history")
# async def get_history():

#     print("🔥 API HIT /history")

#     if not supabase:
#         print("❌ Supabase is NONE")
#         return {"history": [], "total": 0}

#     try:
#         response = supabase.table("history").select("*").execute()

#         print("✅ RAW RESPONSE:", response)

#         # data = response.data if response.data else []
#         data = response.model_dump().get("data", [])

#         print("✅ DATA:", data)

#         return {
#             "history": data,
#             "total": len(data)
#         }

#     except Exception as e:
#         print("❌ ERROR:", str(e))
#         return {"history": [], "error": str(e)}

from fastapi import APIRouter, HTTPException
from app.database import supabase

router = APIRouter()

@router.get("/history")
async def get_history():

    if not supabase:
        return {"history": [], "total": 0}

    try:
        response = supabase.table("history").select("*").execute()

        data = response.model_dump().get("data", [])

        return {
            "history": data,
            "total": len(data)
        }

    except Exception as e:
        return {"history": [], "error": str(e)}


@router.delete("/history/{prediction_id}")
def delete_prediction(prediction_id: str):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    supabase.table("history").delete().eq("id", prediction_id).execute()

    return {"message": "Deleted", "id": prediction_id}


@router.delete("/history")
def clear_history():
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    supabase.table("history").delete().neq("id", "").execute()

    return {"message": "All history cleared"}