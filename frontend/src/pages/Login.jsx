import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Sparkles, Shield, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const OCCUPATIONS = [
  { value: "student", label: "🎓 Student" },
  { value: "doctor", label: "👨‍⚕️ Medical Doctor / Physician" },
  { value: "nurse", label: "👩‍⚕️ Nurse / Healthcare Worker" },
  { value: "researcher", label: "🔬 Medical Researcher" },
  { value: "optometrist", label: "🏥 Eye Care Specialist / Optometrist" },
  { value: "med_student", label: "🎓 Medical Student" },
  { value: "teacher", label: "👨‍🏫 Teacher / Professor" },
  { value: "admin", label: "💼 Healthcare Administrator" },
  { value: "developer", label: "💻 Developer / Engineer" },
  { value: "other", label: "👤 Other / General Public" },
];

const FEATURES = [
  { icon: <Zap size={16} />, text: "AI Analysis in < 3 seconds" },
  { icon: <Shield size={16} />, text: "Data stays on your device" },
  { icon: <Sparkles size={16} />, text: "5 Disease Classes Detected" },
];

// 3D Animated Eye Orb
function EyeOrb() {
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Outer rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-brand-cyan/20"
          style={{ margin: `${i * 20}px` }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 8 + i * 4, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Glowing core */}
      <motion.div
        className="absolute inset-12 rounded-full bg-gradient-radial from-brand-cyan/30 via-brand-violet/20 to-transparent"
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Center eye */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-cyan via-brand-violet to-brand-green flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.5)]">
            <Eye size={36} className="text-surface-0" />
          </div>
          {/* Iris scan lines */}
          {[45, 90, 135].map((deg) => (
            <div
              key={deg}
              className="absolute inset-0 flex items-center justify-center opacity-30"
              style={{ transform: `rotate(${deg}deg)` }}
            >
              <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-cyan to-transparent" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Orbiting dots */}
      {[0, 120, 240].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full bg-brand-cyan"
          style={{
            top: "50%", left: "50%",
            transformOrigin: "0 0",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
        >
          <div
            className="w-3 h-3 rounded-full bg-brand-cyan"
            style={{
              transform: `rotate(${deg}deg) translateX(110px) translateY(-6px)`,
              boxShadow: "0 0 8px #06b6d4",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", occupation: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Enter a valid email address";
    if (!form.occupation) e.occupation = "Please select your occupation";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    login(form);
  };

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: "" })); };

  return (
    <div className="min-h-screen flex overflow-hidden bg-surface-0 bg-grid">
      {/* Left Panel */}
      <motion.div
        className="hidden lg:flex flex-col items-center justify-center w-1/2 relative p-12"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 via-brand-violet/5 to-transparent" />
        <div className="absolute right-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-brand-cyan/20 to-transparent" />

        <EyeOrb />

        <motion.div
          className="mt-10 text-center max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-display text-3xl font-bold gradient-text mb-3">EyeAI</h2>
          <p className="text-surface-5 text-sm leading-relaxed font-inter">
            Advanced retinal disease detection powered by deep learning. Detect cataracts, glaucoma, diabetic retinopathy and more.
          </p>

          <div className="mt-8 space-y-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 text-sm text-surface-5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <span className="text-brand-cyan">{f.icon}</span>
                {f.text}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom stats */}
        <div className="mt-12 grid grid-cols-3 gap-6 w-full max-w-xs">
          {[["5", "Diseases"], ["≥80%", "Accuracy"], ["< 3s", "Analysis"]].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="font-display text-xl font-bold text-brand-cyan">{v}</p>
              <p className="text-xs text-surface-5 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right Panel — Form */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/40 flex items-center justify-center mx-auto mb-3">
            <Eye size={32} className="text-brand-cyan" />
          </div>
          <h1 className="font-display text-2xl font-bold gradient-text">EyeAI</h1>
        </div>

        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-surface-5 text-sm mb-8">Enter your details to access the platform</p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Name */}
            <div>
              <label className="block text-xs font-mono-custom text-surface-5 uppercase tracking-widest mb-2">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Dr. Sarah Johnson"
                className={`w-full px-4 py-3 rounded-xl bg-surface-2 border text-white placeholder-surface-4 focus:outline-none focus:border-brand-cyan/60 transition-colors font-inter text-sm ${errors.name ? "border-brand-rose" : "border-surface-3"}`}
              />
              {errors.name && <p className="text-brand-rose text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-mono-custom text-surface-5 uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="sarah@hospital.org"
                className={`w-full px-4 py-3 rounded-xl bg-surface-2 border text-white placeholder-surface-4 focus:outline-none focus:border-brand-cyan/60 transition-colors font-inter text-sm ${errors.email ? "border-brand-rose" : "border-surface-3"}`}
              />
              {errors.email && <p className="text-brand-rose text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-xs font-mono-custom text-surface-5 uppercase tracking-widest mb-2">Occupation</label>
              <select
                value={form.occupation}
                onChange={(e) => set("occupation", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-surface-2 border text-white focus:outline-none focus:border-brand-cyan/60 transition-colors font-inter text-sm appearance-none ${errors.occupation ? "border-brand-rose" : "border-surface-3"} ${!form.occupation ? "text-surface-4" : ""}`}
                style={{ WebkitAppearance: "none" }}
              >
                <option value="" disabled>Select your role</option>
                {OCCUPATIONS.map((o) => (
                  <option key={o.value} value={o.value} style={{ background: "#111827" }}>{o.label}</option>
                ))}
              </select>
              {errors.occupation && <p className="text-brand-rose text-xs mt-1">{errors.occupation}</p>}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl bg-brand-cyan text-surface-0 font-display font-bold text-base relative overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-4 h-4 border-2 border-surface-0/40 border-t-surface-0 rounded-full animate-spin" />
                  Entering EyeAI...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Eye size={18} /> Enter EyeAI
                </span>
              )}
            </motion.button>
          </motion.form>

          {/* Disclaimer */}
          <motion.p
            className="text-center text-xs text-surface-4 mt-6 font-inter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            🔒 Your data stays on this device only — no server-side auth
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
