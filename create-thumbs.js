const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, 'images');
const thumbsDir = path.join(__dirname, 'thumbs');

if (!fs.existsSync(thumbsDir)) {
  fs.mkdirSync(thumbsDir, { recursive: true });
}

const files = fs.readdirSync(imagesDir).filter(file => {
  return /\.(jpe?g|png|webp)$/i.test(file);
});

async function process() {
  for (const file of files) {
    const inputPath = path.join(imagesDir, file);
    const outputName = file.replace(/\.(png|webp)$/i, '.jpg');
    const outputPath = path.join(thumbsDir, outputName);

    // Если превью уже есть и новее оригинала — пропускаем
    if (fs.existsSync(outputPath)) {
      const inputStat = fs.statSync(inputPath);
      const outputStat = fs.statSync(outputPath);
      if (outputStat.mtimeMs >= inputStat.mtimeMs) {
        console.log('Skip (already up to date):', file);
        continue;
      }
    }

    try {
      await sharp(inputPath)
        .resize({ width: 500, withoutEnlargement: true })
        .jpeg({ quality: 68, mozjpeg: true })
        .toFile(outputPath);

      console.log('Created thumb:', outputName);
    } catch (err) {
      console.error('Error processing', file, err.message);
    }
  }
}

process().then(() => {
  console.log('Done');
});
