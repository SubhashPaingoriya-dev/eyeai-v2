import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Flame, Info } from "lucide-react";

export default function HeatmapViewer({ imageUrl, heatmapBase64, isMock }) {
  const [view, setView] = useState("original"); // original | heatmap

  const heatmapSrc = heatmapBase64
    ? (heatmapBase64.startsWith("data:") ? heatmapBase64 : `data:image/jpeg;base64,${heatmapBase64}`)
    : null;

  return (
    <div className="rounded-2xl bg-surface-2 border border-surface-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-3">
        <h3 className="font-display font-bold text-white text-sm">Visual Analysis</h3>
        {/* Tab toggle */}
        <div className="flex gap-1 p-1 bg-surface-3 rounded-lg">
          {[
            ["original", <Eye size={13} />, "Original"],
            ["heatmap", <Flame size={13} />, "Grad-CAM"],
          ].map(([v, icon, label]) => (
            <button
              key={v}
              onClick={() => heatmapSrc && setView(v)}
              disabled={v === "heatmap" && !heatmapSrc}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono-custom transition-all ${view === v ? "bg-surface-2 text-brand-cyan border border-brand-cyan/20" : "text-surface-5 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"}`}
            >
              {icon}{label}
            </button>
          ))}
        </div>
      </div>

      {/* Image area */}
      <div className="relative overflow-hidden" style={{ height: 260 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {view === "original" ? (
              imageUrl ? (
                <img src={imageUrl} alt="Original" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface-3">
                  <p className="text-surface-5 text-sm font-inter">No image available</p>
                </div>
              )
            ) : (
              heatmapSrc ? (
                <div className="relative w-full h-full">
                  <img src={heatmapSrc} alt="Heatmap" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/70 border border-brand-rose/40 text-brand-rose text-xs font-mono-custom backdrop-blur-sm">
                    GRAD-CAM VISUALIZATION
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-surface-3">
                  <Flame size={28} className="text-surface-5 mb-2" />
                  <p className="text-surface-5 text-sm font-inter">Heatmap not available in demo mode</p>
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>

        {/* Label overlay */}
        {view === "original" && imageUrl && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1.5 rounded-lg bg-black/70 text-brand-cyan text-xs font-mono-custom backdrop-blur-sm border border-brand-cyan/20">
            FUNDUS IMAGE
          </div>
        )}
      </div>

      {/* Explainer */}
      <div className="p-4 border-t border-surface-3">
        <div className="flex gap-2.5">
          <Info size={14} className="text-brand-cyan flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-mono-custom text-surface-5 uppercase tracking-widest mb-1">How the AI Decided</p>
            <p className="text-xs text-surface-5 font-inter leading-relaxed">
              {view === "heatmap"
                ? "Red/yellow regions show where the model focused most when making its prediction. This Grad-CAM visualization highlights pathological features in the retina."
                : "The model analyzes color histograms, texture gradients, brightness distribution, and disease-specific pixel patterns to classify the eye condition."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
