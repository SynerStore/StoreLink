import { Configuration } from '@rspack/cli';
import { rspack } from '@rspack/core';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';
const ROOT = path.resolve(__dirname, '..');

const config: Configuration = {
  target: 'electron-main',
  entry: {
    main: path.resolve(ROOT, './src/main/index.ts'),
    preload: path.resolve(ROOT, './src/main/preload.ts'),
  },
  output: {
    clean: true,
    path: path.resolve(ROOT, 'build'),
    library: {
      type: 'commonjs',
    },
  },
  resolve: {
    extensions: ['...', '.ts', '.js'],
    alias: {
      '@': path.resolve(ROOT, 'src', 'main'),
    },
  },
  devtool: isDev ? 'source-map' : false,
  module: {
    rules: [
      {
        test: /\.(js?|ts?)$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                },
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [new rspack.ProgressPlugin({})].filter(Boolean),
};

export default  config;
