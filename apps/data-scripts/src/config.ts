import process from 'node:process';

const CrawlRegions = process.env.CRAWL_REGIONS?.trim()?.split(',');

if (!CrawlRegions?.length) {
  throw new Error('CRAWL_REGIONS is not set');
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
const pageSize = process.env.CRAWL_PAGE_SIZE;

const config = {
  crawlRegions: CrawlRegions,
  crawlInterval: Number(ScriptCrawlInterval),
  tk87Cookie: TK87Cookie,
  pageSize: Number(pageSize || 200),
  startPage: Number(startPage || 1),
};

export default config;
