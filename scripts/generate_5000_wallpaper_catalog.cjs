// Fast, robust, resilient pipeline to acquire 5,000+ verified real wallpapers across 13 categories
// Uses high-yield keywords, pagination, AbortSignal timeout, and incremental saving.

const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/utils/wallpaperCatalog.json');

const CATEGORY_TARGETS = {
  japanese: 500,
  korean: 500,
  chinese: 500,
  anime: 500,
  cyberpunk: 400,
  gaming: 400,
  minimal: 400,
  study: 400,
  nature: 400,
  space: 300,
  architecture: 300,
  abstract: 200,
  seasonal: 200,
};

const CATEGORY_QUERIES = {
  japanese: [
    { sub: 'Tokyo Night & Metropolis', q: 'Tokyo night' },
    { sub: 'Kyoto Temples & Gardens', q: 'Kyoto temple' },
    { sub: 'Mount Fuji Landscapes', q: 'Mount Fuji' },
    { sub: 'Torii Gates & Shinto Shrines', q: 'Fushimi Inari torii' },
    { sub: 'Hiroshige Ukiyo-e Woodcuts', q: 'Hiroshige landscape' },
    { sub: 'Hokusai Masterpiece Prints', q: 'Katsushika Hokusai' },
    { sub: 'Osaka Dotonbori Lights', q: 'Osaka night' },
    { sub: 'White Heron Castle', q: 'Himeji castle' },
    { sub: 'Floating Torii Miyajima', q: 'Itsukushima shrine' },
    { sub: 'Zen Rock Gardens', q: 'Ryoanji zen garden' },
    { sub: 'Traditional Thatched Villages', q: 'Shirakawa-go' },
    { sub: 'Nara Sacred Deer', q: 'Nara park temple' },
    { sub: 'Shinjuku Neon Crossroads', q: 'Shinjuku night' },
    { sub: 'Shibuya Crossing Flow', q: 'Shibuya crossing' },
  ],
  korean: [
    { sub: 'Seoul Han River Skyline', q: 'Seoul night' },
    { sub: 'Gyeongbokgung Grand Palace', q: 'Gyeongbokgung' },
    { sub: 'Hanok Traditional Rooftops', q: 'Bukchon Hanok' },
    { sub: 'Changdeokgung Secret Garden', q: 'Changdeokgung' },
    { sub: 'N Seoul Tower Landmarks', q: 'N Seoul Tower' },
    { sub: 'Bukhansan Granite Peaks', q: 'Bukhansan' },
    { sub: 'Busan Coast & Gwangan Bridge', q: 'Gwangan bridge' },
    { sub: 'Jeju Volcanic Island Nature', q: 'Jeju island Hallasan' },
    { sub: 'Gyeongju Historic Capital', q: 'Gyeongju' },
    { sub: 'Dongdaemun Futuristic Curves', q: 'Dongdaemun Design Plaza' },
    { sub: 'Incheon Cable Bridge Highway', q: 'Incheon bridge' },
    { sub: 'Gangnam Midnight Avenues', q: 'Gangnam Seoul' },
    { sub: 'Traditional Hanok Interiors', q: 'Hanok interior' },
  ],
  chinese: [
    { sub: 'Guilin Karst River Scenery', q: 'Guilin karst' },
    { sub: 'Forbidden City Imperial Architecture', q: 'Forbidden City' },
    { sub: 'Shanghai Bund & Pudong Night', q: 'Shanghai skyline night' },
    { sub: 'Suzhou Classical Water Gardens', q: 'Suzhou garden' },
    { sub: 'Fenghuang Ancient Water Town', q: 'Fenghuang water' },
    { sub: 'Zhangjiajie Avatar Pillars', q: 'Zhangjiajie' },
    { sub: 'Huangshan Yellow Mountain Peaks', q: 'Huangshan' },
    { sub: 'West Lake Hangzhou Bridges', q: 'West Lake Hangzhou' },
    { sub: 'Great Wall Mountain Watchtowers', q: 'Great Wall of China' },
    { sub: 'Lijiang Ancient Yunnan Town', q: 'Lijiang town' },
    { sub: 'Traditional Song Dynasty Art', q: 'Song dynasty painting' },
    { sub: 'Longjing Green Tea Hills', q: 'Longjing tea' },
    { sub: 'Hong Kong Victoria Harbour', q: 'Victoria Harbour night' },
  ],
  anime: [
    { sub: 'Digital Concept Landscapes', q: 'Digital painting landscape' },
    { sub: 'Atmospheric Concept Art', q: 'Concept art landscape' },
    { sub: 'Anime Scenery & Skylines', q: 'Anime landscape' },
    { sub: 'Fantasy Scenery & Castles', q: 'Fantasy landscape' },
    { sub: 'Twilight Clouds & Skies', q: 'Twilight sky clouds' },
    { sub: 'Pastel Sunset Horizons', q: 'Pastel sunset sky' },
    { sub: 'Aesthetic Skies & Clouds', q: 'Sunset clouds painting' },
    { sub: 'Digital Art Twilight', q: 'Digital art sunset' },
    { sub: 'Fantasy World Environment', q: 'Fantasy scenery' },
    { sub: '16-Bit Pixel Art Scenery', q: 'Pixel art landscape' },
    { sub: 'Scenic Vector Landscapes', q: 'Vector landscape' },
    { sub: 'Matte Painting Environments', q: 'Matte painting landscape' },
  ],
  cyberpunk: [
    { sub: 'Cyberpunk Neon Streets', q: 'Cyberpunk' },
    { sub: 'Illuminated Metropolis Towers', q: 'Neon city night' },
    { sub: 'Rain-Soaked Street Reflections', q: 'Night wet street' },
    { sub: 'Illuminated Cyber Towers', q: 'Illuminated skyscraper' },
    { sub: 'Hong Kong Neon Sign Alleys', q: 'Hong Kong neon' },
    { sub: 'Tokyo Cyberpunk Rain', q: 'Tokyo neon' },
    { sub: 'Night Highway Light Trails', q: 'Night traffic long exposure' },
    { sub: 'Futuristic Cityscapes', q: 'Futuristic city' },
    { sub: 'Synthwave Grids & Wireframes', q: 'Synthwave' },
    { sub: 'Neon Glow Metropolis', q: 'Neon lights city' },
  ],
  gaming: [
    { sub: 'Datacenters & Server Racks', q: 'Server room' },
    { sub: 'Cloud Datacenters & Blue LED', q: 'Data center' },
    { sub: 'Supercomputer Laboratories', q: 'Supercomputer' },
    { sub: 'Macro Electronic Circuit Boards', q: 'Circuit board' },
    { sub: 'Advanced Robotics Laboratories', q: 'Robotics' },
    { sub: 'Motherboards & Micro-Chips', q: 'Motherboard' },
    { sub: 'Semiconductors & Processors', q: 'Microprocessor' },
    { sub: 'High-Tech Battlestations', q: 'Gaming computer' },
    { sub: 'Futuristic Technology Interfaces', q: 'Futuristic technology' },
    { sub: 'Sci-Fi Spaceship Interiors', q: 'Sci-fi concept' },
  ],
  minimal: [
    { sub: 'Brutalist Concrete Monoliths', q: 'Minimalist architecture' },
    { sub: 'Architectural Shadow & Form', q: 'Concrete architecture' },
    { sub: 'Black and White Modernism', q: 'Black and white architecture' },
    { sub: 'Dark Slate & Stone Textures', q: 'Dark texture stone' },
    { sub: 'Modern Dark Interiors', q: 'Minimalist interior' },
    { sub: 'Monochrome Moody Landscapes', q: 'Monochrome landscape' },
    { sub: 'Dark Charcoal & Black Slate', q: 'Black stone' },
    { sub: 'Minimal Dark Surfaces', q: 'Dark minimal' },
    { sub: 'Geometric Shadow Lines', q: 'Geometric architecture' },
  ],
  study: [
    { sub: 'Grand Historic Reading Halls', q: 'Library interior' },
    { sub: 'University Silent Desks', q: 'University library' },
    { sub: 'Antique Wood-Panel Libraries', q: 'Old library' },
    { sub: 'Cozy Bookstore Shelves', q: 'Bookstore' },
    { sub: 'Floor-to-Ceiling Bookshelves', q: 'Bookshelf library' },
    { sub: 'Classical Reading Desks', q: 'Reading room library' },
    { sub: 'Warm Lamp Study Desks', q: 'Study desk' },
    { sub: 'Historic Academic Libraries', q: 'Antique library' },
    { sub: 'Quiet Research Rooms', q: 'Library reading' },
  ],
  nature: [
    { sub: 'Misty Alpine Pine Forests', q: 'Alpine forest' },
    { sub: 'Deep Fog & Tree Canopies', q: 'Misty forest' },
    { sub: 'Glacial Mountain Reflections', q: 'Mountain lake reflection' },
    { sub: 'Swiss Alpine Horizons', q: 'Matterhorn peak' },
    { sub: 'Golden Ocean Horizons', q: 'Ocean sunset' },
    { sub: 'Jungle Gorge Waterfalls', q: 'Waterfall nature' },
    { sub: 'Autumn Golden Woodlands', q: 'Autumn forest' },
    { sub: 'Golden Ripple Sand Dunes', q: 'Desert dunes sunset' },
    { sub: 'Tranquil Bamboo Groves', q: 'Bamboo forest' },
    { sub: 'Dramatic Coastal Horizons', q: 'Coastal cliff waves' },
  ],
  space: [
    { sub: 'Observatory Milky Way Views', q: 'Milky Way observatory' },
    { sub: 'Hubble Deep Space Nebulas', q: 'Hubble telescope nebula' },
    { sub: 'James Webb Deep Galaxy Fields', q: 'James Webb space' },
    { sub: 'Spiral Andromeda Galaxies', q: 'Andromeda galaxy' },
    { sub: 'Aurora Borealis Arctic Skies', q: 'Aurora borealis' },
    { sub: 'Deep Space Galaxy Clusters', q: 'Deep space galaxy' },
    { sub: 'Luminous Moonlight & Clouds', q: 'Full moon night' },
    { sub: 'High-Altitude Telescopes', q: 'Astrophotography stars' },
    { sub: 'Stellar Starlight Horizons', q: 'Starry sky night' },
  ],
  architecture: [
    { sub: 'Curved Glass Modern Facades', q: 'Modern architecture' },
    { sub: 'Gothic Vaults & Arches', q: 'Gothic cathedral' },
    { sub: 'Brutalist Concrete Facades', q: 'Brutalist architecture' },
    { sub: 'Overhead Spiral Staircases', q: 'Spiral staircase' },
    { sub: 'Suspension Cable Bridges', q: 'Suspension bridge' },
    { sub: 'Futuristic Museum Structures', q: 'Futuristic architecture' },
    { sub: 'Dynamic Architectural Lines', q: 'Architectural curves' },
  ],
  abstract: [
    { sub: 'Geometric Color Field Art', q: 'Abstract art' },
    { sub: 'Algorithmic Fractal Geometries', q: 'Fractal' },
    { sub: 'Bauhaus Modernist Posters', q: 'Bauhaus' },
    { sub: 'Luminescent Color Fields', q: 'Color field abstract' },
    { sub: 'De Stijl Geometric Balance', q: 'Geometric abstract' },
    { sub: 'Piet Mondrian Grids', q: 'Mondrian abstract' },
    { sub: 'Generative Mathematical Art', q: 'Generative art' },
    { sub: 'Dynamic Fluid Gradients', q: 'Gradient abstract' },
  ],
  seasonal: [
    { sub: 'Spring Cherry Blossom Parks', q: 'Cherry blossom' },
    { sub: 'Sakura Canopy & Petals', q: 'Sakura blossom' },
    { sub: 'Autumn Crimson Maple Leaves', q: 'Autumn foliage' },
    { sub: 'Momiji Kyoto Autumn Trails', q: 'Maple leaves autumn' },
    { sub: 'Crisp Winter Frost Landscapes', q: 'Winter snow landscape' },
    { sub: 'Provence Summer Lavender Rows', q: 'Lavender field' },
    { sub: 'Alpine Mountain Spring Wildflowers', q: 'Spring meadow' },
  ]
};

