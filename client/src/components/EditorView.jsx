import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  Plus,
  Minus,
  Check,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sliders,
  Folder,
  ArrowLeft,
  Wand2,
  Sparkles,
  Download,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Layers,
  Type,
  Music2,
  FileAudio,
  Eye,
  EyeOff,
  Home,
  Repeat,
  RotateCcw,
  X,
  Search,
  User,
  Video,
  SplitSquareVertical,
  Scissors
} from 'lucide-react';

const API_BASE = 'http://localhost:3001';

const SUBTITLE_PRESETS = [
  { id: 'impacto', name: 'Impacto', preview: 'ISSO MUDA TUDO', color: '#FFE600', uppercase: true, font: 'Anton' },
  { id: 'destaque-verde', name: 'Destaque Verde', preview: 'RESULTADO REAL', color: '#C5F955', uppercase: true, font: 'Archivo Black' },
  { id: 'karaoke', name: 'Karaokê', preview: 'EU DESCOBRI O SEGREDO', activeWord: 'SEGREDO', color: '#C5F955', font: 'Archivo Black' },
  { id: 'tarja', name: 'Tarja Escura', preview: 'o segredo é a manteiga', badge: true, font: 'Poppins' },
  { id: 'pilula', name: 'Pílula Branca', preview: 'pronta em 5 minutos', pill: true, font: 'Poppins' },
  { id: 'neon', name: 'Neon Glow', preview: 'SEM FILTRO', neon: true, font: 'Bebas Neue' },
  { id: 'minimal', name: 'Minimal', preview: 'O resultado me surpreendeu', minimal: true, font: 'Poppins' },
  { id: 'comic', name: 'Comic Pop', preview: 'OLHA ISSO AQUI!', comic: true, font: 'Bangers' },
  { id: 'caixa', name: 'Palavra em Caixa', preview: 'O INTESTINO FERMENTANDO', boxWord: 'FERMENTANDO', font: 'Archivo Black' },
  { id: 'sublinhado', name: 'Sublinhado', preview: 'resultado em 7 dias', underline: true, font: 'Poppins' },
  { id: 'documentario', name: 'Documentário', preview: 'o corpo responde em dias', serif: true, font: 'PT Serif' },
  { id: 'maquina', name: 'Máquina de Escrever', preview: 'o que ninguém te conta_', mono: true, font: 'Courier Prime' },
  { id: 'foco', name: 'Foco', preview: 'déficit', focusPill: true, font: 'Poppins' },
  { id: 'manchete', name: 'Manchete', preview: 'O CORPO RESPONDE', giantWord: 'RESPONDE', font: 'Alfa Slab One' },
  { id: 'sombra-dura', name: 'Sombra Dura', preview: 'ANTES E DEPOIS', shadowDura: true, font: 'Alfa Slab One' },
  { id: 'bloco', name: 'Bloco', preview: 'NA SMASH PONG', pinkBlock: true, font: 'Archivo Black' },
  { id: 'palavra', name: 'Uma Palavra', preview: 'paraguai', italicWord: true, font: 'Poppins' }
];

const HEADLINE_FONTS = [
  { id: 'Anton', name: 'ANTON' },
  { id: 'Archivo Black', name: 'ARCHIVO BLACK' },
  { id: 'Poppins', name: 'Poppins' },
  { id: 'Bebas Neue', name: 'BEBAS NEUE' },
  { id: 'Fjalla One', name: 'Fjalla One' },
  { id: 'Lato', name: 'Lato' },
  { id: 'Alfa Slab One', name: 'Alfa Slab' },
  { id: 'PT Serif', name: 'Serifada' },
  { id: 'Bangers', name: 'BANGERS' },
  { id: 'Courier Prime', name: 'Máquina' }
];

const HEADLINE_BG_COLORS = [
  '#dc2626', // Red
  '#f59e0b', // Gold / Yellow
  '#ea580c', // Orange
  '#16a34a', // Green
  '#2563eb', // Blue
  '#181b20', // Dark Charcoal
  '#ffffff'  // White
];

const TRANSITIONS_GRID = [
  { id: 'corte_seco', label: 'Corte seco' },
  { id: 'fade', label: 'Fade' },
  { id: 'flash_branco', label: 'Flash branco' },
  { id: 'zoom_punch', label: 'Zoom punch' },
  { id: 'whip_lateral', label: 'Whip lateral' },
  { id: 'blur', label: 'Blur' },
  { id: 'glitch', label: 'Glitch' },
  { id: 'glare', label: 'Glare' }
];

// Mapeamento idêntico ao VibeCut: cada transição tem seu som nativo padrão (ou sem som)
const TRANSITION_DEFAULT_SOUNDS = {
  corte_seco: { id: 'sem_som', label: 'Sem som' },
  fade: { id: 'sem_som', label: 'Sem som' },
  flash_branco: { id: 'flash_branco', label: 'Flash branco' },
  zoom_punch: { id: 'zoom_punch', label: 'Zoom punch' },
  whip_lateral: { id: 'whip', label: 'Whip' },
  blur: { id: 'blur', label: 'Blur' },
  glitch: { id: 'glitch', label: 'Glitch' },
  glare: { id: 'glitch', label: 'Glare' },
  flare: { id: 'glitch', label: 'Glare' }
};

// Aliases para compatibilidade retroativa
const TRANSITION_DEFAULT_SOUND = {
  corte_seco: 'sem_som',
  fade: 'sem_som',
  flash_branco: 'flash_branco',
  zoom_punch: 'zoom_punch',
  whip_lateral: 'whip',
  blur: 'blur',
  glitch: 'glitch',
  glare: 'glitch',
  flare: 'glitch'
};

// Lista de opções de som do VibeCut (Imagem 2)
const SOUND_OPTIONS_LIST = [
  { id: 'sem_som', label: 'Sem som' },
  { id: 'whip', label: 'Whip' },
  { id: 'flash_branco', label: 'Flash branco' },
  { id: 'blur', label: 'Blur' },
  { id: 'zoom_punch', label: 'Zoom punch' },
  { id: 'glitch', label: 'Glitch' }
];

const SOUND_AUDIO_FILES = {
  zoom_punch: '/storage/transitions/zoom-punch.mp3',
  flash_branco: '/storage/transitions/whiteflash.mp3',
  whip: '/storage/transitions/whip.mp3',
  blur: '/storage/transitions/blur.mp3',
  glitch: '/storage/transitions/glitch.mp3',
  glare: '/storage/transitions/glitch.mp3'
};

const TRANSITION_SOUNDS = [
  { id: 'padrao', label: 'Padrão' },
  { id: 'sem_som', label: 'Sem som' },
  { id: 'whip', label: 'Whip' },
  { id: 'flash_branco', label: 'Flash branco' },
  { id: 'blur', label: 'Blur' },
  { id: 'zoom_punch', label: 'Zoom punch' },
  { id: 'glitch', label: 'Glitch' }
];

// Gerador PCM WAV puro em memória para reprodução 100% instantânea e livre de bloqueios de áudio
function generatePcmWav(fn, duration = 0.28, sampleRate = 22050) {
  try {
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const setStr = (offset, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    setStr(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    setStr(8, 'WAVE');
    setStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    setStr(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const s = Math.max(-1, Math.min(1, fn(t, duration, i)));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }

    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return 'data:audio/wav;base64,' + btoa(binary);
  } catch (err) {
    return null;
  }
}

// Pre-renderização imediata de 10 perfis acústicos radicais e inconfundíveis em Data URI
const SOUND_DATA_URIS = {};
if (typeof window !== 'undefined') {
  try {
    // 1. Flash Fotográfico: Shutter mecânico duplo (click + clack) + chiado estroboscópico de descarga
    SOUND_DATA_URIS['camera_flash'] = generatePcmWav((t) => {
      const click = t < 0.02 ? (Math.random() * 2 - 1) * Math.exp(-t * 200) * 1.8 : 0;
      const clack = (t > 0.035 && t < 0.065) ? (Math.random() * 2 - 1) * Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-(t - 0.035) * 140) * 1.2 : 0;
      const sizzle = t > 0.015 ? (Math.random() * 2 - 1) * Math.sin(2 * Math.PI * 3400 * t) * Math.exp(-t * 14) * 0.7 : 0;
      return click + clack + sizzle;
    }, 0.32);

    // 2. Impacto Sub (Zoom Punch): Transiente soco 808 + sub-grave pesado descendo para 42Hz
    SOUND_DATA_URIS['impact_sub'] = generatePcmWav((t) => {
      const punch = t < 0.025 ? (Math.random() * 2 - 1) * Math.exp(-t * 120) * 1.6 : 0;
      const freq = 180 * Math.exp(-t * 9) + 42;
      const sub = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 7);
      const warmHarmonic = Math.sin(2 * Math.PI * (freq * 2) * t) * 0.35 * Math.exp(-t * 8);
      return punch * 0.5 + sub * 1.35 + warmHarmonic;
    }, 0.38);

    // 3. Whip Snap (Chicote Seco): Voo rápido de ar seguido por estalo abrasivo violento
    SOUND_DATA_URIS['whip_snap'] = generatePcmWav((t) => {
      const air = t < 0.04 ? (Math.random() * 2 - 1) * Math.pow(t / 0.04, 2) * 0.45 : 0;
      const dt = t - 0.04;
      const crack = (dt >= 0 && dt < 0.02) ? (Math.random() * 2 - 1) * Math.exp(-dt * 350) * 2.3 : 0;
      const tail = dt >= 0 ? Math.sin(2 * Math.PI * 2900 * dt) * Math.exp(-dt * 26) * 0.55 : 0;
      return air + crack + tail;
    }, 0.20);

    // 4. Brilho Óptico (Glare Shimmer): Sino harmônico ressonante de cristal com tremolo cintilante
    SOUND_DATA_URIS['optic_glare'] = generatePcmWav((t, dur) => {
      const env = Math.sin(Math.PI * (t / dur));
      const tone1 = Math.sin(2 * Math.PI * (1650 + 350 * (t / dur)) * t);
      const tone2 = Math.sin(2 * Math.PI * (2450 - 250 * (t / dur)) * t);
      const shimmer = Math.sin(2 * Math.PI * 3300 * t) * (Math.sin(2 * Math.PI * 18 * t) * 0.5 + 0.5);
      const air = (Math.random() * 2 - 1) * 0.2;
      return (tone1 * 0.4 + tone2 * 0.4 + shimmer * 0.55 + air) * env * 1.25;
    }, 0.40);

    // 5. Glitch Digital: Bitcrush quebrado com saltos rápidos de frequência em onda quadrada
    SOUND_DATA_URIS['glitch_sfx'] = generatePcmWav((t) => {
      const step = Math.floor(t * 36);
      const freqs = [2100, 360, 1800, 130, 2400, 520, 1500, 90];
      const freq = freqs[step % freqs.length];
      const sq = Math.sin(2 * Math.PI * freq * t) > 0 ? 0.75 : -0.75;
      const burst = (step % 3 === 0) ? (Math.random() * 2 - 1) * 0.6 : 0;
      return (sq + burst) * Math.exp(-t * 7);
    }, 0.26);

    // 6. Whoosh Profundo (Blur): Onda de ar sub-atmosférica com ressonância grave
    SOUND_DATA_URIS['whoosh_deep'] = generatePcmWav((t, dur) => {
      const norm = t / dur;
      const env = Math.sin(Math.PI * norm);
      const freq = 110 + 380 * Math.sin(Math.PI * norm);
      const sub = Math.sin(2 * Math.PI * freq * t) * 0.85;
      const noise = (Math.random() * 2 - 1) * 0.35;
      return (sub + noise) * env * 1.5;
    }, 0.38);

    // 7. Whoosh Rápido: Corte de vento aerodinâmico veloz
    SOUND_DATA_URIS['whoosh_fast'] = generatePcmWav((t, dur) => {
      const norm = t / dur;
      const env = Math.sin(Math.PI * Math.pow(norm, 0.75));
      const freq = 450 + 2600 * Math.sin(Math.PI * norm);
      const noise = (Math.random() * 2 - 1) * 0.8;
      const tone = Math.sin(2 * Math.PI * freq * t) * 0.2;
      return (noise + tone) * env * 1.6;
    }, 0.22);

    // 8. Swoosh Cinematográfico (Fade): Transição suave e elegante sem estridência
    SOUND_DATA_URIS['swoosh'] = generatePcmWav((t, dur) => {
      const norm = t / dur;
      const env = Math.sin(Math.PI * norm);
      const noise = (Math.random() * 2 - 1) * env * 1.35;
      const tone = Math.sin(2 * Math.PI * (350 + 600 * norm) * t) * env * 0.3;
      return noise + tone;
    }, 0.36);

    // 9. Pop Moderno: Bubble pop agudo
    SOUND_DATA_URIS['pop'] = generatePcmWav((t) => {
      const freq = 850 * Math.exp(-t * 26) + 120;
      return Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 32) * 1.8;
    }, 0.12);

    // 10. Riser Impacto: Subida de tensão com corte seco
    SOUND_DATA_URIS['riser'] = generatePcmWav((t, dur) => {
      const norm = t / dur;
      const freq = 120 + 850 * Math.pow(norm, 1.8);
      const saw = (2 * ((freq * t) % 1)) - 1;
      return saw * Math.pow(norm, 0.75) * 1.1;
    }, 0.38);
  } catch (e) {}
}

let _audioCtx = null;
const _soundBuffers = {};

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!_audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      _audioCtx = new AudioContextClass();
    }
  }
  if (_audioCtx && _audioCtx.state === 'suspended') {
    _audioCtx.resume().catch(() => {});
  }
  return _audioCtx;
}

// Inicializa buffers Web Audio com latência zero
function initSoundBuffers(ctx) {
  if (!ctx || Object.keys(_soundBuffers).length > 0) return;
  const sampleRate = ctx.sampleRate || 44100;

  const createBuf = (duration, gen) => {
    const numSamples = Math.floor(sampleRate * duration);
    const buf = ctx.createBuffer(1, numSamples, sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      data[i] = Math.max(-1, Math.min(1, gen(t, duration, i)));
    }
    return buf;
  };

  try {
    _soundBuffers['camera_flash'] = createBuf(0.32, (t) => {
      const click = t < 0.02 ? (Math.random() * 2 - 1) * Math.exp(-t * 200) * 1.8 : 0;
      const clack = (t > 0.035 && t < 0.065) ? (Math.random() * 2 - 1) * Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-(t - 0.035) * 140) * 1.2 : 0;
      const sizzle = t > 0.015 ? (Math.random() * 2 - 1) * Math.sin(2 * Math.PI * 3400 * t) * Math.exp(-t * 14) * 0.7 : 0;
      return click + clack + sizzle;
    });

    _soundBuffers['impact_sub'] = createBuf(0.38, (t) => {
      const punch = t < 0.025 ? (Math.random() * 2 - 1) * Math.exp(-t * 120) * 1.6 : 0;
      const freq = 180 * Math.exp(-t * 9) + 42;
      const sub = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 7);
      const warmHarmonic = Math.sin(2 * Math.PI * (freq * 2) * t) * 0.35 * Math.exp(-t * 8);
      return punch * 0.5 + sub * 1.35 + warmHarmonic;
    });

    _soundBuffers['whip_snap'] = createBuf(0.20, (t) => {
      const air = t < 0.04 ? (Math.random() * 2 - 1) * Math.pow(t / 0.04, 2) * 0.45 : 0;
      const dt = t - 0.04;
      const crack = (dt >= 0 && dt < 0.02) ? (Math.random() * 2 - 1) * Math.exp(-dt * 350) * 2.3 : 0;
      const tail = dt >= 0 ? Math.sin(2 * Math.PI * 2900 * dt) * Math.exp(-dt * 26) * 0.55 : 0;
      return air + crack + tail;
    });

    _soundBuffers['optic_glare'] = createBuf(0.40, (t, dur) => {
      const env = Math.sin(Math.PI * (t / dur));
      const tone1 = Math.sin(2 * Math.PI * (1650 + 350 * (t / dur)) * t);
      const tone2 = Math.sin(2 * Math.PI * (2450 - 250 * (t / dur)) * t);
      const shimmer = Math.sin(2 * Math.PI * 3300 * t) * (Math.sin(2 * Math.PI * 18 * t) * 0.5 + 0.5);
      const air = (Math.random() * 2 - 1) * 0.2;
      return (tone1 * 0.4 + tone2 * 0.4 + shimmer * 0.55 + air) * env * 1.25;
    });

    _soundBuffers['glitch_sfx'] = createBuf(0.26, (t) => {
      const step = Math.floor(t * 36);
      const freqs = [2100, 360, 1800, 130, 2400, 520, 1500, 90];
      const freq = freqs[step % freqs.length];
      const sq = Math.sin(2 * Math.PI * freq * t) > 0 ? 0.75 : -0.75;
      const burst = (step % 3 === 0) ? (Math.random() * 2 - 1) * 0.6 : 0;
      return (sq + burst) * Math.exp(-t * 7);
    });

    _soundBuffers['whoosh_deep'] = createBuf(0.38, (t, dur) => {
      const norm = t / dur;
      const env = Math.sin(Math.PI * norm);
      const freq = 110 + 380 * Math.sin(Math.PI * norm);
      const sub = Math.sin(2 * Math.PI * freq * t) * 0.85;
      const noise = (Math.random() * 2 - 1) * 0.35;
      return (sub + noise) * env * 1.5;
    });

    _soundBuffers['whoosh_fast'] = createBuf(0.22, (t, dur) => {
      const norm = t / dur;
      const env = Math.sin(Math.PI * Math.pow(norm, 0.75));
      const freq = 450 + 2600 * Math.sin(Math.PI * norm);
      const noise = (Math.random() * 2 - 1) * 0.8;
      const tone = Math.sin(2 * Math.PI * freq * t) * 0.2;
      return (noise + tone) * env * 1.6;
    });

    _soundBuffers['swoosh'] = createBuf(0.36, (t, dur) => {
      const norm = t / dur;
      const env = Math.sin(Math.PI * norm);
      const noise = (Math.random() * 2 - 1) * env * 1.35;
      const tone = Math.sin(2 * Math.PI * (350 + 600 * norm) * t) * env * 0.3;
      return noise + tone;
    });

    _soundBuffers['pop'] = createBuf(0.12, (t) => {
      const freq = 850 * Math.exp(-t * 26) + 120;
      return Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 32) * 1.8;
    });

    _soundBuffers['riser'] = createBuf(0.38, (t, dur) => {
      const norm = t / dur;
      const freq = 120 + 850 * Math.pow(norm, 1.8);
      const saw = (2 * ((freq * t) % 1)) - 1;
      return saw * Math.pow(norm, 0.75) * 1.1;
    });
  } catch (e) {}
}

function playFallbackPcm(cleanId, safeVol = 0.8) {
  let pcmId = cleanId;
  if (pcmId === 'zoom_punch') pcmId = 'impact_sub';
  if (pcmId === 'flash_branco') pcmId = 'camera_flash';
  if (pcmId === 'whip') pcmId = 'whip_snap';
  if (pcmId === 'blur') pcmId = 'whoosh_deep';
  if (pcmId === 'glitch') pcmId = 'glitch_sfx';

  const ctx = getAudioContext();
  if (ctx) {
    if (Object.keys(_soundBuffers).length === 0) {
      initSoundBuffers(ctx);
    }
    const buf = _soundBuffers[pcmId];
    if (buf) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = buf;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(safeVol, ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
        return;
      } catch (e) {}
    }
  }

  try {
    const dataUri = SOUND_DATA_URIS[pcmId];
    if (dataUri) {
      const audio = new Audio(dataUri);
      audio.volume = safeVol;
      audio.play().catch(() => {});
    }
  } catch (err) {}
}

function playTransitionSound(soundId, volume = 0.8, transType = 'zoom_punch') {
  if (volume <= 0) return;

  let target = soundId || 'padrao';
  if (target === 'padrao') {
    const def = TRANSITION_DEFAULT_SOUNDS[transType] || { id: 'sem_som' };
    target = def.id;
  }

  // Normaliza aliases e valores antigos
  if (target === 'impact_sub') target = 'zoom_punch';
  if (target === 'camera_flash') target = 'flash_branco';
  if (target === 'whip_snap' || target === 'whip_lateral') target = 'whip';
  if (target === 'whoosh_deep') target = 'blur';
  if (target === 'glitch_sfx' || target === 'optic_glare' || target === 'glare') target = 'glitch';

  if (!target || target === 'sem_som' || target === 'padrao') return;

  const safeVol = Math.max(0.01, Math.min(1.0, volume > 1 ? volume / 100 : volume));

  // 1. Tentar áudio MP3 de /storage/transitions
  const mp3Url = SOUND_AUDIO_FILES[target];
  if (mp3Url) {
    try {
      const audio = new Audio(mp3Url);
      audio.volume = safeVol;
      const p = audio.play();
      if (p !== undefined) {
        p.catch(() => {
          playFallbackPcm(target, safeVol);
        });
      }
      return;
    } catch (e) {
      playFallbackPcm(target, safeVol);
      return;
    }
  }

  playFallbackPcm(target, safeVol);
}

