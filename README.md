# Price Monitoring System (Free)

Monitor competitor prices for **$0/month**. No paid tools, no subscriptions.

## How It Works

```
Sitemap XML → Product URLs → JSON-LD Prices → GitHub Storage → Webhook Alerts
```

1. **Discover products** via XML sitemaps (every e-commerce site has one)
2. **Extract prices** from JSON-LD structured data (embedded by 80% of stores for Google)
3. **Store daily snapshots** in GitHub (free, versioned, with API)
4. **Alert on changes** via Discord/Slack webhook

## Quick Start

```bash
npm install axios xml2js cheerio @octokit/rest
node monitor.js
```

## vs Paid Tools

| Feature | This (Free) | Prisync ($99/mo) | Competera ($1000+/mo) |
|---------|-------------|-------------------|----------------------|
| Price tracking | ✅ | ✅ | ✅ |
| Change alerts | ✅ | ✅ | ✅ |
| Price history | ✅ (git) | ✅ | ✅ |
| Product matching | Manual | Auto | Auto + AI |
| Dashboard | DIY | Built-in | Built-in |
| **Cost** | **$0** | **$1,188/yr** | **$12,000+/yr** |

## Architecture

```javascript
// 1. Get product URLs from sitemap
const urls = await getProductUrls('competitor.com');

// 2. Extract prices via JSON-LD
const prices = await Promise.all(urls.map(getPrice));

// 3. Compare with yesterday
const changes = detectChanges(prices, yesterday);

// 4. Save & notify
await savePriceData(prices);
if (changes.length) await notify(changes);
```

## Full Tutorial

📖 [I Built a Price Monitoring System in 30 Minutes — Here's the Stack](https://dev.to/0012303/i-built-a-price-monitoring-system-in-30-minutes-heres-the-stack-all-free-apis-1cg6)

## Related Projects

- [77 Web Scraping Tools](https://github.com/spinov001-art/awesome-web-scraping-2026) — Free API-first scrapers
- [API Scraping Templates](https://github.com/spinov001-art/api-scraping-templates) — 20+ ready-to-use Python templates
- [250+ Dev.to Tutorials](https://dev.to/0012303) — Web scraping, APIs, automation

## Need Custom Data Extraction?

📧 Spinov001@gmail.com | [Hire me](https://spinov001-art.github.io)

## License

MIT
