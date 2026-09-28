const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const brolls = [
  { cat: 'casal_brigando', file: 'discussao_casal_01.mp4', color: '#7f1d1d', title: 'Casal Brigando (B-Roll)' },
  { cat: 'casal_feliz', file: 'casal_sorrindo_01.mp4', color: '#065f46', title: 'Casal Feliz (B-Roll)' },
  { cat: 'homem_academia', file: 'treino_pesado_01.mp4', color: '#1e3a8a', title: 'Homem na Academia (B-Roll)' },
  { cat: 'comidas_saudaveis', file: 'receita_fit_01.mp4', color: '#14532d', title: 'Comida Saudavel (B-Roll)' },
  { cat: 'homem_sobrepeso', file: 'homem_cansado_espelho.mp4', color: '#374151', title: 'Homem Sobrepeso (B-Roll)' },
  { cat: 'luxo_lifestyle', file: 'lifestyle_carro_luxo.mp4', color: '#78350f', title: 'Luxo e Lifestyle (B-Roll)' }
];

console.log('Generating starter B-roll media files...');

brolls.forEach(b => {
  const dir = path.join(__dirname, 'storage', 'brolls', b.cat);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  const dest = path.join(dir, b.file);
  if (!fs.existsSync(dest)) {
    console.log(`Generating sample ${b.cat}/${b.file}...`);
    const cmd = `ffmpeg -y -f lavfi -i color=c=${b.color}:s=720x1280:d=6 -vf "drawtext=fontfile='/Windows/Fonts/arial.ttf':text='${b.title}':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.6:boxborderw=15" -c:v libx264 -pix_fmt yuv420p "${dest}"`;
    execSync(cmd, { stdio: 'inherit' });
  }
});

// Generate demo avatar video in uploads
const uploadDir = path.join(__dirname, 'storage', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const demoAvatar = path.join(uploadDir, 'avatar_exemplo_demonstracao.mp4');
if (!fs.existsSync(demoAvatar)) {
  console.log('Generating demo avatar video...');
  const cmd = `ffmpeg -y -f lavfi -i color=c=#18181b:s=720x1280:d=18 -f lavfi -i sine=frequency=220:duration=18 -vf "drawtext=fontfile='/Windows/Fonts/arial.ttf':text='AVATAR EXPERT FALANDO':fontsize=42:fontcolor=white:x=(w-text_w)/2:y=400:box=1:boxcolor=red@0.8:boxborderw=20,drawtext=fontfile='/Windows/Fonts/arial.ttf':text='Video Base (Runway/HeyGen)':fontsize=28:fontcolor=white:x=(w-text_w)/2:y=480" -c:v libx264 -c:a aac -pix_fmt yuv420p "${demoAvatar}"`;
  execSync(cmd, { stdio: 'inherit' });
}

console.log('Starter samples generated successfully!');
