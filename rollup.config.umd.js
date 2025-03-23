import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

export default [
  // Standard UMD build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/blockdoc.js',
      format: 'umd',
      name: 'BlockDoc',
      sourcemap: true,
      globals: {
        ajv: 'Ajv',
        'ajv-formats': 'AjvFormats',
        marked: 'marked',
        'highlight.js': 'hljs'
      }
    },
    plugins: [
      resolve({
        browser: true,
        extensions: ['.js', '.json']
      }),
      json(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', { 
            targets: '> 0.25%, not dead',
            modules: false,
            useBuiltIns: 'usage',
            corejs: 3
          }]
        ]
      })
    ],
    external: ['ajv', 'ajv-formats', 'marked', 'highlight.js']
  },
  // Minified UMD build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/blockdoc.min.js',
      format: 'umd',
      name: 'BlockDoc',
      sourcemap: true,
      globals: {
        ajv: 'Ajv',
        'ajv-formats': 'AjvFormats',
        marked: 'marked',
        'highlight.js': 'hljs'
      }
    },
    plugins: [
      resolve({
        browser: true,
        extensions: ['.js', '.json']
      }),
      json(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', { 
            targets: '> 0.25%, not dead',
            modules: false,
            useBuiltIns: 'usage',
            corejs: 3
          }]
        ]
      }),
      terser()
    ],
    external: ['ajv', 'ajv-formats', 'marked', 'highlight.js']
  }
];