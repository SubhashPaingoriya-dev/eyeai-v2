import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, History, RotateCcw, Clock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import ResultCard from "../components/ResultCard";
import HeatmapViewer from "../components/HeatmapViewer";
import { downloadReport } from "../services/api";

const DISEASE_COLORS = {
  normal:               "#10b981",
  cataract:             "#3b82f6",
  glaucoma:             "#f59e0b",
  diabetic_retinopathy: "#f43f5e",
  myopia:               "#f97316",
};

// Animated probability bar row
function ProbBar({ label, value, color, isTop, index }) {
  const [width, setWidth] = useState(0);
  const pct = (value * 100).toFixed(1);

  useEffect(() => {
    const t = setTimeout(() => setWidth(parseFloat(pct)), 300 + index * 120);
    return () => clearTimeout(t);
  }, [pct, index]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.08 }}
      className={`p-3 rounded-xl transition-all ${isTop ? "bg-surface-3 border border-surface-4" : "bg-surface-2"}`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {isTop && <span className="text-xs font-mono-custom px-1.5 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">TOP</span>}
          <span className="text-sm font-inter font-medium text-white capitalize">
            {label.replace(/_/g, " ")}
          </span>
        </div>
        <span className="text-sm font-display font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, background: color, boxShadow: isTop ? `0 0 8px ${color}60` : "none" }}
        />
      </div>
    </motion.div>
  );
}

// Mini stat card
function StatCard({ label, value, icon, color }) {
  return (
    <div className="p-4 rounded-xl bg-surface-2 border border-surface-3">
      <p className="text-xs font-mono-custom text-surface-5 uppercase tracking-widest mb-2 flex items-center gap-1.5">
        <span style={{ color }}>{icon}</span>
        {label}
      </p>
      <p className="font-display text-xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem(`eyeai_result_${id}`);
    if (cached) {
      try { setResult(JSON.parse(cached)); setLoading(false); return; }
      catch { /* fall through */ }
    }
    // Try fetching from backend
    fetch(`/api/history/${id}`)
      .then((r) => r.json())
      .then((data) => { setResult(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadReport(id);
      toast.success("Report downloaded!");
    } catch {
      toast.error("Could not generate PDF report");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-brand-cyan/30 border-t-brand-cyan animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="pt-16 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <AlertCircle size={48} className="text-brand-rose mb-4" />
        <h2 className="font-display text-2xl font-bold text-white mb-2">Result Not Found</h2>
        <p className="text-surface-5 font-inter mb-6">This analysis may have expired. Please run a new scan.</p>
        <Link to="/" className="px-6 py-3 rounded-xl bg-brand-cyan text-surface-0 font-display font-bold">
          New Analysis
        </Link>
      </div>
    );
  }

  const allPreds = result.prediction?.all_predictions || result.all_predictions || [];
  const sortedPreds = [...allPreds].sort((a, b) => b.confidence - a.confidence);
  const topDisease = result.prediction?.disease || result.disease;
  const imageUrl = result.image_url || null;
  const heatmap = result.gradcam_image || result.heatmap || null;
  const timestamp = result.timestamp ? new Date(result.timestamp) : new Date();
  const infTime = result.model_info?.inference_time_ms || result.inference_time_ms;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-20 pb-16 px-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-4"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2 border border-surface-3 text-surface-5 hover:text-white hover:border-brand-cyan/30 transition-all text-sm font-inter"
            >
              <ArrowLeft size={15} /> Back
            </button>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Analysis Result</h1>
              <div className="flex items-center gap-2 text-xs text-surface-5 font-mono-custom mt-0.5">
                <Clock size={11} />
                {timestamp.toLocaleString()} · ID: {id?.slice(0, 8)}...
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-surface-3 text-white text-sm font-inter hover:border-brand-cyan/30 transition-all disabled:opacity-60"
            >
              <Download size={15} className={downloading ? "animate-bounce" : ""} />
              {downloading ? "Generating..." : "PDF Report"}
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-cyan text-surface-0 text-sm font-display font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
            >
              <RotateCcw size={15} /> New Scan
            </button>
            <Link
              to="/history"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-surface-3 text-surface-5 hover:text-white hover:border-brand-cyan/30 transition-all text-sm font-inter"
            >
              <History size={15} /> History
            </Link>
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        >
          <StatCard label="Condition" value={result.prediction?.disease?.replace(/_/g, " ") || topDisease} icon="🔍" color="#06b6d4" />
          <StatCard label="Confidence" value={result.prediction?.confidence_pct || `${((result.confidence||0)*100).toFixed(1)}%`} icon="📊" color="#8b5cf6" />
          <StatCard label="Severity" value={result.disease_info?.severity || "—"} icon="⚠️" color="#f59e0b" />
          <StatCard label="Inference" value={infTime ? `${infTime}ms` : "< 200ms"} icon="⚡" color="#10b981" />
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left: ResultCard */}
          <ResultCard result={result} />

          {/* Right: HeatmapViewer + prob bars */}
          <div className="flex flex-col gap-6">
            <HeatmapViewer
              imageUrl={imageUrl}
              heatmapBase64={heatmap}
              isMock={result.model_info?.is_mock}
            />

            {/* All predictions */}
            {sortedPreds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl bg-surface-2 border border-surface-3 p-5"
              >
                <h3 className="font-display font-bold text-white mb-4 text-sm">Class Probabilities</h3>
                <div className="flex flex-col gap-2">
                  {sortedPreds.map((p, i) => (
                    <ProbBar
                      key={p.disease}
                      label={p.label || p.disease}
                      value={p.confidence}
                      color={DISEASE_COLORS[p.disease] || "#06b6d4"}
                      isTop={p.disease === topDisease}
                      index={i}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Model info footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-3 text-xs font-mono-custom text-surface-5 border-t border-surface-3 pt-6"
        >
          <span>Model: {result.model_info?.version || "ocunet-rf-1.0"}</span>
          <span>·</span>
          <span>File: {result.filename || "eye-image.jpg"}</span>
          <span>·</span>
          <span className={result.model_info?.is_mock ? "text-brand-amber" : "text-brand-green"}>
            {result.model_info?.is_mock ? "⚠ Demo Mode" : "✓ Real Model"}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
