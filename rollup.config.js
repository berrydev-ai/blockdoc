import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/blockdoc.js',
    format: 'esm',
    sourcemap: true
  },
  plugins: [
    resolve({
      extensions: ['.js', '.json']
    }),
    json(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    })
  ],
  external: ['ajv', 'ajv-formats', 'marked', 'highlight.js']
};