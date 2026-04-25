import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Activity, Shield, Zap, Info } from "lucide-react";

const SEVERITY = {
  none:     { color: "#10b981", label: "Healthy",   Icon: CheckCircle,   ring: "#10b981" },
  low:      { color: "#3b82f6", label: "Low Risk",  Icon: Info,          ring: "#3b82f6" },
  moderate: { color: "#f59e0b", label: "Moderate",  Icon: AlertTriangle, ring: "#f59e0b" },
  high:     { color: "#f43f5e", label: "High Risk", Icon: Zap,           ring: "#f43f5e" },
};

// SVG Confidence Ring
function ConfidenceRing({ value, color }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    const t = setTimeout(() => setOffset(circ * (1 - value)), 200);
    return () => clearTimeout(t);
  }, [value, circ]);

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg width="144" height="144" className="-rotate-90">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#1a2332" strokeWidth="10" />
        <circle
          cx="72" cy="72" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display font-bold text-3xl text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          {(value * 100).toFixed(0)}%
        </motion.span>
        <span className="text-xs font-mono-custom text-surface-5 mt-0.5">confidence</span>
      </div>
    </div>
  );
}

export default function ResultCard({ result }) {
  if (!result) return null;

  const severityKey = result.disease_info?.severity || result.severity || "none";
  const sv = SEVERITY[severityKey] || SEVERITY.none;
  const SvIcon = sv.Icon;
  const info = result.disease_info || {};
  const confidence = result.confidence || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-surface-2 border border-surface-3 overflow-hidden"
    >
      {/* Color top bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${sv.color}, ${sv.color}80)` }} />

      <div className="p-6">
        {/* Severity badge */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-custom border"
            style={{ color: sv.color, borderColor: `${sv.color}40`, background: `${sv.color}10` }}
          >
            <SvIcon size={12} />
            {sv.label.toUpperCase()}
          </span>
          {result.model_info?.is_mock && (
            <span className="px-2 py-0.5 rounded-full text-xs font-mono-custom bg-brand-amber/10 border border-brand-amber/30 text-brand-amber">DEMO</span>
          )}
        </div>

        {/* Disease name */}
        <h2 className="font-display text-2xl font-bold text-white mb-1 leading-tight">
          {info.icon || "👁️"} {info.name || result.disease}
        </h2>

        {/* Urgency label */}
        {info.urgency_label && (
          <p className="text-xs font-mono-custom mb-5" style={{ color: sv.color }}>
            {info.urgency_label}
          </p>
        )}

        {/* Confidence ring */}
        <ConfidenceRing value={confidence} color={sv.color} />

        {/* Description */}
        {info.description && (
          <div className="mt-6 p-4 rounded-xl bg-surface-3/50 border border-surface-4">
            <p className="text-xs font-mono-custom text-surface-5 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Info size={11} /> About
            </p>
            <p className="text-sm text-surface-5 leading-relaxed font-inter">{info.description}</p>
          </div>
        )}

        {/* Symptoms */}
        {info.symptoms?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-mono-custom text-surface-5 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Activity size={11} /> Symptoms
            </p>
            <div className="flex flex-wrap gap-2">
              {info.symptoms.map((s, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="px-2.5 py-1 rounded-full text-xs font-inter border bg-surface-3 border-surface-4 text-surface-5"
                  style={{ borderColor: `${sv.color}25` }}
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {info.risk_factors?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-mono-custom text-surface-5 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Shield size={11} /> Risk Factors
            </p>
            <div className="flex flex-wrap gap-2">
              {info.risk_factors.map((r, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full text-xs font-inter bg-brand-violet/10 border border-brand-violet/20 text-brand-violet/80">{r}</span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        {info.recommendation && (
          <div className="mt-5 p-4 rounded-xl border-l-4" style={{ borderLeftColor: sv.color, background: `${sv.color}08` }}>
            <p className="text-xs font-mono-custom mb-1.5" style={{ color: sv.color }}>
              🩺 {info.urgency_label || "RECOMMENDATION"}
            </p>
            <p className="text-sm text-surface-5 leading-relaxed font-inter">{info.recommendation}</p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-5 flex gap-2.5 p-3 rounded-xl bg-brand-amber/5 border border-brand-amber/20">
          <AlertTriangle size={14} className="text-brand-amber flex-shrink-0 mt-0.5" />
          <p className="text-xs text-surface-5 font-inter leading-relaxed">
            <span className="text-brand-amber font-medium">Medical Disclaimer: </span>
            This AI tool is for educational purposes only. Always consult a licensed ophthalmologist.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
