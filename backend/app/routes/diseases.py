"""
Disease Information Route
GET /api/diseases - Return all disease info
GET /api/diseases/{disease_id} - Return specific disease info
"""

import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter()

DISEASES_PATH = Path(__file__).parent.parent / "data" / "diseases.json"

def load_diseases():
    with open(DISEASES_PATH, "r") as f:
        return json.load(f)

@router.get("/diseases")
async def get_all_diseases():
    """Get information about all detectable diseases."""
    data = load_diseases()
    return {
        "diseases": list(data["diseases"].values()),
        "model_classes": data["model_classes"],
        "total": len(data["diseases"])
    }

@router.get("/diseases/{disease_id}")
async def get_disease(disease_id: str):
    """Get information about a specific disease."""
    data = load_diseases()
    disease = data["diseases"].get(disease_id)
    if not disease:
        raise HTTPException(status_code=404, detail=f"Disease '{disease_id}' not found")
    return disease
