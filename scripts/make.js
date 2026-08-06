const path = require('path');
const fs = require('fs-extra');
const builder = require('electron-builder');
const cp = require('child_process');
const homedir = require('os').homedir();
const pkg = require('../package.json');

const root_dir = path.normalize(path.join(__dirname, '..'));
const dist_dir = path.normalize(path.join(__dirname, '..', 'dist'));
// 使用 1024px 源，保证 Retina 下图标清晰；icon-512@2x.png 与 icon-512.png 是同一幅画
const macIcon = path.normalize(path.join(__dirname, './assets', 'icons/icon-512@2x.png'));
const winIcon = path.normalize(path.join(__dirname, './assets', 'icons/icon-512@2x.png'));

const APP_NAME = 'StoreLink';

const TARGET_PLATFORMS_configs = {
  mac: {
    mac: ['dmg:x64', 'dmg:arm64'],
  },
  win: {
    win: ['nsis:ia32', 'nsis:x64', 'nsis:arm64', 'portable:x64'],
  },
  linux: {
    linux: ['AppImage:x64', 'AppImage:arm64', 'deb:x64', 'deb:arm64'],
  },
  all: {
    mac: ['dmg:x64', 'dmg:arm64', 'zip:universal'],
    win: ['nsis:ia32', 'nsis:x64', 'nsis:arm64', 'portable:x64', 'zip:x64' /* , 'appx:x64'*/],
    linux: ['AppImage:x64', 'AppImage:arm64', 'deb:x64', 'deb:arm64'],
  },
};

const cfg_common = {
  copyright: `Copyright © ${new Date().getFullYear()}`,
  buildVersion: pkg.version,
  directories: {
    buildResources: 'build',
    app: 'build',
  },
  electronDownload: {
    cache: path.join(homedir, '.electron'),
    mirror: 'https://registry.npmmirror.com/-/binary/electron/',
  },
  asar: true,
};

const beforeMake = async () => {
  console.log('-> beforeMake...');
  fs.removeSync(dist_dir);
  fs.ensureDirSync(dist_dir);

  const app_pkg = {
    name: APP_NAME,
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
    main: 'main.js', // 修改为 main.js，因为打包时根目录就是 build
    dependencies: {
      ssh2: (pkg.dependencies && pkg.dependencies['ssh2']) || '^1.16.0',
      'ssh2-sftp-client': (pkg.dependencies && pkg.dependencies['ssh2-sftp-client']) || '^12.0.1',
      piscina: (pkg.dependencies && pkg.dependencies['piscina']) || '^5.1.4',
    },
  };

  fs.writeFileSync(path.join(root_dir, 'build', 'package.json'), JSON.stringify(app_pkg, null, 2), 'utf-8');
  cp.execSync('npm install --omit=dev', { cwd: path.join(root_dir, 'build'), stdio: 'inherit' });
};

const afterMake = async () => {
  console.log('-> afterMake...');
};

const doMake = async () => {
  console.log('-> make...');

  const { MAKE_FOR } = process.env;
  let targets = TARGET_PLATFORMS_configs.all;

  cfg_common.compression = 'maximum';

  if (MAKE_FOR === 'dev') {
    targets = TARGET_PLATFORMS_configs.mac;
    cfg_common.compression = 'store';
  } else if (MAKE_FOR === 'mac') {
    targets = TARGET_PLATFORMS_configs.mac;
  } else if (MAKE_FOR === 'win') {
    targets = TARGET_PLATFORMS_configs.win;
  } else if (MAKE_FOR === 'linux') {
    targets = TARGET_PLATFORMS_configs.linux;
  }

  await builder.build({
    ...targets,
    config: {
      ...cfg_common,
      npmRebuild: false,
      nodeGypRebuild: false,
      appId: 'store.link.app',
      productName: APP_NAME,
      asarUnpack: ['**/*.node', 'node_modules/ssh2/**/*'],
      files: ['**/*'],
      mac: {
        icon: macIcon,
        category: 'public.app-category.utilities',
        target: {
          target: 'default',
          arch: ['arm64', 'x64'],
        },
        type: 'distribution',
        hardenedRuntime: true,
      },
      win: {
        icon: winIcon,
      },
      linux: {
        icon: macIcon,
        artifactName: '${productName}_linux_${arch}_${version}(${buildVersion}).${ext}',
        category: 'Utility',
        synopsis: 'An App for management your multiple storeage',
      },
    },
  });

  console.log('done!');
};

(async () => {
  try {
    await beforeMake();
    await doMake();
    await afterMake();
    //await macSign()

    console.log('-> make Done!');
  } catch (e) {
    console.log(e);
  }
})();
