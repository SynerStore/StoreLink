import { Configuration } from '@rspack/cli';
import { rspack } from '@rspack/core';
import RefreshPlugin from '@rspack/plugin-react-refresh';
import path from 'path';

import { HTML_TEMPLATE } from './config';

const isDev = process.env.NODE_ENV === 'development';
const ROOT = path.resolve(__dirname, '..');

const rspackConfig: Configuration = {
  name: 'renderer',
  mode: isDev ? 'development' : 'production',
  target: 'web',
  entry: {
    render_main: path.resolve(ROOT, './src/renderer/pages/main/index.tsx'),
    render_launch: path.resolve(ROOT, './src/renderer/pages/launch/index.tsx'),
    render_viewer: path.resolve(ROOT, './src/renderer/pages/viewer/index.tsx'),
  },
  output: {
    path: path.resolve(ROOT, 'build'),
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
    globalObject: 'globalThis',
  },
  resolve: {
    extensions: ['...', '.ts', '.tsx', '.jsx'],
    alias: {
      '@': path.resolve(ROOT, 'src'),
    },
  },
  devtool: isDev ? 'source-map' : false,
  devServer: {
    port: 3000,
    open: false,
    historyApiFallback: false,
  },
  module: {
    parser: {
      'css/auto': {
        namedExports: false,
      },
    },
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                  },
                },
              },
            },
          },
        ],
      },

      {
        test: /\.(png|svg|webp|jpe?g|gif)(\?.*)?$/i,
        type: 'asset',
        generator: {
          filename: 'assets/[hash][ext]',
        },
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      title: 'render_main',
      chunks: ['render_main'],
      templateContent: HTML_TEMPLATE,
      filename: 'main.html',
    }),
    new rspack.HtmlRspackPlugin({
      title: 'render_launch',
      chunks: ['render_launch'],
      templateContent: HTML_TEMPLATE,
      filename: 'launch.html',
    }),
    new rspack.HtmlRspackPlugin({
      title: 'render_viewer',
      chunks: ['render_viewer'],
      templateContent: HTML_TEMPLATE,
      filename: 'viewer.html',
    }),
    new rspack.ProgressPlugin({}),
    new rspack.CopyRspackPlugin({
      patterns: [
        {
          from: path.resolve(ROOT, './node_modules/pdfjs-dist/build/pdf.worker.mjs'),
          to: path.resolve(ROOT, './build/pdf.worker.mjs'),
        },
      ],
    }),
    isDev ? new RefreshPlugin() : null,
  ].filter(Boolean),

  experiments: {
    css: true,
  },
};

export default rspackConfig;
