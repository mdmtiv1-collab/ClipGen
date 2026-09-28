const { getSettings } = require('./settings_manager');

async function test() {
  const s = getSettings();
  const key = s.openRouterApiKey;
  if (!key) {
    console.log('No OpenRouter key found');
    return;
  }
  
  console.log('Testing OpenRouter connection...');
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em vídeo B-roll. Responda APENAS em JSON válido.'
        },
        {
          role: 'user',
          content: 'Gere uma descrição visual curta em português e 6 palavras-chave para o vídeo: "Arthritis flare up on my middle finger. At least I_m right handed #psoriaticar.mp4" na categoria "Articulações". Formato JSON: { "description": "...", "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"] }'
        }
      ],
      response_format: { type: 'json_object' }
    })
  });

  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Data:', JSON.stringify(data, null, 2));
}

test().catch(console.error);
