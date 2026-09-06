import express from 'express';
import Category from '../models/Category.js';
import GameAccount from '../models/GameAccount.js';

const router = express.Router();

const BASE_URL = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.replace(/\/$/, '')
  : 'https://luanhuynhfc.shop';

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, priority, changefreq, lastmod = null) {
  let entry = `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <priority>${priority}</priority>\n    <changefreq>${changefreq}</changefreq>`;
  if (lastmod) {
    entry += `\n    <lastmod>${lastmod}</lastmod>`;
  }
  entry += `\n  </url>\n`;
  return entry;
}

router.get('/sitemap.xml', async (req, res) => {
  try {
    const [categories, accounts] = await Promise.all([
      Category.find({ isActive: true }).sort({ order: 1 }).select('slug updatedAt'),
      GameAccount.find({ status: 'available' })
        .sort({ createdAt: -1 })
        .limit(1000)
        .select('_id createdAt')
    ]);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static pages
    xml += urlEntry(`${BASE_URL}/`, '1.0', 'daily');
    xml += urlEntry(`${BASE_URL}/shop`, '0.9', 'daily');
    xml += urlEntry(`${BASE_URL}/cart`, '0.6', 'weekly');
    xml += urlEntry(`${BASE_URL}/checkout`, '0.6', 'weekly');

    // Category pages
    for (const cat of categories) {
      if (cat.slug) {
        xml += urlEntry(`${BASE_URL}/shop/${cat.slug}`, '0.8', 'daily');
      }
    }

    // Account pages
    for (const acc of accounts) {
      const lastmod = acc.createdAt
        ? new Date(acc.createdAt).toISOString().split('T')[0]
        : null;
      xml += urlEntry(`${BASE_URL}/account/${acc._id}`, '0.7', 'weekly', lastmod);
    }

    xml += '</urlset>\n';

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // cache 1h
    res.send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).send('Server Error');
  }
});

export default router;
