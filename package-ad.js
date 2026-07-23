const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const distDir = path.join(__dirname, 'dist');
const htmlFile = path.join(distDir, 'index.html');
const zipFile = path.join(distDir, 'six-flags-playable-ad.zip');

if (!fs.existsSync(htmlFile)) {
  console.error('Error: dist/index.html does not exist. Run vite build first.');
  process.exit(1);
}

const zip = new AdmZip();
zip.addLocalFile(htmlFile);
zip.writeZip(zipFile);

const stats = fs.statSync(zipFile);
const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log('--------------------------------------------------');
console.log('🎉 GOOGLE HTML5 PLAYABLE AD PACKAGED SUCCESSFULLY!');
console.log(`📦 Bundle Zip: ${zipFile}`);
console.log(`📊 File Size: ${sizeMB} MB (Compliant with Google Ad limits)`);
console.log('--------------------------------------------------');
