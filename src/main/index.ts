import path from 'path';
import Module from 'module';
import { app } from 'electron';

if (process.env.NODE_ENV !== 'development') {
  // 为打包环境添加 NODE_PATH 并初始化模块路径
  // @ts-ignore
  process.env.NODE_PATH = path.join(__dirname, 'node_modules');
  try {
    // @ts-ignore
    if (Module && Module.Module && typeof Module.Module._initPaths === 'function') {
      // @ts-ignore
      Module.Module._initPaths();
    } else if (typeof (Module as any)._initPaths === 'function') {
      // @ts-ignore
      (Module as any)._initPaths();
    }
  } catch {}
}

if (app && app.isPackaged) {
  const paths = [
    path.join(process.resourcesPath, 'node_modules'),
    path.join(process.resourcesPath, 'app', 'node_modules'),
    path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules'),
  ];
  // @ts-ignore
  Module.globalPaths.push(...paths);
}
import Core from './core';

const core = new Core();
core.startApp();
