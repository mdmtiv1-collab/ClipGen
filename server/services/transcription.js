const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { getSettings } = require('./settings_manager');

function extractAudio(videoPath, outputAudioPath) {
  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -y -i "${videoPath}" -vn -acodec libmp3lame -ar 16000 -ac 1 -q:a 4 "${outputAudioPath}"`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('Error extracting audio:', stderr);
        return reject(error);
      }
      resolve(outputAudioPath);
    });
  });
}

/**
 * Transcreve com a AssemblyAI (utilizada pelo VibeCut)
 * Fornece timestamps precisos palavra por palavra em milissegundos
 */
async function transcribeWithAssemblyAI(audioPath, apiKey) {
  console.log('[AssemblyAI] Fazendo upload do áudio...');
  const audioData = fs.readFileSync(audioPath);

  // 1. Upload do arquivo de áudio
  const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/octet-stream'
    },
    body: audioData
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`AssemblyAI upload falhou (${uploadRes.status}): ${errText}`);
  }

  const { upload_url } = await uploadRes.json();
  console.log('[AssemblyAI] Upload concluído:', upload_url);

  // 2. Solicitar transcrição em português com pontuação
  console.log('[AssemblyAI] Solicitando transcrição em português com timestamps de palavras...');
  const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      audio_url: upload_url,
      language_code: 'pt',
      punctuate: true,
      format_text: true,
      disfluencies: false
    })
  });

  if (!transcriptRes.ok) {
    const errText = await transcriptRes.text();
    throw new Error(`AssemblyAI transcript request falhou (${transcriptRes.status}): ${errText}`);
  }

  const { id: transcriptId } = await transcriptRes.json();
  console.log('[AssemblyAI] Job iniciado com ID:', transcriptId);

  // 3. Polling até conclusão
  let attempts = 0;
  while (attempts < 120) { // Até 3 minutos
    await new Promise(r => setTimeout(r, 1500));
    attempts++;

    const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: { 'Authorization': apiKey }
    });

    if (!pollRes.ok) continue;

    const data = await pollRes.json();
    if (data.status === 'completed') {
      console.log(`[AssemblyAI] Transcrição concluída! ${data.words?.length || 0} palavras identificadas.`);

      // Converter timestamps de ms para segundos com segurança
      const formattedWords = (data.words || []).map(w => {
        let s = typeof w.start === 'number' ? w.start : parseFloat(w.start) || 0;
        let e = typeof w.end === 'number' ? w.end : parseFloat(w.end) || (s + 0.3);
        if (s > 1000) s = s / 1000;
        if (e > 1000) e = e / 1000;
        return {
          word: w.text || w.word,
          start: parseFloat(s.toFixed(3)),
          end: parseFloat(e.toFixed(3)),
          confidence: w.confidence
        };
      });

      return {
        text: data.text || '',
        words: formattedWords,
        segments: []
      };
    } else if (data.status === 'error') {
      throw new Error(`AssemblyAI erro de transcrição: ${data.error}`);
    }
  }

  throw new Error('Tempo limite excedido na transcrição da AssemblyAI');
}

/**
 * Transcreve com Groq Whisper Large v3 (fallback rápido e ultra-barato)
 */
async function transcribeWithGroq(audioPath, apiKey) {
  const formData = new FormData();
  const fileBuffer = fs.readFileSync(audioPath);
  const blob = new Blob([fileBuffer], { type: 'audio/mp3' });

  formData.append('file', blob, path.basename(audioPath));
  formData.append('model', 'whisper-large-v3');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'word');

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    body: formData
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return {
    text: data.text,
    words: data.words || [],
    segments: data.segments || []
  };
}

// Fallback apenas para modo sem internet / sem chaves
function getMockTranscription() {
  return {
    text: "Se você quer transformar os seus resultados e parar de gastar horas na frente do computador tentando acertar cada detalhe, você precisa entender uma coisa fundamental. Enquanto a maioria das pessoas perde tempo caçando vídeos na internet, quem joga o jogo em alto nível usa automação inteligente para escalar.",
    words: [
      { word: "Se", start: 0.1, end: 0.3 },
      { word: "você", start: 0.3, end: 0.5 },
      { word: "quer", start: 0.5, end: 0.7 },
      { word: "transformar", start: 0.7, end: 1.2 },
      { word: "os", start: 1.2, end: 1.3 },
      { word: "seus", start: 1.3, end: 1.5 },
      { word: "resultados", start: 1.5, end: 2.1 },
      { word: "e", start: 2.1, end: 2.3 },
      { word: "parar", start: 2.3, end: 2.6 },
      { word: "de", start: 2.6, end: 2.7 },
      { word: "gastar", start: 2.7, end: 3.1 },
      { word: "horas", start: 3.1, end: 3.4 },
      { word: "na", start: 3.4, end: 3.6 },
      { word: "frente", start: 3.6, end: 3.9 },
      { word: "do", start: 3.9, end: 4.1 },
      { word: "computador", start: 4.1, end: 4.8 },
      { word: "tentando", start: 4.8, end: 5.2 },
      { word: "acertar", start: 5.2, end: 5.6 },
      { word: "cada", start: 5.6, end: 5.9 },
      { word: "detalhe,", start: 5.9, end: 6.5 },
      { word: "você", start: 6.8, end: 7.1 },
      { word: "precisa", start: 7.1, end: 7.5 },
      { word: "entender", start: 7.5, end: 8.0 },
      { word: "uma", start: 8.0, end: 8.2 },
      { word: "coisa", start: 8.2, end: 8.5 },
      { word: "fundamental.", start: 8.5, end: 9.3 },
      { word: "Enquanto", start: 9.6, end: 10.1 },
      { word: "a", start: 10.1, end: 10.2 },
      { word: "maioria", start: 10.2, end: 10.6 },
      { word: "das", start: 10.6, end: 10.8 },
      { word: "pessoas", start: 10.8, end: 11.2 },
      { word: "perde", start: 11.2, end: 11.5 },
      { word: "tempo", start: 11.5, end: 11.8 },
      { word: "caçando", start: 11.8, end: 12.3 },
      { word: "vídeos", start: 12.3, end: 12.7 },
      { word: "na", start: 12.7, end: 12.9 },
      { word: "internet,", start: 12.9, end: 13.5 },
      { word: "quem", start: 13.8, end: 14.1 },
      { word: "joga", start: 14.1, end: 14.4 },
      { word: "o", start: 14.4, end: 14.5 },
      { word: "jogo", start: 14.5, end: 14.8 },
      { word: "em", start: 14.8, end: 15.0 },
      { word: "alto", start: 15.0, end: 15.3 },
      { word: "nível", start: 15.3, end: 15.7 },
      { word: "usa", start: 15.7, end: 16.0 },
      { word: "automação", start: 16.0, end: 16.6 },
      { word: "inteligente", start: 16.6, end: 17.3 },
      { word: "para", start: 17.3, end: 17.6 },
      { word: "escalar.", start: 17.6, end: 18.2 }
    ]
  };
}

async function transcribeVideo(videoPath) {
  const settings = getSettings();
  const tempAudio = path.join(__dirname, '..', 'storage', 'temp', `audio_${Date.now()}.mp3`);

  const tempDir = path.dirname(tempAudio);
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  try {
    await extractAudio(videoPath, tempAudio);

    // Prioridade 1: AssemblyAI (mesma do VibeCut)
    if (settings.assemblyAiApiKey) {
      console.log('Transcrevendo vídeo real com AssemblyAI...');
      return await transcribeWithAssemblyAI(tempAudio, settings.assemblyAiApiKey);
    }

    // Prioridade 2: Groq Whisper
    if (settings.groqApiKey) {
      console.log('Transcrevendo com Groq Whisper API...');
      return await transcribeWithGroq(tempAudio, settings.groqApiKey);
    }

    throw new Error('Nenhuma chave de API de transcrição encontrada (AssemblyAI / Groq). Configure nas configurações.');
  } catch (err) {
    console.error('[Transcription Error]:', err.message);
    throw err;
  } finally {
    if (fs.existsSync(tempAudio)) {
      try { fs.unlinkSync(tempAudio); } catch(e){}
    }
  }
}

module.exports = {
  transcribeVideo,
  extractAudio
};
