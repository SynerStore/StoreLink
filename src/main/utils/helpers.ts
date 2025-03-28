// sleep
export async function sleep(ms: number, condition?: () => boolean) {
  // 有条件时，循环等待
  if (condition) {
    while (!condition()) {
      console.log('condition', condition());
      await sleep(ms);
    }
  }

  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 串行执行异步任务
export async function runTasksSequentially(tasks: Promise<any>[]) {
  try {
    const results = [];
    for (const task of tasks) {
      const result = await task;
      results.push(result);
    }
    return results;
  } catch (err) {
    return Promise.reject(err);
  }
}
