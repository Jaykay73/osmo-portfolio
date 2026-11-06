// Import the owner's archived public Pixieset media; never changes the source repo.
// --refresh retries exact recorded public renditions and retains local files on failure.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const source = path.resolve(process.argv[2] || '');
if (!process.argv[2]) throw new Error('Usage: node scripts/import-pixieset.mjs "SOURCE REPOSITORY" [--refresh]');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sharp = createRequire(path.join(source, 'package.json'))('sharp');
const credits = JSON.parse(await fs.readFile(path.join(source, 'content/source-credits.json'), 'utf8'));
const projectText = await fs.readFile(path.join(source, 'content/projects.ts'), 'utf8');
const projects = new Map();
for (const block of projectText.split(/\n  \{\r?\n/)) {
  const slug = block.match(/slug: "([^"]+)"/)?.[1];
  const title = block.match(/title: "([^"]+)"/)?.[1];
  const category = block.match(/category: "([^"]+)"/)?.[1];
  if (slug && title) projects.set(slug, {title,category});
}
const labels = {portraits:'Portraits',celebrations:'Celebrations',events:'Events',institutions:'Institutions'};
const recorded = new Map();
function recordUrl(url) {
  const match = url.match(/^https:\/\/images\.pixieset\.com\/(\d+)\/([a-f0-9]+)-([^/?]+)\.(jpe?g|png|webp)$/i);
  if (match) recorded.set(match[2], {base:`https://images.pixieset.com/${match[1]}/${match[2]}`,extension:match[4]});
}
for (const file of await fs.readdir(path.join(source, '.tmp/pixieset'))) {
  if (!file.endsWith('.json')) continue;
  const data = JSON.parse(await fs.readFile(path.join(source, '.tmp/pixieset', file), 'utf8'));
  for (const url of [...(data.urls || []), ...(data.images || [])]) {
    recordUrl(url);
  }
}
const inventory = JSON.parse(await fs.readFile(path.join(source,'.tmp/review/inventory.json'),'utf8'));
for (const collection of Object.values(inventory)) {
  for (const item of collection.sampled || []) {
    if(item.mediumUrl) recordUrl(item.mediumUrl);
  }
}
const seen = new Set(), photos = [], report = {imported:0, refreshed:0, retained:0, failures:[]};
const tasks = credits.photos.map((p,index)=>({p,index}));
await Promise.all(Array.from({length:4}, async()=>{
  while (tasks.length) {
    const {p,index} = tasks.shift();
    const src = path.resolve(source,p.file);
    if (!src.startsWith(source+path.sep)) throw new Error('Invalid source path');
    let buffer = await fs.readFile(src);
    const record = recorded.get(p.sourcePhotoId);
    const sourceUrl = record ? `${record.base}-${p.variant}.${record.extension}` : null;
    if (process.argv.includes('--refresh') && sourceUrl) {
      try {
        const response = await fetch(sourceUrl,{signal:AbortSignal.timeout(15000)});
        if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`HTTP ${response.status}`);
        const candidate = Buffer.from(await response.arrayBuffer());
        await sharp(candidate).metadata();
        buffer = candidate; report.refreshed++;
      } catch(e) { report.retained++; report.failures.push({id:p.sourcePhotoId,error:e.message}); }
    }
    const name = path.basename(src,path.extname(src));
    const directory = path.join(root,'dist/assets/photography',p.project);
    await fs.mkdir(directory,{recursive:true});
    const full = await sharp(buffer).rotate().resize({width:2000,height:2000,fit:'inside',withoutEnlargement:true}).webp({quality:86}).toBuffer({resolveWithObject:true});
    const thumb = await sharp(buffer).rotate().resize({width:800,height:1000,fit:'inside',withoutEnlargement:true}).webp({quality:82}).toBuffer();
    await fs.writeFile(path.join(directory,name+'.webp'),full.data);
    await fs.writeFile(path.join(directory,name+'-thumb.webp'),thumb);
    const project = projects.get(p.project);
    photos.push({index,src:`assets/photography/${p.project}/${name}.webp`,thumb:`assets/photography/${p.project}/${name}-thumb.webp`,title:project?.title || p.project,category:labels[project?.category] || 'Stories',alt:p.alt,width:full.info.width,height:full.info.height,sourceGallery:p.sourceGallery,sourceUrl,sourcePhotoId:p.sourcePhotoId});
    report.imported++;
    if (report.imported % 20 === 0) console.log(`Prepared ${report.imported}/${credits.photos.length} photographs`);
  }
}));
photos.sort((a,b)=>a.index-b.index);
// Start with one frame per collection; the rest remains available through Load more.
const covers=[], remainder=[];
for(const p of photos){if(seen.has(p.title))remainder.push(p);else{seen.add(p.title);covers.push(p);}}
const ordered=[...covers,...remainder];
// Keep the selected event photograph in the featured set without dropping Aisha's portrait.
const aishaIndex=ordered.findIndex(p=>p.src.endsWith('/aisha-birthday/portrait.webp'));
const eventIndex=ordered.findIndex(p=>p.src.endsWith('/law-and-sport-week/audience.webp'));
if(aishaIndex>=0 && eventIndex>=0) [ordered[aishaIndex],ordered[eventIndex]]=[ordered[eventIndex],ordered[aishaIndex]];
const hero=ordered.find(p=>p.title==='Fatima') || ordered[0];
const manifest={importedAt:new Date().toISOString(),source:credits.source,sourceArchiveDate:credits.migratedAt,photos:ordered};
await fs.writeFile(path.join(root,'dist/media.json'),JSON.stringify(manifest,null,2));
await fs.writeFile(path.join(root,'dist/media.js'),`// Generated by scripts/import-pixieset.mjs\nObject.assign(window.OSMO, ${JSON.stringify({hero:hero.src,photos:ordered})});\n`);
await fs.writeFile(path.join(root,'import-report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,collections:seen.size}));
