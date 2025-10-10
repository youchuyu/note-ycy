export class AsyncQueue {
  private queue: (() => Promise<void>)[] = []; // 存储异步任务的队列
  private running = false; // 标记是否有任务正在执行

  /**
   * 添加任务到队列
   * @param task 一个返回 Promise 的函数
   */
  add(task: () => Promise<void>): void {
    this.queue.push(task); // 将任务添加到队列
    if (!this.running) {
      this.processQueue(); // 如果当前没有任务运行，开始处理队列
    }
  }

  /**
   * 处理队列中的任务
   */
  private async processQueue(): Promise<void> {
    if (this.running) return; // 防止重复处理队列

    this.running = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift(); // 获取队列的第一个任务
      if (task) {
        try {
          await task(); // 执行任务
        } catch (error) {
          console.error("Task failed:", error); // 捕获任务错误
        }
      }
    }

    this.running = false; // 队列处理完毕
  }
}
