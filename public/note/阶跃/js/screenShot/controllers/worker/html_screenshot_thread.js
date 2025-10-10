import workerpool from 'workerpool';
import puppeteer from 'puppeteer';

let browser;
let htmlPage;

const initPage = async () => {
  const start = performance.now();
  browser = await puppeteer.launch({
    headless: true,
    // executablePath: isProd ? '/app/cache/puppeteer' : undefined,
  });
  htmlPage = await browser.newPage();
  await htmlPage.setCacheEnabled(false);
  console.log('initPage dur===>', performance.now() - start);
};

const DEFAULT_VIEW_WIDTH = 750;
const DEFAULT_VIEW_HEIGHT = 480;
const DEFAULT_VIEW_SCALE = 1;

const takeHtmlStrScreenshot = async ({ url, html, screenshotParams = {}, value = '{}' }) => {
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

  if (!htmlPage) {
    await initPage();
  }

  let pageInfo = htmlPage;
  if (pageInfo == null) {
    throw new Error('no available page');
  }

  const t2 = performance.now();

  try {
    await htmlPage.setViewport({
      width: width,
      height: height,
      deviceScaleFactor: scale,
    });

    const t3 = performance.now();

    const t4 = performance.now();

    await htmlPage.setContent(html);

    const t5 = performance.now();

    // waitForFunction是轮询执行
    await htmlPage.waitForFunction(
      () => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.every((img) => img.complete);
      },
      { timeout: 10000 },
    ); // 设置一个合理的超时时间，比如 3 秒

    const t6 = performance.now();

    const screenshotType = transparent === true ? 'png' : 'jpeg';

    const screenshotBuffer = await htmlPage.screenshot({
      optimizeForSpeed: true,
      fullPage: !fromView,
      fromSurface: true,
      type: screenshotType,
      omitBackground: transparent,
    });

    const t7 = performance.now();

    console.log('takeHtmlStrScreenshot===>', [
      t2 - t1,
      t3 - t2,
      t4 - t3,
      t5 - t4,
      t6 - t5,
      t7 - t6,
    ]);

    return screenshotBuffer.toJSON();
  } catch (error) {
    throw error;
  }
};

// create a worker and register public functions
workerpool.worker({
  takeHtmlStrScreenshot,
});
