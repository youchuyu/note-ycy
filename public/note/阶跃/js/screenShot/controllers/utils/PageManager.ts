import { POOL_SIZE, CLOSE_PAGE_INTERVAL, PAGE_REUSE_LIMIT } from '@/constant.js';
import puppeteer, { Browser, Page } from 'puppeteer';
import { createAsyncWorker } from './AsyncTaskWorker.js';
import { isProd } from './env.js';

let browser: Browser;
// Puppeteer 浏览器实例，以及页面池
const pagePool: PageInfo[] = [];

export let htmlPage: PageInfo;

let invalidPageCount = 0;

export class PageInfo {
  /**
   * 对应 page 实例
   */
  private page: Page;
  /**
   * 是否正在使用中
   */
  private inUse: boolean;
  /**
   * 是否正在销毁中
   */
  private destroying: boolean;
  /**
   * 使用次数
   */
  private reuseCount: number;
  /**
   * 上次使用时间
   */
  private lastUsed: number;

  /**
   * 上次使用时间
   */
  private createTime: number;

  constructor(page: Page) {
    this.page = page;
    this.inUse = false;
    this.destroying = false;
    this.lastUsed = Date.now();
    this.createTime = Date.now();
    this.reuseCount = 0;
  }

  getPage() {
    return this.page;
  }

  getInfo() {
    return {
      inUse: this.inUse,
      reuseCount: this.reuseCount,
      lastUsed: this.lastUsed,
      destroying: this.destroying,
      createTime: this.createTime,
    };
  }

  startUsing() {
    this.setInfo({
      inUse: true,
    });
  }

  stopUsing() {
    this.setInfo({
      inUse: false,
      lastUsed: Date.now(),
    });
  }

  setInfo(params: {
    page?: Page;
    inUse?: boolean;
    reuseCount?: number;
    lastUsed?: number;
    destroying?: boolean;
  }) {
    if (
      (params.inUse !== undefined && params.inUse !== this.inUse) ||
      (params.destroying !== undefined && params.destroying !== this.destroying)
    ) {
      const isInvalid = Boolean(params.inUse) || Boolean(params.destroying);
      // 更新全局 invalidPageCount
      invalidPageCount = invalidPageCount + (isInvalid ? 1 : -1);
    }

    this.page = params.page ?? this.page;
    this.inUse = params.inUse ?? this.inUse;
    this.destroying = params.destroying ?? this.destroying;
    this.reuseCount = params.reuseCount ?? this.reuseCount;
    this.lastUsed = params.lastUsed ?? this.lastUsed;
  }
}

// 初始化 Puppeteer 浏览器和页面池
export async function startBrowser() {
  browser = await puppeteer.launch({
    headless: true,
    // executablePath: isProd ? '/app/cache/puppeteer' : undefined,
  });

  const page = await browser.newPage();
  const pageInfo = new PageInfo(page);
  htmlPage = pageInfo;

  for (let i = 0; i < POOL_SIZE; i++) {
    const page = await browser.newPage();
    const pageInfo = new PageInfo(page);
    pagePool.push(pageInfo);
  }

  // 定时检查销毁更新
  setInterval(async () => {
    for (let i = 0; i < pagePool.length; i++) {
      const pageInfo = pagePool[i];
      const page = pageInfo.getPage();
      const { lastUsed, inUse, reuseCount } = pageInfo.getInfo();
      const isOldPage = Date.now() - lastUsed > CLOSE_PAGE_INTERVAL;
      const highUsage = reuseCount >= PAGE_REUSE_LIMIT;

      if (!inUse && (isOldPage || highUsage)) {
        pageInfo.setInfo({
          destroying: true,
        });

        await page.close();
        const newPage = await browser.newPage();

        pageInfo.setInfo({
          destroying: false,
        });
        pagePool[i] = new PageInfo(newPage);
      }
    }
  }, CLOSE_PAGE_INTERVAL);
}

function calcCapacity(runningCount: number) {
  return POOL_SIZE - invalidPageCount > 0;
}

// 如果传入 url，以相同 url 的 page 优先
export function getLeastUsedPage(url?: string) {
  let pageInfo: PageInfo | undefined;
  for (let item of pagePool) {
    const info = item.getInfo();
    const page = item.getPage();
    if (info.inUse || info.destroying) {
      continue;
    }
    if (!pageInfo || pageInfo.getInfo().lastUsed > info.lastUsed) {
      pageInfo = item;
    }

    if (page.url() === url) {
      // 直接返回
      return pageInfo;
    }
  }
  return pageInfo;
}

// 分配器，控制对 page 实例的分配
export const pagerAsyncAllocator = createAsyncWorker(calcCapacity);
