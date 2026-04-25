import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Upload as UploadIcon, Camera, Zap, Shield, BarChart2, FileText, AlertCircle, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import UploadZone from "../components/Upload";
import CameraCapture from "../components/Camera";
import Loader from "../components/Loader";
import { predictDisease } from "../services/api";
import { useAuth } from "../context/AuthContext";

// Animated stat counter
function StatCounter({ value, label, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} className="text-center" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
      <p className="font-display text-4xl font-bold gradient-text">{value}{suffix}</p>
      <p className="text-xs font-mono-custom text-surface-5 uppercase tracking-widest mt-2">{label}</p>
    </motion.div>
  );
}

// Feature card
function FeatureCard({ icon, title, desc, color, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="p-6 rounded-2xl bg-surface-2/50 border border-surface-3 hover:border-brand-cyan/30 transition-all group"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        {icon}
      </div>
      <h3 className="font-display text-base font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-surface-5 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

const DISEASE_PILLS = [
  { name: "Normal", color: "text-brand-green border-brand-green/30 bg-brand-green/10" },
  { name: "Cataract", color: "text-brand-blue border-brand-blue/30 bg-brand-blue/10" },
  { name: "Glaucoma", color: "text-brand-amber border-brand-amber/30 bg-brand-amber/10" },
  { name: "Diabetic Retinopathy", color: "text-brand-rose border-brand-rose/30 bg-brand-rose/10" },
  { name: "Myopia", color: "text-brand-orange border-brand-orange/30 bg-brand-orange/10" },
];

const FEATURES = [
  { icon: <Zap size={18} className="text-brand-cyan" />, title: "< 3s Inference", desc: "Powered by a trained RandomForest model analyzing retinal features in milliseconds.", color: "bg-brand-cyan/10", delay: 0 },
  { icon: <BarChart2 size={18} className="text-brand-violet" />, title: "Confidence Scores", desc: "See probability distributions across all 5 disease classes with animated visualizations.", color: "bg-brand-violet/10", delay: 0.1 },
  { icon: <FileText size={18} className="text-brand-green" />, title: "Report Download", desc: "Generate and download a professional PDF medical report for each analysis.", color: "bg-brand-green/10", delay: 0.2 },
  { icon: <Camera size={18} className="text-brand-amber" />, title: "Live Camera", desc: "Capture eye images live from your webcam with alignment guide and 3-second countdown.", color: "bg-brand-amber/10", delay: 0.3 },
  { icon: <Shield size={18} className="text-brand-rose" />, title: "Privacy First", desc: "No data leaves your device. All analysis is done locally via the backend on your machine.", color: "bg-brand-rose/10", delay: 0.4 },
  { icon: <UploadIcon size={18} className="text-brand-orange" />, title: "Drag & Drop", desc: "Supports JPEG, PNG, WebP up to 10MB. Drag your fundus image directly onto the page.", color: "bg-brand-orange/10", delay: 0.5 },
];

const HOW_STEPS = [
  { num: "01", title: "Upload or Capture", desc: "Drag & drop a retinal fundus image or use your live camera to capture one." },
  { num: "02", title: "AI Analysis", desc: "Our ML model analyzes color histograms, textures, and retinal features in milliseconds." },
  { num: "03", title: "Get Results", desc: "Receive a detailed diagnosis with confidence scores, disease info, and recommendations." },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, backendStatus } = useAuth();
  const [tab, setTab] = useState("upload");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const heroRef = useRef(null);

  const handleImageReady = useCallback((f) => {
    setFile(f);
    setError("");
  }, []);

  const handleAnalyze = async () => {
    if (!file) { toast.error("Please select or capture an eye image first"); return; }
    setLoading(true);
    setError("");
    setUploadProgress(0);
    try {
      const result = await predictDisease(file, setUploadProgress);
      const id = result.id || Date.now().toString();
      sessionStorage.setItem(`eyeai_result_${id}`, JSON.stringify(result));
      navigate(`/result/${id}`);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Analysis failed. Please try again.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  if (loading) return <Loader uploadProgress={uploadProgress} imageFile={file} />;

  return (
    <div className="pt-16">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
        {/* Radial glow bg */}
        <div className="absolute inset-0 bg-gradient-radial from-brand-cyan/5 via-transparent to-transparent" style={{ backgroundSize: "80% 80%", backgroundPosition: "center" }} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-violet/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-cyan/5 rounded-full blur-3xl" />

        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan text-xs font-mono-custom"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
          AI-Powered Retinal Disease Detection • v1.0
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="font-display text-center text-5xl sm:text-6xl lg:text-7xl font-bold leading-none tracking-tight max-w-4xl"
        >
          <span className="text-white">Detect Eye Disorders</span>
          <br />
          <span className="gradient-text">in Seconds</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6 text-center text-lg text-surface-5 max-w-xl leading-relaxed font-inter"
        >
          Upload a retinal fundus image or capture one live. Our AI model detects 5 eye conditions with confidence scoring and clinical recommendations.
        </motion.p>

        {/* Disease pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap justify-center gap-2"
        >
          {DISEASE_PILLS.map((d) => (
            <span key={d.name} className={`px-3 py-1.5 rounded-full text-xs font-mono-custom border ${d.color}`}>{d.name}</span>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-8 w-full max-w-2xl border-t border-b border-surface-3 py-8"
        >
          <StatCounter value="5" label="Disease Classes" />
          <StatCounter value="≥80" label="Accuracy" suffix="%" />
          <StatCounter value="< 3" label="Seconds" suffix="s" />
          <StatCounter value="100" label="Privacy" suffix="%" />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-12 text-surface-5"
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* ── UPLOAD / CAMERA SECTION ───────────────────────── */}
      <section id="analyze" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-4xl font-bold text-white mb-3">Analyze Your Eye</h2>
            <p className="text-surface-5 font-inter">Upload a fundus image or use your webcam</p>
          </motion.div>

          {/* Backend warning */}
          {backendStatus === "offline" && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-sm font-inter">
              <AlertCircle size={16} />
              Backend is offline. Start the server with <code className="mx-1 px-2 py-0.5 bg-surface-2 rounded text-xs font-mono-custom">bash start.sh</code>
            </div>
          )}

          {/* Tab switcher */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 flex gap-1 p-1 bg-surface-2 rounded-2xl border border-surface-3"
          >
            {[["upload", <UploadIcon size={15} />, "Upload Image"], ["camera", <Camera size={15} />, "Live Camera"]].map(([t, icon, label]) => (
              <button
                key={t}
                onClick={() => { setTab(t); setFile(null); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-inter font-medium transition-all ${tab === t ? "bg-surface-3 text-brand-cyan border border-brand-cyan/20" : "text-surface-5 hover:text-white"}`}
              >
                {icon}{label}
              </button>
            ))}
          </motion.div>

          {/* Tab content */}
          <motion.div key={tab} initial={{ opacity: 0, x: tab === "upload" ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            {tab === "upload"
              ? <UploadZone onImageReady={handleImageReady} />
              : <CameraCapture onImageReady={handleImageReady} />
            }
          </motion.div>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-sm font-inter">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Analyze button */}
          <motion.div className="mt-6 text-center" animate={{ opacity: file ? 1 : 0.5 }}>
            <motion.button
              whileHover={{ scale: file ? 1.02 : 1, boxShadow: file ? "0 0 30px rgba(6,182,212,0.5)" : "none" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={!file}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-brand-cyan text-surface-0 font-display font-bold text-lg disabled:cursor-not-allowed transition-all"
            >
              <Zap size={20} /> Analyze Eye Image
            </motion.button>
            <p className="mt-3 text-xs font-mono-custom text-surface-5">
              {file ? "✓ Image ready — click to run AI analysis" : "Upload or capture an image to begin"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-surface-3">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-surface-5 font-inter">Three simple steps to get your eye analysis</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                {i < HOW_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-brand-cyan/30 to-transparent -translate-x-1/2 z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-cyan/20 to-brand-violet/20 border border-brand-cyan/30 flex items-center justify-center mb-5">
                    <span className="font-display font-bold text-brand-cyan text-lg">{s.num}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-surface-5 leading-relaxed font-inter">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold text-white mb-3">Why EyeAI?</h2>
            <p className="text-surface-5 font-inter">Everything you need for accurate eye disease screening</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-surface-3 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center">
              <span className="text-brand-cyan text-sm">👁️</span>
            </div>
            <span className="font-display font-bold gradient-text">EyeAI</span>
          </div>
          <p className="text-xs text-surface-5 font-mono-custom">⚠ For educational purposes only — not a medical device</p>
          <p className="text-xs text-surface-5 font-inter">© 2026 EyeAI · v1.0.0</p>
        </div>
      </footer>
    </div>
  );
}
