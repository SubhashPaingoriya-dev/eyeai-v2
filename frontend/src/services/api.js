import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 60000,
});

// Retry on 503/504
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const config = err.config;
    if (!config || config.__retried) return Promise.reject(err);
    const status = err.response?.status;
    if (status === 503 || status === 504) {
      config.__retried = true;
      await new Promise((r) => setTimeout(r, 2000));
      return api(config);
    }
    return Promise.reject(err);
  }
);

export const predictDisease = (file, onProgress) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("generate_heatmap", "true");
  return api.post("/api/predict", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  }).then((r) => r.data);
};

export const getHistory = (limit = 50) =>
  api.get(`/api/history?limit=${limit}`).then((r) => r.data);

export const getPredictionById = (id) =>
  api.get(`/api/history/${id}`).then((r) => r.data);

export const deletePrediction = (id) =>
  api.delete(`/api/history/${id}`).then((r) => r.data);

export const getDiseaseInfo = () =>
  api.get("/api/diseases").then((r) => r.data);

export const downloadReport = async (id) => {
  const res = await api.get(`/api/report/${id}`, { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = `eyeai-report-${id}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

export default api;
