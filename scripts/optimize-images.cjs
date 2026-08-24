const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Install sharp if it's not installed
try {
  require('sharp');
} catch (e) {
  console.log('Installing sharp library for image compression...');
  // We use cmd.exe /c npm install to ensure it runs correctly on Windows
  execSync('npm install sharp', { stdio: 'inherit' });
}

const sharp = require('sharp');

const targetImages = [
  {
    src: path.join(__dirname, '../public/assets/Neema/neema_kitchen.jpeg'),
    dest: path.join(__dirname, '../public/assets/Neema/neema_kitchen.jpeg')
  },
  {
    src: path.join(__dirname, '../public/assets/Neema/neema_bathroom.jpeg'),
    dest: path.join(__dirname, '../public/assets/Neema/neema_bathroom.jpeg')
  }
];

async function optimize() {
  for (const img of targetImages) {
    if (fs.existsSync(img.src)) {
      console.log(`Optimizing ${path.basename(img.src)}...`);
      const tempPath = img.src + '.tmp';
      
      // Resize to 1200px max width and compress to 80% quality
      await sharp(img.src)
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(tempPath);
        
      fs.unlinkSync(img.src);
      fs.renameSync(tempPath, img.dest);
      console.log(`Done! Size is now: ${(fs.statSync(img.dest).size / 1024).toFixed(2)} KB`);
    } else {
      console.log(`File not found: ${img.src}`);
    }
  }
}

optimize().catch(err => {
  console.error('Error during optimization:', err);
  process.exit(1);
});
