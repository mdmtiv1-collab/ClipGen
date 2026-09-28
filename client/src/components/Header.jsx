import React from 'react';
import { Video, FolderOpen, Settings, Sparkles, Download } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenSettings, renderedCount = 0 }) {
  return (
    <header className="border-b border-[#21252b] bg-[#111315]/95 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between font-sans">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="ClipGen" className="w-9 h-9 object-contain shrink-0" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-[#F5F5F0]">
              Clip<span className="text-[#C5F955]">Gen</span>
            </h1>
          </div>
          <p className="text-xs text-[#92978F] font-normal">Editor inteligente de criativos</p>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex items-center gap-1 bg-[#15181c] p-1 rounded-xl border border-[#21252b]">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'create'
              ? 'bg-[#C5F955]/10 text-[#C5F955] border border-[#C5F955]/20'
              : 'text-[#92978F] hover:text-[#F5F5F0] hover:bg-[#1a1e24]'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Criar Anúncios</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'library'
              ? 'bg-[#C5F955]/10 text-[#C5F955] border border-[#C5F955]/20'
              : 'text-[#92978F] hover:text-[#F5F5F0] hover:bg-[#1a1e24]'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Biblioteca de B-rolls</span>
        </button>

        <button
          onClick={() => setActiveTab('outputs')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'outputs'
              ? 'bg-[#C5F955]/10 text-[#C5F955] border border-[#C5F955]/20'
              : 'text-[#92978F] hover:text-[#F5F5F0] hover:bg-[#1a1e24]'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Exportados</span>
          {renderedCount > 0 && (
            <span className="bg-[#C5F955]/20 text-[#C5F955] text-xs font-medium px-1.5 py-0.2 rounded-full">
              {renderedCount}
            </span>
          )}
        </button>
      </nav>

      {/* Settings Action */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#21252b] bg-[#15181c] text-[#92978F] hover:text-[#F5F5F0] hover:border-[#C5F955]/50 transition-colors text-sm font-medium cursor-pointer"
        >
          <Settings className="w-4 h-4 text-[#92978F]" />
          <span>Configurações & APIs</span>
        </button>
      </div>
    </header>
  );
}
