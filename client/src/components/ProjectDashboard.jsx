import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Video,
  Play,
  FileVideo,
  Check,
  Search,
  Loader2,
  X
} from 'lucide-react';

const API_BASE = 'http://localhost:3001';

export default function ProjectDashboard({
  onSelectProject,
  onCreateNew,
  isVslMode = false
}) {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    todos: 0,
    revisao: 0,
    gerando: 0,
    concluido: 0,
    prontos: 0,
    falhas: 0
  });
  const [activeFilter, setActiveFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [progressModalProject, setProgressModalProject] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects`);
      if (res.ok) {
        const data = await res.json();
        const filteredProjects = (data.projects || []).filter(p => isVslMode ? p.isVslMode : !p.isVslMode);
        setProjects(filteredProjects);
        setStats({
          todos: filteredProjects.length,
          revisao: filteredProjects.filter(p => p.status === 'revisao').length,
          gerando: filteredProjects.filter(p => p.status === 'gerando').length,
          concluido: filteredProjects.filter(p => p.status === 'concluido').length,
          prontos: filteredProjects.filter(p => p.status === 'pronto').length,
          falhas: filteredProjects.filter(p => p.status === 'falha').length
        });

        // Sync modal state if open
        if (progressModalProject) {
          const fresh = filteredProjects.find(p => p.id === progressModalProject.id);
          if (fresh) {
            setProgressModalProject(fresh);
          }
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar projetos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(() => {
      fetchProjects();
    }, 2000);
    return () => clearInterval(interval);
  }, [isVslMode, progressModalProject?.id]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Deseja realmente excluir este anúncio?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTitle = async (id, e) => {
    e.stopPropagation();
    if (!editTitleValue.trim()) {
      setEditingTitleId(null);
      return;
    }
    try {
      await fetch(`${API_BASE}/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitleValue.trim() })
      });
      setEditingTitleId(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCardClick = (proj) => {
    if (proj.status === 'gerando') {
      setProgressModalProject(proj);
    } else {
      onSelectProject(proj);
    }
  };

  const displayedProjects = projects.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!p.title?.toLowerCase().includes(q)) return false;
    }
    if (activeFilter === 'todos') return true;
    if (activeFilter === 'revisao') return p.status === 'revisao';
    if (activeFilter === 'gerando') return p.status === 'gerando';
    if (activeFilter === 'concluido') return p.status === 'concluido';
    if (activeFilter === 'prontos') return p.status === 'pronto';
    if (activeFilter === 'falhas') return p.status === 'falha';
    return true;
  });

  const reviewProjects = projects.filter(p => p.status === 'revisao');

  return (
    <div className="w-full p-6 sm:p-8 space-y-6 select-none font-sans bg-[#111315] text-[#F5F5F0]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#F5F5F0] tracking-tight">
            {isVslMode ? 'Gerador de VSLs' : 'Gerador de Anúncios'}
          </h1>
          <p className="text-sm text-[#92978F] mt-1">
            {isVslMode
              ? 'Envie a gravação da VSL e gere versões cortadas com b-rolls dinâmicos e legendas'
              : 'Envie um vídeo de avatar e receba um anúncio editado com b-rolls, zooms e tela dividida'}
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="px-4 py-2.5 rounded-xl bg-[#C5F955] hover:bg-[#b8ea44] text-[#111315] font-medium text-sm transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{isVslMode ? 'Nova VSL' : 'Criar anúncio'}</span>
        </button>
      </div>

      {/* Review Alert Banner */}
      {reviewProjects.length > 0 && (
        <div className="bg-[#171a1e] border border-[#21252b] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#C5F955] text-[#111315] flex items-center justify-center shrink-0">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F5F5F0]">
                {reviewProjects.length === 1
                  ? '1 anúncio esperando sua revisão'
                  : `${reviewProjects.length} anúncios esperando sua revisão`}
              </p>
              <p className="text-xs text-[#92978F] truncate max-w-md">
                {reviewProjects[0]?.title} {reviewProjects.length > 1 && `· +${reviewProjects.length - 1} outros`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectProject(reviewProjects[0])}
            className="px-3.5 py-2 rounded-xl bg-[#C5F955] hover:bg-[#b8ea44] text-[#111315] text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>Revisar agora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search Input matching VibeCut */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-[#92978F] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar anúncio..."
          className="w-full pl-10 pr-4 py-2 bg-[#15181c] border border-[#21252b] rounded-xl text-sm text-[#F5F5F0] placeholder-[#92978F] focus:outline-none focus:border-[#C5F955]/50 transition-colors"
        />
      </div>

      {/* Filter Tabs matching VibeCut */}
      <div className="flex items-center gap-1.5 border-b border-[#1f2328] pb-3 text-sm overflow-x-auto">
        {[
          { id: 'todos', label: 'Todos', count: stats.todos },
          { id: 'revisao', label: 'Para revisar', count: stats.revisao },
          { id: 'gerando', label: 'Gerando', count: stats.gerando },
          { id: 'prontos', label: 'Prontos', count: stats.prontos },
          { id: 'falhas', label: 'Falhas', count: stats.falhas }
        ].map(tab => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#C5F955]/10 text-[#C5F955] border border-[#C5F955]/20'
                  : 'text-[#92978F] hover:text-[#F5F5F0] hover:bg-[#1a1e24] border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isActive ? 'bg-[#C5F955]/20 text-[#C5F955]' : 'bg-[#1c2025] text-[#92978F]'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Projects */}
      {displayedProjects.length === 0 ? (
        <div className="text-center py-16 border border-[#21252b] rounded-xl bg-[#14171b] space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#1a1e24] text-[#C5F955] flex items-center justify-center mx-auto border border-[#21252b]">
            <Video className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#F5F5F0]">
              {isVslMode ? 'Nenhuma VSL criada' : 'Nenhum anúncio criado'}
            </h3>
            <p className="text-sm text-[#92978F] font-normal">
              Envie seu vídeo para começar a edição.
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2.5 rounded-xl bg-[#C5F955] hover:bg-[#b8ea44] text-[#111315] text-sm font-medium transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isVslMode ? 'Criar VSL' : 'Criar anúncio'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedProjects.map(proj => {
            const isEditingTitle = editingTitleId === proj.id;
            const isGerando = proj.status === 'gerando';
            const isRevisao = proj.status === 'revisao';
            const isReady = proj.status === 'pronto';

            return (
              <div
                key={proj.id}
                onClick={() => handleCardClick(proj)}
                className="bg-[#15181c] border border-[#21252b] hover:border-[#2f353d] rounded-xl overflow-hidden transition-all cursor-pointer group flex flex-col relative"
              >
                {/* Thumbnail Preview with Duration badge */}
                <div className="relative aspect-[9/14] bg-[#0c0e10] overflow-hidden flex items-center justify-center">
                  {proj.thumbnailUrl ? (
                    <img
                      src={`${API_BASE}${proj.thumbnailUrl}`}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : proj.baseVideo?.url ? (
                    <video
                      src={`${API_BASE}${proj.baseVideo.url}#t=1`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <FileVideo className="w-12 h-12 text-[#3b4866]" />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111315] via-transparent to-black/30 pointer-events-none" />

                  {/* Top Status Badge */}
                  <div className="absolute top-3 left-3">
                    {isGerando && (
                      <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                        <span>Transcrevendo...</span>
                      </span>
                    )}
                    {isRevisao && (
                      <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#C5F955]/15 text-[#C5F955] border border-[#C5F955]/25 backdrop-blur-md">
                        Para revisar
                      </span>
                    )}
                    {isReady && (
                      <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 backdrop-blur-md">
                        Pronto
                      </span>
                    )}
                  </div>

                  {/* Duration Badge bottom-right */}
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-xs font-mono font-medium text-[#F5F5F0]">
                    {proj.durationFormatted || '0:20'}
                  </div>

                  {/* Bottom Progress Bar if Generating (VibeCut frame_85s) */}
                  {isGerando && (
                    <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/60 overflow-hidden">
                      <div
                        className="h-full bg-[#C5F955] transition-all duration-500"
                        style={{ width: `${proj.progress || 15}%` }}
                      />
                    </div>
                  )}

                  {/* Play Hover Button */}
                  {!isGerando && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/25">
                      <div className="w-11 h-11 rounded-full bg-[#C5F955] text-[#111315] flex items-center justify-center scale-95 group-hover:scale-100 transition-transform">
                        <Play className="w-4 h-4 fill-[#111315] ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Info & Actions */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    {isEditingTitle ? (
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitleValue}
                          onChange={e => setEditTitleValue(e.target.value)}
                          className="flex-1 px-2.5 py-1 rounded-lg bg-[#111315] border border-[#C5F955] text-xs text-[#F5F5F0] focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={(e) => handleSaveTitle(proj.id, e)}
                          className="p-1 rounded-lg bg-[#C5F955] text-[#111315]"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-medium text-[#F5F5F0] truncate flex-1" title={proj.title}>
                          {proj.title}
                        </h4>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTitleId(proj.id);
                            setEditTitleValue(proj.title);
                          }}
                          className="text-[#92978F] hover:text-[#F5F5F0] transition-colors p-1"
                          title="Renomear"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-[#92978F] mt-1.5 font-normal">
                      <span>{new Date(proj.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                      <span>{proj.broll_segments?.length ? `${proj.broll_segments.length} cenas` : (isGerando ? `${proj.progress || 10}%` : '0 cenas')}</span>
                    </div>
                  </div>

                  {/* Card Bottom Buttons: Revisar/Abrir + Trash */}
                  <div className="pt-2.5 border-t border-[#1f2328] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(proj);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-[#C5F955]/10 hover:bg-[#C5F955]/20 text-[#C5F955] border border-[#C5F955]/20 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isGerando ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Ver progresso</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isReady ? 'Abrir' : 'Revisar'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(proj.id, e)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress Modal (Exact VibeCut match frame_110s) */}
      {progressModalProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setProgressModalProject(null)}
        >
          <div
            className="w-full max-w-xl bg-[#15181c] border border-[#21252b] rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setProgressModalProject(null)}
              className="absolute top-4 right-4 text-[#92978F] hover:text-[#F5F5F0] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Spinner */}
            <div className="w-12 h-12 border-3 border-[#C5F955]/30 border-t-[#C5F955] rounded-full animate-spin" />

            {/* Status stage title */}
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-[#F5F5F0]">
                {progressModalProject.stage || 'Transcrevendo a fala do avatar...'}
              </h3>
              <p className="text-xs text-[#92978F]">
                {progressModalProject.title}
              </p>
            </div>

            {/* Progress bar and % */}
            <div className="w-full max-w-md space-y-2">
              <div className="w-full h-2 bg-[#21252b] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C5F955] transition-all duration-500 rounded-full"
                  style={{ width: `${progressModalProject.progress || 10}%` }}
                />
              </div>
              <div className="text-xs font-mono font-medium text-[#C5F955]">
                {progressModalProject.progress || 10}%
              </div>
            </div>

            {/* Helper text as in video */}
            <p className="text-xs text-[#92978F] max-w-md">
              Você pode sair desta tela. A geração continua e o anúncio aparece na galeria quando estiver pronto.
            </p>

            <div className="flex items-center gap-3 pt-2">
              {progressModalProject.status === 'revisao' || progressModalProject.status === 'pronto' ? (
                <button
                  type="button"
                  onClick={() => {
                    const target = progressModalProject;
                    setProgressModalProject(null);
                    onSelectProject(target);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#C5F955] hover:bg-[#b8ea44] text-[#111315] font-medium text-xs transition-colors cursor-pointer"
                >
                  Abrir no editor
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setProgressModalProject(null)}
                  className="px-5 py-2 rounded-xl bg-[#21252b] hover:bg-[#2b3038] text-[#F5F5F0] text-xs font-medium transition-colors cursor-pointer"
                >
                  Continuar navegando
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
