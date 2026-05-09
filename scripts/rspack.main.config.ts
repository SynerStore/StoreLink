import { Configuration } from '@rspack/cli';
import { rspack } from '@rspack/core';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';
const ROOT = path.resolve(__dirname, '..');

const config: Configuration = {
  name: 'main',
  target: 'electron-main',
  entry: {
    main: path.resolve(ROOT, './src/main/index.ts'),
    preload: path.resolve(ROOT, './src/main/preload.ts'),
    'storage.worker': path.resolve(ROOT, './src/main/workers/storage.worker.ts'),
  },
  output: {
    path: path.resolve(ROOT, 'build'),
    filename: '[name].js',
    library: {
      type: 'commonjs2',
    },
  },
  resolve: {
    extensions: ['...', '.ts', '.js'],
    alias: {
      '@': path.resolve(ROOT, 'src'),
    },
  },
  devtool: isDev ? 'source-map' : false,
  externals: {
    ssh2: 'commonjs ssh2',
    piscina: 'commonjs piscina',
    'cpu-features': 'commonjs cpu-features',
    'ssh2-sftp-client': 'commonjs ssh2-sftp-client',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
            },
          },
        },
        type: 'javascript/auto',
      },
    ],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  plugins: [
    new rspack.ProgressPlugin({}),
    new rspack.CopyRspackPlugin({
      patterns: [
        {
          from: path.resolve(ROOT, './scripts/assets'),
          to: path.resolve(ROOT, './build/scripts/assets'),
        },
      ],
    }),
  ].filter(Boolean),
  optimization: {
    minimize: !isDev,
    mangleExports: !isDev,
    concatenateModules: !isDev, // 禁止模块合并
  },
  ignoreWarnings: [
    /Critical dependency/, // ali-oss 导致的问题 https://github.com/ali-sdk/ali-oss/issues/1287
  ],
};

export default config;
