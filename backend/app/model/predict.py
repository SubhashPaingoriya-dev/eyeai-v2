"""
Eye Disease Prediction Engine — sklearn RandomForest on color/texture features.
100% offline, no internet download required.
"""
import os, io, json, time, pickle, random, logging
import numpy as np
from pathlib import Path

logger = logging.getLogger(__name__)

MODEL_DIR     = Path(__file__).parent
SK_MODEL_PATH = MODEL_DIR / "sklearn_model.pkl"
DISEASES_PATH = Path(__file__).parent.parent / "data" / "diseases.json"

CLASS_NAMES = ["cataract", "diabetic_retinopathy", "glaucoma", "myopia", "normal"]

def load_disease_data():
    try:
        with open(DISEASES_PATH) as f:
            return json.load(f)["diseases"]
    except Exception as e:
        logger.error(f"Disease data error: {e}")
        return {}

DISEASE_DATA = load_disease_data()

_model = None
def load_model():
    global _model
    if _model: return _model
    if not SK_MODEL_PATH.exists():
        logger.warning(f"Model not at {SK_MODEL_PATH}. Mock mode."); return None
    try:
        with open(SK_MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
        logger.info(f"Model loaded: {SK_MODEL_PATH}")
        return _model
    except Exception as e:
        logger.error(f"Load failed: {e}"); return None

def extract_features(image_bytes):
    from PIL import Image
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((64,64))
        arr = np.array(img, dtype=np.float32) / 255.0
        feats = []
        for c in range(3):
            hist, _ = np.histogram(arr[:,:,c], bins=32, range=(0,1))
            feats.extend(hist / (hist.sum()+1e-8))
        for c in range(3):
            feats += [arr[:,:,c].mean(), arr[:,:,c].std()]
        h,w = arr.shape[:2]; cx,cy=h//2,w//2; r=min(h,w)//4
        feats += [arr[cy-r:cy+r,cx-r:cx+r].mean(), arr.mean()]
        gray = arr.mean(2)
        feats += [np.abs(np.diff(gray,axis=1)).mean(), np.abs(np.diff(gray,axis=0)).mean()]
        feats += [(arr.mean(2)>0.7).mean(), (arr.mean(2)<0.2).mean(),
                  (arr[:,:,0]>arr[:,:,1]+0.1).mean()]
        return np.array(feats).reshape(1,-1)
    except Exception as e:
        logger.error(f"Feature error: {e}"); return None

def _build(disease, confidence, probs, is_mock, ms):
    return {
        "disease": disease, "confidence": confidence,
        "all_predictions": [{"disease":CLASS_NAMES[i],"confidence":float(probs[i]),
            "label":DISEASE_DATA.get(CLASS_NAMES[i],{}).get("name",CLASS_NAMES[i])}
            for i in range(len(CLASS_NAMES))],
        "disease_info": DISEASE_DATA.get(disease,{}), "gradcam_image": None,
        "inference_time_ms": round(ms,2) if ms else None,
        "model_version": "ocunet-rf-1.0" if not is_mock else "mock-1.0",
        "is_mock": is_mock,
    }

def predict(image_bytes: bytes, generate_heatmap: bool = False) -> dict:
    model = load_model()
    if not model:
        time.sleep(1.2)
        w = random.choices(CLASS_NAMES, weights=[0.20,0.15,0.15,0.15,0.35])[0]
        p = np.random.dirichlet(np.ones(5)*0.3)
        p[CLASS_NAMES.index(w)] = random.uniform(0.68,0.95); p/=p.sum()
        return _build(w, float(p[CLASS_NAMES.index(w)]), p, True, None)

    feats = extract_features(image_bytes)
    if feats is None: return {"error": "Feature extraction failed"}
    try:
        t0 = time.time()
        proba = model.predict_proba(feats)[0]
        ms = (time.time()-t0)*1000
        probs = np.zeros(len(CLASS_NAMES))
        for i, cls in enumerate(model.classes_):
            if cls in CLASS_NAMES: probs[CLASS_NAMES.index(cls)] = proba[i]
        idx = int(np.argmax(probs))
        return _build(CLASS_NAMES[idx], float(probs[idx]), probs, False, ms)
    except Exception as e:
        logger.error(f"Predict error: {e}"); return {"error": str(e)}
