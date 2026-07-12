import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // During build-time (e.g., on Vercel), generate static SEO & monetization assets
  const pubId = process.env.ADSENSE_PUBLISHER_ID || process.env.VITE_ADSENSE_PUBLISHER_ID || 'pub-1234567890123456';
  const appUrl = (process.env.APP_URL || 'https://ai-resource-hub-ind.vercel.app').replace(/\/$/, '');
  
  // Ensure the public directory exists
  const publicDir = path.resolve(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Generate ads.txt
  const adsTxtContent = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;
  fs.writeFileSync(path.join(publicDir, 'ads.txt'), adsTxtContent);

  // 2. Generate robots.txt
  const robotsTxtContent = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${appUrl}/sitemap.xml
`;
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxtContent);

  // 3. Generate sitemap.xml
  const today = new Date().toISOString().split('T')[0];
  const sitemapXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${appUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${appUrl}/?tab=trends</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${appUrl}/?tab=apps</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${appUrl}/?tab=courses</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXmlContent);

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          const verificationCode = process.env.GOOGLE_SITE_VERIFICATION || process.env.VITE_GOOGLE_SITE_VERIFICATION || 'la3aWrlQmZwc9Uzi5z7UdgpgQlqcn7mfYpVQHiItmsE';
          let modifiedHtml = html.replace(/%GOOGLE_SITE_VERIFICATION%/g, verificationCode);
          
          const activePubId = process.env.ADSENSE_PUBLISHER_ID || process.env.VITE_ADSENSE_PUBLISHER_ID;
          if (activePubId && activePubId.trim() !== '' && activePubId !== 'pub-1234567890123456') {
            const adsenseScript = `\n    <!-- Google AdSense -->\n    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${activePubId}" crossorigin="anonymous"></script>\n`;
            modifiedHtml = modifiedHtml.replace('</head>', `${adsenseScript}  </head>`);
          }
          return modifiedHtml;
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
