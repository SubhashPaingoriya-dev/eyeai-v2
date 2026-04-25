import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RotateCcw, AlertCircle, CheckCircle } from "lucide-react";

// Phase: idle | live | countdown | captured | error
export default function CameraCapture({ onImageReady }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [phase, setPhase] = useState("idle");
  const [countdown, setCountdown] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [devices, setDevices] = useState([]);
  const [deviceIdx, setDeviceIdx] = useState(0);

  // Always stop stream on unmount
  useEffect(() => () => stopStream(), []);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startCamera = useCallback(async () => {
    setPhase("live");
    setErrMsg("");
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const cams = allDevices.filter((d) => d.kind === "videoinput");
      setDevices(cams);
      const deviceId = cams[deviceIdx]?.deviceId;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 960 } } : { facingMode: "user" },
      });
      streamRef.current = stream;
      // Video element is always in DOM — assign immediately
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      const msgs = {
        NotAllowedError: "Camera permission denied. Please allow camera access and try again.",
        NotFoundError: "No camera found on this device.",
        NotReadableError: "Camera is in use by another application.",
        OverconstrainedError: "Camera constraints not satisfied.",
      };
      setErrMsg(msgs[err.name] || `Camera error: ${err.message}`);
      setPhase("error");
    }
  }, [deviceIdx]);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const size = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    canvas.width = 640; canvas.height = 640;
    canvas.getContext("2d").drawImage(video, sx, sy, size, size, 0, 0, 640, 640);
    const url = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedUrl(url);
    stopStream();
    canvas.toBlob((blob) => {
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      onImageReady(file);
    }, "image/jpeg", 0.92);
    setPhase("captured");
  }, [onImageReady]);

  const startCountdown = useCallback(() => {
    setPhase("countdown");
    let count = 3;
    setCountdown(count);
    const iv = setInterval(() => {
      count--;
      if (count === 0) { clearInterval(iv); setCountdown(null); captureFrame(); }
      else setCountdown(count);
    }, 1000);
  }, [captureFrame]);

  const retake = () => {
    setCapturedUrl(null);
    setPhase("idle");
    onImageReady(null);
  };

  const flipCamera = () => {
    stopStream();
    setDeviceIdx((i) => (i + 1) % Math.max(devices.length, 1));
    setPhase("idle");
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-surface-3 bg-surface-2" style={{ minHeight: 300 }}>
      {/* Video — always mounted, shown/hidden via CSS */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full object-cover transition-opacity duration-300 ${phase === "live" || phase === "countdown" ? "opacity-100" : "opacity-0 absolute pointer-events-none"}`}
        style={{ height: 300, display: phase === "live" || phase === "countdown" ? "block" : "none" }}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* ── IDLE ── */}
      {phase === "idle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-10 text-center"
          style={{ minHeight: 300 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-brand-violet/10 border border-brand-violet/30 flex items-center justify-center mx-auto mb-4">
            <Camera size={28} className="text-brand-violet" />
          </div>
          <h3 className="font-display text-lg font-bold text-white mb-2">Live Camera Capture</h3>
          <p className="text-surface-5 text-sm font-inter mb-6 max-w-xs">Align your eye inside the guide circle and hold steady. A 3-second countdown will fire before capture.</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={startCamera}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-violet text-white font-display font-bold text-sm hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all"
          >
            <Camera size={16} /> Start Camera
          </motion.button>
        </motion.div>
      )}

      {/* ── LIVE + COUNTDOWN ── */}
      {(phase === "live" || phase === "countdown") && (
        <div className="relative" style={{ height: 300 }}>
          {/* Eye guide ring */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-44 h-44 rounded-full border-2 border-brand-cyan camera-pulse" style={{ boxShadow: "0 0 0 2000px rgba(0,0,0,0.5), 0 0 30px rgba(6,182,212,0.4)" }} />
          </div>
          {/* Scan line */}
          <div className="absolute w-44 h-44 rounded-full overflow-hidden" style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
            <div className="scan-line" />
          </div>
          {/* Countdown overlay */}
          <AnimatePresence>
            {countdown && (
              <motion.div
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="font-display font-bold text-8xl text-brand-cyan" style={{ textShadow: "0 0 40px #06b6d4" }}>{countdown}</span>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Guide label */}
          {!countdown && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/70 border border-brand-cyan/40 text-brand-cyan text-xs font-mono-custom backdrop-blur-sm">
              Align eye within circle · hold steady
            </div>
          )}
          {/* Controls */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            {devices.length > 1 && (
              <button onClick={flipCamera} className="w-9 h-9 rounded-lg bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                <RotateCcw size={15} />
              </button>
            )}
            <button onClick={stopStream} className="px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs font-inter hover:bg-black/80 transition-colors">
              Cancel
            </button>
            {phase === "live" && (
              <button onClick={startCountdown} className="px-4 py-1.5 rounded-lg bg-brand-cyan text-surface-0 text-xs font-display font-bold hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all">
                Capture
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── CAPTURED ── */}
      {phase === "captured" && capturedUrl && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative" style={{ height: 300 }}>
          <img src={capturedUrl} alt="Captured" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-green/20 border border-brand-green/40">
            <CheckCircle size={14} className="text-brand-green" />
            <span className="text-brand-green text-xs font-mono-custom">Captured — ready to analyze</span>
          </div>
          <button onClick={retake} className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs font-inter hover:bg-black/80 transition-colors">
            <RotateCcw size={13} /> Retake
          </button>
        </motion.div>
      )}

      {/* ── ERROR ── */}
      {phase === "error" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-10 text-center" style={{ minHeight: 300 }}>
          <AlertCircle size={36} className="text-brand-rose mb-4" />
          <p className="text-brand-rose text-sm font-inter mb-4 max-w-xs">{errMsg}</p>
          <button onClick={() => setPhase("idle")} className="px-4 py-2 rounded-xl bg-surface-3 border border-surface-4 text-white text-sm font-inter hover:border-brand-cyan/30 transition-colors">
            Try Again
          </button>
        </motion.div>
      )}
    </div>
  );
}
