const fs = require('fs');
const path = require('path');

/**
 * Converte cor hex (#RRGGBB) para o formato BGR do ASS (&H00BBGGRR&)
 */
function hexToAssColor(hex, alphaHex = '00') {
  if (!hex || hex === 'none') return '&H00FFFFFF&';
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const r = clean.substring(0, 2);
  const g = clean.substring(2, 4);
  const b = clean.substring(4, 6);
  return `&H${alphaHex}${b}${g}${r}&`.toUpperCase();
}

/**
 * Formata segundos em formato ASS de tempo: H:MM:SS.cs (centésimos de segundo)
 */
function formatAssTime(seconds) {
  const s = Math.max(0, parseFloat(seconds) || 0);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = Math.floor(s % 60);
  const centis = Math.floor((s % 1) * 100);

  const mStr = String(mins).padStart(2, '0');
  const sStr = String(secs).padStart(2, '0');
  const cStr = String(centis).padStart(2, '0');
  return `${hrs}:${mStr}:${sStr}.${cStr}`;
}

/**
 * 17 Presets com as fontes reais extraídas do VibeCut:
 * Anton, Archivo Black, Poppins ExtraBold, Bebas Neue, Bangers, PT Serif, Courier Prime, Alfa Slab One
 */
const PRESET_DEFINITIONS = {
  'impacto': {
    font: 'Anton',
    fontSizeOffset: 6,
    defaultHighlight: '#FFE600',
    borderStyle: 1,
    outline: 4,
    shadow: 3,
    uppercase: true,
    bold: -1
  },
  'destaque-verde': {
    font: 'Archivo Black',
    fontSizeOffset: 4,
    defaultHighlight: '#8CFF00',
    borderStyle: 1,
    outline: 4,
    shadow: 2,
    uppercase: true,
    bold: -1
  },
  'karaoke': {
    font: 'Archivo Black',
    fontSizeOffset: 4,
    defaultHighlight: '#FFD400',
    borderStyle: 1,
    outline: 4,
    shadow: 2,
    uppercase: true,
    bold: -1,
    karaokeMode: true
  },
  'tarja': {
    font: 'Poppins ExtraBold',
    fontSizeOffset: 0,
    defaultHighlight: '#FFE600',
    borderStyle: 3, // Opaque box in ASS
    outline: 4,
    shadow: 0,
    boxAlpha: '30',
    bold: -1
  },
  'pilula': {
    font: 'Poppins ExtraBold',
    fontSizeOffset: 0,
    defaultHighlight: '#E5484D',
    borderStyle: 3,
    outline: 6,
    shadow: 0,
    boxAlpha: '10',
    bold: -1
  },
  'neon': {
    font: 'Bebas Neue',
    fontSizeOffset: 8,
    defaultHighlight: '#FF3DDB',
    borderStyle: 1,
    outline: 5,
    shadow: 5,
    uppercase: true,
    bold: -1
  },
  'minimal': {
    font: 'Poppins SemiBold',
    fontSizeOffset: -2,
    defaultHighlight: '#FFE600',
    borderStyle: 1,
    outline: 2,
    shadow: 1,
    bold: 0
  },
  'comic': {
    font: 'Bangers',
    fontSizeOffset: 8,
    defaultHighlight: '#FFE600',
    borderStyle: 1,
    outline: 5,
    shadow: 4,
    uppercase: true,
    bold: -1
  },
  'caixa': {
    font: 'Archivo Black',
    fontSizeOffset: 4,
    defaultHighlight: '#D6221B',
    borderStyle: 1,
    outline: 4,
    shadow: 2,
    uppercase: true,
    bold: -1
  },
  'sublinhado': {
    font: 'Poppins ExtraBold',
    fontSizeOffset: 2,
    defaultHighlight: '#FFC300',
    borderStyle: 1,
    outline: 3,
    shadow: 2,
    bold: -1
  },
  'documentario': {
    font: 'PT Serif',
    fontSizeOffset: 0,
    defaultHighlight: '#FFD98A',
    borderStyle: 1,
    outline: 2,
    shadow: 3,
    italic: -1,
    bold: -1
  },
  'maquina': {
    font: 'Courier Prime',
    fontSizeOffset: -4,
    defaultHighlight: '#7CFF9B',
    borderStyle: 3,
    outline: 4,
    shadow: 0,
    boxAlpha: '40',
    bold: -1
  },
  'foco': {
    font: 'Poppins ExtraBold',
    fontSizeOffset: 8,
    defaultHighlight: '#FFE600',
    borderStyle: 3,
    outline: 6,
    shadow: 0,
    singleWordMode: true,
    bold: -1
  },
  'manchete': {
    font: 'Alfa Slab One',
    fontSizeOffset: 12,
    defaultHighlight: '#FFD200',
    borderStyle: 1,
    outline: 5,
    shadow: 3,
    uppercase: true,
    bold: -1
  },
  'sombra-dura': {
    font: 'Alfa Slab One',
    fontSizeOffset: 6,
    defaultHighlight: '#0FB3C4',
    borderStyle: 1,
    outline: 3,
    shadow: 6,
    uppercase: true,
    bold: -1
  },
  'bloco': {
    font: 'Archivo Black',
    fontSizeOffset: 4,
    defaultHighlight: '#FF1FD0',
    borderStyle: 1,
    outline: 4,
    shadow: 2,
    uppercase: true,
    bold: -1
  },
  'palavra': {
    font: 'Poppins ExtraBold',
    fontSizeOffset: 8,
    defaultHighlight: '#2BE8FF',
    borderStyle: 1,
    outline: 4,
    shadow: 2,
    singleWordMode: true,
    italic: -1,
    bold: -1
  }
};

