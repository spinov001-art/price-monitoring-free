const axios = require('axios');
const { parseStringPromise } = require('xml2js');
const cheerio = require('cheerio');

// Step 1: Find product URLs via sitemap
async function getProductUrls(domain) {
  const { data } = await axios.get(`https://${domain}/sitemap.xml`);
  const parsed = await parseStringPromise(data);
  return parsed.urlset.url
    .map(u => u.loc[0])
    .filter(url => url.includes('/product') || url.includes('/item'));
}

// Step 2: Extract price from JSON-LD structured data
async function getPrice(url) {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PriceBot/1.0)' },
    timeout: 10000
  });
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    try {
      const data = JSON.parse($(scripts[i]).html());
      if (data['@type'] === 'Product' && data.offers) {
        return {
          name: data.name,
          price: parseFloat(data.offers.price || data.offers.lowPrice),
          currency: data.offers.priceCurrency,
          availability: data.offers.availability,
          url
        };
      }
    } catch (e) { continue; }
  }
  return null;
}

// Step 3: Detect changes
function detectChanges(today, yesterday) {
  const changes = [];
  for (const product of today) {
    const prev = yesterday.find(p => p.url === product.url);
    if (prev && prev.price !== product.price) {
      changes.push({
        name: product.name,
        oldPrice: prev.price,
        newPrice: product.price,
        change: ((product.price - prev.price) / prev.price * 100).toFixed(1) + '%',
        url: product.url
      });
    }
  }
  return changes;
}

// Step 4: Notify via webhook
async function notify(changes, webhookUrl) {
  if (!webhookUrl || changes.length === 0) return;
  await axios.post(webhookUrl, {
    content: `Price changes detected!\n` +
      changes.map(c => `${c.name}: $${c.oldPrice} → $${c.newPrice} (${c.change})`).join('\n')
  });
}

// Main
async function main() {
  const competitors = process.argv.slice(2);
  if (competitors.length === 0) {
    console.log('Usage: node monitor.js store-a.com store-b.com');
    process.exit(1);
  }

  const allPrices = [];
  for (const domain of competitors) {
    console.log(`Scanning ${domain}...`);
    try {
      const urls = await getProductUrls(domain);
      console.log(`  Found ${urls.length} product pages`);
      for (const url of urls.slice(0, 50)) {
        const price = await getPrice(url);
        if (price) allPrices.push(price);
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
  }

  console.log(`\nTracked ${allPrices.length} products:`);
  allPrices.forEach(p => console.log(`  ${p.name}: ${p.currency} ${p.price}`));

  // Save to local file
  const fs = require('fs');
  const date = new Date().toISOString().split('T')[0];
  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync(`data/${date}.json`, JSON.stringify(allPrices, null, 2));
  console.log(`\nSaved to data/${date}.json`);
}

main().catch(console.error);
