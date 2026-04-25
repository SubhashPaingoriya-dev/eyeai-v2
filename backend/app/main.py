"""
OcuScan AI — FastAPI Backend
Serves both the REST API and the React static build.
"""
import os, time, logging
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from app.routes import predict, diseases, history
from app.database import connect_db, close_db

logging.basicConfig(level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# ─── Frontend build path ─────────────────────────────────────────────────────
FRONTEND_BUILD = Path(__file__).parent.parent.parent / "frontend" / "build"

app = FastAPI(
    title="OcuScan AI — Eye Disease Detection",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# from fastapi.responses import FileResponse
# from reportlab.lib.pagesizes import letter
# from reportlab.pdfgen import canvas
# import uuid

# @app.get("/api/report/{prediction_id}")
# def generate_pdf(prediction_id: str):
#     file_name = f"report_{prediction_id}.pdf"

#     c = canvas.Canvas(file_name, pagesize=letter)
#     c.drawString(100, 750, f"EyeAI Report ID: {prediction_id}")
#     c.drawString(100, 700, "Generated successfully!")
#     c.save()

#     return FileResponse(file_name, media_type='application/pdf', filename=file_name)

from app.database import supabase
from fastapi.responses import FileResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

@app.get("/api/report/{prediction_id}")
def generate_pdf(prediction_id: str):

    if not supabase:
        return {"error": "Database not connected"}

    response = supabase.table("history").select("*").eq("id", prediction_id).execute()

    if not response.data:
        return {"error": "Prediction not found"}

    data = response.data[0]

    file_name = f"report_{prediction_id}.pdf"

    c = canvas.Canvas(file_name, pagesize=letter)

    c.setFont("Helvetica", 12)
    c.drawString(100, 750, "EyeAI Report")

    c.drawString(100, 720, f"Prediction ID: {prediction_id}")
    c.drawString(100, 700, f"Disease: {data.get('disease')}")
    c.drawString(100, 680, f"Confidence: {data.get('confidence')}")
    c.drawString(100, 660, f"Severity: {data.get('severity')}")
    c.drawString(100, 640, f"Timestamp: {data.get('timestamp')}")

    c.save()

    return FileResponse(file_name, media_type='application/pdf', filename=file_name)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request timing ───────────────────────────────────────────────────────────
@app.middleware("http")
async def add_timing(request: Request, call_next):
    t = time.time()
    response = await call_next(request)
    response.headers["X-Process-Time"] = f"{time.time()-t:.4f}s"
    return response

# ─── Lifecycle ────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    logger.info("🚀 Starting OcuScan AI API...")
    await connect_db()
    if FRONTEND_BUILD.exists():
        logger.info(f"✅ React build found at {FRONTEND_BUILD}")
    else:
        logger.info("ℹ️  No React build found. Run: cd frontend && npm run build")

@app.on_event("shutdown")
async def shutdown():
    await close_db()

# ─── API Routes ───────────────────────────────────────────────────────────────
app.include_router(predict.router,  prefix="/api", tags=["Prediction"])
app.include_router(diseases.router, prefix="/api", tags=["Diseases"])
app.include_router(history.router,  prefix="/api", tags=["History"])

# ─── API system routes ────────────────────────────────────────────────────────
@app.get("/api/health", tags=["System"])
async def health():
    from app.model.predict import load_model
    model = load_model()
    return {
        "status": "ok",
        "timestamp": time.time(),
        "model_loaded": model is not None,
        "frontend_built": FRONTEND_BUILD.exists(),
    }

# ─── Serve React static build ─────────────────────────────────────────────────
if FRONTEND_BUILD.exists():
    # Serve static assets (JS, CSS, images)
    app.mount(
        "/static",
        StaticFiles(directory=str(FRONTEND_BUILD / "static")),
        name="static",
    )

    @app.get("/", include_in_schema=False)
    @app.get("/{path:path}", include_in_schema=False)
    async def serve_react(path: str = ""):
        # API routes take priority (handled above)
        # Everything else → serve index.html (React Router handles it)
        index = FRONTEND_BUILD / "index.html"
        if index.exists():
            return FileResponse(str(index))
        return JSONResponse({"status": "healthy", "service": "OcuScan AI",
                             "note": "Frontend not built yet. Run: cd frontend && npm run build"})
else:
    @app.get("/", tags=["System"])
    async def root():
        return {
            "status": "healthy",
            "service": "OcuScan AI Eye Disease Detection",
            "version": "1.0.0",
            "api_docs": "/api/docs",
            "note": "Frontend not built. Run: cd frontend && npm run build",
        }

# ─── Error handlers ───────────────────────────────────────────────────────────
@app.exception_handler(404)
async def not_found(req, exc):
    # If frontend is built, serve index.html for unknown routes (SPA routing)
    if FRONTEND_BUILD.exists():
        return FileResponse(str(FRONTEND_BUILD / "index.html"))
    return JSONResponse(status_code=404, content={"error": "Not found"})

@app.exception_handler(500)
async def server_error(req, exc):
    logger.error(f"Server error: {exc}")
    return JSONResponse(status_code=500, content={"error": "Internal server error"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

# Override health to include model status
from fastapi.responses import JSONResponse as _JSONResponse
import os as _os

@app.get("/api/health")
async def health_v2():
    model_ok = _os.path.exists("app/model/sklearn_model.pkl")
    return {"status": "ok", "model_loaded": model_ok, "timestamp": __import__("time").time()}
