import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Function to get all js files from src directory recursively
function getSrcFiles(dir) {
  const srcPath = join(__dirname, dir);
  let files = [];
  
  readdirSync(srcPath, { withFileTypes: true }).forEach(dirent => {
    const fullPath = join(dir, dirent.name);
    
    if (dirent.isDirectory()) {
      files = files.concat(getSrcFiles(fullPath));
    } else if (dirent.name.endsWith('.js') && !dirent.name.includes('.test.js')) {
      // Only include .js files, not test files
      files.push(fullPath);
    }
  });
  
  return files;
}

// Get all source files
const srcFiles = getSrcFiles('src');

// Create config for each source file to maintain directory structure
export default srcFiles.map(file => {
  const input = file;
  // Remove 'src/' from the file path and use the rest as output path
  const outputFile = file.replace('src/', '');
  
  return {
    input,
    output: {
      file: `dist/esm/${outputFile}`,
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      resolve({
        extensions: ['.js', '.json'],
        preferBuiltins: true
      }),
      json(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', { targets: { node: '18' }, modules: false }]
        ]
      })
    ],
    external: ['ajv', 'ajv-formats', 'marked', 'highlight.js']
  };
});