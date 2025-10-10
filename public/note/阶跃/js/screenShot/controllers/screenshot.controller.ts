import { DEFAULT_VIEW_HEIGHT, DEFAULT_VIEW_SCALE, DEFAULT_VIEW_WIDTH } from '@/constant.js';
import { isProd } from '@/utils/env.js';
import { getLeastUsedPage, htmlPage, PageInfo, pagerAsyncAllocator } from '@/utils/PageManager.js';
import { testResult } from '@/utils/writeTestResult.js';
import { Context } from 'koa';
import { getPool } from './worker/index.js';
import { Page } from 'puppeteer';

interface CreateScreenshotRequest {
  url: string;
  screenshotParams: {
    width?: number;
    height?: number;
    scale?: number;
    fromView?: boolean;
    transparent?: boolean;
  };
  value?: string;
}
interface CreateHtmlScreenshotRequest {
  html: string;
  url?: string;
  screenshotParams: {
    width?: number;
    height?: number;
    scale?: number;
    fromView?: boolean;
    transparent?: boolean;
  };
  value?: string;
  isMainThread?: boolean;
}

export class ScreenshotController {
  static async takeScreenshot({
    url,
    screenshotParams = {},
    value = '{}',
  }: CreateScreenshotRequest) {
    const {
      width = DEFAULT_VIEW_WIDTH,
      height = DEFAULT_VIEW_HEIGHT,
      scale = DEFAULT_VIEW_SCALE,
      fromView,
      transparent,
    } = screenshotParams;

    console.log('==ScreenshotController==url:', url);
    console.log('==ScreenshotController==screenshotParams:', screenshotParams);
    console.log('==ScreenshotController==vals:', value, typeof value);

    const t1 = performance.now();

    let pageInfo = getLeastUsedPage(url);
    if (pageInfo == null) {
      throw new Error('no available page');
    }
    pageInfo?.startUsing();
    let page = pageInfo.getPage();

    const t2 = performance.now();

    try {
      await page.setViewport({
        width: width,
        height: height,
        deviceScaleFactor: scale,
      });

      const t3 = performance.now();

      await page.evaluate((_vals: string) => {
        window.__VALUES__ = _vals;
      }, value);

      await page.evaluateOnNewDocument((_vals: string) => {
        window.__VALUES__ = _vals;
      }, value);

      const t4 = performance.now();

      const currentUrl = page.url();

      // console.log('==lin==ScreenshotController', url, 'currentUrl', currentUrl);

      if (currentUrl !== url) {
        await page.goto(url, { waitUntil: 'networkidle0' });
      } else {
        await page.evaluate(() => location.reload());
        await page.waitForNetworkIdle();
      }

      // console.log('==lin==ScreenshotController load page done');
      const t5 = performance.now();

      // waitForFunction是轮询执行
      await page.waitForFunction(
        () => {
          const imgs = Array.from(document.querySelectorAll('img'));
          return imgs.every((img) => img.complete);
        },
        { timeout: 10000 },
      ); // 设置一个合理的超时时间，比如 3 秒

      // console.log('==lin==ScreenshotController ready for screenshot');
      const t6 = performance.now();

      const screenshotType = transparent === true ? 'png' : 'jpeg';

      const screenshotBuffer = await page.screenshot({
        optimizeForSpeed: true,
        fullPage: !fromView,
        fromSurface: true,
        type: screenshotType,
        omitBackground: transparent,
      });

      const t7 = performance.now();

      await page.evaluate(() => {
        delete window.__VALUES__;
      });

      console.log('takeScreenshot===>', [
        pageInfo.getInfo().createTime,
        t2 - t1,
        t3 - t2,
        t4 - t3,
        t5 - t4,
        t6 - t5,
        t7 - t6,
      ]);

      if (!isProd) {
        testResult.push({
          url,
          timeSpend: [t2 - t1, t3 - t2, t4 - t3, t5 - t4, t6 - t5, t7 - t6],
        });
      }

      pageInfo.stopUsing();
      return screenshotBuffer;
    } catch (error) {
      pageInfo.stopUsing();
      throw error;
    }
  }
  static async takeHtmlStrScreenshot({
    url,
    html,
    screenshotParams = {},
    value = '{}',
  }: CreateScreenshotRequest & { html: string }) {
    const {
      width = DEFAULT_VIEW_WIDTH,
      height = DEFAULT_VIEW_HEIGHT,
      scale = DEFAULT_VIEW_SCALE,
      fromView,
      transparent,
    } = screenshotParams;

    console.log('==ScreenshotController==url:', url);
    console.log('==ScreenshotController==screenshotParams:', screenshotParams);
    console.log('==ScreenshotController==vals:', value);

    const t1 = performance.now();

    let pageInfo = htmlPage;
    if (pageInfo == null) {
      throw new Error('no available page');
    }
    pageInfo?.startUsing();
    let page = pageInfo.getPage();

    const t2 = performance.now();

    try {
      await page.setViewport({
        width: width,
        height: height,
        deviceScaleFactor: scale,
      });

      const t3 = performance.now();

      const t4 = performance.now();

      await page.setContent(html);

      console.log('==lin==ScreenshotController load page done');
      const t5 = performance.now();

      // waitForFunction是轮询执行
      await page.waitForFunction(
        () => {
          const imgs = Array.from(document.querySelectorAll('img'));
          return imgs.every((img) => img.complete);
        },
        { timeout: 10000 },
      ); // 设置一个合理的超时时间，比如 3 秒

      console.log('==lin==ScreenshotController ready for screenshot');
      const t6 = performance.now();

      const screenshotType = transparent === true ? 'png' : 'jpeg';

      const screenshotBuffer = await page.screenshot({
        optimizeForSpeed: true,
        fullPage: !fromView,
        fromSurface: true,
        type: screenshotType,
        omitBackground: transparent,
      });

      const t7 = performance.now();

      await page.evaluate(() => {
        delete window.__VALUES__;
      });

      console.log('takeHtmlStrScreenshot===>', [
        pageInfo.getInfo().createTime,
        t2 - t1,
        t3 - t2,
        t4 - t3,
        t5 - t4,
        t6 - t5,
        t7 - t6,
      ]);

      if (!isProd) {
        testResult.push({
          url,
          timeSpend: [t2 - t1, t3 - t2, t4 - t3, t5 - t4, t6 - t5, t7 - t6],
        });
      }

      pageInfo.stopUsing();
      return screenshotBuffer;
    } catch (error) {
      pageInfo.stopUsing();
      throw error;
    }
  }

