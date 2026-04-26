# """
# Prediction API Routes
# POST /api/predict - Upload image and get prediction
# """

# from app.database import supabase
# import uuid
# import time
# import base64
# import logging
# from datetime import datetime, timezone
# from typing import Optional

# from fastapi import APIRouter, UploadFile, File, HTTPException, Form
# from fastapi.responses import JSONResponse

# from app.model.predict import predict as run_prediction
# # from app.database import get_predictions_collection

# logger = logging.getLogger(__name__)
# router = APIRouter()

# # ─── Constants ────────────────────────────────────────────────────────────────

# ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"}
# MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# # ─── Prediction Endpoint ──────────────────────────────────────────────────────

# @router.post("/predict")
# async def predict_disease(
#     file: UploadFile = File(...),
#     generate_heatmap: bool = Form(default=True),
#     session_id: Optional[str] = Form(default=None),
# ):
#     """
#     Upload a retinal/eye fundus image and receive AI-powered disease prediction.

#     - **file**: Eye/fundus image (JPEG, PNG, WebP)
#     - **generate_heatmap**: Generate Grad-CAM visualization (default: true)
#     - **session_id**: Optional client session identifier for history tracking
#     """

#     # ── Validate file type ────────────────────────────────────────────────────
#     if file.content_type not in ALLOWED_TYPES:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Invalid file type '{file.content_type}'. Accepted: JPEG, PNG, WebP"
#         )

#     # ── Read file bytes ───────────────────────────────────────────────────────
#     image_bytes = await file.read()

#     if len(image_bytes) > MAX_FILE_SIZE:
#         raise HTTPException(
#             status_code=413,
#             detail="File too large. Maximum size is 10MB."
#         )

#     if len(image_bytes) < 1024:  # Too small to be a real image
#         raise HTTPException(
#             status_code=400,
#             detail="File appears to be invalid or corrupted."
#         )

#     logger.info(f"Processing image: {file.filename} ({len(image_bytes) / 1024:.1f} KB)")

#     # ── Run Prediction ────────────────────────────────────────────────────────
#     prediction = run_prediction(image_bytes, generate_heatmap=generate_heatmap)

#     if "error" in prediction:
#         raise HTTPException(status_code=500, detail=prediction["error"])

#     # ── Build Response ────────────────────────────────────────────────────────
#     prediction_id = str(uuid.uuid4())
#     timestamp = datetime.now(timezone.utc).isoformat()

#     # Encode image as base64 for storage/display
#     image_b64 = base64.b64encode(image_bytes).decode("utf-8")
#     image_data_url = f"data:{file.content_type};base64,{image_b64}"

#     response_data = {
#         "id": prediction_id,
#         "timestamp": timestamp,
#         "filename": file.filename,
#         "image_url": image_data_url,
#         "prediction": {
#             "disease": prediction["disease"],
#             "confidence": prediction["confidence"],
#             "confidence_pct": f"{prediction['confidence'] * 100:.1f}%",
#             "all_predictions": prediction["all_predictions"],
#         },
#         "disease_info": prediction.get("disease_info", {}),
#         "gradcam_image": prediction.get("gradcam_image"),
#         "model_info": {
#             "version": prediction.get("model_version", "unknown"),
#             "inference_time_ms": prediction.get("inference_time_ms"),
#             "is_mock": prediction.get("is_mock", False),
#         },
#         "session_id": session_id,
#     }

#     # ── Save to Database ──────────────────────────────────────────────────────
#     # try:
#     #     # collection = get_predictions_collection()
#     #     # if collection is not None:
#     #     #     db_record = {
#     #     #         "_id": prediction_id,
#     #     #         "timestamp": timestamp,
#     #     #         "filename": file.filename,
#     #     #         "session_id": session_id,
#     #     #         "disease": prediction["disease"],
#     #     #         "confidence": prediction["confidence"],
#     #     #         "all_predictions": prediction["all_predictions"],
#     #     #         "model_version": prediction.get("model_version"),
#     #     #     }
#     #     #     await collection.insert_one(db_record)
#     #         logger.info(f"Saved prediction {prediction_id} to database")
#     # except Exception as e:
#     #     logger.warning(f"Could not save to database: {e}")
#     try:
#         if supabase:
#             supabase.table("history").insert({
#                 "id": prediction_id,
#                 "timestamp": timestamp,
#                 "filename": file.filename,
#                 "session_id": session_id,
#                 "disease": prediction["disease"],
#                 "confidence": prediction["confidence"],
#                 "severity": prediction.get("disease_info", {}).get("severity", "unknown")
#             }).execute()

#             logger.info(f"Saved prediction {prediction_id} to Supabase")

#         else:
#             logger.warning("Supabase not connected")

#     except Exception as e:
#         logger.warning(f"Could not save to Supabase: {e}")

#     return JSONResponse(content=response_data, status_code=200)


"""
Prediction API Routes
POST /api/predict - Upload image and get prediction
"""

import uuid
import base64
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse

from app.model.predict import predict as run_prediction
from app.database import insert_prediction   # ✅ Supabase

logger = logging.getLogger(__name__)
router = APIRouter()

# ─── Constants ────────────────────────────────────────────────
ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# ─── Prediction Endpoint ──────────────────────────────────────
@router.post("/predict")
async def predict_disease(
    file: UploadFile = File(...),
    generate_heatmap: bool = Form(default=True),
    session_id: Optional[str] = Form(default=None),
):

    # ── Validate file type ────────────────────────────────────
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Use JPG/PNG/WebP"
        )

    image_bytes = await file.read()

    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large")

    if len(image_bytes) < 1024:
        raise HTTPException(status_code=400, detail="Invalid image")

    logger.info(f"Processing image: {file.filename}")

    # ── Run ML Model ──────────────────────────────────────────
    prediction = run_prediction(image_bytes, generate_heatmap=generate_heatmap)

    if "error" in prediction:
        raise HTTPException(status_code=500, detail=prediction["error"])

    # ── Build Response ────────────────────────────────────────
    prediction_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).isoformat()

    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    image_data_url = f"data:{file.content_type};base64,{image_b64}"

    response_data = {
        "id": prediction_id,
        "timestamp": timestamp,
        "filename": file.filename,
        "image_url": image_data_url,
        "prediction": {
            "disease": prediction["disease"],
            "confidence": prediction["confidence"],
        },
        "severity": "moderate",  # simple placeholder
        "session_id": session_id,
    }

    # ── Save to Supabase ──────────────────────────────────────
    try:
        insert_prediction({
            "id": prediction_id,
            "timestamp": timestamp,
            "filename": file.filename,
            "session_id": session_id,
            "disease": prediction["disease"],
            "confidence": prediction["confidence"],
            "severity": "moderate"
        })
        logger.info(f"Saved prediction {prediction_id}")
    except Exception as e:
        logger.warning(f"DB save failed: {e}")

    return JSONResponse(content=response_data, status_code=200)