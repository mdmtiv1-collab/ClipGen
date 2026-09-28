import React, { useState, useEffect } from 'react';
import {
  Folder,
  Plus,
  Upload,
  Play,
  ArrowLeft,
  Search,
  Sparkles,
  Trash2,
  Pencil,
  Check,
  X,
  RefreshCw,
  Tag
} from 'lucide-react';

const API_BASE = 'http://localhost:3001';

export default function LibraryView({ categories, onRefreshCategories }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryBrolls, setCategoryBrolls] = useState([]);
  const [isLoadingBrolls, setIsLoadingBrolls] = useState(false);

  // Search queries
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [brollSearchQuery, setBrollSearchQuery] = useState('');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [showNewCatModal, setShowNewCatModal] = useState(false);

  // Preview & Edit states
  const [activePreviewVideo, setActivePreviewVideo] = useState(null);
  const [editingBroll, setEditingBroll] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');

  // Individual and batch AI analysis states
  const [analyzingFiles, setAnalyzingFiles] = useState({});
  const [selectedFilenames, setSelectedFilenames] = useState(new Set());
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);

  const totalBrolls = categories.reduce((acc, cat) => acc + (cat.count || 0), 0);

  // Filter categories on main view
  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  // Fetch full rich brolls list when entering a category
  const fetchCategoryBrolls = async (catId) => {
    setIsLoadingBrolls(true);
    try {
      const res = await fetch(`${API_BASE}/api/brolls/list/${encodeURIComponent(catId)}`);
      if (res.ok) {
        const data = await res.json();
        setCategoryBrolls(data);
      }
    } catch (err) {
      console.error('Error fetching category brolls:', err);
    } finally {
      setIsLoadingBrolls(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryBrolls(selectedCategory.id);
      setSelectedFilenames(new Set());
      setBrollSearchQuery('');
    } else {
      setCategoryBrolls([]);
      setSelectedFilenames(new Set());
    }
  }, [selectedCategory]);

  // Create new category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const id = newCatName.toLowerCase().replace(/\s+/g, '_');
      const res = await fetch(`${API_BASE}/api/brolls/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: newCatName })
      });
      if (res.ok) {
        setNewCatName('');
        setShowNewCatModal(false);
        onRefreshCategories();
      }
    } catch (err) {
      alert('Erro ao criar categoria: ' + err.message);
    }
  };

  // Upload videos to category
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedCategory) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('category', selectedCategory.id);
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch(`${API_BASE}/api/brolls/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        await onRefreshCategories();
        await fetchCategoryBrolls(selectedCategory.id);
      }
    } catch (err) {
      alert('Erro ao fazer upload: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // AI Re-analysis of single broll
  const handleReanalyze = async (broll) => {
    const filename = broll.filename;
    setAnalyzingFiles(prev => ({ ...prev, [filename]: true }));

    try {
      const res = await fetch(`${API_BASE}/api/brolls/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory.id,
          filename: filename
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          setCategoryBrolls(prev =>
            prev.map(item => item.filename === filename ? { ...item, ...data.item } : item)
          );
        }
      } else {
        const err = await res.json();
        alert('Erro ao analisar com IA: ' + (err.error || res.statusText));
      }
    } catch (err) {
      alert('Falha ao conectar à IA: ' + err.message);
    } finally {
      setAnalyzingFiles(prev => ({ ...prev, [filename]: false }));
    }
  };

  // Batch AI Analysis for all selected videos
  const handleBatchReanalyze = async () => {
    if (selectedFilenames.size === 0) return;
    setIsBatchAnalyzing(true);

    const filesToAnalyze = Array.from(selectedFilenames);
    for (const filename of filesToAnalyze) {
      const broll = categoryBrolls.find(b => b.filename === filename);
      if (broll) {
        await handleReanalyze(broll);
      }
    }

    setIsBatchAnalyzing(false);
  };

  // Delete broll
  const handleDeleteBroll = async (broll) => {
    if (!window.confirm(`Deseja realmente excluir "${broll.title || broll.filename}" da biblioteca?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/brolls/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory.id,
          filename: broll.filename
        })
      });

      if (res.ok) {
        setCategoryBrolls(prev => prev.filter(item => item.filename !== broll.filename));
        setSelectedFilenames(prev => {
          const next = new Set(prev);
          next.delete(broll.filename);
          return next;
        });
        onRefreshCategories();
      } else {
        alert('Erro ao excluir vídeo.');
      }
    } catch (err) {
      alert('Erro de conexão ao excluir: ' + err.message);
    }
  };

  // Open Edit Modal
  const openEditModal = (broll) => {
    setEditingBroll(broll);
    setEditTitle(broll.title || '');
    setEditDescription(broll.description || '');
    setEditTags((broll.tags || []).join(', '));
  };

  // Save Edit Modal
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBroll) return;

    const parsedTags = editTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    try {
      const res = await fetch(`${API_BASE}/api/brolls/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory.id,
          filename: editingBroll.filename,
          updates: {
            title: editTitle.trim(),
            description: editDescription.trim(),
            tags: parsedTags
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCategoryBrolls(prev =>
          prev.map(item =>
            item.filename === editingBroll.filename ? { ...item, ...data.item } : item
          )
        );
        setEditingBroll(null);
      } else {
        alert('Erro ao atualizar vídeo.');
      }
    } catch (err) {
      alert('Erro ao conectar: ' + err.message);
    }
  };

  // Toggle selection
  const toggleSelect = (filename) => {
    setSelectedFilenames(prev => {
      const next = new Set(prev);
      if (next.has(filename)) {
        next.delete(filename);
      } else {
        next.add(filename);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFilenames.size === filteredBrolls.length) {
      setSelectedFilenames(new Set());
    } else {
      setSelectedFilenames(new Set(filteredBrolls.map(b => b.filename)));
    }
  };

  // Filter brolls in category view by keywords, title, description or filename
  const filteredBrolls = categoryBrolls.filter(broll => {
    if (!brollSearchQuery.trim()) return true;
    const q = brollSearchQuery.toLowerCase();
    const matchTitle = (broll.title || '').toLowerCase().includes(q);
    const matchFull = (broll.filename || '').toLowerCase().includes(q);
    const matchDesc = (broll.description || '').toLowerCase().includes(q);
    const matchTags = (broll.tags || []).some(t => t.toLowerCase().includes(q));
    return matchTitle || matchFull || matchDesc || matchTags;
  });

  // --- VIEW: CATEGORY DETAILS (Inside a category, matching user screenshot) ---
  if (selectedCategory) {
    const catData = categories.find(c => c.id === selectedCategory.id) || selectedCategory;

    return (
      <div className="w-full p-6 sm:p-8 space-y-6 font-sans">
        {/* Top Navigation & Info Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#21252b]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setActivePreviewVideo(null);
              }}
              className="p-2.5 rounded-xl bg-[#15181c] hover:bg-[#1f242b] border border-[#21252b] text-[#92978F] hover:text-[#F5F5F0] transition-colors cursor-pointer"
              title="Voltar para todas as pastas"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-[#F5F5F0]">{catData.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#181c21] text-[#C5F955] border border-[#C5F955]/30">
                  {catData.count || categoryBrolls.length} vídeos
                </span>
              </div>
              <p className="text-sm text-[#92978F] mt-1 font-normal">
                Pasta local: <span className="font-mono text-xs text-[#A1A7B3]">/storage/brolls/{catData.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search within category */}
            <div className="relative w-64">
              <Search className="w-4 h-4 text-[#92978F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar palavra-chave..."
                value={brollSearchQuery}
                onChange={e => setBrollSearchQuery(e.target.value)}
                className="w-full bg-[#15181c] border border-[#21252b] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5F5F0] placeholder-[#92978F] focus:outline-none focus:border-[#C5F955] transition-colors"
              />
            </div>

            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C5F955] hover:bg-[#b8ea44] text-[#111315] font-medium text-xs cursor-pointer transition-colors shrink-0">
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>{isUploading ? 'Enviando...' : 'Adicionar Vídeos MP4'}</span>
              <input
                type="file"
                multiple
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Batch Selection Action Bar (Appears when 1+ videos are selected) */}
        {selectedFilenames.size > 0 && (
          <div className="sticky top-2 z-30 bg-[#15181c]/95 backdrop-blur-md border border-[#C5F955]/40 rounded-xl px-5 py-3 flex items-center justify-between shadow-2xl transition-all">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#F5F5F0]">
                {selectedFilenames.size} de {filteredBrolls.length} selecionado(s)
              </span>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs text-[#92978F] hover:text-[#F5F5F0] underline cursor-pointer"
              >
                {selectedFilenames.size === filteredBrolls.length ? 'Desmarcar todos' : 'Selecionar todos'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBatchReanalyze}
                disabled={isBatchAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1f26] border border-[#C5F955]/30 hover:border-[#C5F955] text-[#C5F955] text-xs font-medium cursor-pointer transition-colors disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isBatchAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isBatchAnalyzing ? 'Analisando com IA...' : 'Re-analisar Selecionados'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilenames(new Set())}
                className="p-1 text-[#92978F] hover:text-[#F5F5F0] cursor-pointer"
                title="Limpar seleção"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Video Preview Modal */}
        {activePreviewVideo && (
          <div className="fixed inset-0 z-50 bg-[#111315]/85 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#15181c] border border-[#21252b] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[#F5F5F0] truncate">
                  {activePreviewVideo.title || activePreviewVideo.filename}
                </span>
                <button
                  onClick={() => setActivePreviewVideo(null)}
                  className="text-[#92978F] hover:text-[#F5F5F0] px-2 py-1 font-medium cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden">
                <video
                  src={`${API_BASE}${activePreviewVideo.url}`}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Edit Metadata Modal */}
        {editingBroll && (
          <div className="fixed inset-0 z-50 bg-[#111315]/85 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#15181c] border border-[#21252b] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center pb-3 border-b border-[#21252b]">
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-[#C5F955]" />
                  <h3 className="text-sm font-semibold text-[#F5F5F0]">Editar Detalhes do B-Roll</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingBroll(null)}
                  className="text-[#92978F] hover:text-[#F5F5F0] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#92978F] block mb-1">
                    Título / Identificador
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full bg-[#111315] border border-[#21252b] rounded-xl px-3 py-2 text-xs text-[#F5F5F0] focus:border-[#C5F955] outline-none"
                    placeholder="Ex: 754848337955..."
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#92978F] block mb-1">
                    Descrição da Cena (IA)
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    className="w-full bg-[#111315] border border-[#21252b] rounded-xl px-3 py-2 text-xs text-[#F5F5F0] focus:border-[#C5F955] outline-none resize-none leading-relaxed"
                    placeholder="Descreva visualmente o que acontece no clipe..."
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#92978F] block mb-1">
                    Palavras-chave (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={e => setEditTags(e.target.value)}
                    className="w-full bg-[#111315] border border-[#21252b] rounded-xl px-3 py-2 text-xs text-[#F5F5F0] focus:border-[#C5F955] outline-none"
                    placeholder="futebol, campo, noite, treino, drible"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingBroll(null)}
                    className="px-4 py-2 rounded-xl border border-[#21252b] text-xs font-medium text-[#92978F] hover:text-[#F5F5F0] hover:bg-[#1a1e24] cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#C5F955] hover:bg-[#b8ea44] text-[#111315] text-xs font-medium cursor-pointer transition-colors"
                  >
                    Salvar alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoadingBrolls ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#C5F955] animate-spin" />
            <p className="text-sm text-[#92978F] font-normal">Carregando e indexando biblioteca de b-rolls...</p>
          </div>
        ) : filteredBrolls.length === 0 ? (
          <div className="py-16 text-center border border-[#21252b] rounded-2xl bg-[#15181c]/50 p-8 space-y-3">
            <Tag className="w-8 h-8 text-[#92978F] mx-auto opacity-50" />
            <h3 className="text-base font-semibold text-[#F5F5F0]">Nenhum vídeo encontrado</h3>
            <p className="text-xs text-[#92978F] max-w-sm mx-auto font-normal">
              {brollSearchQuery
                ? `Nenhum clipe correspondeu à pesquisa por "${brollSearchQuery}".`
                : 'Esta categoria ainda não possui vídeos em formato MP4.'}
            </p>
          </div>
        ) : (
          /* VIDEO GRID: 8 COLUMNS COMPACT LAYOUT */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-8 gap-3 w-full">
            {filteredBrolls.map((broll, idx) => {
              const isSelected = selectedFilenames.has(broll.filename);
              const isAnalyzing = analyzingFiles[broll.filename];

              return (
                <div
                  key={broll.filename || idx}
                  className={`bg-[#14171b] border rounded-xl p-2 flex flex-col justify-between transition-all duration-200 group/card ${
                    isSelected
                      ? 'border-[#C5F955] ring-1 ring-[#C5F955]/40'
                      : 'border-[#21252b] hover:border-[#2f353d]'
                  }`}
                >
                  {/* Top Thumbnail Box */}
                  <div
                    onClick={() => setActivePreviewVideo(broll)}
                    className="relative aspect-[9/14] bg-black rounded-lg overflow-hidden cursor-pointer group"
                  >
                    <video
                      src={`${API_BASE}${broll.url}#t=0.5`}
                      preload="metadata"
                      playsInline
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                    />

                    {/* Play Button Overlay on hover */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent flex items-center justify-center transition-colors">
                      <div className="w-8 h-8 rounded-full bg-black/60 group-hover:bg-[#C5F955] text-white group-hover:text-[#111315] flex items-center justify-center shadow-md transition-all transform group-hover:scale-110">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Top-Left Selection Checkbox */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(broll.filename);
                      }}
                      className={`absolute top-1.5 left-1.5 w-4.5 h-4.5 rounded backdrop-blur-xs flex items-center justify-center cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#C5F955] text-[#111315]'
                          : 'bg-black/60 border border-white/30 text-transparent hover:border-white'
                      }`}
                      title={isSelected ? 'Desmarcar' : 'Selecionar'}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>

                    {/* Bottom-Right Duration Badge */}
                    <div className="absolute bottom-1.5 right-1.5 px-1 py-0.5 rounded bg-black/85 text-white font-mono text-[9px] font-medium leading-none">
                      {broll.durationFormatted || '0:15'}
                    </div>

                    {/* Analyzing Spinner Overlay */}
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-[#111315]/85 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 text-center p-2">
                        <Sparkles className="w-5 h-5 text-[#C5F955] animate-spin" />
                        <span className="text-[10px] font-medium text-[#C5F955]">
                          Analisando...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body Content (Below Thumbnail) */}
                  <div className="pt-2 px-0.5 space-y-1.5">
                    {/* Header Row: Title & Date + Trash Button */}
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <h3
                          className="font-semibold text-xs text-[#F5F5F0] truncate leading-tight"
                          title={broll.fullTitle || broll.filename}
                        >
                          {broll.title || broll.filename}
                        </h3>
                        <span className="text-[10px] text-[#92978F] font-normal block leading-tight mt-0.5">
                          {broll.date || '24/09/2026'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteBroll(broll)}
                        className="p-1 text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer shrink-0"
                        title="Excluir vídeo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* AI Description (1 line with tooltip) */}
                    <p
                      className="text-[10px] text-[#92978F] leading-tight line-clamp-1 font-normal"
                      title={broll.description}
                    >
                      {broll.description || 'Sem descrição.'}
                    </p>

                    {/* Keywords / Tags Badges (Palavras-chave compactas) */}
                    <div className="flex flex-wrap gap-1 min-h-[22px] items-center">
                      {(broll.tags && broll.tags.length > 0 ? broll.tags : ['sem tags']).slice(0, 2).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          onClick={() => setBrollSearchQuery(tag)}
                          className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#1c2026] text-[#A1A7B3] hover:text-[#F5F5F0] hover:bg-[#252b33] border border-[#262c36] cursor-pointer transition-colors truncate max-w-[80px]"
                          title={`Filtrar por "${tag}"`}
                        >
                          {tag}
                        </span>
                      ))}
                      {broll.tags && broll.tags.length > 2 && (
                        <span
                          className="px-1 py-0.5 rounded text-[9px] text-[#92978F] bg-[#171a1f] border border-[#21252b]"
                          title={broll.tags.slice(2).join(', ')}
                        >
                          +{broll.tags.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Footer Actions: Editar & Re-analisar */}
                    <div className="flex items-center justify-between text-[10px] text-[#92978F] pt-1.5 border-t border-[#1f2328]">
                      <button
                        type="button"
                        onClick={() => openEditModal(broll)}
                        className="flex items-center gap-1 hover:text-[#F5F5F0] transition-colors cursor-pointer"
                        title="Editar detalhes"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReanalyze(broll)}
                        disabled={isAnalyzing}
                        className="flex items-center gap-1 hover:text-[#C5F955] transition-colors cursor-pointer disabled:opacity-50"
                        title="Re-analisar com IA"
                      >
                        <Sparkles className={`w-2.5 h-2.5 ${isAnalyzing ? 'animate-spin text-[#C5F955]' : ''}`} />
                        <span>{isAnalyzing ? '...' : 'Re-analisar'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- VIEW: MAIN DIRECTORY (Categories Folders Grid) ---
  return (
    <div className="w-full p-6 sm:p-8 space-y-6 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#21252b]">
        <div>
          <h1 className="text-xl font-semibold text-[#F5F5F0] flex items-center gap-3">
            <span>Biblioteca de B-Rolls</span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#181c21] text-[#C5F955] border border-[#C5F955]/30">
              {totalBrolls} vídeos cadastrados
            </span>
          </h1>
          <p className="text-sm text-[#92978F] mt-1 font-normal">
            Seus clipes categorizados com análise por IA. A IA do ClipGen usa as palavras-chave e descrições para enriquecer e dar ritmo aos anúncios.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-[#92978F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar categoria..."
              value={categorySearchQuery}
              onChange={e => setCategorySearchQuery(e.target.value)}
              className="w-full bg-[#15181c] border border-[#21252b] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5F5F0] placeholder-[#92978F] focus:outline-none focus:border-[#C5F955] transition-colors"
            />
          </div>

          <button
            onClick={() => setShowNewCatModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C5F955] hover:bg-[#b8ea44] text-[#111315] font-medium text-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nova Categoria</span>
          </button>
        </div>
      </div>

      {/* New Category Modal */}
      {showNewCatModal && (
        <div className="fixed inset-0 z-50 bg-[#111315]/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#15181c] border border-[#21252b] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-[#F5F5F0]">Criar Nova Pasta de B-roll</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#92978F] block mb-1">
                  Nome da categoria
                </label>
                <input
                  type="text"
                  placeholder="Ex: Carros esportivos, Natureza..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full bg-[#111315] border border-[#21252b] rounded-xl px-3 py-2 text-xs text-[#F5F5F0] focus:border-[#C5F955] outline-none"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCatModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#21252b] text-xs font-medium text-[#92978F] hover:text-[#F5F5F0] hover:bg-[#1a1e24] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C5F955] hover:bg-[#b8ea44] text-[#111315] text-xs font-medium cursor-pointer"
                >
                  Criar Pasta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map(cat => (
          <div
            key={cat.id}
            onClick={() => setSelectedCategory(cat)}
            className="p-5 rounded-2xl bg-[#15181c] border border-[#21252b] hover:border-[#C5F955]/50 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#111315] border border-[#21252b] flex items-center justify-center text-[#92978F] group-hover:text-[#C5F955] group-hover:border-[#C5F955]/30 transition-colors">
                <Folder className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#181c21] text-[#C5F955] border border-[#C5F955]/20">
                {cat.count || 0} vídeos
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-[#F5F5F0] group-hover:text-white transition-colors truncate">
                {cat.name}
              </h3>
              <p className="text-xs text-[#92978F] mt-1 font-normal">
                {cat.count === 0 ? 'Pasta vazia' : `${cat.count} clipe${cat.count === 1 ? '' : 's'} com tags IA`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