  static async createScreenshot(ctx: Context) {
    const { request } = ctx;

    console.log('request===>', request.body);

    if (!request.body || typeof request.body !== 'object') {
      throw new Error('missing request body');
    }

    const body = request.body as CreateScreenshotRequest;

    if (!body.url) {
      throw new Error('missing target url');
    }

    const screenshotBuffer = await pagerAsyncAllocator(() =>
      ScreenshotController.takeScreenshot(body),
    );

    ctx.body = JSON.stringify({
      imageStream: screenshotBuffer,
    });
  }

  static async createScreenshotV2(ctx: Context) {
    const { request } = ctx;

    if (!request.body || typeof request.body !== 'object') {
      throw new Error('missing request body');
    }

    const body = request.body as CreateScreenshotRequest;

    if (!body.url) {
      throw new Error('missing target url');
    }

    const screenshotBuffer = await pagerAsyncAllocator(() =>
      ScreenshotController.takeScreenshot(body),
    );
    const screenshotType = body.screenshotParams.transparent === true ? 'png' : 'jpeg';

    ctx.res.writeHead(200, {
      'Content-Type': 'image/' + screenshotType,
      'Content-Length': screenshotBuffer.length,
    });
    ctx.res.end(screenshotBuffer);
  }

  static async createScreenshotByHtml(ctx: Context) {
    const { request } = ctx;

    if (!request.body || typeof request.body !== 'object') {
      throw new Error('missing request body');
    }

    const body = request.body as CreateHtmlScreenshotRequest;

    try {
      if (!body.html) {
        throw new Error('missing target html');
      }

      let screenshotBufferJson;

      if (!body?.isMainThread) {
        const curPool = getPool(body?.url ?? '');
        screenshotBufferJson = await curPool.exec('takeHtmlStrScreenshot', [
          {
            ...body,
            url: body?.url ?? '',
            screenshotParams: { transparent: true },
          },
        ]);
      } else {
        const screenshotBuffer = await ScreenshotController.takeHtmlStrScreenshot({
          ...body,
          url: body?.url ?? '',
          screenshotParams: { transparent: true },
        });
        screenshotBufferJson = screenshotBuffer.toJSON();
      }

      ctx.body = {
        imageStream: screenshotBufferJson,
      };
    } catch (e) {
      console.error('createScreenshotByHtml err', e);
    }
  }
}