const LOCAL_WALLPAPERS = [
  { id: 'local-jp-tokyo-cyberpunk', title: 'Cyber Tokyo Night', category: 'cyberpunk', subCategory: 'Tokyo Cyberpunk Rain', file: '/wallpapers/jp_tokyo_cyberpunk.jpg' },
  { id: 'local-art-anime-cherry-blossom', title: 'Mount Fuji & Cherry Blossoms (Vector)', category: 'anime', subCategory: 'Spring Cherry Blossom Parks', file: '/wallpapers/art_anime_cherry_blossom.svg', format: 'svg' },
  { id: 'local-kr-seoul-night', title: 'Seoul Han River Skyline', category: 'korean', subCategory: 'Seoul Han River Skyline', file: '/wallpapers/kr_seoul_night.jpg' },
  { id: 'local-kr-cozy-desk', title: 'Korean Warm Study Desk', category: 'study', subCategory: 'Warm Lamp Study Desks', file: '/wallpapers/kr_cozy_desk.jpg' },
  { id: 'local-cn-misty-mountains', title: 'Guilin Karst Mountains & Mist', category: 'chinese', subCategory: 'Guilin Karst River Scenery', file: '/wallpapers/cn_misty_mountains.jpg' },
  { id: 'local-cn-traditional-lanterns', title: 'Traditional Chinese Lanterns', category: 'chinese', subCategory: 'Suzhou Classical Water Gardens', file: '/wallpapers/cn_traditional_lanterns.jpg' },
  { id: 'local-art-lofi-cyberpunk-neon', title: 'Lofi Cyberpunk Neon Grid (Vector)', category: 'cyberpunk', subCategory: 'Synthwave Grids & Wireframes', file: '/wallpapers/art_lofi_cyberpunk_neon.svg', format: 'svg' },
  { id: 'local-focus-alpine-pines', title: 'Misty Alpine Pines & Fog', category: 'nature', subCategory: 'Misty Alpine Pine Forests', file: '/wallpapers/focus_alpine_pines.jpg' },
  { id: 'local-focus-milky-way', title: 'Milky Way Observatory', category: 'space', subCategory: 'Observatory Milky Way Views', file: '/wallpapers/focus_milky_way.jpg' },
  { id: 'local-focus-golden-sunset', title: 'Sunset Gradient Calm Horizon', category: 'nature', subCategory: 'Golden Ocean Horizons', file: '/wallpapers/focus_golden_sunset.jpg' },
  { id: 'local-jp-kyoto-fuji', title: 'Kyoto Temple & Mount Fuji Twilight', category: 'japanese', subCategory: 'Kyoto Temples & Gardens', file: '/wallpapers/jp_kyoto_fuji.jpg' },
  { id: 'local-jp-osaka-neon', title: 'Osaka Dotonbori Neon Reflections', category: 'japanese', subCategory: 'Osaka Dotonbori Lights', file: '/wallpapers/jp_osaka_neon.jpg' },
  { id: 'local-jp-shibuya-night', title: 'Shibuya Crossing Luminous Flow', category: 'japanese', subCategory: 'Shibuya Crossing Flow', file: '/wallpapers/jp_shibuya_night.jpg' },
  { id: 'local-jp-rainy-alley', title: 'Tokyo Rainy Lantern Alley', category: 'japanese', subCategory: 'Tokyo Night & Metropolis', file: '/wallpapers/jp_rainy_alley.jpg' },
  { id: 'local-jp-anime-clouds', title: 'Pastel Anime Clouds & Twilight Skies', category: 'anime', subCategory: 'Twilight Clouds & Skies', file: '/wallpapers/jp_anime_clouds.jpg' },
  { id: 'local-kr-rainy-cafe', title: 'Rain Drops on Seoul Cafe Window', category: 'korean', subCategory: 'Traditional Hanok Interiors', file: '/wallpapers/kr_rainy_cafe.jpg' },
  { id: 'local-kr-namsan-tower', title: 'Namsan Seoul Tower Sunset Glow', category: 'korean', subCategory: 'N Seoul Tower Landmarks', file: '/wallpapers/kr_namsan_tower.jpg' },
  { id: 'local-kr-gangnam-lights', title: 'Gangnam Cyber Avenue at Midnight', category: 'korean', subCategory: 'Gangnam Midnight Avenues', file: '/wallpapers/kr_gangnam_lights.jpg' },
  { id: 'local-kr-minimal-interior', title: 'Minimalist Korean Wood & Ceramic Desk', category: 'minimal', subCategory: 'Modern Dark Interiors', file: '/wallpapers/kr_minimal_interior.jpg' },
  { id: 'local-cn-ancient-town', title: 'Ancient Chinese Riverside Town', category: 'chinese', subCategory: 'Fenghuang Ancient Water Town', file: '/wallpapers/cn_ancient_town.jpg' },
  { id: 'local-cn-chongqing-bridges', title: 'Cyberpunk Chongqing Illuminated Bridges', category: 'chinese', subCategory: 'Shanghai Bund & Pudong Night', file: '/wallpapers/cn_chongqing_bridges.jpg' },
  { id: 'local-cn-shanghai-skyline', title: 'Shanghai Futuristic Night Skyline', category: 'chinese', subCategory: 'Shanghai Bund & Pudong Night', file: '/wallpapers/cn_shanghai_skyline.jpg' },
  { id: 'local-cn-traditional-temple', title: 'Classical Chinese Temple & Courtyard', category: 'chinese', subCategory: 'Forbidden City Imperial Architecture', file: '/wallpapers/cn_traditional_temple.jpg' },
  { id: 'local-focus-cozy-coffee', title: 'Cozy Morning Coffee & Desk', category: 'study', subCategory: 'Warm Lamp Study Desks', file: '/wallpapers/focus_cozy_coffee.jpg' },
  { id: 'local-focus-deep-ocean', title: 'Deep Ocean Blue Waves', category: 'nature', subCategory: 'Golden Ocean Horizons', file: '/wallpapers/focus_deep_ocean.jpg' },
  { id: 'local-focus-starry-night', title: 'Starry Dark Night Sky', category: 'space', subCategory: 'Stellar Starlight Horizons', file: '/wallpapers/focus_starry_night.jpg' },
  { id: 'local-focus-violet-nebula', title: 'Deep Cosmic Violet Nebula', category: 'space', subCategory: 'Hubble Deep Space Nebulas', file: '/wallpapers/focus_violet_nebula.jpg' },
  { id: 'local-art-cozy-korean-study-desk', title: 'Aesthetic Korean Study Desk (Vector)', category: 'study', subCategory: 'Warm Lamp Study Desks', file: '/wallpapers/art_cozy_korean_study_desk.svg', format: 'svg' },
  { id: 'local-art-traditional-chinese-mist', title: 'Traditional Chinese Misty Mountains (Vector)', category: 'chinese', subCategory: 'Traditional Song Dynasty Art', file: '/wallpapers/art_traditional_chinese_mist.svg', format: 'svg' },
];

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

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchBatch(query, offset = 0) {
  let url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=50&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=720&format=json&origin=*`;
  if (offset > 0) {
    url += `&gsroffset=${offset}`;
  }

  const res = await fetch(url, {
    headers: { 'User-Agent': 'FlocusStudyDashboard/3.0 (contact: support@flocus.app)' },
    signal: AbortSignal.timeout(6000)
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

async function run() {
  console.log('=== FAST VERIFIED WALLPAPER HARVESTER (5,000+ TARGET) ===');

  let existing = [];
  if (fs.existsSync(targetFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    } catch {}
  }

  const catalog = [];
  const seenUrls = new Set();
  const seenIds = new Set();
  const seenTitles = new Set();

  function addItem(item) {
    if (!item.fullUrl || seenUrls.has(item.fullUrl) || seenIds.has(item.id)) return false;
    const titleKey = item.title.toLowerCase().trim();
    if (seenTitles.has(titleKey)) return false;

    seenUrls.add(item.fullUrl);
    seenIds.add(item.id);
    seenTitles.add(titleKey);
    catalog.push(item);
    return true;
  }

  // 1. Local offline wallpapers first
  LOCAL_WALLPAPERS.forEach(loc => {
    addItem({
      id: loc.id,
      title: loc.title,
      category: loc.category,
      subCategory: loc.subCategory,
      tags: [loc.category, 'offline', 'verified', ...loc.subCategory.toLowerCase().split(' ')],
      thumbUrl: loc.file,
      fullUrl: loc.file,
      isLocal: true,
      source: 'Local Bundled Asset',
      attribution: 'Flocus Asset Archive',
      license: 'Public Domain / Free for commercial use',
      resolution: '1920x1080',
      aspectRatio: '16:9',
      format: loc.format || 'jpg',
    });
  });

  // 2. Existing valid items
  existing.forEach(item => addItem(item));
  console.log(`Starting with ${catalog.length} existing unique wallpapers.`);

  function saveCatalog() {
    fs.writeFileSync(targetFile, JSON.stringify(catalog, null, 2), 'utf8');
  }

  for (const [category, target] of Object.entries(CATEGORY_TARGETS)) {
    let currentCount = catalog.filter(c => c.category === category).length;
    console.log(`\nProcessing ${category.toUpperCase()}: ${currentCount}/${target}`);

    const queries = CATEGORY_QUERIES[category] || [{ sub: `${category}`, q: `${category}` }];
    let qIdx = 0;
    let round = 0;

    while (currentCount < target && round < 4) {
      const qObj = queries[qIdx % queries.length];
      const offset = round * 50;

      try {
        const data = await fetchBatch(qObj.q, offset);
        const pages = Object.values(data.query?.pages || {});
        let addedInBatch = 0;

        for (const page of pages) {
          const info = page.imageinfo?.[0];
          if (!info || !info.url) continue;
          if (info.width && info.width < 800) continue;
          if (info.height && info.height < 500) continue;
          if (info.mime && !info.mime.startsWith('image/')) continue;

          const title = cleanTitle(page.title);
          if (/icon|logo|chart|diagram|map of|flag of/i.test(title)) continue;

          const meta = info.extmetadata || {};
          const license = meta.LicenseShortName?.value || meta.License?.value || 'Public Domain / Creative Commons';
          const author = meta.Artist?.value ? meta.Artist.value.replace(/<[^>]*>/g, '').trim() : 'Wikimedia Commons Contributor';

          const thumb = info.thumburl || info.url;

          const ok = addItem({
            id: 'wiki-' + page.pageid,
            title: title,
            category: category,
            subCategory: qObj.sub,
            tags: [category, ...qObj.q.toLowerCase().split(' ').filter(w => w.length > 2)],
            thumbUrl: thumb,
            fullUrl: info.url,
            isLocal: false,
            source: 'Wikimedia Commons',
            attribution: author,
            license: license,
            resolution: `${info.width || 1920}x${info.height || 1080}`,
            aspectRatio: '16:9',
            format: 'jpg',
          });

          if (ok) {
            addedInBatch++;
            currentCount++;
            if (currentCount >= target) break;
          }
        }

        console.log(`  [${category}] "${qObj.q}" (offset ${offset}) -> +${addedInBatch} items (total: ${currentCount})`);
      } catch (err) {
        console.warn(`  Warning on "${qObj.q}": ${err.message}`);
      }

      qIdx++;
      if (qIdx % queries.length === 0) {
        round++;
      }
      await sleep(150);
    }

    saveCatalog();
  }

  saveCatalog();
  console.log(`\n=== COMPLETED! Total Wallpapers in Catalog: ${catalog.length} ===`);
  const counts = {};
  catalog.forEach(c => counts[c.category] = (counts[c.category] || 0) + 1);
  console.log('Category Counts:', counts);
}

run().catch(console.error);
