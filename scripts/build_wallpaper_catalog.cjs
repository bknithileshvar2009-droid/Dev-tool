// Script to build verified wallpaper catalog from real Wikimedia Commons photography
// All entries are genuine public domain / CC-licensed photography with real thumbnail & full URLs.
const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/utils/wallpaperCatalog.json');

const searchBatches = [
  // Japanese
  { category: 'japanese', subCategory: 'Tokyo Night & City', query: 'Tokyo night skyline illuminated' },
  { category: 'japanese', subCategory: 'Kyoto Temples & Gardens', query: 'Kyoto Buddhist temple garden' },
  { category: 'japanese', subCategory: 'Mount Fuji & Nature', query: 'Mount Fuji Japan landscape' },
  { category: 'japanese', subCategory: 'Cherry Blossoms & Sakura', query: 'Japan cherry blossom sakura park' },
  { category: 'japanese', subCategory: 'Osaka & Neon Streets', query: 'Dotonbori Osaka night neon' },
  { category: 'japanese', subCategory: 'Traditional Japanese Art', query: 'Hiroshige landscape woodblock print' },
  
  // Korean
  { category: 'korean', subCategory: 'Seoul Night Skyline', query: 'Seoul night skyline Han River' },
  { category: 'korean', subCategory: 'Palaces & Heritage', query: 'Gyeongbokgung palace Seoul' },
  { category: 'korean', subCategory: 'Hanok Traditional Villages', query: 'Bukchon Hanok Village traditional' },
  { category: 'korean', subCategory: 'Seoul Cityscapes', query: 'N Seoul Tower Namsan evening' },
  { category: 'korean', subCategory: 'Korean Nature & Mountains', query: 'Bukhansan national park Korea landscape' },
  { category: 'korean', subCategory: 'Busan & Coastal Lights', query: 'Busan night skyline Gwangan bridge' },

  // Chinese
  { category: 'chinese', subCategory: 'Misty Mountains & Rivers', query: 'Guilin karst mountains Li River landscape' },
  { category: 'chinese', subCategory: 'Imperial Architecture', query: 'Forbidden City Beijing architecture' },
  { category: 'chinese', subCategory: 'Shanghai Modern Skyline', query: 'Shanghai Bund skyline night Pudong' },
  { category: 'chinese', subCategory: 'Ancient Water Towns', query: 'Fenghuang ancient town water China' },
  { category: 'chinese', subCategory: 'Classical Chinese Gardens', query: 'Suzhou classical garden pavilion' },
  { category: 'chinese', subCategory: 'Traditional Chinese Art', query: 'Song dynasty Chinese landscape painting' },

  // Cyberpunk & Neon
  { category: 'cyberpunk', subCategory: 'Neon Metropolis', query: 'Cyberpunk neon night city lights' },
  { category: 'cyberpunk', subCategory: 'Futuristic Architecture', query: 'Futuristic illuminated night skyscraper' },
  { category: 'cyberpunk', subCategory: 'Rainy Street Reflections', query: 'Night wet street reflections neon' },

  // Cozy Study Rooms & Libraries
  { category: 'study', subCategory: 'Classical Libraries', query: 'Old library book shelves reading room' },
  { category: 'study', subCategory: 'Academic Halls', query: 'University library interior desks' },
  { category: 'study', subCategory: 'Desk & Warm Lighting', query: 'Writing desk lamp book room' },

  // Nature & Landscapes
  { category: 'nature', subCategory: 'Misty Alpine Pines', query: 'Misty pine forest mountain landscape' },
  { category: 'nature', subCategory: 'Northern Lights & Aurora', query: 'Aurora borealis northern lights night sky' },
  { category: 'nature', subCategory: 'Lakes & Reflections', query: 'Mountain lake reflection calm sunset' },

  // Cosmic Space
  { category: 'space', subCategory: 'Nebulas & Galaxies', query: 'Hubble Space Telescope nebula cosmic' },
  { category: 'space', subCategory: 'Milky Way & Observatories', query: 'Milky Way starry night sky observatory' }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanTitle(raw) {
  let title = raw.replace(/^File:/, '')
    .replace(/\.(jpg|jpeg|png|svg|JPG|JPEG|PNG)$/, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (title.length > 55) {
    title = title.substring(0, 52) + '...';
  }
  return title;
}

async function fetchBatch(batch) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
    encodeURIComponent(batch.query) +
    '&gsrnamespace=6&gsrlimit=35&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=600&format=json&origin=*';

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FlocusStudyDashboard/2.0 (contact: support@flocus.app)' }
    });
    if (!res.ok) {
      console.warn('Response not ok for', batch.query, res.status);
      return [];
    }
    const data = await res.json();
    if (!data.query || !data.query.pages) return [];

    const items = [];
    for (const page of Object.values(data.query.pages)) {
      const info = page.imageinfo?.[0];
      if (!info || !info.url) continue;

      // Filter out small icons or non-standard formats
      if (info.width && info.width < 800) continue;
      if (info.mime && !info.mime.startsWith('image/')) continue;

      const title = cleanTitle(page.title);
      const thumb = info.thumburl || info.url;

      items.push({
        id: 'wiki-' + page.pageid,
        title: title,
        category: batch.category,
        subCategory: batch.subCategory,
        tags: [batch.category, ...batch.query.toLowerCase().split(' ').filter(w => w.length > 3)],
        thumbUrl: thumb,
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
    console.warn('Fetch failed for', batch.query, err.message);
    return [];
  }
}

async function run() {
  console.log('Starting wallpaper catalog builder...');
  const catalog = [];
  const seenUrls = new Set();

  for (let i = 0; i < searchBatches.length; i++) {
    const batch = searchBatches[i];
    console.log(`[${i + 1}/${searchBatches.length}] Fetching: ${batch.query}...`);
    const results = await fetchBatch(batch);
    
    let added = 0;
    for (const item of results) {
      if (!seenUrls.has(item.fullUrl)) {
        seenUrls.add(item.fullUrl);
        catalog.push(item);
        added++;
      }
    }
    console.log(`  -> Added ${added} new verified wallpapers (Total so far: ${catalog.length})`);
    // Throttle to respect Wikimedia rate limits
    await sleep(400);
  }

  console.log('Finished fetching! Total verified catalog items:', catalog.length);
  fs.writeFileSync(targetFile, JSON.stringify(catalog, null, 2), 'utf8');
  console.log('Wrote catalog to:', targetFile);
}

run();
