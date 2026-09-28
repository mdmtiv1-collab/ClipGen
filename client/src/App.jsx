import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LibraryView from './components/LibraryView';
import CreateAdView from './components/CreateAdView';
import EditorView from './components/EditorView';
import OutputsView from './components/OutputsView';
import SettingsModal from './components/SettingsModal';
import ProjectDashboard from './components/ProjectDashboard';

const API_BASE = 'http://localhost:3001';

export default function App() {
  const [activeTab, setActiveTab] = useState('create');
  const [categories, setCategories] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [batchProjects, setBatchProjects] = useState([]);
  const [renderedCount, setRenderedCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);

  // States to toggle between Dashboard list and Creation form
  const [isCreatingAd, setIsCreatingAd] = useState(false);
  const [isCreatingVsl, setIsCreatingVsl] = useState(false);

  // Brand Name & Theme states
  const [brandName, setBrandName] = useState('ClipGen');
  const [currentTheme, setCurrentTheme] = useState('indigo'); // 'indigo', 'gold', 'emerald', 'cobalt'

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/brolls/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        setServerOnline(true);
      }
    } catch (err) {
      console.warn('Backend server offline:', err);
      setServerOnline(false);
    }
  };

  const fetchOutputsCount = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects/outputs`);
      if (res.ok) {
        const data = await res.json();
        setRenderedCount(data.length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchOutputsCount();
  }, []);

  const handleOpenProject = (proj) => {
    setCurrentProject(proj);
    setActiveTab('editor');
  };

  const handleProjectCreated = (mainProject, allProjects) => {
    setCurrentProject(mainProject);
    setBatchProjects(allProjects || [mainProject]);
    setIsCreatingAd(false);
    setIsCreatingVsl(false);
    setActiveTab('editor');
  };

  const handleBackFromEditor = () => {
    setIsCreatingAd(false);
    setIsCreatingVsl(false);
    setActiveTab(currentProject?.isVslMode ? 'vsl' : 'create');
  };

  const handleRenderSuccess = (result) => {
    fetchOutputsCount();
    setActiveTab('outputs');
  };

  return (
    <div
      className={`${activeTab === 'editor' ? 'h-screen w-screen overflow-hidden' : 'min-h-screen'} bg-[#0e0c19] text-[#F5F5F0] flex selection:bg-[#C5F955] selection:text-[#111315] font-sans`}
    >
      {/* Sidebar with Brand Name & Live Theme Switcher */}
      {activeTab !== 'editor' && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setIsCreatingAd(false);
            setIsCreatingVsl(false);
            setActiveTab(tab);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          brandName={brandName}
          setBrandName={setBrandName}
          currentTheme={currentTheme}
          setCurrentTheme={setCurrentTheme}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {!serverOnline && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 text-center text-xs text-amber-300 font-semibold">
            Aviso: Servidor local não respondeu na porta 3001. Verifique se o backend está em execução.
          </div>
        )}

        <main className={`flex-1 ${activeTab === 'editor' ? 'h-full overflow-hidden' : 'overflow-y-auto'}`}>
          {activeTab === 'create' && (
            isCreatingAd ? (
              <CreateAdView
                key="ad-mode"
                categories={categories}
                onProjectCreated={handleProjectCreated}
                currentTheme={currentTheme}
                isVslMode={false}
                onNavigateToLibrary={() => setActiveTab('library')}
                onBackToList={() => setIsCreatingAd(false)}
              />
            ) : (
              <ProjectDashboard
                onSelectProject={handleOpenProject}
                onCreateNew={() => setIsCreatingAd(true)}
                isVslMode={false}
                currentTheme={currentTheme}
              />
            )
          )}

          {activeTab === 'vsl' && (
            isCreatingVsl ? (
              <CreateAdView
                key="vsl-mode"
                categories={categories}
                onProjectCreated={handleProjectCreated}
                currentTheme={currentTheme}
                isVslMode={true}
                onNavigateToLibrary={() => setActiveTab('library')}
                onBackToList={() => setIsCreatingVsl(false)}
              />
            ) : (
              <ProjectDashboard
                onSelectProject={handleOpenProject}
                onCreateNew={() => setIsCreatingVsl(true)}
                isVslMode={true}
                currentTheme={currentTheme}
              />
            )
          )}

          {activeTab === 'library' && (
            <LibraryView
              categories={categories}
              onRefreshCategories={fetchCategories}
              currentTheme={currentTheme}
            />
          )}

          {activeTab === 'editor' && currentProject && (
            <EditorView
              project={currentProject}
              categories={categories}
              onBackToCreate={handleBackFromEditor}
              onRenderSuccess={handleRenderSuccess}
              currentTheme={currentTheme}
            />
          )}

          {activeTab === 'outputs' && (
            <OutputsView currentTheme={currentTheme} />
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        brandName={brandName}
      />
    </div>
  );
}
