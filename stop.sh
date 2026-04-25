#!/usr/bin/env bash
echo "Stopping EyeAI..."
[ -f /tmp/eyeai_backend.pid  ] && kill $(cat /tmp/eyeai_backend.pid)  2>/dev/null && echo "  Backend stopped"
[ -f /tmp/eyeai_frontend.pid ] && kill $(cat /tmp/eyeai_frontend.pid) 2>/dev/null && echo "  Frontend stopped"
pkill -f "uvicorn app.main" 2>/dev/null; pkill -f "vite" 2>/dev/null; echo "Done."
