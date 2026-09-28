import React, { useState } from 'react';
import { Film, FolderOpen, Video, Settings, Moon, Sun } from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenSettings,
  brandName = 'ClipGen'
}) {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <aside className="w-64 bg-[#111315] border-r border-[#1f2328] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none font-sans">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-[#1f2328] flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('create')}
          >
            <img src="/logo.png" alt="ClipGen" className="w-8 h-8 object-contain shrink-0" />
            <span className="text-xl font-bold tracking-tight text-[#F5F5F0]">
              Clip<span className="text-[#C5F955]">Gen</span>
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'create' || activeTab === 'editor'
                ? 'bg-[#1a1e24] text-[#F5F5F0]'
                : 'text-[#92978F] hover:bg-[#15181c] hover:text-[#F5F5F0]'
            }`}
          >
            <Film
              className={`w-4 h-4 shrink-0 transition-colors ${
                activeTab === 'create' || activeTab === 'editor' ? 'text-[#C5F955]' : 'text-[#92978F]'
              }`}
            />
            <span>Editor de Anúncios</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vsl')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'vsl'
                ? 'bg-[#1a1e24] text-[#F5F5F0]'
                : 'text-[#92978F] hover:bg-[#15181c] hover:text-[#F5F5F0]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Video
                className={`w-4 h-4 shrink-0 transition-colors ${
                  activeTab === 'vsl' ? 'text-[#C5F955]' : 'text-[#92978F]'
                }`}
              />
              <span>Editor de VSL</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-[#C5F955]/10 text-[#C5F955] border border-[#C5F955]/20">
              Beta
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'library'
                ? 'bg-[#1a1e24] text-[#F5F5F0]'
                : 'text-[#92978F] hover:bg-[#15181c] hover:text-[#F5F5F0]'
            }`}
          >
            <FolderOpen
              className={`w-4 h-4 shrink-0 transition-colors ${
                activeTab === 'library' ? 'text-[#C5F955]' : 'text-[#92978F]'
              }`}
            />
            <span>Biblioteca de B-rolls</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outputs')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'outputs'
                ? 'bg-[#1a1e24] text-[#F5F5F0]'
                : 'text-[#92978F] hover:bg-[#15181c] hover:text-[#F5F5F0]'
            }`}
          >
            <Video
              className={`w-4 h-4 shrink-0 transition-colors ${
                activeTab === 'outputs' ? 'text-[#C5F955]' : 'text-[#92978F]'
              }`}
            />
            <span>Anúncios Prontos</span>
          </button>
        </nav>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#1f2328] flex items-center justify-between text-xs text-[#92978F]">
        <div
          className="flex items-center gap-3 cursor-pointer select-none group"
          onClick={() => setActiveTab('create')}
          title="ClipGen"
        >
          <img src="/logo.png" alt="ClipGen" className="w-7 h-7 object-contain shrink-0" />
          <span className="text-lg font-bold tracking-tight text-[#F5F5F0] group-hover:text-white transition-colors">
            Clip<span className="text-[#C5F955]">Gen</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-[#92978F]">
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-[#92978F] hover:text-[#F5F5F0] transition-colors p-1.5 rounded-lg hover:bg-[#15181c] cursor-pointer"
            title="Configurações & APIs"
          >
            <Settings className="w-[18px] h-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="text-[#92978F] hover:text-[#F5F5F0] transition-colors p-1.5 rounded-lg hover:bg-[#15181c] cursor-pointer"
            title={darkMode ? "Modo escuro ativo" : "Modo claro ativo"}
          >
            {darkMode ? (
              <Moon className="w-[18px] h-[18px]" />
            ) : (
              <Sun className="w-[18px] h-[18px] text-[#C5F955]" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
