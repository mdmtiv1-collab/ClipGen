import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle2, ExternalLink, Edit2, RotateCw, Save, X, KeyRound, Eye, EyeOff } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

export default function SettingsModal({ isOpen, onClose, brandName = 'ClipGen' }) {
  const [settings, setSettings] = useState({
    openRouterApiKey: '',
    assemblyAiApiKey: '',
    geminiApiKey: '',
    groqApiKey: ''
  });
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [showAssemblyAiKey, setShowAssemblyAiKey] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    license: { ready: true, statusText: 'Código de licença funcionando', key: '' },
    database: { ready: true },
    ffmpeg: { ready: true }
  });
  const [isChangingLicense, setIsChangingLicense] = useState(false);
  const [newLicenseKey, setNewLicenseKey] = useState('');
  const [licenseFeedback, setLicenseFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchStatusAndSettings = async () => {
    setIsChecking(true);
    try {
      const [sRes, sysRes] = await Promise.all([
        fetch(`${API_BASE}/api/settings`),
        fetch(`${API_BASE}/api/system/status`)
      ]);
      if (sRes.ok) {
        const sData = await sRes.json();
        setSettings(prev => ({ ...prev, ...sData }));
      }
      if (sysRes.ok) {
        const sysData = await sysRes.json();
        setSystemStatus(sysData);
      }
    } catch (err) {
      console.error('Error fetching settings/status:', err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatusAndSettings();
    }
  }, [isOpen]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
        await fetchStatusAndSettings();
      }
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivateNewLicense = async () => {
    if (!newLicenseKey.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/license/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newLicenseKey.trim(), plan: 'vitalicio' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLicenseFeedback('Licença ativada com sucesso!');
        setIsChangingLicense(false);
        setNewLicenseKey('');
        await fetchStatusAndSettings();
      } else {
        setLicenseFeedback(data.error || 'Código inválido.');
      }
    } catch (err) {
      setLicenseFeedback('Erro ao conectar: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#111315]/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto select-none font-sans">
      <div className="max-w-[560px] w-full bg-[#15181c] border border-[#21252b] rounded-2xl p-7 shadow-2xl relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#92978F] hover:text-[#F5F5F0] transition-colors p-1 rounded-lg cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Icon (ClipGen Logo) */}
        <div className="flex items-center justify-center mx-auto mb-3">
          <img src="/logo.png" alt="ClipGen" className="w-14 h-14 object-contain" />
        </div>

        {/* Header Title & Subtitle */}
        <div className="text-center space-y-1.5 mb-6">
          <h2 className="text-xl font-semibold text-[#F5F5F0] tracking-tight">
            Bem-vindo ao {brandName}! 👋
          </h2>
          <p className="text-sm text-[#92978F] max-w-md mx-auto leading-relaxed font-normal">
            A instalação deu certo. Agora é só preencher as chaves abaixo e clicar em{' '}
            <strong className="text-[#F5F5F0] font-medium">Salvar configurações</strong>. O sistema confere tudo sozinho.
          </p>
        </div>

        {/* CARD 1: Preencher as chaves aqui mesmo */}
        <div className="bg-[#111315] rounded-xl border border-[#21252b] p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F0]">Preencher as chaves aqui mesmo</h3>
            <p className="text-sm text-[#92978F] mt-1 font-normal">
              Para o {brandName} montar os seus anúncios, preencha as chaves abaixo.
            </p>
          </div>

          {/* License Status Box */}
          <div className="space-y-2">
            <div className="bg-[#192215] border border-[#C5F955]/30 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C5F955] shrink-0" />
                <span className="text-xs font-medium text-[#C5F955]">
                  Código de licença {brandName} {systemStatus.license?.ready ? 'funcionando' : 'inativo'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsChangingLicense(!isChangingLicense)}
                className="text-xs text-[#92978F] hover:text-[#F5F5F0] flex items-center gap-1.5 cursor-pointer transition-colors font-medium"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Trocar</span>
              </button>
            </div>

            {/* Inline License Key change form */}
            {isChangingLicense && (
              <div className="p-3 bg-[#15181c] rounded-xl border border-[#21252b] space-y-2">
                <label className="text-xs font-medium text-[#92978F] block">
                  Insira o novo código de licença:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="CG-XXXX-XXXX-XXXX"
                    value={newLicenseKey}
                    onChange={e => setNewLicenseKey(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#21252b] text-xs text-[#F5F5F0] bg-[#111315] font-mono focus:outline-none focus:border-[#C5F955]"
                  />
                  <button
                    type="button"
                    onClick={handleActivateNewLicense}
                    className="px-3.5 py-1.5 rounded-lg bg-[#C5F955] hover:bg-[#b8ea44] text-[#111315] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Ativar
                  </button>
                </div>
                {licenseFeedback && (
                  <p className="text-xs text-[#C5F955] font-medium">{licenseFeedback}</p>
                )}
              </div>
            )}
          </div>

          {/* Form for API Keys */}
          <form onSubmit={handleSave} className="space-y-4">
            {/* OpenRouter Key */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium text-[#F5F5F0]">
                  OpenRouter, chave da API
                </label>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#92978F] hover:text-[#C5F955] transition-colors"
                  title="Abrir OpenRouter Keys"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="relative">
                <input
                  type={showOpenRouterKey ? 'text' : 'password'}
                  placeholder="sk-or-..."
                  value={settings.openRouterApiKey || ''}
                  onChange={e => setSettings({ ...settings, openRouterApiKey: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#21252b] text-sm text-[#F5F5F0] bg-[#15181c] placeholder:text-[#92978F]/50 focus:outline-none focus:border-[#C5F955] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#92978F] hover:text-[#C5F955] transition-colors p-0.5 cursor-pointer"
                  title={showOpenRouterKey ? 'Ocultar chave' : 'Visualizar chave'}
                >
                  {showOpenRouterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-[#92978F] font-normal">
                Crie a conta e adicione créditos antes de gerar a chave
              </p>
            </div>

            {/* AssemblyAI Key */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium text-[#F5F5F0]">
                  AssemblyAI, chave da API
                </label>
                <a
                  href="https://www.assemblyai.com/app/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#92978F] hover:text-[#C5F955] transition-colors"
                  title="Abrir AssemblyAI Keys"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="relative">
                <input
                  type={showAssemblyAiKey ? 'text' : 'password'}
                  placeholder="Cole aqui a chave da AssemblyAI"
                  value={settings.assemblyAiApiKey || ''}
                  onChange={e => setSettings({ ...settings, assemblyAiApiKey: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#21252b] text-sm text-[#F5F5F0] bg-[#15181c] placeholder:text-[#92978F]/50 focus:outline-none focus:border-[#C5F955] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowAssemblyAiKey(!showAssemblyAiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#92978F] hover:text-[#C5F955] transition-colors p-0.5 cursor-pointer"
                  title={showAssemblyAiKey ? 'Ocultar chave' : 'Visualizar chave'}
                >
                  {showAssemblyAiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-[#92978F] font-normal">
                A chave fica no painel, em API Keys
              </p>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 px-4 rounded-xl bg-[#C5F955] hover:bg-[#b8ea44] text-[#111315] font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#111315] stroke-[2.5]" />
                  <span>Configurações salvas com sucesso!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#111315] stroke-[2.5]" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar configurações'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* CARD 2: JÁ ESTÁ PRONTO (Matching Image 5) */}
        <div className="bg-[#111315] rounded-xl border border-[#21252b] p-5 space-y-3 mt-4">
          <h4 className="text-xs font-semibold text-[#92978F] tracking-wider uppercase">
            JÁ ESTÁ PRONTO
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C5F955] shrink-0" />
                <span className="text-[#F5F5F0] font-normal">Licença {brandName}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C5F955] shrink-0" />
                <span className="text-[#F5F5F0] font-normal">FFmpeg (edição de vídeo)</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C5F955] shrink-0" />
                <span className="text-[#F5F5F0] font-normal">Banco de dados e arquivos locais</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action: Verificar novamente */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={fetchStatusAndSettings}
            disabled={isChecking}
            className="inline-flex items-center gap-2 text-xs text-[#92978F] hover:text-[#C5F955] transition-colors cursor-pointer font-medium"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Verificar novamente</span>
          </button>
        </div>
      </div>
    </div>
  );
}