/**
 * Gera um arquivo .ass completo a partir dos dados de transcrição com word-level timestamps.
 */
function generateAssSubtitleFile({
  words = [],
  subtitleStyle = 'impacto',
  highlightColor = null,
  fontScale = 1,
  videoWidth = 1080,
  videoHeight = 1920,
  outputPath
}) {
  // Normalizar chave (kebab ou snake)
  const normKey = (subtitleStyle || 'impacto').replace(/_/g, '-');
  const preset = PRESET_DEFINITIONS[normKey] || PRESET_DEFINITIONS['impacto'];

  const scaleFactor = typeof fontScale === 'number' && fontScale > 0 ? (fontScale > 10 ? fontScale / 100 : fontScale) : 1;
  const baseFontSize = Math.round((52 + (preset.fontSizeOffset || 0)) * scaleFactor * (videoWidth / 1080));
  
  const activeHighlight = highlightColor || preset.defaultHighlight;
  const assHighlight = hexToAssColor(activeHighlight);
  const assWhite = '&H00FFFFFF&';
  const assBlack = '&H00000000&';
  const assSecondary = preset.boxAlpha ? `&H${preset.boxAlpha}000000&` : assBlack;

  const fontName = preset.font || 'Anton';
  const boldFlag = preset.bold !== undefined ? preset.bold : -1;
  const italicFlag = preset.italic ? -1 : 0;
  const borderStyle = preset.borderStyle || 1;
  const outline = preset.outline || 4;
  const shadow = preset.shadow || 2;
  const marginV = Math.round(videoHeight * 0.12);

  const styleHeader = `Style: Default,${fontName},${baseFontSize},${assWhite},${assHighlight},${assBlack},${assSecondary},${boldFlag},${italicFlag},0,0,100,100,0,0,${borderStyle},${outline},${shadow},2,40,40,${marginV},1`;

  const header = `[Script Info]
Title: ClipGen Auto Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.601
PlayResX: ${videoWidth}
PlayResY: ${videoHeight}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
${styleHeader}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = [];

  if (words.length > 0) {
    if (preset.singleWordMode) {
      // Uma palavra por vez (estilo foco ou palavra rápida)
      for (const w of words) {
        if (!w.word || !w.word.trim()) continue;
        const start = formatAssTime(w.start);
        const end = formatAssTime(w.end || (w.start + 0.35));
        let text = w.word.trim();
        if (preset.uppercase) text = text.toUpperCase();
        events.push(`Dialogue: 0,${start},${end},Default,,0,0,0,,{\\c${assHighlight}}${text}`);
      }
    } else if (preset.karaokeMode) {
      // Agrupa 3-4 palavras e acende com tag de cor \c no tempo de cada palavra
      const chunkSize = 4;
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize);
        if (chunk.length === 0) continue;

        for (let j = 0; j < chunk.length; j++) {
          const activeWord = chunk[j];
          const start = formatAssTime(activeWord.start);
          const end = formatAssTime(activeWord.end || (activeWord.start + 0.35));

          const lineParts = chunk.map((cw, idx) => {
            let txt = cw.word.trim();
            if (preset.uppercase) txt = txt.toUpperCase();
            if (idx === j) {
              return `{\\c${assHighlight}\\fscx108\\fscy108}${txt}{\\r\\fscx100\\fscy100}`;
            }
            return `{\\c${assWhite}}${txt}`;
          });

          events.push(`Dialogue: 0,${start},${end},Default,,0,0,0,,${lineParts.join(' ')}`);
        }
      }
    } else {
      // Chunk normal de 3 a 5 palavras com destaque da palavra-chave
      const chunkSize = 4;
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize);
        if (chunk.length === 0) continue;

        const startTime = formatAssTime(chunk[0].start);
        const endTime = formatAssTime(chunk[chunk.length - 1].end || (chunk[0].start + 1.8));

        // Escolhe a palavra mais longa para destacar se não houver karaoke
        let longestIdx = 0;
        let maxLen = 0;
        chunk.forEach((cw, idx) => {
          if (cw.word && cw.word.length > maxLen) {
            maxLen = cw.word.length;
            longestIdx = idx;
          }
        });

        const lineParts = chunk.map((cw, idx) => {
          let txt = cw.word.trim();
          if (preset.uppercase) txt = txt.toUpperCase();
          if (idx === longestIdx) {
            return `{\\c${assHighlight}}${txt}{\\r}`;
          }
          return `{\\c${assWhite}}${txt}`;
        });

        events.push(`Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${lineParts.join(' ')}`);
      }
    }
  }

  const content = header + events.join('\n') + '\n';
  fs.writeFileSync(outputPath, content, 'utf8');
  return outputPath;
}

module.exports = {
  PRESET_DEFINITIONS,
  generateAssSubtitleFile,
  hexToAssColor,
  formatAssTime
};
