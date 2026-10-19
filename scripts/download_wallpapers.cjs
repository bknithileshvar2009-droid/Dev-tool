// Script to download and generate verified local wallpaper assets in public/wallpapers/
const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.resolve(__dirname, '../public/wallpapers');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. Download verified high-res wallpapers from Unsplash for guaranteed local offline availability
const downloads = [
  { file: 'jp_tokyo_cyberpunk.jpg', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80' },
  { file: 'jp_kyoto_fuji.jpg', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1920&q=80' },
  { file: 'jp_shibuya_night.jpg', url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1920&q=80' },
  { file: 'jp_rainy_alley.jpg', url: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=1920&q=80' },
  { file: 'jp_anime_clouds.jpg', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1920&q=80' },
  { file: 'kr_seoul_night.jpg', url: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1920&q=80' },
  { file: 'kr_cozy_desk.jpg', url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1920&q=80' },
  { file: 'kr_rainy_cafe.jpg', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1920&q=80' },
  { file: 'cn_misty_mountains.jpg', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80' },
  { file: 'cn_traditional_lanterns.jpg', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80' },
  { file: 'cn_shanghai_skyline.jpg', url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1920&q=80' },
  { file: 'focus_alpine_pines.jpg', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80' },
  { file: 'focus_milky_way.jpg', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80' },
  { file: 'focus_golden_sunset.jpg', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1920&q=80' },
  { file: 'focus_violet_nebula.jpg', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1920&q=80' }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status ' + res.statusCode));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(resolve); });
    }).on('error', reject);
  });
}

// 2. Generate local pristine high-resolution SVG artwork that work 100% offline with zero dependencies
const svgArtworks = [
  {
    file: 'art_anime_cherry_blossom.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e1338"/>
          <stop offset="35%" stop-color="#3b1d5a"/>
          <stop offset="65%" stop-color="#732b6c"/>
          <stop offset="85%" stop-color="#d65d7a"/>
          <stop offset="100%" stop-color="#f8a58b"/>
        </linearGradient>
        <linearGradient id="fujiGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f3f4f6"/>
          <stop offset="25%" stop-color="#93c5fd"/>
          <stop offset="60%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
        <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stop-color="#ffe4e6" stop-opacity="1"/>
          <stop offset="40%" stop-color="#f43f5e" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#881337" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- Sky -->
      <rect width="1920" height="1080" fill="url(#skyGrad)"/>
      <!-- Glowing Sun -->
      <circle cx="960" cy="560" r="140" fill="url(#sunGlow)"/>
      <circle cx="960" cy="560" r="100" fill="#fff1f2" opacity="0.9"/>
      <!-- Mount Fuji Silhouette -->
      <polygon points="560,780 840,420 1080,420 1360,780 1600,1080 320,1080" fill="url(#fujiGrad)"/>
      <!-- Snowy Cap highlight -->
      <polygon points="840,420 960,420 1000,470 1040,440 1080,420 1140,500 1060,540 960,510 880,550 820,490" fill="#ffffff" opacity="0.95"/>
      <!-- Distant Hills & Pine Layers -->
      <path d="M0 750 Q 480 700 960 760 T 1920 730 L 1920 1080 L 0 1080 Z" fill="#131124" opacity="0.85"/>
      <path d="M0 830 Q 520 780 1040 850 T 1920 810 L 1920 1080 L 0 1080 Z" fill="#0b0914"/>
      <!-- Foreground Pagoda & Cherry Branches -->
      <g fill="#07060d">
        <!-- Pagoda on left hill -->
        <rect x="180" y="650" width="100" height="180"/>
        <path d="M120 730 Q 230 710 340 730 L 320 710 Q 230 690 140 710 Z"/>
        <path d="M140 670 Q 230 650 320 670 L 300 650 Q 230 630 160 650 Z"/>
        <path d="M160 610 Q 230 590 300 610 L 280 590 Q 230 570 180 590 Z"/>
        <polygon points="230,510 225,580 235,580"/>
      </g>
      <!-- Cherry Blossom Petals -->
      <g fill="#fbcfe8" opacity="0.85">
        <ellipse cx="400" cy="450" rx="8" ry="4" transform="rotate(25 400 450)"/>
        <ellipse cx="520" cy="520" rx="7" ry="4" transform="rotate(-35 520 520)"/>
        <ellipse cx="780" cy="380" rx="9" ry="5" transform="rotate(15 780 380)"/>
        <ellipse cx="1200" cy="420" rx="8" ry="4" transform="rotate(45 1200 420)"/>
        <ellipse cx="1450" cy="560" rx="7" ry="4" transform="rotate(-20 1450 560)"/>
        <ellipse cx="1650" cy="480" rx="9" ry="5" transform="rotate(30 1650 480)"/>
        <ellipse cx="320" cy="620" rx="6" ry="3" transform="rotate(60 320 620)"/>
        <ellipse cx="890" cy="670" rx="8" ry="4" transform="rotate(-15 890 670)"/>
        <ellipse cx="1320" cy="640" rx="7" ry="4" transform="rotate(10 1320 640)"/>
      </g>
    </svg>`
  },
  {
    file: 'art_lofi_cyberpunk_neon.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#05030a"/>
          <stop offset="60%" stop-color="#0f0920"/>
          <stop offset="100%" stop-color="#180b33"/>
        </linearGradient>
        <linearGradient id="neonFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#080512"/>
          <stop offset="100%" stop-color="#020105"/>
        </linearGradient>
        <linearGradient id="cyanNeon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#0080ff" stop-opacity="0.2"/>
        </linearGradient>
        <linearGradient id="pinkNeon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff007f"/>
          <stop offset="100%" stop-color="#7000ff"/>
        </linearGradient>
      </defs>
      <!-- Dark City Sky -->
      <rect width="1920" height="720" fill="url(#nightSky)"/>
      <!-- Wet Reflective Street Floor -->
      <rect y="720" width="1920" height="360" fill="url(#neonFloor)"/>
      <!-- Grid Perspective Floor Lines -->
      <g stroke="#00f0ff" stroke-width="1" opacity="0.2">
        <line x1="960" y1="720" x2="0" y2="1080"/>
        <line x1="960" y1="720" x2="300" y2="1080"/>
        <line x1="960" y1="720" x2="600" y2="1080"/>
        <line x1="960" y1="720" x2="800" y2="1080"/>
        <line x1="960" y1="720" x2="960" y2="1080"/>
        <line x1="960" y1="720" x2="1120" y2="1080"/>
        <line x1="960" y1="720" x2="1320" y2="1080"/>
        <line x1="960" y1="720" x2="1620" y2="1080"/>
        <line x1="960" y1="720" x2="1920" y2="1080"/>
      </g>
      <!-- Distant Skyscrapers & Neon Windows -->
      <g fill="#0b0717">
        <rect x="120" y="240" width="140" height="480"/>
        <rect x="300" y="160" width="180" height="560"/>
        <rect x="520" y="300" width="160" height="420"/>
        <rect x="720" y="180" width="220" height="540"/>
        <rect x="980" y="220" width="200" height="500"/>
        <rect x="1220" y="140" width="190" height="580"/>
        <rect x="1450" y="260" width="170" height="460"/>
        <rect x="1660" y="200" width="160" height="520"/>
      </g>
      <!-- Neon Billboards & Japanese Glyphs -->
      <rect x="320" y="180" width="60" height="120" fill="url(#pinkNeon)" opacity="0.9" rx="4"/>
      <rect x="750" y="220" width="160" height="40" fill="#00f0ff" opacity="0.85" rx="4"/>
      <rect x="1250" y="160" width="50" height="180" fill="#a855f7" opacity="0.9" rx="4"/>
      <rect x="1480" y="290" width="110" height="50" fill="#f43f5e" opacity="0.85" rx="4"/>
      <!-- Atmospheric Rain Streaks -->
      <g stroke="#ffffff" stroke-width="0.8" opacity="0.25">
        <line x1="200" y1="100" x2="180" y2="220"/>
        <line x1="450" y1="200" x2="430" y2="340"/>
        <line x1="720" y1="120" x2="700" y2="280"/>
        <line x1="940" y1="300" x2="920" y2="440"/>
        <line x1="1180" y1="80" x2="1160" y2="240"/>
        <line x1="1400" y1="220" x2="1380" y2="380"/>
        <line x1="1680" y1="140" x2="1660" y2="290"/>
        <line x1="320" y1="420" x2="300" y2="560"/>
        <line x1="840" y1="480" x2="820" y2="620"/>
        <line x1="1310" y1="450" x2="1290" y2="600"/>
        <line x1="1600" y1="400" x2="1580" y2="540"/>
      </g>
      <!-- Wet Road Light Reflections -->
      <ellipse cx="350" cy="800" rx="80" ry="12" fill="#ff007f" opacity="0.35"/>
      <ellipse cx="830" cy="840" rx="140" ry="18" fill="#00f0ff" opacity="0.4"/>
      <ellipse cx="1275" cy="810" rx="90" ry="14" fill="#a855f7" opacity="0.35"/>
      <ellipse cx="1535" cy="830" rx="110" ry="16" fill="#f43f5e" opacity="0.35"/>
    </svg>`
  },
  {
    file: 'art_traditional_chinese_mist.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <linearGradient id="inkPaper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#090d14"/>
          <stop offset="50%" stop-color="#0f1622"/>
          <stop offset="100%" stop-color="#141c2c"/>
        </linearGradient>
        <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stop-color="#fef3c7" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="#d97706" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- Background Canvas -->
      <rect width="1920" height="1080" fill="url(#inkPaper)"/>
      <!-- Soft Full Moon -->
      <circle cx="1400" cy="280" r="160" fill="url(#moonGlow)"/>
      <circle cx="1400" cy="280" r="100" fill="#fffbeb" opacity="0.85"/>
      <!-- Karst Mountain Layers (Chinese Ink Wash Style) -->
      <!-- Distant Layer -->
      <path d="M 0 600 Q 350 320 620 540 T 1200 480 Q 1550 280 1920 580 L 1920 1080 L 0 1080 Z" fill="#1b2537" opacity="0.4"/>
      <!-- Middle Layer -->
      <path d="M 120 700 Q 420 380 780 660 T 1480 540 Q 1700 400 1920 680 L 1920 1080 L 0 1080 Z" fill="#151e2d" opacity="0.7"/>
      <!-- Foreground Layer -->
      <path d="M 0 780 Q 280 500 580 740 T 1140 680 Q 1500 460 1920 790 L 1920 1080 L 0 1080 Z" fill="#0d131d"/>
      <!-- Misty river reflections -->
      <path d="M 0 880 Q 480 840 960 890 T 1920 860 L 1920 1080 L 0 1080 Z" fill="#080c13"/>
      <!-- Traditional Chinese Roof Silhouette & Pine Branch -->
      <g fill="#040609">
        <!-- Elegant Pavilion Roof on right cliff -->
        <path d="M1520 620 Q 1680 560 1840 620 L 1800 600 Q 1680 540 1560 600 Z"/>
        <path d="M1560 560 Q 1680 510 1800 560 L 1780 545 Q 1680 500 1580 545 Z"/>
        <polygon points="1680,450 1675,505 1685,505"/>
        <rect x="1620" y="620" width="120" height="120"/>
        <!-- Pine Tree silhouette on left -->
        <path d="M0 640 Q 140 600 240 660 Q 300 710 380 690"/>
        <ellipse cx="220" cy="630" rx="60" ry="20" fill="#040609"/>
        <ellipse cx="320" cy="670" rx="70" ry="25" fill="#040609"/>
        <ellipse cx="140" cy="590" rx="50" ry="18" fill="#040609"/>
      </g>
      <!-- Red Lantern glow -->
      <circle cx="1640" cy="650" r="14" fill="#ef4444"/>
      <circle cx="1720" cy="650" r="14" fill="#ef4444"/>
    </svg>`
  },
  {
    file: 'art_cozy_korean_study_desk.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <linearGradient id="warmWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#140e10"/>
          <stop offset="70%" stop-color="#211516"/>
          <stop offset="100%" stop-color="#2a1a1c"/>
        </linearGradient>
        <radialGradient id="deskLampGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stop-color="#fef3c7" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- Warm Room Wall -->
      <rect width="1920" height="1080" fill="url(#warmWall)"/>
      <!-- Window Frame overlooking Seoul Night -->
      <rect x="240" y="120" width="640" height="540" fill="#090814" rx="8" stroke="#3d2c2e" stroke-width="8"/>
      <!-- City Bokeh outside window -->
      <g opacity="0.6">
        <circle cx="340" cy="380" r="18" fill="#38bdf8"/>
        <circle cx="480" cy="420" r="24" fill="#f43f5e"/>
        <circle cx="620" cy="350" r="28" fill="#facc15"/>
        <circle cx="750" cy="460" r="16" fill="#a855f7"/>
        <circle cx="410" cy="490" r="22" fill="#34d399"/>
        <circle cx="560" cy="520" r="20" fill="#fb923c"/>
        <circle cx="690" cy="400" r="25" fill="#f472b6"/>
      </g>
      <!-- Rain droplets on glass -->
      <g stroke="#ffffff" stroke-width="1.2" opacity="0.35">
        <line x1="320" y1="180" x2="318" y2="240"/>
        <line x1="450" y1="220" x2="449" y2="290"/>
        <line x1="580" y1="160" x2="578" y2="260"/>
        <line x1="720" y1="200" x2="719" y2="280"/>
        <line x1="380" y1="360" x2="379" y2="440"/>
        <line x1="640" y1="380" x2="639" y2="470"/>
      </g>
      <!-- Desk Surface -->
      <rect y="680" width="1920" height="400" fill="#1b1213"/>
      <rect y="680" width="1920" height="24" fill="#291c1d"/>
      <!-- Warm Lamp Glow on Desk -->
      <circle cx="1450" cy="540" r="420" fill="url(#deskLampGlow)"/>
      <!-- Lamp Fixture -->
      <g fill="#e2e8f0" stroke="#0f172a" stroke-width="4">
        <!-- Base -->
        <rect x="1540" y="660" width="120" height="20" rx="4" fill="#334155"/>
        <!-- Arm -->
        <path d="M1600 660 L 1580 440 L 1450 420" fill="none" stroke="#64748b" stroke-width="8"/>
        <!-- Shade -->
        <polygon points="1410,400 1490,440 1400,480" fill="#f8fafc"/>
        <!-- Bulb light center -->
        <circle cx="1440" cy="450" r="12" fill="#fef08a"/>
      </g>
      <!-- Open Study Notebook & Stationery -->
      <g fill="#f8fafc" stroke="#334155" stroke-width="2">
        <polygon points="980,720 1280,710 1310,850 1000,865" fill="#fdfbf7"/>
        <line x1="1145" y1="715" x2="1155" y2="858" stroke="#cbd5e1" stroke-width="3"/>
      </g>
      <!-- Coffee Mug -->
      <rect x="880" y="730" width="50" height="60" rx="6" fill="#f1f5f9"/>
      <path d="M930 740 Q 955 755 930 770" fill="none" stroke="#f1f5f9" stroke-width="6"/>
      <!-- Laptop on left -->
      <rect x="420" y="670" width="280" height="15" rx="3" fill="#64748b"/>
      <polygon points="440,540 680,540 700,670 420,670" fill="#0f172a"/>
      <rect x="455" y="555" width="210" height="100" fill="#0284c7" opacity="0.6"/>
    </svg>`
  }
];

// Write SVG files
svgArtworks.forEach(item => {
  const dest = path.join(targetDir, item.file);
  fs.writeFileSync(dest, item.svg, 'utf8');
  console.log('Created local SVG wallpaper:', item.file);
});

// Download verified images
async function runDownloads() {
  for (const item of downloads) {
    const dest = path.join(targetDir, item.file);
    if (!fs.existsSync(dest) || fs.statSync(dest).size < 10000) {
      try {
        console.log('Downloading:', item.file, 'from', item.url.slice(0, 50));
        await download(item.url, dest);
        console.log('Done:', item.file, fs.statSync(dest).size, 'bytes');
      } catch (err) {
        console.error('Failed to download:', item.file, err.message);
      }
    } else {
      console.log('Already exists:', item.file, fs.statSync(dest).size, 'bytes');
    }
  }
  console.log('All local wallpapers processed!');
}

runDownloads();
