import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const C = {
  bg: "#070d1a", surface: "#0f1629", surface2: "#0a0f1e",
  border: "#1e293b", border2: "#334155",
  accent: "#6366f1", accent2: "#a855f7", amber: "#f59e0b",
  green: "#22c55e", red: "#ef4444", cyan: "#14b8a6",
  text: "#f1f5f9", textDim: "#94a3b8", textFaint: "#64748b",
  indigoLight: "#818cf8", greenLight: "#4ade80",
  amberLight: "#fbbf24", redLight: "#f87171", purpleLight: "#c084fc",
};

const Spinner = ({ size = "md" }) => {
  const dim = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  return (
    <div className={`relative ${dim} mx-auto`}>
      <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: C.border }} />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
      <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" 
        style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
    </div>
  );
};

const CertificateModal = ({ certificate, onClose, onDownload }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    generateAndView();
  }, [certificate]);

  const generateAndView = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/api/certificates/generate/${certificate.courseId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to generate certificate");
      }
    } catch (err) {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div className="rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" style={{ background: C.surface, border: `1px solid ${C.border}` }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ background: C.surface2, borderColor: C.border }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44` }}>
              <span className="material-symbols-outlined text-base" style={{ color: C.accent }}>workspace_premium</span>
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">Certificate Preview</h3>
            <p className="text-xs text-gray-500">{certificate.courseTitle}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg transition-all hover:bg-white/10" style={{ color: C.textFaint }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-20">
              <Spinner size="lg" />
              <p className="text-center text-gray-400 mt-4 text-sm">Generating certificate...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: `${C.red}22`, border: `1px solid ${C.red}44` }}>
              <span className="material-symbols-outlined text-red-400">error</span>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : (
            <iframe src={pdfUrl} className="w-full h-[70vh] rounded-lg" style={{ background: "white", border: "none" }} title="Certificate Preview" />
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t" style={{ borderColor: C.border }}>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: C.surface2, color: C.textDim, border: `1px solid ${C.border}` }}
          >
            Close
          </button>
          <button
            onClick={() => onDownload(certificate.courseId, certificate.courseTitle, certificate.courseCode)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}
          >
            <span className="material-symbols-outlined text-base">download</span>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [viewingCert, setViewingCert] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/certificates/my-certificates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCertificates(data.certificates || []);
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (courseId, courseTitle, courseCode) => {
    setGenerating(courseId);
    setError("");
    setSuccess("");
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/api/certificates/generate/${courseId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Certificate_${courseCode}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setSuccess(`Certificate for "${courseTitle}" downloaded successfully!`);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to generate certificate");
      }
    } catch (err) {
      setError("Cannot connect to server");
    } finally {
      setGenerating(null);
      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
    }
  };

  const viewCertificate = (cert) => {
    setViewingCert(cert);
  };

  if (loading) {
    return (
      <div className="py-20">
        <Spinner size="lg" />
        <p className="text-center text-gray-400 mt-4 text-sm">Loading certificates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif" }}>
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: `1px solid ${C.border}` }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: C.accent }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: C.accent2 }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.accent }} />
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Achievements · Recognition</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My Certificates</h1>
          <p className="text-sm text-gray-400 mt-1">View and download your course completion certificates</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: `${C.red}22`, border: `1px solid ${C.red}44` }}>
          <span className="material-symbols-outlined text-sm" style={{ color: C.redLight }}>error</span>
          <span className="text-sm flex-1" style={{ color: C.redLight }}>{error}</span>
          <button onClick={() => setError("")}><span className="material-symbols-outlined text-sm">close</span></button>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: `${C.green}22`, border: `1px solid ${C.green}44` }}>
          <span className="material-symbols-outlined text-sm" style={{ color: C.greenLight }}>check_circle</span>
          <span className="text-sm flex-1" style={{ color: C.greenLight }}>{success}</span>
        </div>
      )}

      {certificates.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">workspace_premium</span>
          <p className="font-bold text-white text-lg">No certificates yet</p>
          <p className="text-sm text-gray-500">Complete courses to earn certificates of completion</p>
          <button 
            onClick={() => window.location.href = "/student/dashboard?tab=courses"}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div key={cert.courseId} className="rounded-2xl p-5 transition-all hover:scale-[1.02] duration-300" 
              style={{ background: C.surface, border: `1px solid ${C.accent}33` }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-lg" style={{ color: C.accent }}>school</span>
                    <h3 className="font-bold text-white text-base">{cert.courseTitle}</h3>
                  </div>
                  <p className="text-xs text-gray-500">{cert.courseCode}</p>
                  <p className="text-xs text-gray-500 mt-1">{cert.department}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" 
                  style={{ background: `${C.green}22`, color: C.greenLight, border: `1px solid ${C.green}44` }}>
                  {cert.credits} Credits
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Completed</span>
                  <span>{new Date(cert.completedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => viewCertificate(cert)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                  style={{ background: `${C.accent}22`, color: C.indigoLight, border: `1px solid ${C.accent}44` }}
                >
                  <span className="material-symbols-outlined text-base">visibility</span>
                  View
                </button>
                <button
                  onClick={() => downloadCertificate(cert.courseId, cert.courseTitle, cert.courseCode)}
                  disabled={generating === cert.courseId}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}
                >
                  {generating === cert.courseId ? (
                    <>
                      <Spinner size="sm" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">download</span>
                      Download
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {viewingCert && (
        <CertificateModal
          certificate={viewingCert}
          onClose={() => setViewingCert(null)}
          onDownload={downloadCertificate}
        />
      )}

      {/* Info Banner */}
      <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: C.surface, border: `1px solid ${C.accent}33` }}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44` }}>
          <span className="material-symbols-outlined text-sm" style={{ color: C.accent }}>info</span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: C.textDim }}>
          <span className="font-semibold" style={{ color: C.indigoLight }}>Certificates:</span> Earn a certificate for every course you complete with 100% progress. Click "View" to preview your certificate, or "Download" to save it as a PDF.
        </p>
      </div>
    </div>
  );
};

export default Certificates;