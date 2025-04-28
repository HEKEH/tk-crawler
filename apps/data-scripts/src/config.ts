import process from 'node:process';

const CrawlRegion = process.env.CRAWL_REGION;

if (!CrawlRegion) {
  throw new Error('CRAWL_REGION is not set');
}

const ScriptCrawlInterval = process.env.SCRIPT_CRAWL_INTERVAL;

if (!ScriptCrawlInterval) {
  throw new Error('SCRIPT_CRAWL_INTERVAL is not set');
}

const TK87Cookie = process.env.TK87_COOKIE;

if (!TK87Cookie) {
  throw new Error('TK87_COOKIE is not set');
}

const startPage = process.env.CRAWL_START_PAGE;

const config = {
  crawlRegion: CrawlRegion,
  crawlInterval: Number(ScriptCrawlInterval),
  tk87Cookie: TK87Cookie,
  startPage: Number(startPage || 1),
};

export default config;
