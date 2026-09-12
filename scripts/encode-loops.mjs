// Encode Kie/Kling loops from /tmp/valeo-gen/video/<id>.mp4 into public/video/w-<id>.mp4 and wire heroVideo in the catalog.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
const cat = JSON.parse(readFileSync('data/catalog.json', 'utf8'));
let n = 0;
for (const f of cat.fragrances) {
  const src = `/tmp/valeo-gen/video/${f.id}.mp4`;
  if (!existsSync(src)) continue;
  const out = `public/video/w-${f.id}.mp4`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-vf', 'scale=960:540', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', '-t', '5', out]);
  f.heroVideo = `video/w-${f.id}.mp4`; n++;
}
writeFileSync('data/catalog.json', JSON.stringify(cat, null, 2) + '\n');
console.log(`encoded ${n} loops; heroVideo on ${cat.fragrances.filter((f) => f.heroVideo).length}/18`);
