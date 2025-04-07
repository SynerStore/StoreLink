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

export const isEmpty = (value: any) => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true;
  }
  return false;
};
