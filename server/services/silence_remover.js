const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Removes silent pauses from video where silence duration >= minDuration.
 * Preserves a safety margin (padding) around speech so words are not cut off.
 */
function removeSilenceFromVideo(inputPath, outputPath, options = {}) {
  const noiseThreshold = options.noiseThreshold || '-30dB';
  const minDuration = options.minDuration || 0.4;
  const padding = options.padding || 0.08; // 80ms padding

  return new Promise((resolve) => {
    // 1. Detect silence intervals
    const detectCmd = `ffmpeg -i "${inputPath}" -af "silencedetect=noise=${noiseThreshold}:d=${minDuration}" -f null -`;
    exec(detectCmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      const lines = (stderr || '').split('\n');
      const silences = [];
      let currentStart = null;

      for (const line of lines) {
        const startMatch = line.match(/silence_start:\s*([0-9.]+)/);
        if (startMatch) {
          currentStart = parseFloat(startMatch[1]);
        }
        const endMatch = line.match(/silence_end:\s*([0-9.]+)/);
        if (endMatch && currentStart !== null) {
          const end = parseFloat(endMatch[1]);
          if (end - currentStart >= minDuration) {
            silences.push({ start: currentStart, end });
          }
          currentStart = null;
        }
      }

      if (silences.length === 0) {
        console.log('No prolonged silences detected in avatar video.');
        try { fs.copyFileSync(inputPath, outputPath); } catch (e) {}
        return resolve({ outputPath, silencesRemoved: 0 });
      }

      console.log(`Detected ${silences.length} silence pause(s) to remove.`);

      // 2. Get total video duration
      const probeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`;
      exec(probeCmd, (probeErr, probeStdout) => {
        const totalDuration = parseFloat((probeStdout || '').trim()) || 0;
        if (!totalDuration) {
          try { fs.copyFileSync(inputPath, outputPath); } catch (e) {}
          return resolve({ outputPath, silencesRemoved: 0 });
        }

        // 3. Compute speech intervals
        const speechSegments = [];
        let cursor = 0;

        for (const s of silences) {
          const speechEnd = Math.max(0, s.start + padding);
          if (speechEnd > cursor + 0.1) {
            speechSegments.push({ start: cursor, end: speechEnd });
          }
          cursor = Math.max(cursor, s.end - padding);
        }

        if (cursor < totalDuration) {
          speechSegments.push({ start: cursor, end: totalDuration });
        }

        if (speechSegments.length === 0) {
          try { fs.copyFileSync(inputPath, outputPath); } catch (e) {}
          return resolve({ outputPath, silencesRemoved: 0 });
        }

        // 4. Build select and aselect expression
        const selectFilter = speechSegments
          .map(seg => `between(t,${seg.start.toFixed(3)},${seg.end.toFixed(3)})`)
          .join('+');

        const cutCmd = `ffmpeg -y -i "${inputPath}" -vf "select='${selectFilter}',setpts=N/FRAME_RATE/TB" -af "aselect='${selectFilter}',asetpts=N/SR/TB" -c:v libx264 -preset veryfast -crf 20 -c:a aac -b:a 192k "${outputPath}"`;

        exec(cutCmd, { maxBuffer: 10 * 1024 * 1024 }, (cutErr) => {
          if (cutErr) {
            console.warn('Silence removal failed, using original video:', cutErr.message);
            try { fs.copyFileSync(inputPath, outputPath); } catch (e) {}
            return resolve({ outputPath, silencesRemoved: 0 });
          }
          console.log(`Successfully removed ${silences.length} silences. Snappier audio & video saved.`);
          resolve({ outputPath, silencesRemoved: silences.length, speechSegments });
        });
      });
    });
  });
}

module.exports = {
  removeSilenceFromVideo
};
