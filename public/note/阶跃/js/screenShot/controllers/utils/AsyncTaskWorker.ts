export function createAsyncWorker(calcCapacity: (count: number) => boolean) {
  // 执行中(运行中 + pending)任务数量
  let count = 0;
  // pending 队列
  const queue: ((value?: unknown) => void)[] = [];

  return async (fn: () => Promise<any>) => {
    count++;

    const isVacant = calcCapacity(count);

    if (!isVacant) {
      await new Promise((resolve) => {
        queue.push(resolve);
      });
    }

    const finallyStep = () => {
      count--;
      if (queue.length) {
        const r = queue.shift();
        r?.();
      }
    };

    return fn()
      .then((res) => {
        finallyStep();
        return res;
      })
      .catch((e) => {
        finallyStep();
        throw e;
      });
  };
}
