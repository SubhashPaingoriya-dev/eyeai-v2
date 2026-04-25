#!/usr/bin/env bash
# EyeAI — One-command startup
set -e
G='\033[0;32m'; C='\033[0;36m'; Y='\033[1;33m'; B='\033[1m'; N='\033[0m'
log() { echo -e "${C}[EyeAI]${N} $1"; }
ok()  { echo -e "${G}[  OK  ]${N} $1"; }
err() { echo -e "\033[0;31m[ERROR]${N} $1"; exit 1; }

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BP=${BACKEND_PORT:-8000}; FP=${FRONTEND_PORT:-5173}

echo ""; echo -e "${B}  👁️  EyeAI — Starting Full Stack${N}"; echo ""

command -v python3 &>/dev/null || err "Python 3 not found"
command -v node    &>/dev/null || err "Node.js not found"
ok "Python $(python3 --version | awk '{print $2}') + Node $(node --version)"

# ── Backend ──────────────────────────────────────────────
log "Setting up backend..."
cd "$DIR/backend"
[ ! -d "venv" ] && python3 -m venv venv && log "Created venv"
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
pip install -q -r requirements.txt
[ -f "app/model/sklearn_model.pkl" ] && ok "ML model: sklearn_model.pkl" || \
  log "No model — running mock mode"
[ ! -f ".env" ] && echo "MONGODB_URI=mongodb://localhost:27017" > .env

python3 -m uvicorn app.main:app --host 0.0.0.0 --port $BP \
    --log-level warning > /tmp/eyeai_backend.log 2>&1 &
BPID=$!; echo $BPID > /tmp/eyeai_backend.pid
log "Waiting for backend (port $BP)..."
for i in $(seq 1 20); do
    curl -s "http://localhost:$BP/api/health" > /dev/null 2>&1 && break
    [ $i -eq 20 ] && err "Backend failed. Check /tmp/eyeai_backend.log"
    sleep 1
done
ok "Backend  → http://localhost:$BP  (Docs: /api/docs)"

# ── Frontend ─────────────────────────────────────────────
log "Setting up frontend..."
cd "$DIR/frontend"
[ ! -d "node_modules" ] && { log "npm install..."; npm install --legacy-peer-deps --silent; }
echo "VITE_API_URL=http://localhost:$BP" > .env

npm run dev -- --port $FP --host > /tmp/eyeai_frontend.log 2>&1 &
FPID=$!; echo $FPID > /tmp/eyeai_frontend.pid
log "Waiting for frontend (port $FP)..."
for i in $(seq 1 60); do
    curl -s "http://localhost:$FP" > /dev/null 2>&1 && break
    grep -q "Local:" /tmp/eyeai_frontend.log 2>/dev/null && break
    [ $i -eq 60 ] && { log "Frontend may still be loading..."; break; }
    sleep 1
done

echo ""
echo -e "${B}${G}  ✅  EyeAI is live!${N}"
echo ""
echo -e "  🌐 App       →  ${C}http://localhost:$FP${N}"
echo -e "  ⚙️  API       →  ${C}http://localhost:$BP${N}"
echo -e "  📖 API Docs  →  ${C}http://localhost:$BP/api/docs${N}"
echo ""
echo -e "  Press ${Y}Ctrl+C${N} to stop"
echo ""
trap "echo ''; log 'Stopping...'; kill $BPID $FPID 2>/dev/null; ok 'Stopped.'" INT TERM
wait $BPID
