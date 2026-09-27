import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

// Ensure dist dir exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Copy index.css to dist/index.css
if (fs.existsSync('src/index.css')) {
  fs.copyFileSync('src/index.css', 'dist/index.css');
}

// Copy public/index.html to dist/index.html
if (fs.existsSync('public/index.html')) {
  let html = fs.readFileSync('public/index.html', 'utf-8');
  // Ensure relative path to bundle.js and index.css
  fs.writeFileSync('dist/index.html', html);
}

esbuild.build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  loader: { '.js': 'jsx', '.jsx': 'jsx' },
  define: { 'process.env.NODE_ENV': '"production"' },
  minify: true,
  sourcemap: false,
}).then(() => {
  console.log('⚡ SahiHisaab production build completed successfully in frontend/dist!');
}).catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
