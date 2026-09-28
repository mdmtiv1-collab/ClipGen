import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, Laptop, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

export default function LicenseModal({ isOpen, onClose, brandName = 'ClipGen' }) {
  const [license, setLicense] = useState(null);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('mensal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchLicenseStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/license/status`);
      if (res.ok) {
        const data = await res.json();
        setLicense(data);
        if (data.key && !data.isDemo) {
          setLicenseKeyInput(data.key);
        }
      }
    } catch (err) {
      console.warn('Erro ao checar licença:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLicenseStatus();
      setStatusMsg(null);
    }
  }, [isOpen]);

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) return;

    setIsProcessing(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/license/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: licenseKeyInput.trim(),
          plan: selectedPlan
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao validar chave');

      setLicense(data.license);
      setStatusMsg({ type: 'success', text: 'Licença ativada com sucesso neste computador!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Deseja desativar a licença deste computador para usá-la em outra máquina?')) return;

    setIsProcessing(true);
    try {
      await fetch(`${API_BASE}/api/license/deactivate`, { method: 'POST' });
      await fetchLicenseStatus();
      setLicenseKeyInput('');
      setStatusMsg({ type: 'success', text: 'Chave desvinculada deste PC. Agora você pode ativá-la em outro computador!' });
    } catch (err) {
      alert('Erro: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#111315]/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#15181c] border border-[#21252b] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#21252b]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#C5F955]/15 text-[#C5F955] border border-[#C5F955]/30 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F5F5F0]">Sua Licença do {brandName}</h3>
              <p className="text-xs text-[#92978F]">Proteção por Hardware ID (1 chave = 1 computador)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#92978F] hover:text-[#F5F5F0] font-medium px-2 py-1 cursor-pointer">
            ✕
          </button>
        </div>

        {/* Status atual */}
        {license && license.active && !license.isDemo ? (
          <div className="p-4 rounded-xl bg-[#192215] border border-[#C5F955]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#C5F955] shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-[#F5F5F0] block">Licença Ativa e Válida</span>
                  <span className="text-[11px] text-[#C5F955]">
                    Plano {license.plan?.toUpperCase()} • Válido até {license.validUntil}
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5F955]/20 text-[#C5F955] font-mono font-medium">
                1 PC ATIVO
              </span>
            </div>

            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 flex items-center justify-between font-mono text-xs text-[#F5F5F0]">
              <span className="truncate">{license.key}</span>
              <span className="text-xs text-[#92978F]">ID: {license.machineId}</span>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-[#92978F]">Precisa usar em outro computador?</span>
              <button
                type="button"
                onClick={handleDeactivate}
                className="text-amber-400 hover:underline font-medium cursor-pointer"
              >
                Usar em outro computador
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#181c21] border border-[#21252b] text-sm text-[#92978F] leading-relaxed space-y-1">
            <span className="font-medium text-[#F5F5F0] block">Ativação por Computador:</span>
            <p className="text-xs text-[#92978F] font-normal">
              Insira o código de licença que você recebeu por e-mail após a compra na Hotmart ou Kiwify. Este código vale para 1 computador só.
            </p>
          </div>
        )}

        {/* Formulário de Ativação */}
        <form onSubmit={handleActivate} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#F5F5F0] block mb-1.5">
              Código de Licença
            </label>
            <input
              type="text"
              placeholder="Ex: CG-7214-7D1E-5AF2"
              value={licenseKeyInput}
              onChange={e => setLicenseKeyInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#21252b] text-sm text-[#F5F5F0] bg-[#111315] focus:outline-none focus:border-[#C5F955] font-mono uppercase tracking-wider"
              required
            />
          </div>

          {/* Seleção do Tipo de Plano (Para simulação ou cadastro de cliente) */}
          <div>
            <label className="text-xs font-medium text-[#92978F] uppercase tracking-wider block mb-1.5">
              Tipo de Assinatura:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'mensal', label: 'Mensal', price: 'R$ 97/mês' },
                { id: 'anual', label: 'Anual', price: 'R$ 497/ano' },
                { id: 'vitalicio', label: 'Vitalício', price: 'R$ 997 único' }
              ].map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer text-center transition-all ${
                    selectedPlan === p.id
                      ? 'border-[#C5F955] bg-[#C5F955]/15 ring-1 ring-[#C5F955] text-[#F5F5F0]'
                      : 'border-[#21252b] hover:border-[#2f353d] bg-[#111315] text-[#92978F]'
                  }`}
                >
                  <span className="text-xs font-medium block">{p.label}</span>
                  <span className="text-[10px] text-[#92978F] mt-0.5 block">{p.price}</span>
                </div>
              ))}
            </div>
          </div>

          {statusMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMsg.type === 'success' ? 'bg-[#C5F955]/15 text-[#C5F955] border border-[#C5F955]/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-[#C5F955]" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#21252b]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-[#92978F] hover:text-[#F5F5F0] cursor-pointer font-medium"
            >
              Fechar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl bg-[#C5F955] hover:bg-[#b8ea44] text-[#111315] font-medium text-sm cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isProcessing ? 'Verificando...' : 'Ativar neste Computador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
