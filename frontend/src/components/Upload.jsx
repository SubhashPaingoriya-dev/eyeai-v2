// import { useCallback, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Upload, ImageIcon, X, CheckCircle } from "lucide-react";

// const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"];
// const MAX_SIZE = 10 * 1024 * 1024;

// export default function UploadZone({ onImageReady }) {
//   const [dragging, setDragging] = useState(false);
//   const [preview, setPreview] = useState(null);
//   const [fileInfo, setFileInfo] = useState(null);

//   const handleFile = useCallback((file) => {
//     if (!file) return;
//     if (!ACCEPTED.includes(file.type)) { alert("Please upload JPG, PNG, or WebP"); return; }
//     if (file.size > MAX_SIZE) { alert("File too large. Max 10MB."); return; }
//     const url = URL.createObjectURL(file);
//     setPreview(url);
//     setFileInfo({ name: file.name, size: (file.size / 1024).toFixed(0) + " KB" });
//     onImageReady(file);
//   }, [onImageReady]);

//   const onDrop = useCallback((e) => {
//     e.preventDefault(); setDragging(false);
//     handleFile(e.dataTransfer.files[0]);
//   }, [handleFile]);

//   const remove = () => { setPreview(null); setFileInfo(null); onImageReady(null); };

//   if (preview) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="relative rounded-2xl overflow-hidden border border-brand-green/30 bg-surface-2"
//         style={{ height: 280 }}
//       >
//         <img src={preview} alt="Preview" className="w-full h-full object-cover" />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
//         {/* Bottom info */}
//         <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-green/20 border border-brand-green/40">
//           <CheckCircle size={14} className="text-brand-green" />
//           <span className="text-brand-green text-xs font-mono-custom">{fileInfo?.name} · {fileInfo?.size}</span>
//         </div>
//         {/* Remove btn */}
//         <button onClick={remove} className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors">
//           <X size={14} />
//         </button>
//       </motion.div>
//     );
//   }

//   return (
//     <div
//       onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
//       onDragLeave={() => setDragging(false)}
//       onDrop={onDrop}
//       onClick={() => document.getElementById("eyeai-file-input").click()}
//       className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center overflow-hidden`}
//       style={{ height: 280, borderColor: dragging ? "#06b6d4" : "rgba(6,182,212,0.25)", background: dragging ? "rgba(6,182,212,0.04)" : "#111827" }}
//     >
//       <input id="eyeai-file-input" type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
//       {/* Radial glow on drag */}
//       <div className={`absolute inset-0 transition-opacity duration-300 ${dragging ? "opacity-100" : "opacity-0"}`} style={{ background: "radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, transparent 70%)" }} />

//       <motion.div animate={{ y: dragging ? -4 : 0 }} transition={{ duration: 0.2 }}>
//         <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center mx-auto mb-4">
//           <Upload size={28} className="text-brand-cyan" />
//         </div>
//         <h3 className="font-display text-lg font-bold text-white mb-2">
//           {dragging ? "Drop image here" : "Upload Fundus / Eye Image"}
//         </h3>
//         <p className="text-surface-5 text-sm font-inter mb-5">Drag & drop or click to browse</p>
//         <div className="flex gap-2 justify-center flex-wrap">
//           {["JPG", "PNG", "WebP", "BMP"].map((t) => (
//             <span key={t} className="px-2.5 py-1 rounded-full bg-surface-3 border border-surface-4 text-xs font-mono-custom text-surface-5">{t}</span>
//           ))}
//           <span className="px-2.5 py-1 rounded-full bg-surface-3 border border-surface-4 text-xs font-mono-custom text-surface-5">Max 10MB</span>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

import { useCallback, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, CheckCircle } from "lucide-react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/bmp"];
const MAX_SIZE = 10 * 1024 * 1024;

