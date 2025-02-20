import { promises as fs } from 'fs';

const DOMAIN = process.env.SITE_URL || 'https://ashe.tn';
const lastmod = new Date().toISOString();

const PAGES = [
  { url: '/', lastmod, changefreq: 'monthly', priority: '1.0' },
  { url: '/products', lastmod, changefreq: 'monthly', priority: '0.8' },
  { url: '/about', lastmod, changefreq: 'monthly', priority: '0.7' },
  { url: '/contact', lastmod, changefreq: 'monthly', priority: '0.7' }
];

function generateSiteMap() {
  const urls = PAGES.map(({ url, lastmod, changefreq, priority }) => {
    return `
  <url>
    <loc>${DOMAIN}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function SiteMap() {
  // This component is only used to trigger getServerSideProps.
  return null;
}

export async function getServerSideProps({ res }) {
  try {
    const sitemap = generateSiteMap();

    // Set appropriate headers and cache for one day.
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    
    res.write(sitemap);
    res.end();

    return { props: {} };
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.statusCode = 500;
    res.end();
    return { props: {} };
  }
}

export default SiteMap;
