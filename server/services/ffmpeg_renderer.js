const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { generateAssSubtitleFile } = require('./subtitle_generator');

const RESOLUTIONS = {
  '9:16': { w: 1080, h: 1920 },
  '16:9': { w: 1920, h: 1080 },
  '1:1': { w: 1080, h: 1080 },
  '4:3': { w: 1440, h: 1080 },
  '3:4': { w: 1080, h: 1440 },
  '2:1': { w: 1920, h: 960 }
};

function renderVideo({
  baseVideoPath,
  segments = [],
  headline,
  format = '9:16',
  template = 'direct_response',
  subtitleStyle = 'uma_palavra',
  highlightColor = '#00f2fe',
  fontScale = 100,
  words = [],
  musicFile = null,
  musicVolume = 0.15,
  outputFilename = null
}) {
  return new Promise((resolve, reject) => {
    const outputsDir = path.join(__dirname, '..', 'storage', 'outputs');
    if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });

    const tempDir = path.join(__dirname, '..', 'storage', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const targetRes = RESOLUTIONS[format] || RESOLUTIONS['9:16'];
    const { w: width, h: height } = targetRes;

    const timestamp = Date.now();
    const outputPath = path.join(outputsDir, outputFilename || `cortex_criativo_${timestamp}.mp4`);

    const absBaseVideo = path.isAbsolute(baseVideoPath)
      ? baseVideoPath
      : path.resolve(__dirname, '..', baseVideoPath);
    let inputs = [`-i "${absBaseVideo}"`];
    let filterComplex = [];

    // Base avatar video scaled and cropped to aspect ratio
    filterComplex.push(`[0:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}[base]`);

    let currentVTag = 'base';
    let inputIndex = 1;

    // Process scene segments
    segments.forEach((seg, i) => {
      const brollRelative = seg.broll?.url?.replace('/storage/', '');
      const brollAbsPath = brollRelative ? path.join(__dirname, '..', 'storage', brollRelative) : null;
      const mode = seg.displayMode || (template === 'voice_over' ? 'broll' : 'dividida');

      const startT = seg.start || 0;
      const endT = seg.end || 3;

      let zoom = 1.0;
      if (typeof seg.zoom === 'number') {
        zoom = seg.zoom;
      } else if (seg.zoom === 'zoom_in') {
        zoom = 1.15;
      } else if (seg.zoom === 'zoom_out') {
        zoom = 0.90;
      } else if (seg.zoom === 'zoom_punch') {
        zoom = 1.25;
      }

      if (brollAbsPath && fs.existsSync(brollAbsPath) && mode !== 'avatar') {
        const brollOffset = seg.brollOffset || 0;
        if (brollOffset > 0) {
          inputs.push(`-ss ${brollOffset} -i "${brollAbsPath}"`);
        } else {
          inputs.push(`-i "${brollAbsPath}"`);
        }
        const brollInput = inputIndex;
        inputIndex++;

        // Speed adjustment if specified
        let brollStream = `${brollInput}:v`;
        if (seg.brollSpeed && seg.brollSpeed !== 1.0) {
          const speedFilterTag = `br_spd_${i}`;
          filterComplex.push(`[${brollInput}:v]setpts=PTS/${seg.brollSpeed}[${speedFilterTag}]`);
          brollStream = speedFilterTag;
        }

        if (mode === 'dividida') {
          // TELA DIVIDIDA (Split Screen) com maskHeight dinâmico
          const splitPct = (seg.maskHeight || 50) / 100;
          const topH = Math.round(height * splitPct);
          const botH = height - topH;
          const isAvatarTop = seg.avatarPosition !== 'embaixo';

          const avH = isAvatarTop ? topH : botH;
          const brH = isAvatarTop ? botH : topH;

          // Crop Avatar section
          filterComplex.push(`[0:v]scale=${width}:${avH}:force_original_aspect_ratio=increase,crop=${width}:${avH}[av_part_${i}]`);
          // Scale B-roll section
          const brollW = Math.round(width * zoom);
          const brollH = Math.round(brH * zoom);
          if (zoom >= 1.0) {
            filterComplex.push(`[${brollStream}]scale=${brollW}:${brollH}:force_original_aspect_ratio=increase,crop=${width}:${brH}[br_part_${i}]`);
          } else {
            filterComplex.push(`[${brollStream}]scale=${brollW}:${brollH},pad=${width}:${brH}:(ow-iw)/2:(oh-ih)/2:black[br_part_${i}]`);
          }

          // Stack vertically
          const topTag = isAvatarTop ? `av_part_${i}` : `br_part_${i}`;
          const botTag = isAvatarTop ? `br_part_${i}` : `av_part_${i}`;
          const splitTag = `split_${i}`;
          filterComplex.push(`[${topTag}][${botTag}]vstack[${splitTag}]`);

          const nextVTag = `v_seg_${i}`;
          filterComplex.push(`[${currentVTag}][${splitTag}]overlay=0:0:enable='between(t,${startT},${endT})'[${nextVTag}]`);
          currentVTag = nextVTag;
        } else {
          // B-ROLL TELA CHEIA
          const targetW = Math.round(width * zoom);
          const targetH = Math.round(height * zoom);
          const brollTag = `broll_full_${i}`;
          if (zoom >= 1.0) {
            filterComplex.push(`[${brollStream}]scale=${targetW}:${targetH}:force_original_aspect_ratio=increase,crop=${width}:${height}[${brollTag}]`);
          } else {
            filterComplex.push(`[${brollStream}]scale=${targetW}:${targetH},pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black[${brollTag}]`);
          }

          const nextVTag = `v_seg_${i}`;
          filterComplex.push(`[${currentVTag}][${brollTag}]overlay=0:0:enable='between(t,${startT},${endT})'[${nextVTag}]`);
          currentVTag = nextVTag;
        }
      } else if (mode === 'avatar' && zoom !== 1.0) {
        // Zoom aplicado ao Avatar na cena
        const avZoomW = Math.round(width * zoom);
        const avZoomH = Math.round(height * zoom);
        const avZoomTag = `av_zoom_${i}`;
        if (zoom >= 1.0) {
          filterComplex.push(`[0:v]scale=${avZoomW}:${avZoomH}:force_original_aspect_ratio=increase,crop=${width}:${height}[${avZoomTag}]`);
        } else {
          filterComplex.push(`[0:v]scale=${avZoomW}:${avZoomH},pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black[${avZoomTag}]`);
        }
        const nextVTag = `v_seg_${i}`;
        filterComplex.push(`[${currentVTag}][${avZoomTag}]overlay=0:0:enable='between(t,${startT},${endT})'[${nextVTag}]`);
        currentVTag = nextVTag;
      }

      // Visual scene transitions (Flash branco, Fade, etc.) in FFmpeg
      const transType = seg.transition?.type || seg.transitionType;
      if (i > 0 && transType) {
        if (transType === 'flash_branco') {
          const flashTag = `fl_${i}`;
          const nextVTag = `v_tr_${i}`;
          filterComplex.push(`color=c=white:s=${width}x${height}:d=0.25,format=rgba,fade=t=out:st=0:d=0.25:alpha=1[${flashTag}]`);
          filterComplex.push(`[${currentVTag}][${flashTag}]overlay=0:0:enable='between(t,${startT},${startT + 0.25})'[${nextVTag}]`);
          currentVTag = nextVTag;
        } else if (transType === 'fade') {
          const fadeTag = `fd_${i}`;
          const nextVTag = `v_tr_${i}`;
          filterComplex.push(`color=c=black:s=${width}x${height}:d=0.30,format=rgba,fade=t=in:st=0:d=0.15:alpha=1,fade=t=out:st=0.15:d=0.15:alpha=1[${fadeTag}]`);
          filterComplex.push(`[${currentVTag}][${fadeTag}]overlay=0:0:enable='between(t,${startT},${startT + 0.30})'[${nextVTag}]`);
          currentVTag = nextVTag;
        }
      }
    });

    // Headline overlay if enabled
    if (headline && headline.text && headline.text.trim()) {
      const cleanText = headline.text.replace(/'/g, "\\'").replace(/:/g, '\\:').toUpperCase();
      const boxColor = headline.bgColor === '#dc2626' ? 'red' : headline.bgColor === '#000000' ? 'black' : 'red';
      const headlineTag = 'v_headline';
      const fontSize = Math.round((headline.fontSize || 16) * 2.8 * (width / 1080));
      const posY = headline.positionY !== undefined 
        ? Math.round(height * (headline.positionY / 100))
        : Math.round(height * 0.48);
      const enableStr = headline.stayUntilEnd ? '' : `:enable='between(t,0,${headline.durationSec || 2.0})'`;

      filterComplex.push(
        `[${currentVTag}]drawtext=fontfile='/Windows/Fonts/impact.ttf':text='${cleanText}':fontcolor=${headline.textColor || 'white'}:fontsize=${fontSize}:x=(w-text_w)/2:y=${posY}:box=1:boxcolor=${boxColor}@0.90:boxborderw=20${enableStr}[${headlineTag}]`
      );
      currentVTag = headlineTag;
    }

    // Dynamic Subtitles via ASS generator
    let subtitleAssPath = null;
    if (subtitleStyle && words && words.length > 0) {
      subtitleAssPath = path.join(tempDir, `sub_${timestamp}.ass`);
      generateAssSubtitleFile({
        words,
        subtitleStyle,
        highlightColor,
        fontScale,
        videoWidth: width,
        videoHeight: height,
        outputPath: subtitleAssPath
      });

      // Escape path for FFmpeg filter on Windows
      const safeAssPath = subtitleAssPath.replace(/\\/g, '/').replace(/:/g, '\\:');
      const fontsDir = path.join(__dirname, '..', 'storage', 'fonts').replace(/\\/g, '/').replace(/:/g, '\\:');
      const subTag = 'v_sub';
      filterComplex.push(`[${currentVTag}]ass='${safeAssPath}':fontsdir='${fontsDir}'[${subTag}]`);
      currentVTag = subTag;
    }

    // Background Music integration with ducking
    let audioMap = '-map 0:a?';
    if (musicFile) {
      const musicAbs = path.join(__dirname, '..', 'storage', musicFile.replace('/storage/', ''));
      if (fs.existsSync(musicAbs)) {
        const musicIndex = inputIndex;
        inputs.push(`-stream_loop -1 -i "${musicAbs}"`);
        filterComplex.push(`[${musicIndex}:a]volume=${musicVolume || 0.15}[bgm];[0:a][bgm]amix=inputs=2:duration=first:dropout_transition=2[aout]`);
        audioMap = '-map "[aout]"';
      }
    }

    const filterString = filterComplex.join(';');
    const cmd = `ffmpeg -y ${inputs.join(' ')} -filter_complex "${filterString}" -map "[${currentVTag}]" ${audioMap} -c:v libx264 -preset fast -crf 21 -c:a aac -b:a 192k "${outputPath}"`;

    console.log('[FFmpeg Renderer] Starting render for format', format, 'with', segments.length, 'scenes...');

    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      // Clean up temporary ASS subtitle file
      if (subtitleAssPath && fs.existsSync(subtitleAssPath)) {
        try { fs.unlinkSync(subtitleAssPath); } catch (e) {}
      }

      if (err) {
        console.error('FFmpeg render error:', stderr);
        return reject(new Error(`Erro ao renderizar com FFmpeg: ${err.message}`));
      }

      console.log('[FFmpeg Renderer] Render finished successfully:', outputPath);
      resolve({
        success: true,
        outputPath,
        outputFilename: path.basename(outputPath),
        videoUrl: `/storage/outputs/${path.basename(outputPath)}`,
        url: `/storage/outputs/${path.basename(outputPath)}`
      });
    });
  });
}

module.exports = {
  renderVideo
};
