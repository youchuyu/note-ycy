import path from "path";
import workerpool from "workerpool";
import { fileURLToPath } from "url";
import Pool from "workerpool/types/Pool.js";
import { generateUUID } from "../utils/uuid.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MAX_THREADS = 3;

export const createPool = () => {
  const pool = workerpool.pool(
    path.resolve(__dirname, "./html_screenshot_thread.js"),
    {
      maxWorkers: 1,
      workerType: "thread",
    }
  );

  const id = generateUUID();

  poolMap.set(id, pool);

  return { pool, id };
};

// 获取最少使用的线程池id
const getLeastUsedPoolId = () => {
  const ids = [...poolMap.keys()];

  // 线程未用满，创建新线程池
  if (ids.length < MAX_THREADS) return createPool().id;

  // 获取最少使用的线程池id
  const entries = [...pool2HtmlMap.entries()];

  let leastUsedIdCount: number | null = null;
  let leastUsedId: string | null = null;

  ids.forEach((id) => {
    let count = 0;
    entries.map((entry) => {
      if (entry[1] === id) {
        count++;
      }
    });
    if (!leastUsedIdCount || count < leastUsedIdCount) {
      leastUsedIdCount = count;
      console.log(leastUsedIdCount);
      leastUsedId = id;
    }
  });

  if (!leastUsedId) leastUsedId = ids[0] as string;
  return leastUsedId;
};

export const getPool = (url: string): Pool => {
  let poolId = pool2HtmlMap.get(url);

  if (!poolId) {
    poolId = getLeastUsedPoolId();
    pool2HtmlMap.set(url, poolId);
  }

  const pool = poolMap.get(poolId) as Pool;

  return pool;
};

// 键为poolId，值为pool
export const poolMap = new Map<string, Pool>();

// 键为url，值为对应的poolId
export const pool2HtmlMap = new Map<string, string>();
