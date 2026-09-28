import React, { useState, useEffect } from 'react';
import { Download, Play, Video, Clock, CheckCircle } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

export default function OutputsView() {
  const [outputs, setOutputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [downloadingFile, setDownloadingFile] = useState(null);

  const downloadVideo = async (filename) => {
    if (!filename) return;
    setDownloadingFile(filename);
    try {
      const res = await fetch(`${API_BASE}/api/projects/download/${encodeURIComponent(filename)}`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 3000);
    } catch (err) {
      window.open(`${API_BASE}/api/projects/download/${encodeURIComponent(filename)}`, '_blank');
    } finally {
      setDownloadingFile(null);
    }
  };

  const fetchOutputs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects/outputs`);
      if (res.ok) {
        const data = await res.json();
        setOutputs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutputs();
  }, []);

  return (
    <div className="w-full p-6 sm:p-8 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#21252b]">
        <div>
          <h2 className="text-xl font-semibold text-[#F5F5F0] flex items-center gap-3">
            <span>Criativos Renderizados</span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#181c21] text-[#C5F955] border border-[#C5F955]/30">
              {outputs.length} prontos para anúncio
            </span>
          </h2>
          <p className="text-sm text-[#92978F] mt-1 font-normal">
            Seus anúncios finais exportados em 1080x1920 (9:16) prontos para subir no Meta Ads, TikTok ou Shorts.
          </p>
        </div>

        <button
          onClick={fetchOutputs}
          className="px-4 py-2 rounded-xl bg-[#15181c] hover:bg-[#1f242b] border border-[#21252b] text-[#92978F] hover:text-[#F5F5F0] text-xs font-medium cursor-pointer transition-colors"
        >
          Atualizar Lista
        </button>
      </div>

      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-[#111315]/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#15181c] border border-[#21252b] rounded-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-[#F5F5F0] truncate">{activeVideo.filename}</span>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-[#92978F] hover:text-[#F5F5F0] px-2 py-1 font-medium cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden">
              <video
                src={`${API_BASE}${activeVideo.url}`}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => downloadVideo(activeVideo.filename)}
              disabled={downloadingFile === activeVideo.filename}
              className="w-full py-3 rounded-xl bg-[#C5F955] hover:bg-[#b8ea44] text-[#111315] font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-lime-950/30 disabled:opacity-50"
            >
              {downloadingFile === activeVideo.filename ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Baixando para o computador...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Baixar Arquivo MP4</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-[#92978F] text-sm font-normal">Carregando exportações...</div>
      ) : outputs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {outputs.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#15181c] border border-[#21252b] rounded-xl overflow-hidden hover:border-[#2f353d] transition-all group flex flex-col justify-between"
            >
              <div
                onClick={() => setActiveVideo(item)}
                className="relative aspect-[9/16] bg-black cursor-pointer overflow-hidden flex items-center justify-center"
              >
                <video
                  src={`${API_BASE}${item.url}#t=1.0`}
                  className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent flex items-center justify-center transition-colors">
                  <div className="w-11 h-11 rounded-full bg-black/70 group-hover:bg-[#C5F955] text-white group-hover:text-[#111315] flex items-center justify-center transition-all">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-xs text-[#F5F5F0] font-mono">
                  {(item.size / (1024 * 1024)).toFixed(1)} MB
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-[#F5F5F0] truncate" title={item.filename}>
                    {item.filename}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#92978F] font-normal">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => downloadVideo(item.filename)}
                  disabled={downloadingFile === item.filename}
                  className="w-full py-2 rounded-xl bg-[#181c21] hover:bg-[#1f242b] border border-[#21252b] text-[#C5F955] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {downloadingFile === item.filename ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#C5F955] border-t-transparent rounded-full animate-spin" />
                      <span>Baixando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Download MP4</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border border-[#21252b] rounded-xl bg-[#14171b] max-w-xl mx-auto space-y-3 p-8">
          <div className="w-12 h-12 rounded-xl bg-[#1a1e24] text-[#C5F955] flex items-center justify-center mx-auto border border-[#21252b]">
            <Video className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-semibold text-[#F5F5F0]">Nenhum anúncio renderizado ainda</h3>
          <p className="text-sm text-[#92978F] max-w-sm mx-auto font-normal">
            Vá para o Editor de Anúncios, escolha um modelo e clique em "Renderizar Vídeo".
          </p>
        </div>
      )}
    </div>
  );
}
