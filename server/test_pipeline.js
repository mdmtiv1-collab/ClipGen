async function testPipeline() {
  console.log('Testing end-to-end project creation and rendering...');

  // 1. Create project using the demo video
  const form = new FormData();
  form.append('template', 'direct_response');
  form.append('headlineType', 'paradoxical');
  form.append('categories', JSON.stringify(['homem_academia', 'casal_brigando', 'comidas_saudaveis']));

  const demoRes = await fetch('http://localhost:3001/storage/uploads/avatar_exemplo_demonstracao.mp4');
  const blob = await demoRes.blob();
  form.append('videos', blob, 'avatar_exemplo_demonstracao.mp4');

  const createRes = await fetch('http://localhost:3001/api/projects/create', {
    method: 'POST',
    body: form
  });

  const projectData = await createRes.json();
  console.log('Project created successfully!');
  console.log('Title:', projectData.projects[0].title);
  console.log('Headline:', projectData.projects[0].headline.text);
  console.log('Segments count:', projectData.projects[0].broll_segments.length);

  const proj = projectData.projects[0];

  // 2. Test rendering this project via FFmpeg
  console.log('Testing FFmpeg render endpoint...');
  const renderRes = await fetch('http://localhost:3001/api/projects/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      baseVideoPath: proj.baseVideo.path,
      segments: proj.broll_segments,
      headline: proj.headline,
      subtitleStyle: 'hormozi_yellow',
      musicFile: null
    })
  });

  const renderData = await renderRes.json();
  console.log('Render result:', renderData);
}

testPipeline().catch(console.error);