export default function UploadZone({ onImageReady }) {
const [dragging, setDragging] = useState(false);
const [preview, setPreview] = useState(null);
const [fileInfo, setFileInfo] = useState(null);

const [imageSrc, setImageSrc] = useState(null);
const [crop, setCrop] = useState({ aspect: 1 });
const [completedCrop, setCompletedCrop] = useState(null);

const imgRef = useRef(null);
const fileInputRef = useRef(null);

// ───── FILE HANDLE ─────
const handleFile = useCallback((file) => {
if (!file) return;


if (!ACCEPTED.includes(file.type)) {
  alert("Upload JPG/PNG/WebP");
  return;
}

if (file.size > MAX_SIZE) {
  alert("Max size 10MB");
  return;
}

const reader = new FileReader();
reader.onload = () => setImageSrc(reader.result);
reader.readAsDataURL(file);

setFileInfo({
  name: file.name,
  size: (file.size / 1024).toFixed(0) + " KB",
});

}, []);

// ───── DRAG DROP ─────
const onDrop = useCallback((e) => {
e.preventDefault();
setDragging(false);
handleFile(e.dataTransfer.files[0]);
}, [handleFile]);

// ───── CROP IMAGE ─────
const getCroppedImage = async () => {
if (!completedCrop || !imgRef.current) return null;


const canvas = document.createElement("canvas");
const image = imgRef.current;

const scaleX = image.naturalWidth / image.width;
const scaleY = image.naturalHeight / image.height;

canvas.width = completedCrop.width;
canvas.height = completedCrop.height;

const ctx = canvas.getContext("2d");

ctx.drawImage(
  image,
  completedCrop.x * scaleX,
  completedCrop.y * scaleY,
  completedCrop.width * scaleX,
  completedCrop.height * scaleY,
  0,
  0,
  completedCrop.width,
  completedCrop.height
);

return new Promise((resolve) => {
  canvas.toBlob((blob) => resolve(blob), "image/jpeg");
});


};

// ───── CONFIRM CROP ─────
const confirmCrop = async () => {
const blob = await getCroppedImage();


if (!blob) {
  alert("Crop image first");
  return;
}

const file = new File([blob], "cropped.jpg", {
  type: "image/jpeg",
});

const url = URL.createObjectURL(file);

setPreview(url);
setImageSrc(null);

onImageReady(file); // ✅ correct


};

// ───── REMOVE ─────
const remove = () => {
setPreview(null);
setImageSrc(null);
setFileInfo(null);
onImageReady(null);
};

// ───── CROP UI ─────
if (imageSrc && !preview) {
return ( <div className="p-4 bg-surface-2 rounded-2xl">
<ReactCrop
crop={crop}
onChange={(c) => setCrop(c)}
onComplete={(c) => setCompletedCrop(c)}
> <img
         ref={imgRef}
         src={imageSrc}
         alt="Crop"
         className="max-h-[300px] mx-auto"
       /> </ReactCrop>


    <button
      onClick={confirmCrop}
      className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg"
    >
      Confirm Crop
    </button>
  </div>
);


}

// ───── PREVIEW UI ─────
if (preview) {
return (
<motion.div
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
className="relative rounded-2xl overflow-hidden border border-green-500/30"
style={{ height: 280 }}
> <img src={preview} alt="Preview" className="w-full h-full object-cover" />


    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

    <div className="absolute bottom-3 left-3 text-green-400 text-xs">
      {fileInfo?.name} · {fileInfo?.size}
    </div>

    <button
      onClick={remove}
      className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded"
    >
      <X size={14} />
    </button>
  </motion.div>
);


}

// ───── UPLOAD UI ─────
return (
<div
onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
onDragLeave={() => setDragging(false)}
onDrop={onDrop}
onClick={() => fileInputRef.current.click()}
className="relative border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer"
style={{ height: 280 }}
>
<input
ref={fileInputRef}
type="file"
accept="image/*"
className="hidden"
onChange={(e) => handleFile(e.target.files[0])}
/>


  <div className="text-center">
    <Upload size={28} />
    <p>{dragging ? "Drop image" : "Upload Eye Image"}</p>
  </div>
</div>

);
}

