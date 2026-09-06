/**
 * Script sinh logo ngang cho Shop Luan Huynh
 * Chạy: node scripts/generate-logos.js
 *
 * Tạo ảnh logo ngang (horizontal) từ favicon SVG gốc
 * để dùng làm logo header trên website.
 */

import sharp from 'sharp';
import { mkdir, writeFile, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'uploads');
// favicon nằm ở frontend/public/ (cùng cấp server/)
const FAVICON_SVG = join(__dirname, '..', '..', 'frontend', 'public', 'favicon.svg');

// ─────────────────────────────────────────────
// SVG ngang cho logo header (dark background)
// ─────────────────────────────────────────────
const HORIZONTAL_LOGO_SVG = (iconSvg) => `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100" viewBox="0 0 400 100">
  <defs>
    <linearGradient id="lhGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316"/>
      <stop offset="100%" style="stop-color:#f59e0b"/>
    </linearGradient>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&amp;display=swap');
      .brand-text {
        font-family: 'Inter', 'Arial Black', sans-serif;
        font-weight: 900;
        font-size: 28px;
        fill: #ffffff;
        letter-spacing: 1px;
      }
      .brand-text .highlight {
        fill: url(#lhGrad);
      }
    </style>
  </defs>

  <!-- Dark background -->
  <rect width="400" height="100" fill="#0F172A" rx="12"/>

  <!-- Icon area (left) -->
  <g transform="translate(14, 14)">
    ${iconSvg}
  </g>

  <!-- Brand text (right) -->
  <text x="100" y="60" class="brand-text" dominant-baseline="middle">
    <tspan class="highlight">LUAN</tspan><tspan fill="#ffffff">HUYNH</tspan>
  </text>
</svg>
`;

// ─────────────────────────────────────────────
// SVG ngang cho banner danh mục (reusable)
// ─────────────────────────────────────────────
const CATEGORY_BANNER_SVG = (iconSvg, categoryText) => `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="50%" style="stop-color:#16213e"/>
      <stop offset="100%" style="stop-color:#0f3460"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#f97316"/>
      <stop offset="100%" style="stop-color:#f59e0b"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&amp;display=swap');
      .cat-text {
        font-family: 'Inter', 'Arial Black', sans-serif;
        font-weight: 900;
        font-size: 52px;
        fill: #ffffff;
        letter-spacing: 2px;
        filter: url(#glow);
      }
      .sub-text {
        font-family: 'Inter', sans-serif;
        font-weight: 400;
        font-size: 16px;
        fill: #94a3b8;
        letter-spacing: 0.5px;
      }
    </style>
  </defs>

  <!-- Gradient background -->
  <rect width="800" height="300" fill="url(#bg)" rx="16"/>

  <!-- Accent line top -->
  <rect x="0" y="0" width="800" height="4" fill="url(#accent)" rx="4"/>

  <!-- Icon (bottom left) -->
  <g transform="translate(30, 30)">
    ${iconSvg}
  </g>

  <!-- Category text (centered) -->
  <text x="400" y="145" text-anchor="middle" class="cat-text">${categoryText}</text>

  <!-- Subtitle -->
  <text x="400" y="190" text-anchor="middle" class="sub-text">MUA BÁN TÀI KHOẢN GAME - SHOPLUANHUYNH</text>

  <!-- Decorative accent bar -->
  <rect x="340" y="210" width="120" height="4" fill="url(#accent)" rx="2"/>
</svg>
`;

// ─────────────────────────────────────────────
// Extract inner content of favicon SVG (strip <svg> wrapper)
// ─────────────────────────────────────────────
function extractIconContent(svgString) {
  // Remove the outer <svg> tag attributes and wrapper
  return svgString
    .replace(/<\?xml[^>]*\?>/g, '')            // remove XML declaration
    .replace(/<svg[^>]*>/, '')                 // remove opening svg tag
    .replace(/<\/svg>/, '')                    // remove closing svg tag
    .replace(/<!--[\s\S]*?-->/g, '')           // remove comments
    .trim();
}

// ─────────────────────────────────────────────
// Sinh logo header ngang
// ─────────────────────────────────────────────
async function generateLogo() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const faviconRaw = await readFile(FAVICON_SVG, 'utf-8');
  const iconContent = extractIconContent(faviconRaw);

  // Scale icon for logo (from 64x64 to 72x72)
  const scaledIcon = iconContent
    .replace(/width="[^"]*"/, 'width="72"')
    .replace(/height="[^"]*"/, 'height="72"')
    .replace(/viewBox="([^"]*)"/, (_, vb) => `viewBox="${vb}"`);

  const logoSvg = HORIZONTAL_LOGO_SVG(scaledIcon);

  // Save SVG for reference
  await writeFile(join(OUTPUT_DIR, 'logo-header.svg'), logoSvg);
  console.log('✓ logo-header.svg saved');

  // Convert SVG → PNG
  await sharp(Buffer.from(logoSvg))
    .png()
    .toFile(join(OUTPUT_DIR, 'logo-header.png'));
  console.log('✓ logo-header.png saved (400x100)');
}

// ─────────────────────────────────────────────
// Sinh banner danh mục (reusable - đổi text là xong)
// ─────────────────────────────────────────────
async function generateCategoryBanners() {
  await mkdir(join(OUTPUT_DIR, 'banners'), { recursive: true });

  const faviconRaw = await readFile(FAVICON_SVG, 'utf-8');
  const iconContent = extractIconContent(faviconRaw);

  // Scale icon for banner (from 64x64 to 100x100)
  const scaledIcon = iconContent
    .replace(/width="[^"]*"/, 'width="100"')
    .replace(/height="[^"]*"/, 'height="100"');

  const categories = [
    { name: 'ACC CẦU THỦ', file: 'acc-cau-thu.png' },
    { name: 'ACC BP TÙY',   file: 'acc-bp-tuy.png'   },
    { name: 'TÚI MÙ',      file: 'tui-mu.png'        },
    { name: 'ACC FC',       file: 'acc-fc.png'        },
  ];

  for (const cat of categories) {
    const bannerSvg = CATEGORY_BANNER_SVG(scaledIcon, cat.name);
    await writeFile(join(OUTPUT_DIR, 'banners', `${cat.file.replace('.png', '.svg')}`), bannerSvg);

    await sharp(Buffer.from(bannerSvg))
      .png()
      .toFile(join(OUTPUT_DIR, 'banners', cat.file));
    console.log(`✓ banners/${cat.file} saved`);
  }
}

// ─────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────
async function main() {
  try {
    console.log('🎨 Đang sinh logo cho Shop Luan Huynh...\n');
    await generateLogo();
    console.log('');
    await generateCategoryBanners();
    console.log('\n✅ Hoàn tất! Các file trong server/uploads/:');
    console.log('  • logo-header.png          → logo header ngang (400x100)');
    console.log('  • logo-header.svg          → SVG nguồn');
    console.log('  • banners/acc-cau-thu.png → banner danh mục');
    console.log('  • banners/acc-bp-tuy.png');
    console.log('  • banners/tui-mu.png');
    console.log('  • banners/acc-fc.png');
    console.log('\n→ Upload logo-header.png qua admin panel để dùng làm logo website.');
    console.log('→ Banner danh mục upload thủ công hoặc tự động hóa qua API.');
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
}

main();
