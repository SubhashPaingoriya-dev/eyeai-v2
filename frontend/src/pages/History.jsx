import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, RefreshCw, History, Filter, TrendingUp, Eye, Clock, AlertCircle, BarChart2 } from "lucide-react";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import toast from "react-hot-toast";
import { getHistory, deletePrediction } from "../services/api";

const DISEASE_COLORS = {
  normal:               "#10b981",
  cataract:             "#3b82f6",
  glaucoma:             "#f59e0b",
  diabetic_retinopathy: "#f43f5e",
  myopia:               "#f97316",
};
const DISEASE_LABELS = {
  normal: "Normal", cataract: "Cataract", glaucoma: "Glaucoma",
  diabetic_retinopathy: "Diabetic Ret.", myopia: "Myopia",
};

// Analytics dashboard
function AnalyticsDashboard({ records }) {
  const counts = records.reduce((a, r) => { a[r.disease] = (a[r.disease] || 0) + 1; return a; }, {});
  const chartData = Object.entries(counts).map(([d, c]) => ({ name: DISEASE_LABELS[d] || d, count: c, color: DISEASE_COLORS[d] || "#06b6d4" }));
  const avgConf = records.length ? (records.reduce((s, r) => s + (r.confidence || 0), 0) / records.length * 100).toFixed(1) : 0;
  const topDisease = chartData.sort((a, b) => b.count - a.count)[0]?.name || "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-surface-2 border border-surface-3 p-6 mb-8"
    >
      <div className="flex items-center gap-2 mb-6">
        <BarChart2 size={16} className="text-brand-cyan" />
        <h3 className="font-display font-bold text-white">Analytics Dashboard</h3>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Scans", value: records.length, color: "#06b6d4" },
          { label: "Avg Confidence", value: `${avgConf}%`, color: "#8b5cf6" },
          { label: "Most Common", value: topDisease, color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} className="text-center p-3 rounded-xl bg-surface-3 border border-surface-4">
            <p className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-mono-custom text-surface-5 mt-1 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={chartData} barSize={32}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#4b5563", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "#1a2332", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 10, fontFamily: "JetBrains Mono", fontSize: 12 }}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}

// History card
function HistoryCard({ record, onDelete }) {
  const navigate = useNavigate();
  const color = DISEASE_COLORS[record.disease] || "#06b6d4";
  const label = DISEASE_LABELS[record.disease] || record.disease;
  const pct = ((record.confidence || 0) * 100).toFixed(1);

  const handleClick = () => {
    sessionStorage.setItem(`eyeai_result_${record.id}`, JSON.stringify(record));
    navigate(`/result/${record.id}`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -3 }}
      onClick={handleClick}
      className="rounded-2xl bg-surface-2 border border-surface-3 overflow-hidden cursor-pointer hover:border-brand-cyan/20 transition-all group"
    >
      {/* Top accent */}
      <div className="h-1" style={{ background: color }} />

      <div className="p-4">
        {/* Badge + delete */}
        <div className="flex items-start justify-between mb-3">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-mono-custom border"
            style={{ color, borderColor: `${color}30`, background: `${color}10` }}
          >
            {label}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(record.id); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-brand-rose/10 border border-brand-rose/20 flex items-center justify-center text-brand-rose hover:bg-brand-rose/20"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Confidence */}
        <div className="mb-3">
          <div className="flex justify-between text-xs font-mono-custom mb-1.5">
            <span className="text-surface-5">Confidence</span>
            <span style={{ color }}>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: "width 0.8s ease" }} />
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-surface-5 font-inter truncate max-w-[140px]">{record.filename || "eye-image.jpg"}</p>
            <div className="flex items-center gap-1 text-xs text-surface-4 font-mono-custom mt-0.5">
              <Clock size={10} />
              {record.timestamp ? format(new Date(record.timestamp), "MMM dd · HH:mm") : "—"}
            </div>
          </div>
          <Eye size={14} className="text-surface-5 group-hover:text-brand-cyan transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [dbAvailable, setDbAvailable] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHistory(100);
      setRecords(data.history || []);
      setDbAvailable(data.db_available !== false);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleDelete = async (id) => {
    try {
      await deletePrediction(id);
      setRecords((p) => p.filter((r) => r.id !== id));
      toast.success("Record deleted");
    } catch {
      toast.error("Could not delete record");
    }
  };

  const filtered = filter === "all" ? records : records.filter((r) => r.disease === filter);
  const diseaseCounts = records.reduce((a, r) => { a[r.disease] = (a[r.disease] || 0) + 1; return a; }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-20 pb-16 px-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <History size={20} className="text-brand-cyan" />
              <h1 className="font-display text-3xl font-bold text-white">Scan History</h1>
            </div>
            <p className="text-surface-5 text-sm font-inter ml-8">
              {records.length} total scan{records.length !== 1 ? "s" : ""}
              {!dbAvailable && <span className="text-brand-amber ml-2">· Database offline (ephemeral mode)</span>}
            </p>
          </div>
          <button onClick={fetchHistory} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-surface-3 text-surface-5 hover:text-white hover:border-brand-cyan/20 transition-all text-sm font-inter">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </motion.div>

        {/* Analytics dashboard */}
        {records.length > 0 && <AnalyticsDashboard records={records} />}

        {/* Filter pills */}
        {records.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2 flex-wrap mb-6 items-center"
          >
            <Filter size={14} className="text-surface-5" />
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-mono-custom border transition-all ${filter === "all" ? "bg-brand-cyan text-surface-0 border-brand-cyan" : "bg-surface-2 border-surface-3 text-surface-5 hover:text-white"}`}
            >
              All ({records.length})
            </button>
            {Object.entries(DISEASE_LABELS).map(([key, label]) => {
              const count = diseaseCounts[key] || 0;
              if (!count) return null;
              const col = DISEASE_COLORS[key];
              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(key)}
                  className="px-3 py-1.5 rounded-full text-xs font-mono-custom border transition-all"
                  style={filter === key
                    ? { background: col, color: "#070a0f", borderColor: col }
                    : { background: `${col}10`, borderColor: `${col}30`, color: col }
                  }
                >
                  {label} ({count})
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-brand-cyan/30 border-t-brand-cyan animate-spin" />
            <p className="text-surface-5 font-mono-custom text-sm">Loading history...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-surface-2 border border-surface-3 flex items-center justify-center mx-auto mb-4 text-3xl">
              {records.length === 0 ? "👁️" : "🔍"}
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">
              {records.length === 0 ? "No scans yet" : "No results match filter"}
            </h3>
            <p className="text-surface-5 font-inter text-sm mb-6 max-w-sm">
              {records.length === 0 ? "Upload or capture an eye image on the home page to get started." : "Try selecting a different disease filter above."}
            </p>
            {filter !== "all" ? (
              <button onClick={() => setFilter("all")} className="px-5 py-2.5 rounded-xl border border-brand-cyan/30 text-brand-cyan text-sm font-inter hover:bg-brand-cyan/10 transition-colors">
                Clear filter
              </button>
            ) : (
              <a href="/" className="px-5 py-2.5 rounded-xl bg-brand-cyan text-surface-0 text-sm font-display font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                Start Analyzing
              </a>
            )}
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((rec, i) => (
                <motion.div key={rec.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <HistoryCard record={rec} onDelete={handleDelete} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
