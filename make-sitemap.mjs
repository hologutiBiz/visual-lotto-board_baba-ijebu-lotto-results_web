import { readdirSync, writeFileSync } from 'fs';

const host = 'https://premier-lotto-babaijebu-results.visuallottoboard.com';
const games = readdirSync('games').filter(f => f.endsWith('.html')).sort();
const pages = ['/', '/game-schedule.html', ...games.map(f => `/games/${f}`)];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url><loc>${host}${p}</loc></url>`).join('\n')}
</urlset>
`;
writeFileSync('sitemap.xml', xml);