import { Configuration } from '@rspack/cli';
import { rspack } from '@rspack/core';
import RefreshPlugin from '@rspack/plugin-react-refresh';
import path from 'path';

import { HTML_TEMPLATE } from './config';

const isDev = process.env.NODE_ENV === 'development';
const ROOT = path.resolve(__dirname, '..');

const rspackConfig: Configuration = {
  mode: isDev ? 'development' : 'production',
  entry: {
    main: path.resolve(ROOT, './src/renderer/pages/main/index.tsx'),
    launch: path.resolve(ROOT, './src/renderer/pages/launch/index.tsx'),
  },
  output: {
    clean: true,
    path: path.resolve(ROOT, 'build'),
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  },
  resolve: {
    extensions: ['...', '.ts', '.tsx', '.jsx'],
    alias: {
      '@': path.resolve(ROOT, 'src', 'renderer/src'),
    },
  },
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
        test: /\.less$/,
        loader: require.resolve('less-loader'),
        options: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
        type: 'css/auto',
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
      title: 'main',
      chunks: ['main'],
      templateContent: HTML_TEMPLATE,
      filename: 'main.html',
    }),
    new rspack.HtmlRspackPlugin({
      title: 'launch',
      chunks: ['launch'],
      templateContent: HTML_TEMPLATE,
      filename: 'launch.html',
    }),
    new rspack.ProgressPlugin({}),
    new rspack.CopyRspackPlugin({
      patterns: [
        {
          from: path.resolve(ROOT, './src/renderer/public'),
          to: path.resolve(ROOT, './build'),
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