export default function EditorView({
  project,
  categories = [],
  onBackToCreate,
  onRenderSuccess,
  currentTheme = 'lime'
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(project.durationSec || 20);
  const [isMuted, setIsMuted] = useState(false);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [activeTransitionVisual, setActiveTransitionVisual] = useState(null);
  const transitionTimerRef = useRef(null);

  const triggerTransitionPreview = (type, sound, volume) => {
    let cleanType = type || 'corte_seco';
    if (cleanType === 'flare') cleanType = 'glare';

    if (soundEffectsEnabled) {
      playTransitionSound(sound, volume ?? 35, cleanType);
    }

    if (cleanType && cleanType !== 'corte_seco') {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      // Objeto único com ID força o React a recriar o nó DOM e disparar animações CSS
      setActiveTransitionVisual({
        id: Date.now() + Math.random(),
        type: cleanType
      });
      transitionTimerRef.current = setTimeout(() => {
        setActiveTransitionVisual(null);
      }, 520);
    }
  };

  // Scene Segments State with normalized transitions & distinct sounds
  const [segments, setSegments] = useState(() => {
    const raw = project.broll_segments && project.broll_segments.length > 0
      ? project.broll_segments
      : [
          {
            id: 'seg_1',
            index: 1,
            start: 0,
            end: 3.5,
            duration: 3.5,
            displayMode: 'dividida',
            avatarPosition: 'embaixo',
            maskType: 'suave',
            degrade: 15,
            maskHeight: 50,
            broll: { filename: 'broll_1.mp4', category: 'geral', url: '' },
            brollOffset: 0,
            brollSpeed: 1.0,
            brollZoom: 1.0,
            brollFrameX: 0,
            brollFrameY: 0,
            zoom: 'sem_efeito',
            transition: { type: 'zoom_punch', direction: 'esquerda', sound: 'impact_sub', volume: 80 },
            texture: { grain: false, flash: false },
            subtitlePosition: 'automatica',
            label: 'Cena 1 (Hook): Tela Dividida'
          }
        ];

    return raw.map((s, idx) => {
      let tType = s.transition?.type || s.transitionType || (idx === 0 ? 'corte_seco' : 'zoom_punch');
      if (tType === 'flare') tType = 'glare';
      let tSound = s.transition?.sound || s.transitionSound;
      if (!tSound || tSound === 'whip') {
        tSound = TRANSITION_DEFAULT_SOUND[tType] || 'padrao';
      } else if (tSound === 'flare' || tSound === 'glare') {
        tSound = 'optic_glare';
      } else if (tSound === 'punch') {
        tSound = 'impact_sub';
      }
      return {
        ...s,
        transition: {
          type: tType,
          sound: tSound,
          volume: s.transition?.volume ?? s.transitionVolume ?? 80
        }
      };
    });
  });
  const [selectedSegIndex, setSelectedSegIndex] = useState(0);
  const [inspectorTab, setInspectorTab] = useState('scene'); // 'scene' | 'global'

  // Scene Loop Mode
  const [isSceneLoopMode, setIsSceneLoopMode] = useState(false);

  // Global Settings State
  const [globalFormat, setGlobalFormat] = useState(project.format || '9:16');
  const [enableSubtitles, setEnableSubtitles] = useState(true);
  const [globalSubtitleStyle, setGlobalSubtitleStyle] = useState(project.subtitleStyle || 'impacto');
  const [subtitlesPositionGlobal, setSubtitlesPositionGlobal] = useState('automatica');
  const [highlightColor, setHighlightColor] = useState(project.highlightColor || '#C5F955');
  const [fontScale, setFontScale] = useState(project.fontScale || 95);
  const [avatarSpeed, setAvatarSpeed] = useState(1.0);
  const [avatarFraming, setAvatarFraming] = useState({
    splitBoxTop: 0,
    frameTime: 0,
    zoom: 1.0,
    applyToFullScenes: false
  });
  const [isRePlanning, setIsRePlanning] = useState(false);
  const [isGeneratingHeadline, setIsGeneratingHeadline] = useState(false);
  const [isSoundDropdownOpen, setIsSoundDropdownOpen] = useState(false);
  const soundDropdownRef = useRef(null);
  const [syncAllVolumeOnDrag, setSyncAllVolumeOnDrag] = useState(false);
  const [soundFeedbackMsg, setSoundFeedbackMsg] = useState('');

  useEffect(() => {
    function handleClickOutside(event) {
      if (soundDropdownRef.current && !soundDropdownRef.current.contains(event.target)) {
        setIsSoundDropdownOpen(false);
      }
    }
    if (isSoundDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSoundDropdownOpen]);

  // Headline State with interactive position & sizing
  const [headline, setHeadline] = useState(
    project.headline || {
      text: '',
      bgColor: '#dc2626',
      textColor: '#ffffff',
      fontSize: 13,
      fontFamily: 'Anton',
      positionY: 48,
      width: 90,
      visible: true,
      highlightMode: 'bloco',
      durationSec: 2.0
    }
  );
  const [isHeadlineSelected, setIsHeadlineSelected] = useState(false);
  const [isEditingHeadlineInline, setIsEditingHeadlineInline] = useState(false);
  const previewPlayerRef = useRef(null);
  const isDraggingHeadlineRef = useRef(false);

  // Background Music State
  const [musicVolume, setMusicVolume] = useState(0.2);
  const [musicFile, setMusicFile] = useState(project.music || null);

  // UI Feedback States
  const [sceneSaveFeedback, setSceneSaveFeedback] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState('');
  const [renderedResult, setRenderedResult] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [projectTitle, setProjectTitle] = useState(project.title || 'Anúncio sem título');

  // B-Roll Library Modal State
  const [isBrollModalOpen, setIsBrollModalOpen] = useState(false);
  const [brollSearchQuery, setBrollSearchQuery] = useState('');
  const [selectedBrollCategory, setSelectedBrollCategory] = useState('all');

  // History stack for Undo / Redo
  const [history, setHistory] = useState([
    {
      segments: project.broll_segments || [],
      headline: project.headline,
      globalSubtitleStyle: project.subtitleStyle || 'impacto',
      highlightColor: project.highlightColor || '#C5F955'
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Video Refs: PERSISTENT SINGLE VIDEOS
  const videoRef = useRef(null);
  const brollVideoRef = useRef(null);
  const trimVideoRef = useRef(null);
  const avatarPreviewVideoRef = useRef(null);
  const timelineScrollRef = useRef(null);
  const avatarFramingBoxRef = useRef(null);
  const brollFramingBoxRef = useRef(null);
  const cutoutCanvasRef = useRef(null);
  const selfieSegRef = useRef(null);
  const isSegBusyRef = useRef(false);
  const segAnimFrameRef = useRef(null);
  const [isSegLoading, setIsSegLoading] = useState(false);

  const activeSegment = segments[selectedSegIndex] || segments[0];

  // Helper refs for persistent video event listeners
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;
  const selectedSegIndexRef = useRef(selectedSegIndex);
  selectedSegIndexRef.current = selectedSegIndex;
  const isSceneLoopModeRef = useRef(isSceneLoopMode);
  isSceneLoopModeRef.current = isSceneLoopMode;

  // Sync trim video preview whenever activeSegment broll or offset changes
  useEffect(() => {
    if (trimVideoRef.current && activeSegment?.broll?.url) {
      trimVideoRef.current.currentTime = activeSegment?.brollOffset || 0;
    }
  }, [activeSegment?.brollOffset, activeSegment?.broll?.url]);

  // Sync avatar preview video frame timestamp
  useEffect(() => {
    if (avatarPreviewVideoRef.current) {
      avatarPreviewVideoRef.current.currentTime = avatarFraming.frameTime || 0;
    }
  }, [avatarFraming.frameTime, project.baseVideo?.url]);

  // Auto-scroll timeline to keep active scene card centered and visible
  useEffect(() => {
    if (timelineScrollRef.current) {
      const container = timelineScrollRef.current;
      const cardEl = container.children[selectedSegIndex];
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedSegIndex]);

  // State & drag handler for boundary trimming directly on the timeline track
  const [resizingBoundaryIndex, setResizingBoundaryIndex] = useState(null);
  const resizeStartXRef = useRef(0);
  const resizeOriginalDurationRef = useRef({ prevDur: 0, nextDur: 0 });

  const handleBoundaryMouseDown = (idx, e) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingBoundaryIndex(idx);
    resizeStartXRef.current = e.clientX;
    const curSeg = segments[idx];
    const nextSeg = segments[idx + 1];
    if (!curSeg || !nextSeg) return;
    resizeOriginalDurationRef.current = {
      prevDur: curSeg.duration || (curSeg.end - curSeg.start),
      nextDur: nextSeg.duration || (nextSeg.end - nextSeg.start)
    };

    const handleMouseMove = (moveEvent) => {
      const deltaPx = moveEvent.clientX - resizeStartXRef.current;
      const barEl = document.querySelector('[data-timeline-track]');
      const barWidth = barEl?.getBoundingClientRect().width || 1000;
      const totalDur = duration || 30;
      const deltaSec = parseFloat(((deltaPx / barWidth) * totalDur).toFixed(2));

      const { prevDur, nextDur } = resizeOriginalDurationRef.current;
      const newPrev = Math.max(0.5, prevDur + deltaSec);
      const newNext = Math.max(0.5, nextDur - deltaSec);
      if (newPrev >= 0.5 && newNext >= 0.5) {
        setSegments(prev => {
          const updated = prev.map(s => ({ ...s }));
          updated[idx].duration = parseFloat(newPrev.toFixed(2));
          updated[idx].end = parseFloat((updated[idx].start + newPrev).toFixed(2));
          updated[idx + 1].start = updated[idx].end;
          updated[idx + 1].duration = parseFloat(newNext.toFixed(2));
          return updated;
        });
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setResizingBoundaryIndex(null);
      pushState();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Drag handler for headline vertical positioning
  const handleHeadlineMouseDown = (e) => {
    e.stopPropagation();
    setIsHeadlineSelected(true);
    isDraggingHeadlineRef.current = true;

    const startY = e.clientY;
    const startPosY = headline.positionY || 48;
    const playerRect = previewPlayerRef.current?.getBoundingClientRect();
    if (!playerRect) return;

    const handleMouseMove = (moveEvent) => {
      if (!isDraggingHeadlineRef.current) return;
      const deltaY = moveEvent.clientY - startY;
      const deltaPercent = (deltaY / playerRect.height) * 100;
      const newPos = Math.max(8, Math.min(88, Math.round(startPosY + deltaPercent)));
      setHeadline(prev => ({ ...prev, positionY: newPos }));
    };

    const handleMouseUp = () => {
      isDraggingHeadlineRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Drag handler for Avatar Framing Box ("janela do split")
  const handleAvatarBoxMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startTop = avatarFraming.splitBoxTop !== undefined ? avatarFraming.splitBoxTop : 0;
    const container = avatarFramingBoxRef.current;
    if (!container) return;
    const containerH = container.clientHeight;
    const maxTravelPx = containerH * 0.5;

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaPercent = (deltaY / (maxTravelPx || 1)) * 50;
      const newTop = Math.max(0, Math.min(50, Math.round(startTop + deltaPercent)));
      setAvatarFraming(prev => ({ ...prev, splitBoxTop: newTop }));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // B-Roll Zoom and Framing calculations
  const brollZoomVal = activeSegment?.brollZoom || 1.0;
  const isBrollZoomed = brollZoomVal > 1.01;
  const brollBoxWidthPct = isBrollZoomed ? Math.max(25, Math.min(100, Math.round(100 / brollZoomVal))) : 100;
  const brollBoxHeightPct = isBrollZoomed ? Math.max(25, Math.min(100, Math.round(100 / brollZoomVal))) : 100;
  const brollMaxTravelXPct = 100 - brollBoxWidthPct;
  const brollMaxTravelYPct = 100 - brollBoxHeightPct;

  const brollLeftPercent = isBrollZoomed
    ? Math.max(0, Math.min(brollMaxTravelXPct, (brollMaxTravelXPct / 2) + (activeSegment?.brollFrameX || 0) * (brollMaxTravelXPct / 2)))
    : 0;

  const brollTopPercent = isBrollZoomed
    ? Math.max(0, Math.min(brollMaxTravelYPct, (brollMaxTravelYPct / 2) + (activeSegment?.brollFrameY || 0) * (brollMaxTravelYPct / 2)))
    : 0;

  // Drag handler for B-Roll Framing Box ("janela da cena") - active only when zoomed
  const handleBrollBoxMouseDown = (e) => {
    if (!isBrollZoomed) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startFrameX = activeSegment?.brollFrameX || 0;
    const startFrameY = activeSegment?.brollFrameY || 0;
    const container = brollFramingBoxRef.current;
    if (!container) return;
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    const travelRangeX = (containerW * (brollMaxTravelXPct / 100)) / 2 || 1;
    const travelRangeY = (containerH * (brollMaxTravelYPct / 100)) / 2 || 1;

    const handleMouseMove = (moveEvt) => {
      const deltaX = moveEvt.clientX - startX;
      const deltaY = moveEvt.clientY - startY;
      const deltaFrameX = deltaX / travelRangeX;
      const deltaFrameY = deltaY / travelRangeY;
      const newFrameX = Math.max(-1.0, Math.min(1.0, parseFloat((startFrameX + deltaFrameX).toFixed(2))));
      const newFrameY = Math.max(-1.0, Math.min(1.0, parseFloat((startFrameY + deltaFrameY).toFixed(2))));
      updateActiveSegment({ brollFrameX: newFrameX, brollFrameY: newFrameY });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Helper to push history state for Undo/Redo
  const pushState = (newSegments, newHeadline, newSubStyle, newColor) => {
    const currentState = {
      segments: newSegments ? JSON.parse(JSON.stringify(newSegments)) : JSON.parse(JSON.stringify(segments)),
      headline: newHeadline ? { ...newHeadline } : { ...headline },
      globalSubtitleStyle: newSubStyle || globalSubtitleStyle,
      highlightColor: newColor || highlightColor
    };
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(currentState);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setSegments(JSON.parse(JSON.stringify(prev.segments)));
      if (prev.headline) setHeadline({ ...prev.headline });
      if (prev.globalSubtitleStyle) setGlobalSubtitleStyle(prev.globalSubtitleStyle);
      if (prev.highlightColor) setHighlightColor(prev.highlightColor);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setSegments(JSON.parse(JSON.stringify(next.segments)));
      if (next.headline) setHeadline({ ...next.headline });
      if (next.globalSubtitleStyle) setGlobalSubtitleStyle(next.globalSubtitleStyle);
      if (next.highlightColor) setHighlightColor(next.highlightColor);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Keyboard shortcut listener (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Current Scene Display Mode: 'talking-head', 'broll-full', 'split-screen', 'avatar-overlay'
  const currentMode =
    activeSegment?.displayMode === 'dividida' || activeSegment?.type === 'split-screen'
      ? 'split-screen'
      : activeSegment?.displayMode === 'broll' || activeSegment?.type === 'broll-full'
      ? 'broll-full'
      : activeSegment?.displayMode === 'recorte' || activeSegment?.type === 'avatar-overlay'
      ? 'avatar-overlay'
      : 'talking-head';

  // Master Video Synchronization (STABLE - ATTACHES ONCE)
  useEffect(() => {
    const master = videoRef.current;
    if (!master) return;

    const handlePlay = () => {
      setIsPlaying(true);
      if (brollVideoRef.current) {
        brollVideoRef.current.play().catch(() => {});
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (brollVideoRef.current) {
        brollVideoRef.current.pause();
      }
    };

    const handleTimeUpdate = () => {
      const t = master.currentTime;
      setCurrentTime(t);

      const curSegs = segmentsRef.current;
      const curIdx = selectedSegIndexRef.current;
      const curSeg = curSegs[curIdx] || curSegs[0];

      // Loop within current scene if isSceneLoopMode is active
      if (isSceneLoopModeRef.current && curSeg) {
        if (t >= (curSeg.end - 0.08)) {
          master.currentTime = curSeg.start;
          setCurrentTime(curSeg.start);
          return;
        }
      }

      // Auto-detect active scene from currentTime
      const sceneIdx = curSegs.findIndex(s => t >= s.start && t < s.end);
      if (sceneIdx !== -1 && sceneIdx !== selectedSegIndexRef.current) {
        selectedSegIndexRef.current = sceneIdx;
        setSelectedSegIndex(sceneIdx);
        // On scene change: smoothly transition B-roll
        const nextSeg = curSegs[sceneIdx];
        if (brollVideoRef.current && nextSeg?.broll?.url) {
          const speed = nextSeg.brollSpeed || 1.0;
          const offset = nextSeg.brollOffset || 0;
          brollVideoRef.current.playbackRate = speed;
          brollVideoRef.current.currentTime = offset;
          if (!master.paused) {
            brollVideoRef.current.play().catch(() => {});
          }
        }
        // Play transition sound and visual effect if scene > 0
        if (sceneIdx > 0 && nextSeg) {
          const transType = nextSeg.transition?.type || nextSeg.transitionType || 'corte_seco';
          const defaultSound = TRANSITION_DEFAULT_SOUND[transType] || 'padrao';
          const transSound = nextSeg.transition?.sound || nextSeg.transitionSound || defaultSound;
          const transVol = nextSeg.transition?.volume ?? nextSeg.transitionVolume ?? 80;
          triggerTransitionPreview(transType, transSound, transVol);
        }
      } else if (brollVideoRef.current && curSeg?.broll?.url) {
        // Playing inside same scene: keep speed aligned and ensure it's playing
        const speed = curSeg.brollSpeed || 1.0;
        if (brollVideoRef.current.playbackRate !== speed) {
          brollVideoRef.current.playbackRate = speed;
        }
        if (!master.paused && brollVideoRef.current.paused) {
          brollVideoRef.current.play().catch(() => {});
        }
        // Only resync if catastrophic drift (> 1.5s) to avoid constant decoder seeking/stutter
        const segStart = curSeg.start || 0;
        const brollDuration = brollVideoRef.current.duration || 10;
        const offset = curSeg.brollOffset || 0;
        const segElapsed = Math.max(0, t - segStart);
        const expectedBrollTime = (offset + segElapsed * speed) % brollDuration;
        if (Math.abs(brollVideoRef.current.currentTime - expectedBrollTime) > 1.5) {
          brollVideoRef.current.currentTime = expectedBrollTime;
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (brollVideoRef.current) brollVideoRef.current.pause();
    };

    master.addEventListener('play', handlePlay);
    master.addEventListener('pause', handlePause);
    master.addEventListener('timeupdate', handleTimeUpdate);
    master.addEventListener('ended', handleEnded);

    return () => {
      master.removeEventListener('play', handlePlay);
      master.removeEventListener('pause', handlePause);
      master.removeEventListener('timeupdate', handleTimeUpdate);
      master.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Update B-roll source whenever activeSegment's B-roll changes without stopping master
  useEffect(() => {
    if (!brollVideoRef.current) return;
    if (activeSegment?.broll?.url) {
      const fullUrl = `${API_BASE}${activeSegment.broll.url}`;
      if (brollVideoRef.current.src !== fullUrl) {
        brollVideoRef.current.src = fullUrl;
        brollVideoRef.current.load();
        if (isPlaying) {
          brollVideoRef.current.play().catch(() => {});
        }
      }
    }
  }, [activeSegment?.broll?.url, isPlaying]);

  // Adjust avatar video speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = avatarSpeed;
    }
  }, [avatarSpeed]);

  // Initialize MediaPipe AI Selfie Segmentation for Recorte Mode
  useEffect(() => {
    let checkInterval = null;
    const initSelfieSeg = () => {
      if (selfieSegRef.current || typeof window === 'undefined' || !window.SelfieSegmentation) return;
      try {
        setIsSegLoading(true);
        const seg = new window.SelfieSegmentation({
          locateFile: (file) => `/mediapipe/${file}`
        });
        seg.setOptions({
          modelSelection: 1, // landscape: faster, covers full body/torso accurately
          selfieMode: false
        });
        seg.onResults((results) => {
          isSegBusyRef.current = false;
          setIsSegLoading(false);
          const canvas = cutoutCanvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const w = results.image.width || 720;
          const h = results.image.height || 1280;

          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
          }

          ctx.save();
          ctx.clearRect(0, 0, w, h);

          // 1. Draw segmentation mask with soft blur for antialiasing
          ctx.filter = 'blur(1px)';
          ctx.drawImage(results.segmentationMask, 0, 0, w, h);
          ctx.filter = 'none';

          // 2. Keep only where mask exists (person outline)
          ctx.globalCompositeOperation = 'source-in';

          // 3. Draw video frame
          ctx.drawImage(results.image, 0, 0, w, h);

          ctx.restore();
        });
        selfieSegRef.current = seg;
      } catch (err) {
        console.warn('Failed to init SelfieSegmentation:', err);
        setIsSegLoading(false);
      }
    };

    if (typeof window !== 'undefined' && window.SelfieSegmentation) {
      initSelfieSeg();
    } else {
      checkInterval = setInterval(() => {
        if (typeof window !== 'undefined' && window.SelfieSegmentation) {
          clearInterval(checkInterval);
          initSelfieSeg();
        }
      }, 150);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, []);

  // Frame processing loop when in Recorte (avatar-overlay) mode
  useEffect(() => {
    if (currentMode !== 'avatar-overlay') return;

    let isAlive = true;

    const processFrame = async () => {
      if (!isAlive) return;
      const v = videoRef.current;
      const seg = selfieSegRef.current;

      if (v && seg && v.readyState >= 2 && !v.ended) {
        if (!isSegBusyRef.current) {
          isSegBusyRef.current = true;
          try {
            await seg.send({ image: v });
          } catch (e) {
            isSegBusyRef.current = false;
          }
        }
      }
      segAnimFrameRef.current = requestAnimationFrame(processFrame);
    };

    segAnimFrameRef.current = requestAnimationFrame(processFrame);

    // Initial frame on scene enter / mode switch
    const v = videoRef.current;
    const seg = selfieSegRef.current;
    if (v && seg && v.readyState >= 2 && !isSegBusyRef.current) {
      isSegBusyRef.current = true;
      seg.send({ image: v }).catch(() => {
        isSegBusyRef.current = false;
      });
    }

    return () => {
      isAlive = false;
      if (segAnimFrameRef.current) {
        cancelAnimationFrame(segAnimFrameRef.current);
      }
    };
  }, [currentMode, activeSegment?.id, selectedSegIndex]);

  // Toggle Play / Pause
  const togglePlay = () => {
    const master = videoRef.current;
    if (!master) return;

    if (isPlaying) {
      master.pause();
      if (brollVideoRef.current) brollVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      master.play().then(() => {
        setIsPlaying(true);
        if (brollVideoRef.current) brollVideoRef.current.play().catch(() => {});
      }).catch(err => {
        console.warn('Playback error:', err);
      });
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    if (brollVideoRef.current && activeSegment?.broll?.url) {
      const segStart = activeSegment.start || 0;
      const brollDuration = brollVideoRef.current.duration || 10;
      const speed = activeSegment.brollSpeed || 1.0;
      const offset = activeSegment.brollOffset || 0;
      const segElapsed = Math.max(0, time - segStart);
      brollVideoRef.current.currentTime = (offset + segElapsed * speed) % brollDuration;
    }
  };

  const jumpToScene = (idx) => {
    if (idx < 0 || idx >= segments.length) return;
    selectedSegIndexRef.current = idx;
    setSelectedSegIndex(idx);
    const targetSeg = segments[idx];
    if (videoRef.current && targetSeg) {
      videoRef.current.currentTime = targetSeg.start;
      setCurrentTime(targetSeg.start);
    }
    if (brollVideoRef.current && targetSeg?.broll?.url) {
      brollVideoRef.current.playbackRate = targetSeg.brollSpeed || 1.0;
      brollVideoRef.current.currentTime = targetSeg.brollOffset || 0;
      if (isPlaying) {
        brollVideoRef.current.play().catch(() => {});
      }
    }
    // Preview incoming transition effect if switching to scene 2+
    if (idx > 0 && targetSeg) {
      const tType = targetSeg.transition?.type || targetSeg.transitionType || 'corte_seco';
      const defaultSound = TRANSITION_DEFAULT_SOUND[tType] || 'padrao';
      const tSound = targetSeg.transition?.sound || targetSeg.transitionSound || defaultSound;
      const tVol = targetSeg.transition?.volume ?? targetSeg.transitionVolume ?? 80;
      triggerTransitionPreview(tType, tSound, tVol);
    }
  };

  const handleNextSceneOk = () => {
    if (selectedSegIndex < segments.length - 1) {
      jumpToScene(selectedSegIndex + 1);
    } else {
      handleSaveScene();
    }
  };

  // Update Active Segment attributes
  const updateActiveSegment = (updates) => {
    setSegments(prev => {
      const updated = [...prev];
      updated[selectedSegIndex] = {
        ...updated[selectedSegIndex],
        ...updates
      };
      return updated;
    });
  };

  // Save Scene Edits to Backend
  const handleSaveScene = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectTitle,
          broll_segments: segments,
          headline,
          format: globalFormat,
          subtitleStyle: globalSubtitleStyle,
          highlightColor,
          fontScale,
          music: musicFile
        })
      });
      if (res.ok) {
        setSceneSaveFeedback(true);
        setTimeout(() => setSceneSaveFeedback(false), 2000);
        pushState(segments, headline, globalSubtitleStyle, highlightColor);
      }
    } catch (e) {
      console.error('Error saving scene:', e);
    }
  };

  // Duplicate Scene
  const handleDuplicateScene = (idx, e) => {
    e.stopPropagation();
    const sourceSeg = segments[idx];
    if (!sourceSeg) return;

    const halfDur = Math.max(1.0, (sourceSeg.duration || 3.0) / 2);
    const newSeg1 = {
      ...sourceSeg,
      duration: parseFloat(halfDur.toFixed(2)),
      end: parseFloat((sourceSeg.start + halfDur).toFixed(2))
    };
    const newSeg2 = {
      ...sourceSeg,
      id: `seg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      start: parseFloat((sourceSeg.start + halfDur).toFixed(2)),
      end: sourceSeg.end,
      duration: parseFloat((sourceSeg.end - (sourceSeg.start + halfDur)).toFixed(2)),
      label: `Cena ${idx + 2} (Cópia)`
    };

    const nextSegs = [...segments];
    nextSegs.splice(idx, 1, newSeg1, newSeg2);
    setSegments(nextSegs);
    setSelectedSegIndex(idx + 1);
    pushState(nextSegs);
  };

  // Delete Scene (VibeCut style: engloba o tempo e áudio da cena na cena anterior ou próxima)
  const handleDeleteScene = (idx, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (segments.length <= 1) {
      alert('O anúncio precisa ter no mínimo 1 cena.');
      return;
    }

    const deletedSeg = segments[idx];
    const nextSegs = segments.filter((_, i) => i !== idx);

    if (idx > 0) {
      // Engloba na cena anterior (idx - 1), estendendo o fim até o fim da cena excluída
      const prev = nextSegs[idx - 1];
      prev.end = deletedSeg.end;
      prev.duration = parseFloat((prev.end - prev.start).toFixed(2));
    } else {
      // Se excluiu a primeira cena (idx === 0), a nova primeira cena começa em 0.0s
      const first = nextSegs[0];
      first.start = 0;
      first.duration = parseFloat((first.end - 0).toFixed(2));
    }

    // Re-indexa as cenas mantendo intacta a linha do tempo contínua e sincronia de fala
    const reindexed = nextSegs.map((s, i) => ({
      ...s,
      index: i + 1,
      label: s.label?.replace(/Cena \d+/, `Cena ${i + 1}`) || `Cena ${i + 1}`
    }));

    setSegments(reindexed);
    const newIdx = Math.max(0, Math.min(idx > 0 ? idx - 1 : 0, reindexed.length - 1));
    setSelectedSegIndex(newIdx);
    selectedSegIndexRef.current = newIdx;
    pushState(reindexed);
  };

  // Ajustar duração de uma cena específica (+/- segundos)
  const handleAdjustSceneDuration = (idx, deltaSeconds) => {
    const curSeg = segments[idx];
    if (!curSeg) return;
    const curDur = curSeg.duration || (curSeg.end - curSeg.start) || 3.0;
    const newDur = Math.max(0.5, parseFloat((curDur + deltaSeconds).toFixed(2)));
    if (newDur === curDur) return;

    const nextSegs = segments.map(s => ({ ...s }));
    const diff = parseFloat((newDur - curDur).toFixed(2));

    // Se existe cena seguinte, ajusta a fronteira de corte entre a cena atual e a próxima (estilo VibeCut)
    if (idx < nextSegs.length - 1) {
      const nextDur = nextSegs[idx + 1].duration || (nextSegs[idx + 1].end - nextSegs[idx + 1].start);
      if (nextDur - diff >= 0.5) {
        // Ajuste no corte mantendo o tempo total do vídeo e da fala
        nextSegs[idx].duration = newDur;
        nextSegs[idx].end = parseFloat((nextSegs[idx].start + newDur).toFixed(2));
        nextSegs[idx + 1].start = nextSegs[idx].end;
        nextSegs[idx + 1].duration = parseFloat((nextSegs[idx + 1].end - nextSegs[idx + 1].start).toFixed(2));
      } else {
        // Se a próxima ficaria menor que 0.5s, desloca as demais mantendo duração mínima
        nextSegs[idx].duration = newDur;
        nextSegs[idx].end = parseFloat((nextSegs[idx].start + newDur).toFixed(2));
        for (let j = idx + 1; j < nextSegs.length; j++) {
          const d = Math.max(0.5, nextSegs[j].duration || (nextSegs[j].end - nextSegs[j].start));
          nextSegs[j].start = nextSegs[j - 1].end;
          nextSegs[j].end = parseFloat((nextSegs[j].start + d).toFixed(2));
          nextSegs[j].duration = d;
        }
      }
    } else {
      // Última cena: ajusta o fim da cena e a duração total do vídeo
      nextSegs[idx].duration = newDur;
      nextSegs[idx].end = parseFloat((nextSegs[idx].start + newDur).toFixed(2));
    }

    const newTotalDuration = nextSegs[nextSegs.length - 1].end;
    setDuration(newTotalDuration);
    setSegments(nextSegs);
    pushState(nextSegs);
  };

  // Available B-rolls from library
  const allAvailableBrolls = useMemo(() => {
    const list = [];
    categories.forEach(c => {
      (c.files || []).forEach(f => {
        list.push({ ...f, category: c.id, categoryName: c.name || c.id });
      });
    });
    return list;
  }, [categories]);

  // Filtered B-rolls for Modal
  const filteredBrolls = useMemo(() => {
    return allAvailableBrolls.filter(b => {
      const matchesCat = selectedBrollCategory === 'all' || b.category === selectedBrollCategory;
      const matchesSearch = !brollSearchQuery || (b.filename || '').toLowerCase().includes(brollSearchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [allAvailableBrolls, selectedBrollCategory, brollSearchQuery]);

  // First 4 suggested B-rolls for quick selector
  const quickBrolls = useMemo(() => {
    return allAvailableBrolls.slice(0, 4);
  }, [allAvailableBrolls]);

  // Download video helper directly to user's computer via blob / attachment
  const handleDownloadVideo = async (url, filename) => {
    setIsDownloading(true);
    try {
      const cleanName = filename || (url ? url.split('/').pop() : 'anuncio_clipgen.mp4');
      const downloadEndpoint = `${API_BASE}/api/projects/download/${encodeURIComponent(cleanName)}`;
      
      const res = await fetch(downloadEndpoint);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 3000);
    } catch (err) {
      console.warn('Direct blob download fallback:', err);
      const cleanName = filename || (url ? url.split('/').pop() : 'anuncio_clipgen.mp4');
      window.open(`${API_BASE}/api/projects/download/${encodeURIComponent(cleanName)}`, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  // Render Final Video with FFmpeg and Auto-Download (VibeCut-like)
  const handleRenderFinal = async () => {
    setIsRendering(true);
    setRenderProgress('Processando corte e sincronização com FFmpeg...');

    try {
      setTimeout(() => setRenderProgress('Gerando legendas dinâmicas libass...'), 1200);
      setTimeout(() => setRenderProgress('Compondo camadas de tela dividida / recorte...'), 2400);
      setTimeout(() => setRenderProgress('Finalizando renderização em alta definição...'), 3800);

      const res = await fetch(`${API_BASE}/api/projects/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          baseVideoPath: project.baseVideo?.path || project.baseVideo?.url,
          segments,
          headline: headline?.text ? headline : null,
          format: globalFormat,
          template: project.template || 'direct_response',
          subtitleStyle: enableSubtitles ? globalSubtitleStyle : '',
          highlightColor,
          fontScale,
          words: project.transcript?.words || [],
          musicFile: musicFile?.url || project.music?.url || null,
          musicVolume
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha na renderização');
      }

      const data = await res.json();
      setIsRendering(false);
      setRenderedResult(data);
      setShowExportModal(true);

      // Auto-trigger direct download to user's computer just like VibeCut
      const downloadFilename = data.outputFilename || (data.videoUrl ? data.videoUrl.split('/').pop() : 'anuncio_clipgen.mp4');
      handleDownloadVideo(data.videoUrl || data.url, downloadFilename);
    } catch (err) {
      alert('Erro na renderização: ' + err.message);
      setIsRendering(false);
    }
  };

  // Re-generate editing plan with AI
  const handleRegeneratePlan = async () => {
    if (!project.id) return;
    if (!confirm('Deseja que a IA crie outro plano de edição? As alterações atuais serão substituídas.')) return;
    setIsRePlanning(true);
    try {
      const res = await fetch(`${API_BASE}/api/projects/${project.id}/replan`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.project?.broll_segments) {
          setSegments(data.project.broll_segments);
          if (data.project.headline) setHeadline(data.project.headline);
          setSelectedSegIndex(0);
          pushState(data.project.broll_segments, data.project.headline);
        }
      } else {
        alert('Não foi possível gerar novo plano no momento.');
      }
    } catch (e) {
      console.warn('Replan error:', e);
    } finally {
      setIsRePlanning(false);
    }
  };

  // Generate new headline matching copy's language on demand
  const handleGenerateAiHeadline = async () => {
    setIsGeneratingHeadline(true);
    try {
      const res = await fetch(`${API_BASE}/api/headlines/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcriptText: project.transcript?.text || '',
          videoTitle: project.title || '',
          angle: project.headlineType || 'pergunta_paradoxal'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.headline) {
          const newHl = { ...headline, text: data.headline, visible: true };
          setHeadline(newHl);
          pushState(segments, newHl);
        }
      } else {
        alert('Não foi possível gerar nova headline no momento.');
      }
    } catch (e) {
      console.warn('Erro ao gerar headline:', e);
    } finally {
      setIsGeneratingHeadline(false);
    }
  };

  // Live Subtitle Words and manual speech correction support
  const words = project.transcript?.words || [];

  const currentSceneWords = useMemo(() => {
    if (activeSegment?.text && activeSegment.text.trim()) {
      const segWords = activeSegment.text.trim().split(/\s+/).filter(Boolean);
      const segDur = Math.max(1.0, (activeSegment.end - activeSegment.start) || 3.0);
      const wordDur = segDur / Math.max(1, segWords.length);
      return segWords.map((w, idx) => ({
        word: w,
        start: (activeSegment.start || 0) + idx * wordDur,
        end: (activeSegment.start || 0) + (idx + 1) * wordDur
      }));
    }
    return words.filter(w => {
      const sStart = activeSegment?.start || 0;
      const sEnd = activeSegment?.end || 4;
      return w.start >= sStart && w.end <= sEnd;
    });
  }, [activeSegment?.text, activeSegment?.start, activeSegment?.end, words]);

  const sceneTranscriptText = activeSegment?.text !== undefined
    ? activeSegment.text
    : currentSceneWords.map(w => w.word).join(' ');

  const activeSceneWordObj = currentSceneWords.find(w => currentTime >= w.start && currentTime <= w.end) 
    || currentSceneWords[0];

  const currentWordsChunk = useMemo(() => {
    if (!currentSceneWords.length) return [];
    if (!activeSceneWordObj) return currentSceneWords.slice(0, 4);
    const activeIdx = currentSceneWords.findIndex(w => w === activeSceneWordObj);
    const chunkStart = Math.floor(Math.max(0, activeIdx) / 4) * 4;
    return currentSceneWords.slice(chunkStart, Math.min(currentSceneWords.length, chunkStart + 4));
  }, [activeSceneWordObj, currentSceneWords]);

  // Visual Subtitle Renderer for all 17 Presets
  const renderSubtitlePreview = () => {
    if (!enableSubtitles || activeSegment?.subtitlePosition === 'sem_legenda' || !activeSceneWordObj) {
      return null;
    }

    const effectivePos = activeSegment?.subtitlePosition && activeSegment.subtitlePosition !== 'automatica'
      ? activeSegment.subtitlePosition
      : (subtitlesPositionGlobal !== 'automatica' ? subtitlesPositionGlobal : (currentMode === 'split-screen' ? 'centro' : 'embaixo'));

    const posClass = effectivePos === 'centro' 
      ? 'top-1/2 -translate-y-1/2' 
      : 'bottom-7';

    const baseSize = (fontScale / 100) * 14;
    const activeWordText = activeSceneWordObj.word;

    // Preset 1: Impacto (Anton, Yellow, bold outline)
    if (globalSubtitleStyle === 'impacto') {
      return (
        <div className={`absolute inset-x-4 z-30 flex justify-center pointer-events-none transition-all ${posClass}`}>
          <div
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: `${baseSize * 1.3}px`,
              color: highlightColor || '#FFE600',
              textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 4px 8px rgba(0,0,0,0.9)'
            }}
            className="font-black text-center uppercase tracking-wide px-2 select-none"
          >
            {currentWordsChunk.map((w, idx) => (
              <span key={idx} className={w.word === activeWordText ? 'underline decoration-2' : ''}>
                {w.word}{' '}
              </span>
            ))}
          </div>
        </div>
      );
    }

    // Preset 2: Destaque Verde (Archivo Black, Lime Green active)
    if (globalSubtitleStyle === 'destaque-verde') {
      return (
        <div className={`absolute inset-x-4 z-30 flex justify-center pointer-events-none transition-all ${posClass}`}>
          <div
            style={{
              fontFamily: 'Archivo Black, sans-serif',
              fontSize: `${baseSize * 1.15}px`,
              textShadow: '0 2px 8px rgba(0,0,0,0.95), -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000'
            }}
            className="font-black text-center uppercase tracking-tight px-2 select-none"
          >
            {currentWordsChunk.map((w, idx) => {
              const isAct = w.word === activeWordText;
              return (
                <span key={idx} style={{ color: isAct ? (highlightColor || '#C5F955') : '#FFFFFF' }}>
                  {w.word}{' '}
                </span>
              );
            })}
          </div>
        </div>
      );
    }

    // Preset 3: Karaokê (Archivo Black, animated bounce & highlight)
    if (globalSubtitleStyle === 'karaoke') {
      return (
        <div className={`absolute inset-x-4 z-30 flex justify-center pointer-events-none transition-all ${posClass}`}>
          <div
            style={{
              fontFamily: 'Archivo Black, sans-serif',
              fontSize: `${baseSize * 1.15}px`,
              textShadow: '0 2px 10px rgba(0,0,0,0.9), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
            }}
            className="font-black text-center uppercase tracking-wide px-3 py-1 bg-black/40 rounded-xl backdrop-blur-[2px] select-none"
          >
            {currentWordsChunk.map((w, idx) => {
              const isAct = w.word === activeWordText;
              return (
                <span
                  key={idx}
                  className={`inline-block transition-transform duration-100 ${isAct ? 'scale-110' : 'opacity-85'}`}
                  style={{
                    color: isAct ? (highlightColor || '#C5F955') : '#FFFFFF'
                  }}
                >
                  {w.word}{' '}
                </span>
              );
            })}
          </div>
        </div>
      );
    }

    // Preset 4: Tarja Escura (Poppins, dark translucent badge)
    if (globalSubtitleStyle === 'tarja') {
      return (
        <div className={`absolute inset-x-4 z-30 flex justify-center pointer-events-none transition-all ${posClass}`}>
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: `${baseSize * 1.05}px`
            }}
            className="bg-black/85 text-white px-3.5 py-1.5 rounded-lg border border-white/10 font-bold text-center tracking-normal shadow-2xl select-none"
          >
            {currentWordsChunk.map((w, idx) => {
              const isAct = w.word === activeWordText;
              return (
                <span key={idx} style={{ color: isAct ? (highlightColor || '#C5F955') : '#FFFFFF' }}>
                  {w.word}{' '}
                </span>
              );
            })}
          </div>
        </div>
      );
    }

    // Preset 5: Pílula Branca (Poppins, white rounded pill badge)
    if (globalSubtitleStyle === 'pilula') {
      return (
        <div className={`absolute inset-x-4 z-30 flex justify-center pointer-events-none transition-all ${posClass}`}>
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: `${baseSize * 1.05}px`
            }}
            className="bg-white text-black px-4 py-1.5 rounded-full font-bold shadow-2xl tracking-normal text-center select-none"
          >
            {currentWordsChunk.map((w, idx) => {
              const isAct = w.word === activeWordText;
              return (
                <span key={idx} className={isAct ? 'text-emerald-700 font-extrabold' : 'text-black'}>
                  {w.word}{' '}
                </span>
              );
            })}
          </div>
        </div>
      );
    }

    // Preset 6: Neon Glow (Bebas Neue, glowing text)
    if (globalSubtitleStyle === 'neon') {
      return (
        <div className={`absolute inset-x-4 z-30 flex justify-center pointer-events-none transition-all ${posClass}`}>
          <div
            style={{
              fontFamily: 'Bebas Neue, cursive',
              fontSize: `${baseSize * 1.5}px`,
              color: '#FFFFFF',
              textShadow: `0 0 10px ${highlightColor || '#C5F955'}, 0 0 20px ${highlightColor || '#C5F955'}, 0 0 35px ${highlightColor || '#C5F955'}, 0 0 50px ${highlightColor || '#C5F955'}`
            }}
            className="font-normal text-center tracking-widest uppercase select-none"
          >
            {currentWordsChunk.map((w, idx) => (
              <span key={idx}>{w.word} </span>
            ))}
          </div>
        </div>
      );
    }

    // Preset 7: Minimal (Poppins, clean white with soft shadow)
    if (globalSubtitleStyle === 'minimal') {
      return (
        <div className={`absolute inset-x-4 z-30 flex justify-center pointer-events-none transition-all ${posClass}`}>
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: `${baseSize}px`,
              color: '#F5F5F0',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)'
            }}
            className="font-medium text-center tracking-normal px-2 select-none"
          >
            {currentWordsChunk.map((w, idx) => (
              <span key={idx}>{w.word} </span>
            ))}
          </div>
        </div>
      );
    }

    // Preset 8: Comic Pop (Bangers, yellow with black stroke)
    if (globalSubtitleStyle === 'comic') {
      return (
        <div className={`absolute inset-x-4 z-30 flex justify-center pointer-events-none transition-all ${posClass}`}>
          <div
            style={{
              fontFamily: 'Bangers, cursive',
              fontSize: `${baseSize * 1.45}px`,
              color: highlightColor || '#FFE600',
              textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 5px 10px rgba(0,0,0,0.9)'
            }}
            className="tracking-wider text-center uppercase select-none"
          >
            {currentWordsChunk.map((w, idx) => (
              <span key={idx}>{w.word} </span>
            ))}
          </div>
        </div>
      );
    }

    // Preset 9: Palavra em Caixa (Archivo Black, active word in red box)
    if (globalSubtitleStyle === 'caixa') {
      return (
        <div className={`absolute inset-x-4 z-30 flex justify-center pointer-events-none transition-all ${posClass}`}>
          <div
            style={{
              fontFamily: 'Archivo Black, sans-serif',
              fontSize: `${baseSize * 1.15}px`,
              textShadow: '0 2px 6px rgba(0,0,0,0.8)'
            }}
            className="font-black text-center uppercase tracking-tight flex items-center justify-center flex-wrap gap-1.5 px-2 select-none"
          >
            {currentWordsChunk.map((w, idx) => {
              const isAct = w.word === activeWordText;
              return isAct ? (
                <span
                  key={idx}
                  style={{ backgroundColor: highlightColor || '#dc2626' }}
                  className="px-2 py-0.5 rounded text-white shadow-lg inline-block"
                >
                  {w.word}
                </span>
              ) : (
                <span key={idx} className="text-white">
                  {w.word}
                </span>
              );
            })}
          </div>
        </div>
      );
    }

    // Preset 10: Sublinhado (Poppins, active word underlined in yellow)
    if (globalSubtitleStyle === 'sublinhado') {
      return (
        <div className={`absolute inset-x-4 z-30 flex justify-center pointer-events-none transition-all ${posClass}`}>
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: `${baseSize * 1.15}px`,
              textShadow: '0 2px 8px rgba(0,0,0,0.9), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
            }}
            className="font-bold text-center text-white px-2 select-none"
          >
            {currentWordsChunk.map((w, idx) => {
              const isAct = w.word === activeWordText;
              return (
                <span
                  key={idx}
                  style={isAct ? { borderBottom: `3px solid ${highlightColor || '#FFD400'}` } : {}}
                  className={isAct ? 'text-white pb-0.5' : 'text-white'}
                >
                  {w.word}{' '}
                </span>
              );
            })}
          </div>
        </div>
      );
    }

    // Preset 11: Documentário (PT Serif, elegant serif font)
    if (globalSubtitleStyle === 'documentario') {
      return (
        <div className={`absolute inset-x-4 z-30 flex justify-center pointer-events-none transition-all ${posClass}`}>
          <div
            style={{
              fontFamily: 'PT Serif, serif',
              fontSize: `${baseSize * 1.1}px`,
              textShadow: '0 2px 6px rgba(0,0,0,0.9)'
            }}
            className="font-normal italic text-center text-[#F5F5F0] bg-black/60 px-4 py-1 rounded-lg backdrop-blur-sm select-none"
          >
            {currentWordsChunk.map((w, idx) => (
              <span key={idx}>{w.word} </span>
            ))}
          </div>
        </div>
      );
    }

    // Preset 12: Máquina de Escrever (Courier Prime, monospace terminal)
    if (globalSubtitleStyle === 'maquina') {
      return (
        <div className={`absolute inset-x-4 z-30 flex justify-center pointer-events-none transition-all ${posClass}`}>
          <div
            style={{
              fontFamily: 'Courier Prime, monospace',
              fontSize: `${baseSize * 1.1}px`,
              color: '#00FF66',
              textShadow: '0 0 6px rgba(0,255,102,0.8)'
            }}
            className="bg-black/90 px-3 py-1.5 rounded border border-[#00FF66]/30 text-center tracking-wide font-bold select-none"
          >
            {currentWordsChunk.map((w, idx) => (
              <span key={idx}>{w.word} </span>
            ))}
            <span className="animate-pulse">_</span>
          </div>
        </div>
      );
    }

    // Preset 13: Foco (Poppins, single active word in yellow pill)
    if (globalSubtitleStyle === 'foco') {
      return (
        <div className={`absolute inset-x-4 z-30 flex justify-center pointer-events-none transition-all ${posClass}`}>
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: `${baseSize * 1.2}px`,
              backgroundColor: highlightColor || '#FFDE00'
            }}
            className="text-black font-extrabold px-4 py-1 rounded-full shadow-2xl uppercase tracking-wider text-center select-none"
          >
            {activeWordText}
          </div>
        </div>
      );
    }

    // Preset 14: Manchete (Alfa Slab One, bold headline style)
    if (globalSubtitleStyle === 'manchete') {
      return (
        <div className={`absolute inset-x-4 z-30 flex justify-center pointer-events-none transition-all ${posClass}`}>
          <div
            style={{
              fontFamily: 'Alfa Slab One, cursive',
              fontSize: `${baseSize * 1.3}px`,
              color: highlightColor || '#FFD200',
              textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 4px 10px rgba(0,0,0,0.9)'
            }}
            className="font-black text-center uppercase tracking-wide select-none"
          >
            {activeWordText}
          </div>
        </div>
      );
    }

    // Preset 15: Sombra Dura (Alfa Slab One, hard offset shadow)
    if (globalSubtitleStyle === 'sombra-dura') {
      return (
        <div className={`absolute inset-x-4 z-30 flex justify-center pointer-events-none transition-all ${posClass}`}>
          <div
            style={{
              fontFamily: 'Alfa Slab One, cursive',
              fontSize: `${baseSize * 1.15}px`,
              color: highlightColor || '#0FB3C4',
              textShadow: '3px 3px 0 #000, 4px 4px 0 #000'
            }}
            className="font-black text-center uppercase tracking-wide select-none"
          >
            {currentWordsChunk.map((w, idx) => (
              <span key={idx}>{w.word} </span>
            ))}
          </div>
        </div>
      );
    }

    // Preset 16: Bloco (Archivo Black, in magenta block)
    if (globalSubtitleStyle === 'bloco') {
      return (
        <div className={`absolute inset-x-4 z-30 flex justify-center pointer-events-none transition-all ${posClass}`}>
          <div
            style={{
              fontFamily: 'Archivo Black, sans-serif',
              fontSize: `${baseSize * 1.15}px`
            }}
            className="bg-[#FF1FD0] text-white px-3.5 py-1 rounded shadow-xl font-black uppercase tracking-tight text-center select-none"
          >
            {currentWordsChunk.map((w, idx) => (
              <span key={idx}>{w.word} </span>
            ))}
          </div>
        </div>
      );
    }

    // Preset 17: Uma Palavra (Default / Palavra Rápida em Cyan)
    return (
      <div className={`absolute inset-x-4 z-30 flex justify-center pointer-events-none transition-all ${posClass}`}>
        <div
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: `${baseSize * 1.25}px`,
            color: highlightColor || '#C5F955',
            textShadow: '0 2px 8px rgba(0,0,0,0.9)'
          }}
          className="italic font-black text-center uppercase tracking-wide drop-shadow-md select-none"
        >
          {activeWordText}
        </div>
      </div>
    );
  };

  // Split-screen Mask and Degrade computations
  const isSplitMode = currentMode === 'split-screen';
  const splitPct = activeSegment?.maskHeight || 50;
  const isAvatarTop = activeSegment?.avatarPosition === 'em_cima';
  const isSuave = (activeSegment?.maskType || 'suave') === 'suave';
  const degradeVal = isSuave ? Math.min(15, Math.max(0, activeSegment?.degrade !== undefined ? activeSegment.degrade : 15)) : 0;
  const halfDegrade = degradeVal / 2;

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden flex flex-col bg-[#0B0C0E] text-[#F5F5F0] select-none font-sans">
      {/* Top Header matching ClipGen Brand Style */}
      <div className="h-14 shrink-0 px-5 py-2 border-b border-[#21252B] bg-[#111315] flex items-center justify-between">
        <div className="flex flex-col justify-center min-w-0">
          {/* Breadcrumb line */}
          <div className="flex items-center gap-1.5 text-[10px] text-[#92978F]/70 mb-0.5">
            <Home className="w-2.5 h-2.5" />
            <span>&gt;</span>
            <span>Editor de Anúncios</span>
            <span>&gt;</span>
            <span className="text-[#C5F955] font-semibold">Detalhe</span>
          </div>

          {/* Project Title and Tags */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBackToCreate}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#181B20] hover:bg-[#21252B] border border-[#282C34] text-[#F5F5F0] text-xs font-semibold transition-colors cursor-pointer shrink-0"
              title="Voltar ao painel de anúncios"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>

            {isEditingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={projectTitle}
                  onChange={e => setProjectTitle(e.target.value)}
                  className="px-2 py-0.5 rounded-lg bg-[#181B20] border border-[#C5F955] text-xs text-[#F5F5F0] focus:outline-none"
                  autoFocus
                  onBlur={() => setIsEditingTitle(false)}
                />
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1 rounded-lg bg-[#C5F955] text-black"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0">
                <h2 className="text-xs font-bold text-[#F5F5F0] truncate max-w-[200px]">
                  {projectTitle}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="text-[#92978F] hover:text-[#F5F5F0] p-0.5 transition-colors cursor-pointer shrink-0"
                  title="Renomear"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}

            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-[#FEF08A]/10 text-[#FACC15] border border-[#FACC15]/30 text-[10px] font-medium shrink-0">
              Aguardando revisão
            </span>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full bg-[#181B20] text-[#92978F] border border-[#282C34] text-[10px] font-medium shrink-0">
              Direct Response
            </span>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full bg-[#181B20] text-[#92978F] border border-[#282C34] text-[10px] font-medium shrink-0">
              9:16
            </span>
            <span className="text-[11px] text-[#C5F955] font-semibold truncate shrink-0">
              ✓ Revisadas {selectedSegIndex + 1} de {segments.length} cenas
            </span>
          </div>
        </div>

        {/* Right CTA / Action buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center bg-[#15181C] border border-[#21252B] rounded-xl p-0.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg text-[#92978F] hover:text-white disabled:opacity-30 disabled:hover:text-[#92978F] transition-colors cursor-pointer"
              title="Desfazer (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg text-[#92978F] hover:text-white disabled:opacity-30 disabled:hover:text-[#92978F] transition-colors cursor-pointer"
              title="Refazer (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveScene}
            className="px-3.5 py-1.5 rounded-xl bg-[#181B20] hover:bg-[#21252B] border border-[#282C34] text-[#F5F5F0] text-xs font-semibold transition-colors cursor-pointer"
          >
            {sceneSaveFeedback ? 'Salvo!' : 'Salvar Edição'}
          </button>

          <button
            type="button"
            onClick={handleRenderFinal}
            disabled={isRendering}
            className="px-4 py-1.5 rounded-xl bg-[#C5F955] hover:bg-[#b2e847] text-black font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-lime-950/30"
            title="Exporta o vídeo final em Full HD e baixa direto para o seu computador"
          >
            {isRendering ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>{renderProgress || 'Exportando...'}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Exportar e Baixar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Middle Workspace: Video takes major space, Controls pinned on right (NO OUTSIDE SCROLL) */}
      <div className="flex-1 min-h-0 flex flex-row overflow-hidden bg-[#0B0C0E]">
        {/* CENTER / LEFT VIDEO AREA: Dominant, spacious, centered */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center p-3 h-full overflow-hidden">
          <div
            ref={previewPlayerRef}
            onClick={() => {
              setIsHeadlineSelected(false);
              setIsEditingHeadlineInline(false);
            }}
            className={`relative aspect-[9/16] h-full max-h-[calc(100vh-325px)] bg-black rounded-2xl overflow-hidden border border-[#21252B] shadow-2xl flex flex-col justify-center items-center select-none ${
              activeTransitionVisual?.type === 'zoom_punch' ? 'player-zoom-punch-anim' : ''
            } ${
              activeTransitionVisual?.type === 'whip_lateral' ? 'player-whip-anim' : ''
            } ${
              activeTransitionVisual?.type === 'blur' ? 'player-blur-anim' : ''
            } ${
              activeTransitionVisual?.type === 'glitch' ? 'player-glitch-anim' : ''
            }`}
          >
            {/* PERSISTENT SINGLE AVATAR VIDEO LAYER (NEVER UNMOUNTS) */}
            <div
              className="absolute inset-0 overflow-hidden transition-all duration-300 pointer-events-none"
              style={{
                opacity: currentMode === 'broll-full' || currentMode === 'avatar-overlay' ? 0 : 1,
                ...(isSplitMode
                  ? isAvatarTop
                    ? {
                        top: 0,
                        height: `${Math.min(100, splitPct + halfDegrade)}%`,
                        zIndex: 2,
                        WebkitMaskImage: isSuave && degradeVal > 0
                          ? `linear-gradient(to bottom, black calc(100% - ${Math.round((degradeVal / 15) * 45) + 12}px), transparent 100%)`
                          : 'none',
                        maskImage: isSuave && degradeVal > 0
                          ? `linear-gradient(to bottom, black calc(100% - ${Math.round((degradeVal / 15) * 45) + 12}px), transparent 100%)`
                          : 'none'
                      }
                    : {
                        top: `${Math.max(0, splitPct - halfDegrade)}%`,
                        bottom: 0,
                        height: `${100 - Math.max(0, splitPct - halfDegrade)}%`,
                        zIndex: 1,
                        WebkitMaskImage: 'none',
                        maskImage: 'none'
                      }
                  : {
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: 1
                    })
              }}
            >
              <video
                ref={videoRef}
                src={project.baseVideo?.url ? `${API_BASE}${project.baseVideo.url}` : ''}
                className={`w-full ${currentMode === 'split-screen' ? 'object-cover' : 'h-full object-cover'} transition-all duration-150`}
                style={{
                  ...(currentMode === 'split-screen'
                    ? {
                        height: `${(100 / (splitPct || 50)) * 100}%`,
                        transform: `scale(${avatarFraming.zoom || 1}) translateY(-${((avatarFraming.splitBoxTop || 0) / 50) * 50}%)`,
                        transformOrigin: 'top center'
                      }
                    : currentMode === 'talking-head' && avatarFraming.applyToFullScenes
                    ? {
                        transform: `scale(${avatarFraming.zoom || 1})`,
                        transformOrigin: 'center center'
                      }
                    : {})
                }}
                playsInline
                muted={isMuted}
              />
            </div>

            {/* CUTOUT AVATAR LAYER (Recorte IA - Somente o Avatar sem o Cenário) */}
            {currentMode === 'avatar-overlay' && (
              <div
                className="absolute pointer-events-none z-5 flex items-end justify-center transition-all duration-150"
                style={{
                  bottom: 0,
                  height: `${activeSegment?.avatarRecorteScale || 80}%`,
                  width: '60%',
                  ...(activeSegment?.avatarRecortePosition === 'esquerda'
                    ? { left: '2%' }
                    : activeSegment?.avatarRecortePosition === 'centro'
                    ? { left: '50%', transform: 'translateX(-50%)', width: '75%' }
                    : { right: '2%' })
                }}
              >
                <canvas
                  ref={cutoutCanvasRef}
                  className="w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)]"
                />
                {isSegLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs rounded-xl text-[10px] text-white font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5F955] animate-spin mr-1.5" />
                    Processando recorte IA...
                  </div>
                )}
              </div>
            )}

            {/* SPLIT SCREEN MASK SEAM: BLUR GRADIENTE ESFUMAÇADO (Fiel ao VibeCut - Foto 1) */}
            {currentMode === 'split-screen' && (
              isSuave && degradeVal > 0 ? (
                <div
                  className="absolute inset-x-0 -translate-y-1/2 pointer-events-none z-10"
                  style={{
                    top: `${splitPct}%`,
                    height: `${Math.round((degradeVal / 15) * 54) + 14}px`,
                    backdropFilter: `blur(${Math.max(3, Math.round((degradeVal / 15) * 10))}px)`,
                    WebkitBackdropFilter: `blur(${Math.max(3, Math.round((degradeVal / 15) * 10))}px)`,
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.18) 50%, rgba(255,255,255,0.03) 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)'
                  }}
                />
              ) : activeSegment?.maskType === 'reta' ? (
                <div
                  className="absolute inset-x-0 -translate-y-1/2 pointer-events-none z-10 border-b border-[#22c55e]/40 shadow-sm"
                  style={{ top: `${splitPct}%` }}
                />
              ) : null
            )}

            {/* PERSISTENT SINGLE B-ROLL VIDEO LAYER (NEVER UNMOUNTS) */}
            <div
              className="absolute inset-0 overflow-hidden transition-all duration-300 pointer-events-none"
              style={{
                opacity: currentMode === 'talking-head' || !activeSegment?.broll?.url ? 0 : 1,
                ...(isSplitMode
                  ? isAvatarTop
                    ? {
                        top: `${Math.max(0, splitPct - halfDegrade)}%`,
                        bottom: 0,
                        height: `${100 - Math.max(0, splitPct - halfDegrade)}%`,
                        zIndex: 1,
                        WebkitMaskImage: 'none',
                        maskImage: 'none'
                      }
                    : {
                        top: 0,
                        height: `${Math.min(100, splitPct + halfDegrade)}%`,
                        zIndex: 2,
                        WebkitMaskImage: isSuave && degradeVal > 0
                          ? `linear-gradient(to bottom, black calc(100% - ${Math.round((degradeVal / 15) * 45) + 12}px), transparent 100%)`
                          : 'none',
                        maskImage: isSuave && degradeVal > 0
                          ? `linear-gradient(to bottom, black calc(100% - ${Math.round((degradeVal / 15) * 45) + 12}px), transparent 100%)`
                          : 'none'
                      }
                  : {
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: 1
                    })
              }}
            >
              <video
                ref={brollVideoRef}
                src={activeSegment?.broll?.url ? `${API_BASE}${activeSegment.broll.url}` : ''}
                className="w-full h-full object-cover transition-transform duration-75"
                style={{
                  transform: isBrollZoomed
                    ? `scale(${brollZoomVal}) translate(${(-(activeSegment?.brollFrameX || 0) * ((brollZoomVal - 1) / brollZoomVal) * 35)}%, ${(-(activeSegment?.brollFrameY || 0) * ((brollZoomVal - 1) / brollZoomVal) * 35)}%)`
                    : 'scale(1) translate(0, 0)'
                }}
                muted
                playsInline
                loop
              />
            </div>

            {/* Authentic Vintage Film Grain Texture (Película de Cinema 35mm - Sem Quadriculado) */}
            {activeSegment?.texture?.grain && (
              <>
                <div className="vintage-film-grain" />
                <div className="vintage-vignette" />
              </>
            )}

            {/* Authentic Vintage Film Burn / Light Leak Flash (Queimadura e Flash de Filme) */}
            {activeSegment?.texture?.flash && (
              <div className="vintage-film-flash" />
            )}

            {/* Visual Scene Transitions Overlay (Full Screen in Player, z-50 above everything) */}
            {activeTransitionVisual && activeTransitionVisual.type !== 'corte_seco' && (
              <div
                key={`trans-active-${activeTransitionVisual.id}`}
                className="absolute inset-0 pointer-events-none z-50 overflow-hidden"
              >
                {activeTransitionVisual.type === 'flash_branco' && (
                  <div className="absolute inset-0 bg-white transition-flash-anim flex items-center justify-center">
                    <div className="w-[180%] h-[180%] rounded-full bg-white blur-3xl opacity-90" />
                  </div>
                )}
                {activeTransitionVisual.type === 'fade' && (
                  <div className="absolute inset-0 bg-black transition-fade-anim" />
                )}
                {activeTransitionVisual.type === 'blur' && (
                  <div className="absolute inset-0 transition-blur-anim bg-white/5" />
                )}
                {activeTransitionVisual.type === 'glare' && (
                  <div className="absolute inset-0 flex items-center justify-center transition-glare-sweep-anim">
                    <div className="w-[260%] h-28 bg-gradient-to-r from-transparent via-white to-transparent rotate-[25deg] blur-[2px] shadow-[0_0_90px_#ffffff]" />
                    <div className="absolute w-44 h-44 rounded-full bg-[#C5F955] blur-2xl opacity-60" />
                  </div>
                )}
                {activeTransitionVisual.type === 'glitch' && (
                  <div className="absolute inset-0 transition-glitch-anim bg-[#C5F955]/20 mix-blend-color-dodge flex flex-col justify-around">
                    <div className="h-4 bg-white/50 translate-x-5" />
                    <div className="h-6 bg-cyan-400/40 -translate-x-6" />
                    <div className="h-3 bg-fuchsia-500/40 translate-x-7" />
                    <div className="h-8 bg-white/40 -translate-x-4" />
                  </div>
                )}
                {activeTransitionVisual.type === 'whip_lateral' && (
                  <div className="absolute inset-y-0 w-full transition-whip-bar-anim bg-gradient-to-r from-black/80 via-white to-black/80 shadow-2xl" />
                )}
                {activeTransitionVisual.type === 'zoom_punch' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-white/20 transition-punch-flash-anim" />
                    <div className="w-36 h-36 rounded-full border-4 border-white transition-zoom-ring-anim" />
                  </div>
                )}
              </div>
            )}

            {/* Interactive Headline Box with Resizing & Spacing Handles */}
            {headline?.visible !== false && headline?.text && (headline?.stayUntilEnd || currentTime <= (headline.durationSec || 2.0)) && (
              <div
                className={`absolute inset-x-2 z-30 flex items-center justify-center cursor-move transition-shadow ${
                  isHeadlineSelected ? 'ring-2 ring-[#C5F955] ring-offset-2 ring-offset-black rounded-lg' : ''
                }`}
                style={{
                  top: `${headline.positionY || 48}%`,
                  transform: 'translateY(-50%)'
                }}
                onMouseDown={handleHeadlineMouseDown}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsHeadlineSelected(true);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditingHeadlineInline(true);
                }}
              >
                <div
                  style={{
                    backgroundColor: headline.highlightMode === 'nenhum' ? 'transparent' : (headline.bgColor || '#dc2626'),
                    color: headline.textColor || '#ffffff',
                    fontFamily: headline.fontFamily || 'Anton, sans-serif',
                    fontSize: `${(headline.fontSize || 13) * 1.05}px`,
                    width: `${headline.width || 90}%`
                  }}
                  className="px-3 py-1 rounded shadow-lg text-center font-black uppercase tracking-wider leading-tight relative select-none"
                >
                  {isEditingHeadlineInline ? (
                    <input
                      type="text"
                      value={headline.text}
                      onChange={(e) => setHeadline({ ...headline, text: e.target.value })}
                      onBlur={() => setIsEditingHeadlineInline(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setIsEditingHeadlineInline(false);
                      }}
                      autoFocus
                      className="w-full bg-transparent text-center text-inherit font-inherit outline-none border-b border-white"
                    />
                  ) : (
                    <span>{headline.text}</span>
                  )}

                  {/* Handles to adjust width & font size */}
                  {isHeadlineSelected && (
                    <>
                      {/* Left Handle: adjust width */}
                      <div
                        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#C5F955] rounded-full border-2 border-black cursor-ew-resize z-40"
                        title="Arrastar para ajustar largura / espaçamento"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const startX = e.clientX;
                          const startW = headline.width || 90;
                          const onMove = (me) => {
                            const delta = startX - me.clientX;
                            const newW = Math.max(40, Math.min(96, Math.round(startW + delta * 0.8)));
                            setHeadline(h => ({ ...h, width: newW }));
                          };
                          const onUp = () => {
                            window.removeEventListener('mousemove', onMove);
                            window.removeEventListener('mouseup', onUp);
                          };
                          window.addEventListener('mousemove', onMove);
                          window.addEventListener('mouseup', onUp);
                        }}
                      />
                      {/* Right Handle: adjust width */}
                      <div
                        className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#C5F955] rounded-full border-2 border-black cursor-ew-resize z-40"
                        title="Arrastar para ajustar largura / espaçamento"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const startX = e.clientX;
                          const startW = headline.width || 90;
                          const onMove = (me) => {
                            const delta = me.clientX - startX;
                            const newW = Math.max(40, Math.min(96, Math.round(startW + delta * 0.8)));
                            setHeadline(h => ({ ...h, width: newW }));
                          };
                          const onUp = () => {
                            window.removeEventListener('mousemove', onMove);
                            window.removeEventListener('mouseup', onUp);
                          };
                          window.addEventListener('mousemove', onMove);
                          window.addEventListener('mouseup', onUp);
                        }}
                      />
                      {/* Top Handle: adjust font size */}
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#C5F955] rounded-full border-2 border-black cursor-ns-resize z-40"
                        title="Arrastar para ajustar tamanho da fonte"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const startY = e.clientY;
                          const startSize = headline.fontSize || 13;
                          const onMove = (me) => {
                            const delta = startY - me.clientY;
                            const newSize = Math.max(10, Math.min(26, Math.round(startSize + delta * 0.3)));
                            setHeadline(h => ({ ...h, fontSize: newSize }));
                          };
                          const onUp = () => {
                            window.removeEventListener('mousemove', onMove);
                            window.removeEventListener('mouseup', onUp);
                          };
                          window.addEventListener('mousemove', onMove);
                          window.addEventListener('mouseup', onUp);
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Dynamic 17-Preset Subtitle Overlay */}
            {renderSubtitlePreview()}

            {/* Center Play Button Overlay when Paused */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 z-30 flex items-center justify-center bg-black/35 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full bg-[#C5F955] text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                  <Play className="w-6 h-6 fill-black ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Transport Bar under Video Player */}
          <div className="w-full max-w-[420px] mt-2 shrink-0 bg-[#15181C] border border-[#21252B] p-2 rounded-xl flex items-center gap-2 text-xs shadow-md">
            <button
              type="button"
              onClick={() => jumpToScene(selectedSegIndex - 1)}
              className="text-[#92978F] hover:text-[#F5F5F0] p-1 cursor-pointer transition-colors"
              title="Cena anterior"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="w-7 h-7 rounded-lg bg-[#C5F955] hover:bg-[#b2e847] text-black flex items-center justify-center cursor-pointer transition-colors shadow-sm"
              title={isPlaying ? 'Pausar' : 'Reproduzir'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => jumpToScene(selectedSegIndex + 1)}
              className="text-[#92978F] hover:text-[#F5F5F0] p-1 cursor-pointer transition-colors"
              title="Próxima cena"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsSceneLoopMode(!isSceneLoopMode)}
              className={`px-1.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-semibold ${
                isSceneLoopMode
                  ? 'bg-[#C5F955] text-black'
                  : 'bg-[#181B20] text-[#92978F] hover:text-white'
              }`}
              title="Loop da cena selecionada"
            >
              <Repeat className="w-3 h-3" />
              <span>Loop</span>
            </button>

            <input
              type="range"
              min="0"
              max={duration || 20}
              step="0.05"
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 accent-[#C5F955] h-1.5 bg-[#21252B] rounded cursor-pointer"
            />

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="text-[#92978F] hover:text-[#F5F5F0] p-1 cursor-pointer transition-colors"
              title={isMuted ? 'Desmutar' : 'Mutar'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <span className="font-mono text-[#92978F] text-[10px] tabular-nums shrink-0">
              {currentTime.toFixed(1)}s / {(duration || 20).toFixed(1)}s
            </span>
          </div>
        </div>

        {/* RIGHT INSPECTOR PANEL: Compact fixed width pinned to right edge (INTERNAL SCROLL ONLY) */}
        <div className="w-[580px] xl:w-[620px] shrink-0 h-full min-h-0 flex flex-col bg-[#14171C] border-l border-[#21252B] overflow-hidden">
          {/* Top Tabs: Cena X de Y | Global */}
          <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-[#21252B] bg-[#111315]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInspectorTab('scene')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  inspectorTab === 'scene'
                    ? 'bg-[#C5F955] text-black shadow-sm'
                    : 'bg-transparent text-[#92978F] hover:text-white'
                }`}
              >
                Cena {selectedSegIndex + 1} de {segments.length}
              </button>

              <button
                type="button"
                onClick={() => setInspectorTab('global')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  inspectorTab === 'global'
                    ? 'bg-[#C5F955] text-black shadow-sm'
                    : 'bg-transparent text-[#92978F] hover:text-white'
                }`}
              >
                Global
              </button>
            </div>

            <div className="text-xs text-[#92978F] font-mono">
              {(activeSegment?.duration || 3.5).toFixed(1)}s
            </div>
          </div>

          {/* Internal Scrollable Content Panel */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin scrollbar-thumb-[#282C34] scrollbar-track-transparent">
            {/* TAB 1: CENA CONTROLS (Matching media_1790290780519.png) */}
            {inspectorTab === 'scene' && (
              <div className="space-y-4">
                {/* Scene Duration and Header with +/- buttons */}
                <div className="flex items-center justify-between pb-1.5 border-b border-[#21252B]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F5F5F0]">
                      {currentMode === 'broll-full' ? 'B-roll' : currentMode === 'split-screen' ? 'Dividida' : currentMode === 'avatar-overlay' ? 'Recorte' : 'Avatar'}
                    </span>
                    <span className="text-[11px] text-[#92978F] font-mono">
                      {(activeSegment?.start || 0).toFixed(1)}s - {(activeSegment?.end || 3.5).toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAdjustSceneDuration(selectedSegIndex, -0.5)}
                      className="px-2 py-0.5 rounded-lg bg-[#181B20] hover:bg-[#282C34] border border-[#282C34] text-[10px] font-mono text-[#92978F] hover:text-white transition-colors cursor-pointer"
                      title="Diminuir duração da cena (-0.5s)"
                    >
                      -0.5s
                    </button>
                    <span className="px-2 py-0.5 rounded-lg bg-[#181B20] border border-[#C5F955]/30 text-[11px] text-[#C5F955] font-mono font-bold">
                      {(activeSegment?.duration || 3.5).toFixed(1)}s
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustSceneDuration(selectedSegIndex, 0.5)}
                      className="px-2 py-0.5 rounded-lg bg-[#181B20] hover:bg-[#282C34] border border-[#282C34] text-[10px] font-mono text-[#C5F955] hover:bg-[#C5F955]/10 transition-colors cursor-pointer"
                      title="Aumentar duração da cena (+0.5s)"
                    >
                      +0.5s
                    </button>
                  </div>
                </div>

                {/* LEGENDA DESTA CENA Textarea */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#92978F] uppercase tracking-wider block">
                    Legenda desta cena
                  </span>
                  <textarea
                    value={sceneTranscriptText}
                    onChange={(e) => updateActiveSegment({ text: e.target.value })}
                    rows={2}
                    placeholder="Edite a fala ou legenda desta cena..."
                    className="w-full px-3 py-2 rounded-xl bg-[#111315] border border-[#21252B] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C5F955] resize-none"
                  />
                  <p className="text-[10px] text-[#92978F]">
                    Edite e saia do campo (ou Enter) — salva sozinho e o texto se encaixa no tempo da fala. Apagar tudo tira a legenda desta cena.
                  </p>
                </div>

                {/* 2-COLUMN GRID FOR CENA SETTINGS */}
                <div className="grid grid-cols-2 gap-2">
                  {/* LEFT COLUMN: O QUE APARECE, PUNCH-IN, TEXTURA, LEGENDA NESTA CENA */}
                  <div className="space-y-2">
                    {/* O QUE APARECE */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[#F5F5F0] uppercase tracking-wider block">
                        O que aparece
                      </span>
                      <p className="text-[10px] text-[#92978F] leading-tight">
                        Selecione o formato de imagem que entra enquanto a fala toca.
                      </p>

                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 'avatar', modeId: 'talking-head', label: 'Avatar', icon: User },
                          { id: 'broll', modeId: 'broll-full', label: 'B-roll', icon: Video },
                          { id: 'dividida', modeId: 'split-screen', label: 'Dividida', icon: SplitSquareVertical },
                          { id: 'recorte', modeId: 'avatar-overlay', label: 'Recorte', icon: Scissors }
                        ].map(item => {
                          const isSel = currentMode === item.modeId;
                          const IconComp = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => updateActiveSegment({ displayMode: item.id })}
                              className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                isSel
                                  ? 'bg-[#C5F955]/15 border-2 border-[#C5F955] text-white shadow-sm'
                                  : 'bg-[#111315] border-[#21252B] text-[#92978F] hover:text-[#F5F5F0]'
                              }`}
                            >
                              <IconComp className={`w-4 h-4 ${isSel ? 'text-[#C5F955]' : 'text-[#92978F]'}`} />
                              <span className="text-[10px] font-bold">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Split Screen options when Dividida is selected (Matching media_1790293959938.png) */}
                    {currentMode === 'split-screen' && (
                      <div className="p-3.5 rounded-xl bg-[#111315] border border-[#21252B] space-y-3">
                        {/* Posição do avatar */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-semibold text-[#92978F] uppercase tracking-wider">
                            Posição do avatar
                          </span>
                          <div className="flex items-center gap-1.5">
                            {[
                              { id: 'em_cima', label: 'Em cima' },
                              { id: 'embaixo', label: 'Embaixo' }
                            ].map(pos => (
                              <button
                                key={pos.id}
                                type="button"
                                onClick={() => updateActiveSegment({ avatarPosition: pos.id })}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  (activeSegment?.avatarPosition || 'embaixo') === pos.id
                                    ? 'bg-[#C5F955] text-black shadow-sm'
                                    : 'bg-[#181B20] border border-[#282C34] text-[#92978F] hover:text-white'
                                }`}
                              >
                                {pos.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Máscara entre os vídeos */}
                        <div className="space-y-2 pt-2 border-t border-[#21252B]">
                          <span className="text-[11px] font-semibold text-[#F5F5F0] uppercase tracking-wider block">
                            Máscara entre os vídeos
                          </span>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => updateActiveSegment({ maskType: 'suave' })}
                              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                                (activeSegment?.maskType || 'suave') === 'suave'
                                  ? 'bg-[#C5F955]/15 border-2 border-[#C5F955] text-white shadow-sm'
                                  : 'bg-[#181B20] border-[#282C34] text-[#92978F] hover:text-white'
                              }`}
                            >
                              <span className="text-sm">◇</span>
                              <span>Suave</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => updateActiveSegment({ maskType: 'reta' })}
                              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                                activeSegment?.maskType === 'reta'
                                  ? 'bg-[#C5F955]/15 border-2 border-[#C5F955] text-white shadow-sm'
                                  : 'bg-[#181B20] border-[#282C34] text-[#92978F] hover:text-white'
                              }`}
                            >
                              <span className="text-sm">□</span>
                              <span>Reta</span>
                            </button>
                          </div>

                          {/* Degradê Slider (Shown when Suave is active) */}
                          {(activeSegment?.maskType || 'suave') === 'suave' && (
                            <div className="space-y-1.5 pt-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#92978F] text-[11px]">Degradê</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[#F5F5F0] text-[11px]">
                                    {activeSegment?.degrade !== undefined ? activeSegment.degrade : 15}%
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateActiveSegment({ degrade: 15 })}
                                    title="Redefinir para 15%"
                                    className="p-1 rounded bg-[#181B20] hover:bg-[#21252B] border border-[#282C34] text-[#92978F] hover:text-white transition-colors cursor-pointer"
                                  >
                                    <RotateCcw className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="15"
                                  step="1"
                                  value={activeSegment?.degrade !== undefined ? Math.min(15, activeSegment.degrade) : 15}
                                  onChange={e => updateActiveSegment({ degrade: Math.min(15, parseInt(e.target.value)) })}
                                  className="flex-1 accent-[#C5F955] h-1.5 bg-[#21252B] rounded cursor-pointer"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recorte (Cutout) options when Recorte is selected */}
                    {currentMode === 'avatar-overlay' && (
                      <div className="p-3.5 rounded-xl bg-[#111315] border border-[#21252B] space-y-3">
                        {/* Posição do avatar */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-semibold text-[#92978F] uppercase tracking-wider">
                            Posição do avatar
                          </span>
                          <div className="flex items-center gap-1.5">
                            {[
                              { id: 'esquerda', label: 'Esquerda' },
                              { id: 'direita', label: 'Direita' },
                              { id: 'centro', label: 'Centro' }
                            ].map(pos => (
                              <button
                                key={pos.id}
                                type="button"
                                onClick={() => updateActiveSegment({ avatarRecortePosition: pos.id })}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  (activeSegment?.avatarRecortePosition || 'direita') === pos.id
                                    ? 'bg-[#C5F955] text-black shadow-sm'
                                    : 'bg-[#181B20] border border-[#282C34] text-[#92978F] hover:text-white'
                                }`}
                              >
                                {pos.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Tamanho do avatar no recorte */}
                        <div className="space-y-1.5 pt-2 border-t border-[#21252B]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#92978F] text-[11px]">Tamanho do avatar</span>
                            <span className="font-mono text-[#F5F5F0] text-[11px]">
                              {activeSegment?.avatarRecorteScale || 80}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="100"
                            step="5"
                            value={activeSegment?.avatarRecorteScale || 80}
                            onChange={e => updateActiveSegment({ avatarRecorteScale: parseInt(e.target.value) })}
                            className="w-full accent-[#C5F955] h-1.5 bg-[#21252B] rounded cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-[#C5F955] pt-1">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          <span>Recorte por IA ativo: todo o cenário é removido</span>
                        </div>
                      </div>
                    )}

                    {/* EFEITO DE ZOOM (PUNCH-IN) */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-[#F5F5F0] uppercase tracking-wider block">
                        Efeito de zoom
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'sem_efeito', label: 'Sem efeito' },
                          { id: 'zoom_in', label: 'Zoom in' },
                          { id: 'zoom_out', label: 'Zoom out' }
                        ].map(pi => {
                          const isSel = (activeSegment?.zoom || 'sem_efeito') === pi.id;
                          return (
                            <button
                              key={pi.id}
                              type="button"
                              onClick={() => updateActiveSegment({ zoom: pi.id })}
                              className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                                isSel
                                  ? 'bg-[#C5F955] text-black border-[#C5F955]'
                                  : 'bg-[#111315] border-[#21252B] text-[#92978F] hover:text-white'
                              }`}
                            >
                              {pi.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* TRANSIÇÃO DE ENTRADA & EFEITOS SONOROS (Aparece a partir da Cena 2, idêntico ao VibeCut) */}
                    {selectedSegIndex > 0 ? (
                      <div className="space-y-2.5 p-3 rounded-xl bg-[#111315] border border-[#21252B]">
                        <span className="text-[10px] font-bold text-[#F5F5F0] uppercase tracking-wider block">
                          Transição de entrada
                        </span>
                        
                        {/* 8 Botões de transição em 2 colunas */}
                        <div className="grid grid-cols-2 gap-1.5">
                          {TRANSITIONS_GRID.map(t => {
                            const curTransType = activeSegment?.transition?.type || activeSegment?.transitionType || 'corte_seco';
                            const isSel = curTransType === t.id;
                            const curVol = activeSegment?.transition?.volume ?? activeSegment?.transitionVolume ?? 35;
                            const curSound = activeSegment?.transition?.sound || 'padrao';
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                  updateActiveSegment({
                                    transition: {
                                      type: t.id,
                                      sound: curSound,
                                      volume: curVol
                                    }
                                  });
                                  let soundToPlay = curSound;
                                  if (soundToPlay === 'padrao') {
                                    soundToPlay = TRANSITION_DEFAULT_SOUNDS[t.id]?.id || 'sem_som';
                                  }
                                  triggerTransitionPreview(t.id, soundToPlay, curVol);
                                }}
                                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                                  isSel
                                    ? 'bg-[#181B20] text-white border-[#a855f7] ring-1 ring-[#a855f7] shadow-sm'
                                    : 'bg-[#111315] border-[#21252B] text-[#92978F] hover:text-white hover:border-[#282C34]'
                                }`}
                              >
                                {t.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Dropdown de Som + Botão de Prévia (Idêntico ao VibeCut - Imagem 1 e 2) */}
                        {(() => {
                          const curTransType = activeSegment?.transition?.type || activeSegment?.transitionType || 'corte_seco';
                          const curTransDefault = TRANSITION_DEFAULT_SOUNDS[curTransType] || { id: 'sem_som', label: 'Sem som' };
                          
                          let curSoundVal = activeSegment?.transition?.sound || activeSegment?.transitionSound || 'padrao';
                          if (curSoundVal === 'impact_sub') curSoundVal = 'zoom_punch';
                          if (curSoundVal === 'camera_flash') curSoundVal = 'flash_branco';
                          if (curSoundVal === 'whip_snap' || curSoundVal === 'whip_lateral') curSoundVal = 'whip';
                          if (curSoundVal === 'whoosh_deep') curSoundVal = 'blur';
                          if (curSoundVal === 'glitch_sfx' || curSoundVal === 'optic_glare') curSoundVal = 'glitch';

                          let curSoundLabel = `Padrão (${curTransDefault.label})`;
                          if (curSoundVal === 'padrao') {
                            curSoundLabel = `Padrão (${curTransDefault.label})`;
                          } else if (curSoundVal === 'sem_som') {
                            curSoundLabel = 'Sem som';
                          } else {
                            const found = SOUND_OPTIONS_LIST.find(s => s.id === curSoundVal);
                            curSoundLabel = found ? found.label : `Padrão (${curTransDefault.label})`;
                          }

                          const curVol = activeSegment?.transition?.volume ?? activeSegment?.transitionVolume ?? 35;

                          return (
                            <div className="space-y-2 pt-1">
                              {/* Linha do Dropdown de Som */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[#92978F] shrink-0 w-9">Som</span>
                                
                                <div className="relative flex-1" ref={soundDropdownRef}>
                                  <button
                                    type="button"
                                    onClick={() => setIsSoundDropdownOpen(prev => !prev)}
                                    className="w-full bg-[#181B20] border border-[#21252B] hover:border-[#383D47] text-[#F5F5F0] text-xs rounded-xl px-3 py-2 flex items-center justify-between transition-colors cursor-pointer"
                                  >
                                    <span className="truncate font-medium">{curSoundLabel}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-[#92978F] transition-transform duration-150 ${isSoundDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                                  </button>

                                  {/* Menu Flutuante de Sons (Imagem 2) */}
                                  {isSoundDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#16181D] border border-[#282C34] rounded-xl shadow-2xl py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                      {/* Opção Padrão (Nome da Transição) */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateActiveSegment({
                                            transition: {
                                              type: curTransType,
                                              sound: 'padrao',
                                              volume: curVol
                                            }
                                          });
                                          setIsSoundDropdownOpen(false);
                                          const defSound = curTransDefault.id;
                                          if (defSound && defSound !== 'sem_som') {
                                            playTransitionSound(defSound, curVol / 100, curTransType);
                                          }
                                          triggerTransitionPreview(curTransType, defSound, curVol);
                                        }}
                                        className={`w-full px-3 py-2 text-xs flex items-center justify-between text-left transition-colors cursor-pointer ${
                                          curSoundVal === 'padrao'
                                            ? 'bg-[#21252B] text-white font-medium'
                                            : 'text-[#D1D5DB] hover:bg-[#1C1F26] hover:text-white'
                                        }`}
                                      >
                                        <span>{`Padrão (${curTransDefault.label})`}</span>
                                        {curSoundVal === 'padrao' && <Check className="w-3.5 h-3.5 text-[#C5F955]" />}
                                      </button>

                                      {/* Demais opções do VibeCut: Sem som, Whip, Flash branco, Blur, Zoom punch, Glitch */}
                                      {SOUND_OPTIONS_LIST.map(opt => {
                                        const isSelected = curSoundVal === opt.id;
                                        return (
                                          <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => {
                                              updateActiveSegment({
                                                transition: {
                                                  type: curTransType,
                                                  sound: opt.id,
                                                  volume: curVol
                                                }
                                              });
                                              setIsSoundDropdownOpen(false);
                                              if (opt.id !== 'sem_som') {
                                                playTransitionSound(opt.id, curVol / 100, curTransType);
                                              }
                                              triggerTransitionPreview(curTransType, opt.id, curVol);
                                            }}
                                            className={`w-full px-3 py-2 text-xs flex items-center justify-between text-left transition-colors cursor-pointer ${
                                              isSelected
                                                ? 'bg-[#21252B] text-white font-medium'
                                                : 'text-[#D1D5DB] hover:bg-[#1C1F26] hover:text-white'
                                            }`}
                                          >
                                            <span>{opt.label}</span>
                                            {isSelected && <Check className="w-3.5 h-3.5 text-[#C5F955]" />}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Botão de Prévia de Áudio (Ícone de Alto-Falante) */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    let soundToPlay = curSoundVal;
                                    if (soundToPlay === 'padrao') {
                                      soundToPlay = curTransDefault.id;
                                    }
                                    if (soundToPlay && soundToPlay !== 'sem_som') {
                                      playTransitionSound(soundToPlay, curVol / 100, curTransType);
                                    }
                                    triggerTransitionPreview(curTransType, soundToPlay, curVol);
                                  }}
                                  title="Ouvir som e testar transição na tela"
                                  className="p-2 rounded-xl bg-[#181B20] border border-[#21252B] text-[#92978F] hover:text-[#C5F955] hover:border-[#C5F955]/40 transition-colors cursor-pointer shrink-0"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Controle de Volume */}
                              <div className="flex items-center gap-2.5 pt-0.5">
                                <span className="text-xs text-[#92978F] shrink-0 w-9">Volume</span>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={curVol}
                                  onChange={e => {
                                    const newVol = parseInt(e.target.value);
                                    if (syncAllVolumeOnDrag) {
                                      setSegments(prev => prev.map((s, idx) => {
                                        if (idx === 0) return s;
                                        return {
                                          ...s,
                                          transition: {
                                            ...(s.transition || {}),
                                            type: s.transition?.type || 'corte_seco',
                                            sound: s.transition?.sound || 'padrao',
                                            volume: newVol
                                          }
                                        };
                                      }));
                                    } else {
                                      updateActiveSegment({
                                        transition: {
                                          type: curTransType,
                                          sound: curSoundVal,
                                          volume: newVol
                                        }
                                      });
                                    }
                                  }}
                                  className="flex-1 accent-[#a855f7] h-1.5 bg-[#21252B] rounded cursor-pointer"
                                />
                                <span className="text-xs font-mono text-[#F5F5F0] w-9 text-right shrink-0 font-medium">
                                  {curVol}%
                                </span>
                              </div>

                              {/* Ações idênticas ao VibeCut (Imagem 1): Som padrão em todas as cenas | 35% em todas as cenas */}
                              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#21252B]/60 mt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSegments(prev => {
                                      const updated = prev.map((s, idx) => {
                                        if (idx === 0) return s;
                                        return {
                                          ...s,
                                          transition: {
                                            ...(s.transition || {}),
                                            type: s.transition?.type || 'corte_seco',
                                            sound: 'padrao',
                                            volume: s.transition?.volume ?? curVol
                                          }
                                        };
                                      });
                                      pushState(updated, headline);
                                      return updated;
                                    });
                                    setSoundFeedbackMsg('som_padrao');
                                    setTimeout(() => setSoundFeedbackMsg(''), 2500);
                                  }}
                                  className="text-[#92978F] hover:text-[#C5F955] transition-colors cursor-pointer text-left underline decoration-dotted"
                                >
                                  {soundFeedbackMsg === 'som_padrao' ? (
                                    <span className="text-[#C5F955] font-semibold flex items-center gap-1">
                                      <Check className="w-3 h-3" /> Som padrão em todas
                                    </span>
                                  ) : (
                                    'Som padrão em todas as cenas'
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSegments(prev => {
                                      const updated = prev.map((s, idx) => {
                                        if (idx === 0) return s;
                                        return {
                                          ...s,
                                          transition: {
                                            ...(s.transition || {}),
                                            type: s.transition?.type || 'corte_seco',
                                            sound: s.transition?.sound || 'padrao',
                                            volume: curVol
                                          }
                                        };
                                      });
                                      pushState(updated, headline);
                                      return updated;
                                    });
                                    setSoundFeedbackMsg('volume_todas');
                                    setTimeout(() => setSoundFeedbackMsg(''), 2500);
                                  }}
                                  className="text-[#92978F] hover:text-[#C5F955] transition-colors cursor-pointer text-right underline decoration-dotted"
                                >
                                  {soundFeedbackMsg === 'volume_todas' ? (
                                    <span className="text-[#C5F955] font-semibold flex items-center gap-1">
                                      <Check className="w-3 h-3" /> {curVol}% em todas
                                    </span>
                                  ) : (
                                    `${curVol}% em todas as cenas`
                                  )}
                                </button>
                              </div>

                              {/* Opção de sincronização automática contínua */}
                              <label className="flex items-center gap-1.5 text-[10px] text-[#92978F] hover:text-[#F5F5F0] cursor-pointer select-none pt-0.5">
                                <input
                                  type="checkbox"
                                  checked={syncAllVolumeOnDrag}
                                  onChange={e => setSyncAllVolumeOnDrag(e.target.checked)}
                                  className="accent-[#a855f7] rounded cursor-pointer w-3 h-3"
                                />
                                <span>Sincronizar volume em todas as cenas ao mover slider</span>
                              </label>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#111315] border border-[#21252B] space-y-1">
                        <span className="text-[10px] font-bold text-[#92978F] uppercase tracking-wider block">
                          Transição de entrada
                        </span>
                        <p className="text-[11px] text-[#92978F]/80">
                          A primeira cena não possui transição de entrada. As transições e efeitos sonoros são aplicados a partir da Cena 2.
                        </p>
                      </div>
                    )}

                    {/* EFEITOS DE TEXTURA */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-[#F5F5F0] uppercase tracking-wider block">
                        Efeitos de textura
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'grain', label: 'Grain' },
                          { id: 'flash', label: 'Flash' }
                        ].map(eff => {
                          const isSel = !!activeSegment?.texture?.[eff.id];
                          return (
                            <button
                              key={eff.id}
                              type="button"
                              onClick={() => updateActiveSegment({
                                texture: {
                                  ...activeSegment?.texture,
                                  [eff.id]: !isSel
                                }
                              })}
                              className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                                isSel
                                  ? 'bg-[#C5F955] text-black border-[#C5F955]'
                                  : 'bg-[#111315] border-[#21252B] text-[#92978F] hover:text-white'
                              }`}
                            >
                              {eff.label}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-[#92978F]">
                        Grain e flash frame, ajustados cena a cena.
                      </p>
                    </div>

                    {/* LEGENDA NESTA CENA */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-[#F5F5F0] uppercase tracking-wider block">
                        Legenda nesta cena
                      </span>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { id: 'automatica', label: 'Automática' },
                          { id: 'embaixo', label: 'Embaixo' },
                          { id: 'centro', label: 'Centro' },
                          { id: 'sem_legenda', label: 'Sem legenda' }
                        ].map(pos => {
                          const isSel = (activeSegment?.subtitlePosition || 'automatica') === pos.id;
                          return (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => updateActiveSegment({ subtitlePosition: pos.id })}
                              className={`py-2 px-1 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer text-center truncate ${
                                isSel
                                  ? 'bg-[#C5F955] text-black border-[#C5F955]'
                                  : 'bg-[#111315] border-[#21252B] text-[#92978F] hover:text-white'
                              }`}
                            >
                              {pos.label}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-[#92978F]">
                        Automática = segue o padrão global (aba Global). Vale só para esta cena.
                      </p>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: B-ROLL, TRIM, ZOOM E POSIÇÃO DO B-ROLL */}
                  <div className="space-y-4">
                    {/* B-ROLL THUMBNAILS ROW */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#F5F5F0] uppercase tracking-wider">
                          B-roll
                        </span>
                        <span className="text-[10px] text-[#92978F] font-mono">
                          {activeSegment?.broll?.category || 'geral'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {quickBrolls.map((b, idx) => {
                          const isChosen = activeSegment?.broll?.url === b.url;
                          return (
                            <div
                              key={b.url || idx}
                              onClick={() => updateActiveSegment({
                                broll: {
                                  filename: b.filename,
                                  category: b.category,
                                  url: b.url
                                }
                              })}
                              className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 cursor-pointer shrink-0 transition-transform hover:scale-105 ${
                                isChosen ? 'border-[#C5F955] ring-2 ring-[#C5F955]/30' : 'border-[#282C34]'
                              }`}
                            >
                              <video src={`${API_BASE}${b.url}`} className="w-full h-full object-cover" muted />
                              {isChosen && (
                                <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#C5F955] text-black flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Button: Ver todos */}
                        <button
                          type="button"
                          onClick={() => setIsBrollModalOpen(true)}
                          className="w-14 h-14 rounded-xl border-2 border-dashed border-[#282C34] hover:border-[#C5F955] bg-[#111315] hover:bg-[#181B20] text-[#92978F] hover:text-[#C5F955] flex flex-col items-center justify-center text-[9px] font-bold transition-all shrink-0 cursor-pointer"
                        >
                          <span>Ver</span>
                          <span>todos</span>
                        </button>
                      </div>
                    </div>

                    {/* Trecho usado (trim) */}
                    <div className="space-y-2 p-3 rounded-xl bg-[#111315] border border-[#21252B]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#F5F5F0]">Trecho usado (trim)</span>
                        <span className="text-[10px] text-[#92978F] font-mono">
                          {activeSegment?.broll?.filename || 'B-roll ativo'}
                        </span>
                      </div>

                      {/* Video preview with live frame-update as Início slider moves */}
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-[#282C34]">
                        {activeSegment?.broll?.url ? (
                          <video
                            ref={trimVideoRef}
                            src={`${API_BASE}${activeSegment.broll.url}`}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[#92978F]">
                            Sem vídeo selecionado
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-mono text-[#F5F5F0]">
                          frame de entrada
                        </span>
                      </div>

                      {/* Início slider */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#92978F] text-[11px]">Início</span>
                          <span className="font-mono text-[#C5F955] text-[11px]">
                            0:0{(activeSegment?.brollOffset || 0).toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="12"
                          step="0.1"
                          value={activeSegment?.brollOffset || 0}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            updateActiveSegment({ brollOffset: val });
                            if (trimVideoRef.current) {
                              trimVideoRef.current.currentTime = val;
                            }
                          }}
                          className="w-full accent-[#C5F955] h-1.5 bg-[#21252B] rounded cursor-pointer"
                        />
                        <p className="text-[10px] text-[#92978F]">
                          Começa em 0:0{(activeSegment?.brollOffset || 0).toFixed(0)} · usa {(activeSegment?.duration || 3.5).toFixed(1)}s do b-roll na cena
                        </p>
                      </div>

                      {/* Velocidade slider */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#92978F] text-[11px]">Velocidade</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[#C5F955] text-[11px]">
                              {(activeSegment?.brollSpeed || 1.0).toFixed(1).replace('.', ',')}x
                            </span>
                            <button
                              type="button"
                              onClick={() => updateActiveSegment({ brollSpeed: 1.0 })}
                              className="text-[#92978F] hover:text-white cursor-pointer"
                              title="Redefinir velocidade"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={activeSegment?.brollSpeed || 1.0}
                          onChange={e => updateActiveSegment({ brollSpeed: parseFloat(e.target.value) })}
                          className="w-full accent-[#C5F955] h-1.5 bg-[#21252B] rounded cursor-pointer"
                        />
                        <p className="text-[10px] text-[#92978F]">
                          Abaixo de 1x é câmera lenta. Só a imagem do b-roll muda de ritmo: a fala e a duração da cena ficam iguais.
                        </p>
                      </div>
                    </div>

                    {/* ZOOM E POSIÇÃO DO B-ROLL (PEGA TELA INTEIRA SEM ZOOM / ARRASTÁVEL COM ZOOM) */}
                    <div className="space-y-2 p-3 rounded-xl bg-[#111315] border border-[#21252B]">
                      <span className="text-[10px] font-bold text-[#F5F5F0] uppercase tracking-wider block">
                        Zoom e posição do b-roll
                      </span>

                      {/* Preview Box */}
                      <div
                        ref={brollFramingBoxRef}
                        className="relative w-40 h-52 mx-auto bg-black rounded-xl overflow-hidden border border-[#282C34] shadow-inner flex items-center justify-center select-none"
                      >
                        {activeSegment?.broll?.url ? (
                          <video
                            src={`${API_BASE}${activeSegment.broll.url}`}
                            className="w-full h-full object-cover pointer-events-none select-none"
                            muted
                          />
                        ) : (
                          <div className="text-[10px] text-[#92978F]">B-roll</div>
                        )}

                        {/* Interactive Green Box: janela da cena */}
                        <div
                          style={{
                            top: `${brollTopPercent}%`,
                            left: `${brollLeftPercent}%`,
                            width: `${brollBoxWidthPct}%`,
                            height: `${brollBoxHeightPct}%`
                          }}
                          onMouseDown={handleBrollBoxMouseDown}
                          className={`absolute border-2 border-[#22c55e] rounded-lg bg-[#22c55e]/10 flex items-start p-1 select-none z-10 ${
                            isBrollZoomed ? 'cursor-grab active:cursor-grabbing ring-1 ring-[#C5F955]/50' : 'cursor-default'
                          }`}
                        >
                          <span className="bg-[#22c55e] text-black text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider select-none shadow">
                            janela da cena
                          </span>
                        </div>
                      </div>

                      {/* Zoom Slider and Reset Button */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#92978F] text-[11px]">Zoom:</span>
                          <span className="font-mono text-[#C5F955] text-[11px]">
                            {(activeSegment?.brollZoom || 1.0).toFixed(2)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="2.5"
                          step="0.05"
                          value={activeSegment?.brollZoom || 1.0}
                          onChange={e => updateActiveSegment({ brollZoom: parseFloat(e.target.value) })}
                          className="w-full accent-[#C5F955] h-1.5 bg-[#21252B] rounded cursor-pointer"
                        />

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] text-[#92978F]">
                            {isBrollZoomed ? 'Arraste a janela verde para enquadrar' : 'Sem zoom = tela inteira'}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateActiveSegment({ brollFrameX: 0, brollFrameY: 0, brollZoom: 1.0 })}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#181B20] hover:bg-[#21252B] border border-[#282C34] text-[10px] text-[#92978F] hover:text-white transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Redefinir</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOTTOM STICKY ACTION BAR */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => jumpToScene(selectedSegIndex - 1)}
                    disabled={selectedSegIndex <= 0}
                    className="px-4 py-2.5 rounded-xl bg-[#111315] border border-[#21252B] text-[#92978F] hover:text-[#F5F5F0] disabled:opacity-30 text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    &lt; Anterior
                  </button>

                  <button
                    type="button"
                    onClick={handleNextSceneOk}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#C5F955] hover:bg-[#b2e847] text-black font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-lime-950/20"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>✓ Cena ok, próxima &gt;</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: GLOBAL SETTINGS (Matching media_1790290780509.png & media_1790290780489.png) */}
            {inspectorTab === 'global' && (
              <div className="space-y-4">
                {/* 2-COLUMN GRID FOR GLOBAL SETTINGS */}
                <div className="grid grid-cols-2 gap-2">
                  {/* LEFT COLUMN: ENQUADRAMENTO DO AVATAR, VELOCIDADE, SOM, MUSICA, HEADLINE, POSICAO LEGENDAS */}
                  <div className="space-y-2">
                    {/* ENQUADRAMENTO DO AVATAR (STATIONARY PREVIEW + DRAGGABLE SPLIT BOX + TIME SCRUB) */}
                    <div className="p-3.5 rounded-xl bg-[#111315] border border-[#21252B] space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#F5F5F0] uppercase tracking-wider text-[11px]">
                          Enquadramento do avatar
                        </span>
                        <span className="text-[10px] text-[#C5F955] font-semibold">
                          automático
                        </span>
                      </div>

                      {/* Framing Box Preview */}
                      <div
                        ref={avatarFramingBoxRef}
                        className="relative w-36 h-48 mx-auto bg-black rounded-xl overflow-hidden border border-[#282C34] shadow-inner flex items-center justify-center select-none"
                      >
                        {project.baseVideo?.url ? (
                          <video
                            ref={avatarPreviewVideoRef}
                            src={`${API_BASE}${project.baseVideo.url}`}
                            className="w-full h-full object-cover pointer-events-none select-none"
                            muted
                            playsInline
                          />
                        ) : (
                          <div className="text-[10px] text-[#92978F]">Avatar</div>
                        )}

                        {/* Interactive Green Draggable Box: janela do split */}
                        <div
                          style={{
                            top: `${avatarFraming.splitBoxTop || 0}%`,
                            left: '4px',
                            right: '4px',
                            height: '50%'
                          }}
                          onMouseDown={handleAvatarBoxMouseDown}
                          className="absolute border-2 border-[#22c55e] rounded-lg cursor-grab active:cursor-grabbing bg-[#22c55e]/10 flex items-start p-1 select-none z-10 shadow"
                        >
                          <span className="bg-[#22c55e] text-black text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider select-none shadow">
                            janela do split
                          </span>
                        </div>

                        {/* Dashed Box: janela de avatar (tela cheia) */}
                        {avatarFraming.applyToFullScenes && (
                          <div className="absolute inset-1 border-2 border-dashed border-[#8b9289] rounded-lg pointer-events-none flex items-end p-1 z-5">
                            <span className="bg-[#181B20] text-[#F5F5F0] text-[7px] font-bold px-1 py-0.5 rounded uppercase tracking-wider">
                              janela de avatar (tela cheia)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Sliders Frame & Zoom */}
                      <div className="space-y-2 pt-1 text-xs">
                        {/* Frame Slider (Video Timestamp / Frame scrubbing matching VibeCut) */}
                        <div className="flex items-center gap-3">
                          <span className="text-[#92978F] w-12 text-[11px]">Frame:</span>
                          <input
                            type="range"
                            min="0"
                            max={duration || 20}
                            step="0.1"
                            value={avatarFraming.frameTime || 0}
                            onChange={e => {
                              const val = parseFloat(e.target.value);
                              setAvatarFraming(f => ({ ...f, frameTime: val }));
                              if (avatarPreviewVideoRef.current) {
                                avatarPreviewVideoRef.current.currentTime = val;
                              }
                            }}
                            className="flex-1 accent-[#C5F955] h-1.5 bg-[#21252B] rounded cursor-pointer"
                          />
                          <span className="font-mono text-[#F5F5F0] text-[11px] w-9 text-right">
                            {Math.floor((avatarFraming.frameTime || 0) / 60)}:{Math.floor((avatarFraming.frameTime || 0) % 60).toString().padStart(2, '0')}
                          </span>
                        </div>

                        {/* Zoom Slider */}
                        <div className="flex items-center gap-3">
                          <span className="text-[#92978F] w-12 text-[11px]">Zoom:</span>
                          <input
                            type="range"
                            min="1.0"
                            max="2.5"
                            step="0.05"
                            value={avatarFraming.zoom || 1.0}
                            onChange={e => setAvatarFraming(f => ({ ...f, zoom: parseFloat(e.target.value) }))}
                            className="flex-1 accent-[#C5F955] h-1.5 bg-[#21252B] rounded cursor-pointer"
                          />
                          <span className="font-mono text-[#F5F5F0] text-[11px] w-9 text-right">
                            {(avatarFraming.zoom || 1.0).toFixed(2)}x
                          </span>
                        </div>

                        <p className="text-[10px] text-[#92978F] leading-tight">
                          A janela verde é o que entra na metade de todas as telas divididas. Arraste a janela verde para cima ou para baixo para enquadrar perfeitamente o rosto.
                        </p>

                        <label className="flex items-start gap-2 pt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={avatarFraming.applyToFullScenes}
                            onChange={e => setAvatarFraming(f => ({ ...f, applyToFullScenes: e.target.checked }))}
                            className="accent-[#C5F955] w-3.5 h-3.5 rounded mt-0.5 cursor-pointer"
                          />
                          <span className="text-[10px] text-[#92978F] leading-tight">
                            Usar este centro e zoom também nas cenas de avatar em tela cheia e no recorte (ex.: tirar marca d'água da borda).
                          </span>
                        </label>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setAvatarFraming({ splitBoxTop: 0, zoom: 1.0, frameTime: 0, applyToFullScenes: false });
                              if (avatarPreviewVideoRef.current) {
                                avatarPreviewVideoRef.current.currentTime = 0;
                              }
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#181B20] hover:bg-[#21252B] border border-[#282C34] text-[10px] text-[#92978F] hover:text-white transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Redefinir</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* VELOCIDADE DO AVATAR */}
                    <div className="p-3.5 rounded-xl bg-[#111315] border border-[#21252B] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#F5F5F0] uppercase tracking-wider text-[11px]">
                          Velocidade do avatar
                        </span>
                        <span className="font-mono text-[#C5F955] font-bold">
                          {avatarSpeed.toFixed(2).replace('.', ',')}x
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0.75"
                        max="2.0"
                        step="0.05"
                        value={avatarSpeed}
                        onChange={e => setAvatarSpeed(parseFloat(e.target.value))}
                        className="w-full accent-[#C5F955] h-1.5 bg-[#21252B] rounded cursor-pointer"
                      />

                      <div className="flex items-center gap-1.5">
                        {[0.75, 1.0, 1.25, 1.5, 2.0].map(spd => (
                          <button
                            key={spd}
                            type="button"
                            onClick={() => setAvatarSpeed(spd)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                              avatarSpeed === spd
                                ? 'bg-[#C5F955] text-black font-bold'
                                : 'bg-[#181B20] border border-[#282C34] text-[#92978F] hover:text-[#F5F5F0]'
                            }`}
                          >
                            {spd === 1.0 ? '1x' : `${spd.toString().replace('.', ',')}x`}
                          </button>
                        ))}
                      </div>

                      <p className="text-[10px] text-[#92978F]">
                        Vale para o vídeo todo: fala, legendas e cenas acompanham, e o tom da voz não muda.
                      </p>
                    </div>

                    {/* EFEITOS SONOROS */}
                    <div className="p-3.5 rounded-xl bg-[#111315] border border-[#21252B] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#F5F5F0] uppercase tracking-wider text-[11px]">
                          Efeitos Sonoros
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSoundEffectsEnabled(true)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              soundEffectsEnabled
                                ? 'bg-[#C5F955] text-black'
                                : 'bg-[#181B20] text-[#92978F] hover:text-white'
                            }`}
                          >
                            Ligado
                          </button>
                          <button
                            type="button"
                            onClick={() => setSoundEffectsEnabled(false)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              !soundEffectsEnabled
                                ? 'bg-[#C5F955] text-black'
                                : 'bg-[#181B20] text-[#92978F] hover:text-white'
                            }`}
                          >
                            Desligado
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#92978F] leading-tight">
                        Sons das transições e dos destaques, no vídeo todo. Desligar não apaga o som nem o volume que você escolheu em cada cena: religando, tudo volta como estava. Qual som toca em cada transição, e em que volume, fica na aba da cena.
                      </p>
                    </div>

                    {/* MÚSICA DE FUNDO */}
                    <div className="p-3.5 rounded-xl bg-[#111315] border border-[#21252B] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#F5F5F0] uppercase tracking-wider text-[11px]">
                          Música de fundo
                        </span>
                        <span className="text-[10px] text-[#92978F]">
                          {musicFile ? musicFile.filename || 'Música ativa' : 'Nenhuma música adicionada'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => alert('Para gerenciar músicas, use a aba Biblioteca no menu principal.')}
                          className="px-3 py-1.5 rounded-lg bg-[#181B20] hover:bg-[#21252B] border border-[#282C34] text-xs text-[#F5F5F0] font-semibold transition-colors cursor-pointer"
                        >
                          {musicFile ? 'Trocar música' : '+ Adicionar música'}
                        </button>
                      </div>

                      {musicFile && (
                        <div className="pt-2 border-t border-[#21252B] space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#92978F]">Volume da música</span>
                            <span className="font-mono text-[#C5F955]">{Math.round(musicVolume * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={musicVolume}
                            onChange={e => setMusicVolume(parseFloat(e.target.value))}
                            className="w-full accent-[#C5F955] h-1.5 bg-[#21252B] rounded cursor-pointer"
                          />
                        </div>
                      )}
                    </div>

                    {/* HEADLINE DE GANCHO */}
                    <div className="p-3.5 rounded-xl bg-[#111315] border border-[#21252B] space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#F5F5F0] uppercase tracking-wider text-[11px]">
                          Headline de Gancho
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setHeadline(h => ({ ...h, visible: true }))}
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              headline?.visible !== false
                                ? 'bg-[#C5F955] text-black'
                                : 'bg-[#181B20] text-[#92978F] hover:text-white'
                            }`}
                          >
                            Ativa
                          </button>
                          <button
                            type="button"
                            onClick={() => setHeadline(h => ({ ...h, visible: false }))}
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              headline?.visible === false
                                ? 'bg-[#C5F955] text-black'
                                : 'bg-[#181B20] text-[#92978F] hover:text-white'
                            }`}
                          >
                            Desligada
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={headline?.text || ''}
                          onChange={e => setHeadline({ ...headline, text: e.target.value })}
                          placeholder="Texto da headline de gancho..."
                          className="w-full px-3 py-2 rounded-xl bg-[#181B20] border border-[#282C34] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C5F955]"
                        />

                        <button
                          type="button"
                          onClick={handleGenerateAiHeadline}
                          disabled={isGeneratingHeadline}
                          className="w-full py-1.5 px-3 rounded-xl border border-[#282C34] hover:border-[#C5F955]/60 hover:bg-[#181B20] text-[#C5F955] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isGeneratingHeadline ? (
                            <>
                              <div className="w-3 h-3 border-2 border-[#C5F955] border-t-transparent rounded-full animate-spin" />
                              <span>Gerando headline no idioma da voz...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-[#C5F955]" />
                              <span>Gerar com IA no idioma da copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* 10 Font Buttons in 2 Columns */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-[#F5F5F0] uppercase tracking-wider">
                          Fonte
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {HEADLINE_FONTS.map(f => {
                            const isSel = (headline?.fontFamily || 'Anton') === f.id;
                            return (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setHeadline({ ...headline, fontFamily: f.id })}
                                style={{ fontFamily: `${f.id}, sans-serif` }}
                                className={`py-2 px-3 rounded-xl text-xs font-black uppercase text-center border transition-all cursor-pointer ${
                                  isSel
                                    ? 'bg-[#C5F955]/15 border-2 border-[#C5F955] text-white shadow-sm'
                                    : 'bg-[#181B20] border-[#282C34] text-[#92978F] hover:text-[#F5F5F0]'
                                }`}
                              >
                                {f.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tamanho da Letra */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#92978F]">Tamanho da letra</span>
                          <span className="font-mono text-[#C5F955]">{Math.round((headline?.fontSize || 13) / 13 * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="80"
                          max="160"
                          value={Math.round((headline?.fontSize || 13) / 13 * 100)}
                          onChange={e => setHeadline({ ...headline, fontSize: Math.round((parseInt(e.target.value) / 100) * 13) })}
                          className="w-full accent-[#C5F955] h-1.5 bg-[#21252B] rounded cursor-pointer"
                        />
                        <p className="text-[10px] text-[#92978F]">
                          100% é o corpo padrão da fonte. No preview, as alças do topo e cantos mudam este mesmo número.
                        </p>
                      </div>

                      {/* Largura da Caixa (Espaçamento) */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#92978F]">Largura / Espaçamento da caixa</span>
                          <span className="font-mono text-[#C5F955]">{headline?.width || 90}%</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="98"
                          value={headline?.width || 90}
                          onChange={e => setHeadline({ ...headline, width: parseInt(e.target.value) })}
                          className="w-full accent-[#C5F955] h-1.5 bg-[#21252B] rounded cursor-pointer"
                        />
                      </div>

                      {/* Posição da Headline */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-[#F5F5F0] uppercase tracking-wider block">
                          Posição
                        </span>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-[#181B20] border border-[#282C34] text-xs">
                          <span className="text-[11px] text-[#C5F955] font-mono">
                            Posição padrão · {headline?.width || 90}% de largura
                          </span>
                          <button
                            type="button"
                            onClick={() => setHeadline(h => ({ ...h, positionY: 48, width: 90 }))}
                            className="flex items-center gap-1 text-[11px] text-[#92978F] hover:text-white cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Redefinir</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-[#92978F] leading-tight">
                          Arraste a headline no preview para posicioná-la. As alças laterais ajustam a largura e as superiores ajustam o tamanho da fonte.
                        </p>
                      </div>

                      {/* Destaque: Nenhum | Bloco | Por linha */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-[#F5F5F0] uppercase tracking-wider block">
                          Destaque
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'nenhum', label: 'Nenhum' },
                            { id: 'bloco', label: 'Bloco' },
                            { id: 'linha', label: 'Por linha' }
                          ].map(d => {
                            const isSel = (headline?.highlightMode || 'bloco') === d.id;
                            return (
                              <button
                                key={d.id}
                                type="button"
                                onClick={() => setHeadline({ ...headline, highlightMode: d.id })}
                                className={`py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center ${
                                  isSel
                                    ? 'bg-[#C5F955] text-black font-black'
                                    : 'bg-[#181B20] border border-[#282C34] text-[#92978F] hover:text-white'
                                }`}
                              >
                                {d.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cor do Fundo: 7 Circles */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-[#F5F5F0] uppercase tracking-wider block">
                          Cor do Fundo
                        </span>
                        <div className="flex items-center gap-2.5">
                          {HEADLINE_BG_COLORS.map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setHeadline({ ...headline, bgColor: color, highlightMode: 'bloco' })}
                              style={{ backgroundColor: color }}
                              className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                                headline?.bgColor === color ? 'border-[#C5F955] scale-110 shadow-md' : 'border-transparent hover:scale-105'
                              }`}
                            />
                          ))}
                          <input
                            type="color"
                            value={headline?.bgColor || '#dc2626'}
                            onChange={e => setHeadline({ ...headline, bgColor: e.target.value, highlightMode: 'bloco' })}
                            className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0 p-0"
                            title="Cor personalizada"
                          />
                        </div>
                      </div>

                      {/* Cor do Texto: White & Black */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-[#F5F5F0] uppercase tracking-wider block">
                          Cor do Texto
                        </span>
                        <div className="flex items-center gap-2.5">
                          {['#ffffff', '#000000'].map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setHeadline({ ...headline, textColor: color })}
                              style={{ backgroundColor: color }}
                              className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                                headline?.textColor === color ? 'border-[#C5F955] scale-110 shadow-md' : 'border-[#282C34] hover:scale-105'
                              }`}
                            />
                          ))}
                          <input
                            type="color"
                            value={headline?.textColor || '#ffffff'}
                            onChange={e => setHeadline({ ...headline, textColor: e.target.value })}
                            className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0 p-0"
                            title="Cor personalizada de texto"
                          />
                        </div>
                      </div>

                      {/* Fica até (Duration slider) */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#92978F]">Fica até</span>
                          <span className="font-mono text-[#C5F955]">
                            {headline?.stayUntilEnd 
                              ? 'Vídeo todo' 
                              : `0:${Math.floor(headline?.durationSec || 2).toString().padStart(2, '0')}`}
                          </span>
                        </div>
                        {!headline?.stayUntilEnd && (
                          <input
                            type="range"
                            min="1"
                            max={Math.max(10, Math.round(duration || 30))}
                            step="0.5"
                            value={headline?.durationSec || 2}
                            onChange={e => setHeadline({ ...headline, durationSec: parseFloat(e.target.value) })}
                            className="w-full accent-[#C5F955] h-1.5 bg-[#21252B] rounded cursor-pointer"
                          />
                        )}
                        <label className="flex items-center gap-2 cursor-pointer pt-0.5 select-none">
                          <input
                            type="checkbox"
                            checked={!!headline?.stayUntilEnd}
                            onChange={e => setHeadline({ ...headline, stayUntilEnd: e.target.checked })}
                            className="w-4 h-4 rounded accent-[#C5F955] bg-[#21252B] border-[#282C34] cursor-pointer"
                          />
                          <span className="text-xs text-[#F5F5F0]">Ficar até o final do vídeo</span>
                        </label>
                      </div>
                    </div>

                    {/* POSIÇÃO DAS LEGENDAS */}
                    <div className="p-3.5 rounded-xl bg-[#111315] border border-[#21252B] space-y-2">
                      <span className="text-[11px] font-semibold text-[#F5F5F0] uppercase tracking-wider block">
                        Posição das Legendas
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'automatica', label: 'Automática' },
                          { id: 'embaixo', label: 'Embaixo' },
                          { id: 'centro', label: 'Centro' }
                        ].map(pos => {
                          const isSel = (subtitlesPositionGlobal || 'automatica') === pos.id;
                          return (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => setSubtitlesPositionGlobal(pos.id)}
                              className={`py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center ${
                                isSel
                                  ? 'bg-[#C5F955] text-black font-black'
                                  : 'bg-[#181B20] border border-[#282C34] text-[#92978F] hover:text-white'
                              }`}
                            >
                              {pos.label}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-[#92978F] leading-tight">
                        Automática = embaixo (centro nas telas divididas em pé). Cenas com posição própria continuam valendo.
                      </p>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: FORMATO DO ANÚNCIO, LEGENDAS AUTOMÁTICAS (17 PRESETS), GERAR OUTRO PLANO */}
                  <div className="space-y-2">
                    {/* FORMATO DO ANÚNCIO */}
                    <div className="p-3 rounded-xl bg-[#111315] border border-[#21252B] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#F5F5F0] uppercase tracking-wider text-[11px]">
                          Formato do Anúncio
                        </span>
                        <span className="font-mono text-[10px] text-[#92978F]">1080 × 1920</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#181B20] border border-[#282C34] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-6 h-9 shrink-0 border-2 border-[#C5F955] rounded-md flex items-center justify-center text-[9px] font-bold text-[#C5F955]">
                            9:16
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-[#F5F5F0] block truncate">9:16 · Vertical</span>
                            <span className="text-[10px] text-[#92978F] block truncate">Reels, TikTok, Shorts e Stories</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setGlobalFormat(globalFormat === '9:16' ? '16:9' : '9:16')}
                          className="px-2.5 py-1 rounded-lg bg-[#21252B] hover:bg-[#282C34] text-[#F5F5F0] text-xs font-semibold cursor-pointer transition-colors shrink-0"
                        >
                          Trocar
                        </button>
                      </div>
                    </div>

                    {/* LEGENDAS AUTOMÁTICAS & 17 PRESETS */}
                    <div className="p-3 rounded-xl bg-[#111315] border border-[#21252B] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enableSubtitles}
                            onChange={e => setEnableSubtitles(e.target.checked)}
                            className="accent-[#C5F955] w-3.5 h-3.5 rounded cursor-pointer"
                          />
                          <span className="text-xs font-bold text-[#F5F5F0]">
                            Legendas automáticas · <span className="text-[#C5F955] capitalize">{globalSubtitleStyle}</span>
                          </span>
                        </label>
                      </div>

                      {/* 17 Presets 2-Column Grid (Labels fit cleanly without truncation) */}
                      <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#282C34]">
                        {SUBTITLE_PRESETS.map(sub => {
                          const isSelected = globalSubtitleStyle === sub.id;
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => setGlobalSubtitleStyle(sub.id)}
                              className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#C5F955]/15 border-2 border-[#C5F955] shadow-sm'
                                  : 'bg-[#181B20] border-[#282C34] hover:border-[#383e49]'
                              }`}
                            >
                              <div className="h-7 rounded-lg bg-[#111315] flex items-center justify-center p-1 overflow-hidden">
                                <span
                                  style={{
                                    color: sub.color || highlightColor,
                                    fontFamily: sub.font || 'sans-serif'
                                  }}
                                  className="text-[9px] font-bold uppercase truncate"
                                >
                                  {sub.preview}
                                </span>
                              </div>
                              <span className={`text-[10px] font-semibold mt-1 block truncate ${isSelected ? 'text-[#C5F955]' : 'text-[#92978F]'}`}>
                                {sub.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Cor de destaque e Tamanho da Fonte (Properly stacked to prevent any overflow) */}
                      <div className="space-y-1.5 pt-1.5 border-t border-[#21252B] text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#92978F] text-[11px]">Cor de destaque:</span>
                          <div className="flex items-center gap-2">
                            <span
                              style={{ backgroundColor: highlightColor }}
                              className="w-5 h-5 rounded border border-[#C5F955] shadow-sm inline-block"
                            />
                            <input
                              type="color"
                              value={highlightColor}
                              onChange={e => setHighlightColor(e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[#92978F] text-[11px]">Tamanho da fonte:</span>
                          <div className="flex items-center gap-2 flex-1 max-w-[130px]">
                            <input
                              type="range"
                              min="75"
                              max="140"
                              value={fontScale}
                              onChange={e => setFontScale(parseInt(e.target.value))}
                              className="w-full accent-[#C5F955] h-1.5 bg-[#21252B] rounded cursor-pointer"
                            />
                            <span className="font-mono text-[#F5F5F0] text-[10px] w-8 text-right">{fontScale}%</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[10px] text-[#92978F] leading-tight">
                        Posição automática: inferior nas cenas de avatar/b-roll, central nas telas divididas em pé. Preview aproximado — o render usa as fontes reais.
                      </p>
                    </div>

                    {/* AI RE-PLAN BUTTON */}
                    <div className="p-3.5 rounded-xl bg-[#111315] border border-[#21252B] text-center space-y-1.5">
                      <button
                        type="button"
                        onClick={handleRegeneratePlan}
                        disabled={isRePlanning}
                        className="w-full py-2.5 px-4 rounded-xl border border-[#282C34] hover:bg-[#181B20] text-[#F5F5F0] hover:text-[#C5F955] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isRePlanning ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-[#C5F955] border-t-transparent rounded-full animate-spin" />
                            <span>A IA está gerando um novo plano...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3.5 h-3.5 text-[#C5F955]" />
                            <span>Gerar outro plano de edição</span>
                          </>
                        )}
                      </button>
                      <p className="text-[10px] text-[#92978F]">
                        A IA cria um novo plano; as alterações atuais são descartadas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Timeline with All Consecutive Scenes (Fiel ao VibeCut - 100% Proporcional) */}
      <div className="shrink-0 h-[200px] bg-[#101215] border-t border-[#21252B] px-3 pt-2 pb-1.5 flex flex-col justify-between overflow-hidden select-none z-20">
        {/* Top Scrubber Track with Scene Proportional Segments */}
        <div className="flex items-center justify-between text-[10px] text-[#92978F]/60 pb-1">
          <div
            data-timeline-track="true"
            className="relative h-3 flex-1 bg-[#16191E] rounded-sm overflow-hidden flex border border-[#21252B] mr-4 shadow-inner"
          >
            {segments.map((seg, idx) => {
              const isSelected = selectedSegIndex === idx;
              const pct = ((seg.duration || 3.5) / (duration || 20)) * 100;
              const isLast = idx === segments.length - 1;
              return (
                <div
                  key={seg.id || idx}
                  style={{ width: `${pct}%` }}
                  onClick={() => jumpToScene(idx)}
                  className={`group relative h-full transition-colors cursor-pointer flex items-center justify-center border-r border-[#111315] ${
                    isSelected
                      ? 'bg-[#C5F955] text-black font-mono font-bold text-[7.5px]'
                      : idx % 2 === 0
                      ? 'bg-[#1F232B] hover:bg-[#282E37] text-white/40'
                      : 'bg-[#181B20] hover:bg-[#232832] text-white/40'
                  }`}
                  title={`Cena ${idx + 1} (${(seg.duration || 3.5).toFixed(1)}s)`}
                >
                  {/* Label if wide enough */}
                  {pct > 5 && (
                    <span className="truncate px-1 pointer-events-none text-[7px] font-bold">
                      {isSelected ? `Cena ${idx + 1}` : `${idx + 1}`}
                    </span>
                  )}

                  {/* Resizable Divider Handle on Segment Boundary */}
                  {!isLast && (
                    <div
                      onMouseDown={(e) => handleBoundaryMouseDown(idx, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-0 bottom-0 w-2 -mr-1 z-20 cursor-col-resize hover:bg-white/80 active:bg-[#C5F955] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      title="Arraste para ajustar o tempo desta cena"
                    >
                      <div className="w-0.5 h-2 bg-white/60 rounded-full" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <span className="shrink-0 font-mono text-[9px]">Ctrl / ⌘ + scroll para ajustar o zoom</span>
        </div>

        {/* Horizontal Scene Cards Row */}
        <div
          ref={timelineScrollRef}
          className="flex-1 min-h-0 flex items-center gap-1.5 overflow-x-auto overflow-y-hidden pt-1 pb-0.5 scrollbar-thin scrollbar-thumb-[#282C34] scrollbar-track-transparent"
        >
          {segments.map((seg, idx) => {
            const isSelected = selectedSegIndex === idx;
            const segMode = seg.displayMode || seg.type || 'dividida';

            return (
              <div
                key={seg.id || idx}
                onClick={() => jumpToScene(idx)}
                className={`shrink-0 w-[84px] h-[162px] rounded-lg border transition-all cursor-pointer p-1 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#181B20] border-2 border-[#C5F955] shadow-lg shadow-lime-950/20'
                    : 'bg-[#131519] border border-[#21252B] hover:border-[#333944]'
                }`}
              >
                {/* Card Top: Scene Index & Actions */}
                <div className="flex items-center justify-between pb-0.5 text-[#92978F]">
                  <span className={`text-[8.5px] font-bold truncate ${isSelected ? 'text-[#C5F955]' : 'text-[#F5F5F0]'}`}>
                    Cena {idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleDuplicateScene(idx, e)}
                      className="hover:text-[#C5F955] p-0.5 transition-colors cursor-pointer"
                      title="Duplicar cena"
                    >
                      <Copy className="w-2.5 h-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteScene(idx, e)}
                      className="hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                      title="Excluir cena"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                {/* Card Thumbnail - Vertical 9:12 exactly reflecting scene mode */}
                <div className="relative w-full h-[88px] rounded overflow-hidden bg-black border border-[#262B34] flex flex-col shadow-inner select-none">
                  {/* MODE 1: TELA DIVIDIDA */}
                  {(segMode === 'dividida' || segMode === 'split-screen') && (
                    <div className="relative w-full h-full flex flex-col overflow-hidden">
                      {/* Top half: B-roll */}
                      <div className="relative w-full h-1/2 overflow-hidden bg-zinc-950 border-b border-[#21252B]/60">
                        {seg.broll?.url ? (
                          <video
                            src={`${API_BASE}${seg.broll.url}`}
                            className="w-full h-full object-cover pointer-events-none"
                            muted
                            playsInline
                            onLoadedMetadata={(e) => {
                              try { e.target.currentTime = seg.brollOffset || 0.1; } catch (err) {}
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[7px] text-[#92978F] bg-[#14171C]">
                            B-roll
                          </div>
                        )}
                      </div>

                      {/* Bottom half: Avatar */}
                      <div className="relative w-full h-1/2 overflow-hidden bg-zinc-950">
                        {project.baseVideo?.url ? (
                          <video
                            src={`${API_BASE}${project.baseVideo.url}`}
                            className="w-full h-full object-cover pointer-events-none"
                            muted
                            playsInline
                            onLoadedMetadata={(e) => {
                              try { e.target.currentTime = seg.start || 0.1; } catch (err) {}
                            }}
                          />
                        ) : project.thumbnailUrl ? (
                          <img
                            src={`${API_BASE}${project.thumbnailUrl}`}
                            alt="Avatar"
                            className="w-full h-full object-cover pointer-events-none"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[7px] text-[#92978F] bg-[#14171C]">
                            Avatar
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* MODE 2: B-ROLL TELA CHEIA */}
                  {(segMode === 'broll' || segMode === 'broll-full') && (
                    <div className="relative w-full h-full overflow-hidden bg-zinc-950">
                      {seg.broll?.url ? (
                        <video
                          src={`${API_BASE}${seg.broll.url}`}
                          className="w-full h-full object-cover pointer-events-none"
                          muted
                          playsInline
                          onLoadedMetadata={(e) => {
                            try { e.target.currentTime = seg.brollOffset || 0.1; } catch (err) {}
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[7px] text-[#92978F] bg-[#14171C]">
                          B-roll
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODE 3: AVATAR TELA CHEIA */}
                  {(segMode === 'avatar' || segMode === 'talking-head') && (
                    <div className="relative w-full h-full overflow-hidden bg-zinc-950">
                      {project.baseVideo?.url ? (
                        <video
                          src={`${API_BASE}${project.baseVideo.url}`}
                          className="w-full h-full object-cover pointer-events-none"
                          muted
                          playsInline
                          onLoadedMetadata={(e) => {
                            try { e.target.currentTime = seg.start || 0.1; } catch (err) {}
                          }}
                        />
                      ) : project.thumbnailUrl ? (
                        <img
                          src={`${API_BASE}${project.thumbnailUrl}`}
                          alt="Avatar"
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[7px] text-[#92978F] bg-[#14171C]">
                          Avatar
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODE 4: RECORTE / AVATAR OVERLAY */}
                  {(segMode === 'recorte' || segMode === 'avatar-overlay') && (
                    <div className="relative w-full h-full overflow-hidden bg-zinc-950">
                      {seg.broll?.url && (
                        <video
                          src={`${API_BASE}${seg.broll.url}`}
                          className="w-full h-full object-cover pointer-events-none"
                          muted
                          playsInline
                          onLoadedMetadata={(e) => {
                            try { e.target.currentTime = seg.brollOffset || 0.1; } catch (err) {}
                          }}
                        />
                      )}
                      <div
                        className="absolute right-0 bottom-0 w-3/4 h-3/4 pointer-events-none overflow-hidden flex items-end justify-center"
                        style={{
                          WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 50% 65%, black 45%, transparent 95%)',
                          maskImage: 'radial-gradient(ellipse 70% 80% at 50% 65%, black 45%, transparent 95%)'
                        }}
                      >
                        {project.baseVideo?.url ? (
                          <video
                            src={`${API_BASE}${project.baseVideo.url}`}
                            className="w-full h-full object-contain pointer-events-none"
                            muted
                            playsInline
                            onLoadedMetadata={(e) => {
                              try { e.target.currentTime = seg.start || 0.1; } catch (err) {}
                            }}
                          />
                        ) : (
                          <div className="text-[6px] text-white/70 bg-black/60 px-0.5 rounded">Avatar</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Top-Right Timestamp Badge */}
                  <span className="absolute top-0.5 right-0.5 px-1 py-0.2 rounded bg-black/85 font-mono text-[7px] font-bold text-[#F5F5F0] border border-white/10 z-10 leading-tight">
                    0:{Math.floor(seg.start || 0).toString().padStart(2, '0')}
                  </span>

                  {/* Bottom-Left Transition Pill */}
                  {seg.transition?.type && seg.transition.type !== 'corte_seco' && (
                    <span className="absolute bottom-0.5 left-0.5 px-1 py-0.2 rounded bg-[#8b5cf6]/90 text-white font-bold text-[6px] uppercase tracking-wider backdrop-blur-xs shadow z-10 leading-tight">
                      {seg.transition.type.replace('_', ' ')}
                    </span>
                  )}

                  {/* Top-Left Zoom badge if applied */}
                  {seg.zoom && seg.zoom !== 'sem_efeito' && (
                    <span className="absolute top-0.5 left-0.5 px-1 py-0.2 rounded bg-[#eab308]/90 text-black font-bold text-[6px] uppercase tracking-wider backdrop-blur-xs z-10 leading-tight">
                      {seg.zoom.replace('_', ' ')}
                    </span>
                  )}
                </div>

                {/* Scene Label (fiel ao VibeCut - Foto anexada) */}
                <div className="flex items-center gap-1 py-0.5 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    segMode === 'dividida' || segMode === 'split-screen'
                      ? 'bg-sky-400'
                      : segMode === 'avatar' || segMode === 'talking-head'
                      ? 'bg-indigo-400'
                      : segMode === 'recorte' || segMode === 'avatar-overlay'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`} />
                  <span className="text-[7.5px] text-[#D0D4DC] font-medium truncate">
                    {idx + 1} · {segMode === 'dividida' || segMode === 'split-screen' ? 'Tela dividida' : segMode === 'broll' || segMode === 'broll-full' ? 'B-roll' : segMode === 'recorte' || segMode === 'avatar-overlay' ? 'Recorte' : 'Avatar'}
                  </span>
                </div>

                {/* Scene Duration Adjuster (- / +) */}
                <div 
                  className="flex items-center justify-between w-full h-[19px] px-1 rounded bg-[#0A0C0E] border border-[#21252B]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdjustSceneDuration(idx, e.shiftKey ? -0.5 : -0.1);
                    }}
                    className="w-3.5 h-3.5 rounded bg-[#16181D] hover:bg-[#282C34] text-[#92978F] hover:text-[#F5F5F0] flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                    title="Diminuir tempo (-0.1s, Shift: -0.5s)"
                  >
                    <Minus className="w-2 h-2" />
                  </button>

                  <span
                    className="text-[8.5px] font-mono font-bold text-[#C5F955] select-none"
                    title="Duração da cena em segundos"
                  >
                    {(seg.duration || (seg.end - seg.start) || 3.5).toFixed(1)}s
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdjustSceneDuration(idx, e.shiftKey ? 0.5 : 0.1);
                    }}
                    className="w-3.5 h-3.5 rounded bg-[#16181D] hover:bg-[#282C34] text-[#92978F] hover:text-[#C5F955] flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                    title="Aumentar tempo (+0.1s, Shift: +0.5s)"
                  >
                    <Plus className="w-2 h-2" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* B-ROLL LIBRARY MODAL ("Ver todos") */}
      {isBrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[85vh] bg-[#111315] border border-[#21252B] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#21252B] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#F5F5F0]">Biblioteca de B-Rolls</h3>
                <p className="text-xs text-[#92978F]">
                  Selecione um vídeo da sua biblioteca para associar à Cena {selectedSegIndex + 1}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBrollModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#181B20] hover:bg-[#21252B] text-[#92978F] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Filters & Search */}
            <div className="px-6 py-3 border-b border-[#21252B] bg-[#14171C] flex flex-wrap items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-lg scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedBrollCategory('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedBrollCategory === 'all'
                      ? 'bg-[#C5F955] text-black font-bold'
                      : 'bg-[#181B20] text-[#92978F] hover:text-white'
                  }`}
                >
                  Todas ({allAvailableBrolls.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedBrollCategory(cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedBrollCategory === cat.id
                        ? 'bg-[#C5F955] text-black font-bold'
                        : 'bg-[#181B20] text-[#92978F] hover:text-white'
                    }`}
                  >
                    {cat.name || cat.id} ({(cat.files || []).length})
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#92978F]" />
                <input
                  type="text"
                  placeholder="Buscar B-roll..."
                  value={brollSearchQuery}
                  onChange={e => setBrollSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#181B20] border border-[#282C34] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C5F955]"
                />
              </div>
            </div>

            {/* Modal B-Rolls Grid */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 scrollbar-thin scrollbar-thumb-[#282C34]">
              {filteredBrolls.map((b, idx) => {
                const isSelected = activeSegment?.broll?.url === b.url;
                return (
                  <div
                    key={b.url || idx}
                    onClick={() => {
                      updateActiveSegment({
                        broll: {
                          filename: b.filename,
                          category: b.category,
                          url: b.url
                        }
                      });
                      setIsBrollModalOpen(false);
                    }}
                    className={`group relative aspect-[9/16] rounded-xl overflow-hidden bg-black border-2 cursor-pointer transition-all hover:scale-[1.02] shadow-md ${
                      isSelected ? 'border-[#C5F955] ring-2 ring-[#C5F955]/30' : 'border-[#21252B] hover:border-[#C5F955]'
                    }`}
                  >
                    <video
                      src={`${API_BASE}${b.url}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-2">
                      <span className="text-[10px] font-semibold text-white block truncate">
                        {b.filename}
                      </span>
                      <span className="text-[9px] text-[#C5F955] font-mono">
                        {b.categoryName || b.category}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#C5F955] text-black flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredBrolls.length === 0 && (
                <div className="col-span-full py-16 text-center text-[#92978F] text-sm">
                  Nenhum B-roll encontrado nesta categoria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EXPORT SUCCESS & DIRECT DOWNLOAD MODAL (Idêntico ao VibeCut) */}
      {showExportModal && renderedResult && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171C] border border-[#282C34] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl shadow-black/90">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C5F955]/15 border border-[#C5F955]/40 flex items-center justify-center text-[#C5F955] shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F5F5F0]">Vídeo Pronto para Download!</h3>
                  <p className="text-[11px] text-[#92978F]">Exportado em 1080x1920 (9:16 Full HD)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-[#92978F] hover:text-[#F5F5F0] p-1 rounded-lg hover:bg-[#1F242C] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player Preview */}
            <div className="relative aspect-[9/16] max-h-[300px] mx-auto bg-black rounded-xl overflow-hidden border border-[#282C34] shadow-inner">
              <video
                src={`${API_BASE}${renderedResult.videoUrl || renderedResult.url}`}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* Status Feedback */}
            <div className="p-2.5 rounded-xl bg-[#0D0E11] border border-[#21252B] space-y-1 text-xs">
              <div className="flex items-center justify-between text-[#92978F]">
                <span className="text-[11px]">Arquivo:</span>
                <span className="font-mono text-[#F5F5F0] text-[10px] truncate max-w-[190px]">
                  {renderedResult.outputFilename}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[#C5F955] text-[10px] pt-0.5">
                <Check className="w-3 h-3 shrink-0" />
                <span>Download iniciado direto para seu computador!</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDownloadVideo(renderedResult.videoUrl || renderedResult.url, renderedResult.outputFilename)}
                disabled={isDownloading}
                className="w-full py-2.5 rounded-xl bg-[#C5F955] hover:bg-[#b2e847] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-lime-950/40 disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Baixando arquivo...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Baixar Novamente (.mp4)</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 py-2 rounded-xl bg-[#181B20] hover:bg-[#21252B] border border-[#282C34] text-[#F5F5F0] text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  Continuar no Editor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExportModal(false);
                    if (onRenderSuccess) onRenderSuccess(renderedResult);
                  }}
                  className="flex-1 py-2 rounded-xl bg-[#181B20] hover:bg-[#21252B] border border-[#282C34] text-[#92978F] hover:text-[#C5F955] text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  Ver Todos os Vídeos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
