const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const musicDir = path.join(__dirname, 'storage', 'music');
if (!fs.existsSync(musicDir)) fs.mkdirSync(musicDir, { recursive: true });

const tracks = [
  { name: 'tensao_suspense.mp3', title: 'Tensão e Curiosidade (Direct Response)', freq: 110 },
  { name: 'motivacional_ritmo.mp3', title: 'Batida Dinâmica e Ritmo', freq: 165 },
  { name: 'lofi_foco.mp3', title: 'Lofi Ambiente Suave', freq: 220 }
];

console.log('Generating demo music tracks...');
tracks.forEach(t => {
  const dest = path.join(musicDir, t.name);
  if (!fs.existsSync(dest)) {
    console.log(`Generating music track ${t.name}...`);
    // Generate gentle rhythmic tones with ffmpeg
    const cmd = `ffmpeg -y -f lavfi -i "sine=frequency=${t.freq}:duration=30" -af "volume=0.3,tremolo=f=4:d=0.7" -c:a libmp3lame "${dest}"`;
    execSync(cmd, { stdio: 'ignore' });
  }
});

console.log('Music tracks generated successfully!');
