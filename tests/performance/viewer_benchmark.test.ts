import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';

// Mock dependencies BEFORE imports
vi.mock('electron-store', () => {
  return {
    default: class {
      store = {};
      get(key: string) { return this.store[key]; }
      set(key: string, val: any) { this.store[key] = val; }
    }
  };
});

// Mock storeManage completely to avoid loading DB
vi.mock('../../src/main/stores/storeManage', () => {
  return {
    getStoreConfig: vi.fn(),
    storePool: new Map(),
  };
});

// Mock sqlite to avoid DB connection
vi.mock('../../src/main/db/sqlite', () => {
  return {
    default: {
      prepare: () => ({ all: () => [] }),
    }
  };
});

// Mock TaskManager to avoid circular deps and DB
vi.mock('../../src/main/tasks/manage', () => {
  return {
    default: {
      getInstance: () => ({}),
    }
  };
});

// Now import the modules under test
import { TaskScheduler } from '../../src/main/tasks/scheduler';
import { getSourceUrl } from '../../src/main/stores/adapters/local/api';
import * as StoreManage from '../../src/main/stores/storeManage';

describe('Viewer Performance Benchmark', () => {
  let tempDir: string;
  let testFilePath: string;
  const CONNECTION_ID = 'test-local-conn';

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'synerstore-perf-'));
    testFilePath = path.join(tempDir, 'large-test-file.txt');
    // Create a 5MB text file
    const content = 'A'.repeat(1024 * 1024 * 5);
    await fs.writeFile(testFilePath, content);

    // Setup mock config
    (StoreManage.getStoreConfig as any).mockReturnValue({
      type: 'local',
      config: { root: tempDir },
    });
  });

  afterAll(async () => {
    await fs.remove(tempDir);
    vi.restoreAllMocks();
  });

  it('should benchmark Main Process execution', async () => {
    const start = performance.now();
    const result = await getSourceUrl({ key: testFilePath });
    const end = performance.now();

    expect(result.content.length).toBe(1024 * 1024 * 5);
    console.log(`[Main Process] getSourceUrl duration: ${(end - start).toFixed(2)}ms`);
  });

  it('should verify TaskScheduler logic (Mocked Worker)', async () => {
    const scheduler = TaskScheduler.getInstance();

    // Spy on piscina run to avoid actual worker spawning in test env
    // @ts-ignore
    const runSpy = vi.spyOn(scheduler.piscina, 'run').mockImplementation(async (task) => {
      // Simulate worker serialization/deserialization delay
      await new Promise(r => setTimeout(r, 10));
      // Execute the logic directly (simulating worker execution)
      return {
        data: await getSourceUrl({ key: testFilePath })
      };
    });

    const start = performance.now();
    const result = await scheduler.executeWorkerTask({
      connectionId: CONNECTION_ID,
      method: 'getSourceUrl',
      params: { key: testFilePath }
    });
    const end = performance.now();

    expect(result.data.content.length).toBe(1024 * 1024 * 5);
    console.log(`[Worker Process (Simulated)] getSourceUrl duration: ${(end - start).toFixed(2)}ms`);

    runSpy.mockRestore();
  });
});
