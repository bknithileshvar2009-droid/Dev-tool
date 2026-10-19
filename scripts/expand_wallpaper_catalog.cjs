const fs = require('fs');
const path = require('path');
const targetFile = path.resolve(__dirname, '../src/utils/wallpaperCatalog.json');

const catalog = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
const seenUrls = new Set(catalog.map(c => c.fullUrl));
console.log('Starting with existing catalog items:', catalog.length);

const moreBatches = [
  // Japanese
  { category: 'japanese', subCategory: 'Kyoto Autumn Foliage', query: 'Kyoto autumn leaves foliage momiji' },
  { category: 'japanese', subCategory: 'Tokyo Rainy Streets', query: 'Tokyo rain street umbrella' },
  { category: 'japanese', subCategory: 'Shinto Shrines & Torii', query: 'Fushimi Inari shrine torii gate' },
  { category: 'japanese', subCategory: 'Japanese Castles', query: 'Himeji castle Japan architecture' },
  { category: 'japanese', subCategory: 'Hokkaido Landscapes', query: 'Hokkaido landscape scenery Japan' },
  { category: 'japanese', subCategory: 'Ukiyo-e Classic Art', query: 'Katsushika Hokusai landscape woodcut' },

  // Korean
  { category: 'korean', subCategory: 'Changdeokgung Palace', query: 'Changdeokgung secret garden Seoul' },
  { category: 'korean', subCategory: 'Jeju Island Nature', query: 'Jeju island Hallasan volcanic landscape' },
  { category: 'korean', subCategory: 'Korean Traditional Tea', query: 'Korean traditional tea house interior' },
  { category: 'korean', subCategory: 'Gyeongju Historic Sites', query: 'Gyeongju historic landscape Korea' },
  { category: 'korean', subCategory: 'Incheon & Modern Bridges', query: 'Incheon bridge sunset highway' },

  // Chinese
  { category: 'chinese', subCategory: 'Zhangjiajie Pillars', query: 'Zhangjiajie national forest park sandstone pillars' },
  { category: 'chinese', subCategory: 'West Lake Hangzhou', query: 'West Lake Hangzhou scenic bridge' },
  { category: 'chinese', subCategory: 'Great Wall Scenery', query: 'Great Wall of China landscape mountain' },
  { category: 'chinese', subCategory: 'Traditional Tea Plantations', query: 'Longjing tea plantation hills green' },
  { category: 'chinese', subCategory: 'Lijiang Old Town', query: 'Lijiang ancient town Yunnan rooftops' },
  { category: 'chinese', subCategory: 'Huangshan Yellow Mountain', query: 'Huangshan yellow mountain granite peaks pines' },

  // Cyberpunk & Sci-Fi
  { category: 'cyberpunk', subCategory: 'Futuristic Skyline', query: 'Night city long exposure light trails traffic' },
  { category: 'cyberpunk', subCategory: 'Illuminated Towers', query: 'Skyscraper glowing night aerial' },
  { category: 'cyberpunk', subCategory: 'Urban Reflections', query: 'Puddle reflection city lights neon' },

  // Cozy Study Rooms
  { category: 'study', subCategory: 'Cozy Bookstores', query: 'Bookshop bookstore shelves interior' },
  { category: 'study', subCategory: 'Warm Desks', query: 'Study room desk computer setup notebook' },
  { category: 'study', subCategory: 'Historic Libraries', query: 'Trinity College Dublin long room library' },

  // Nature
  { category: 'nature', subCategory: 'Deep Pine Forest', query: 'Forest fog sunlight rays trees' },
  { category: 'nature', subCategory: 'Snowy Alpine Peaks', query: 'Matterhorn Swiss Alps snow mountain sunset' },
  { category: 'nature', subCategory: 'Ocean Horizon', query: 'Sunset ocean sea beach waves golden' },

  // Space
  { category: 'space', subCategory: 'James Webb Cosmic Views', query: 'James Webb Space Telescope cosmic deep field' },
  { category: 'space', subCategory: 'Andromeda & Star Clusters', query: 'Andromeda galaxy telescope astronomy' },
  { category: 'space', subCategory: 'Solar & Planetary Views', query: 'NASA Earth from space planet atmosphere' }
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function cleanTitle(raw) {
  let title = raw.replace(/^File:/, '')
    .replace(/\.(jpg|jpeg|png|svg|JPG|JPEG|PNG)$/, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (title.length > 55) title = title.substring(0, 52) + '...';
  return title;
}

async function fetchBatch(batch) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
    encodeURIComponent(batch.query) +
    '&gsrnamespace=6&gsrlimit=35&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=600&format=json&origin=*';

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'FlocusStudyDashboard/2.0 (contact: support@flocus.app)' } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.query || !data.query.pages) return [];

    const items = [];
    for (const page of Object.values(data.query.pages)) {
      const info = page.imageinfo?.[0];
      if (!info || !info.url) continue;
      if (info.width && info.width < 800) continue;
      if (info.mime && !info.mime.startsWith('image/')) continue;

      items.push({
        id: 'wiki-' + page.pageid,
        title: cleanTitle(page.title),
        category: batch.category,
        subCategory: batch.subCategory,
        tags: [batch.category, ...batch.query.toLowerCase().split(' ').filter(w => w.length > 3)],
        thumbUrl: info.thumburl || info.url,
        fullUrl: info.url,
        isLocal: false,
        source: 'Wikimedia Commons',
        resolution: `${info.width || 1920}x${info.height || 1080}`,
        aspectRatio: '16:9',
        format: 'jpg'
      });
    }
    return items;
  } catch (err) {
    return [];
  }
}

async function run() {
  for (let i = 0; i < moreBatches.length; i++) {
    const batch = moreBatches[i];
    const results = await fetchBatch(batch);
    let added = 0;
    for (const item of results) {
      if (!seenUrls.has(item.fullUrl)) {
        seenUrls.add(item.fullUrl);
        catalog.push(item);
        added++;
      }
    }
    console.log(`[${i+1}/${moreBatches.length}] ${batch.query}: +${added} (Total: ${catalog.length})`);
    await sleep(400);
  }
  fs.writeFileSync(targetFile, JSON.stringify(catalog, null, 2), 'utf8');
  console.log('Finished pass 2! Total catalog items:', catalog.length);
}

run();
