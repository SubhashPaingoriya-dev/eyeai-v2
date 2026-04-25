import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  "Preprocessing retinal image...",
  "Extracting color histograms...",
  "Analyzing texture features...",
  "Running ML classification...",
  "Computing confidence scores...",
  "Generating clinical report...",
];

export default function Loader({ uploadProgress = 0, imageFile }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  useEffect(() => {
    const delays = [400, 1200, 2200, 3400, 4600, 5800];
    const timers = delays.map((delay, i) =>
      setTimeout(() => { setDone((p) => [...p, i]); setStep(i + 1); }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-surface-0/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center px-6"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-radial from-brand-cyan/5 via-transparent to-transparent pointer-events-none" />

      {/* Scanner */}
      <div className="relative mb-8">
        {/* Outer rings */}
        <div className="w-36 h-36 relative">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-cyan ring-spin-1" />
          <div className="absolute inset-3 rounded-full border border-brand-violet/40 ring-spin-2" />
          <div className="absolute inset-6 rounded-full border border-brand-cyan/20" />

          {/* Eye / image preview */}
          <div className="absolute inset-8 rounded-full overflow-hidden flex items-center justify-center bg-surface-2">
            {previewUrl ? (
              <img src={previewUrl} alt="scanning" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">👁️</span>
            )}
            {/* Scan line inside circle */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="scan-line" />
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-display text-2xl font-bold text-white mb-1 text-center"
      >
        Analyzing Eye Image
      </motion.h2>
      <p className="font-mono-custom text-xs text-brand-cyan tracking-widest mb-8 text-center">AI DIAGNOSIS IN PROGRESS</p>

      {/* Upload progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-72 mb-6">
          <div className="flex justify-between text-xs font-mono-custom text-surface-5 mb-2">
            <span>Uploading</span><span className="text-brand-cyan">{uploadProgress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
            <motion.div className="h-full rounded-full bg-brand-cyan" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="flex flex-col gap-2.5 w-72">
        {STEPS.map((s, i) => {
          const isDone = done.includes(i);
          const isActive = step === i && !isDone;
          const isPending = step < i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isPending ? 0.25 : 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 text-xs font-mono-custom transition-colors ${isDone ? "text-brand-green" : isActive ? "text-brand-cyan" : "text-surface-5"}`}
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isDone ? "bg-brand-green" : isActive ? "bg-brand-cyan animate-pulse" : "bg-surface-4"}`} />
              <span>{s}</span>
              {isDone && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">✓</motion.span>}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
