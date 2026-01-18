const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function makeWhiteTransparent(inputPath, outputPath, threshold = 250) {
  console.log(`Processing: ${inputPath}`);
  
  // Read the SVG file
  const svgContent = fs.readFileSync(inputPath, 'utf8');
  
  // Extract base64 PNG data
  const base64Match = svgContent.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
  if (!base64Match) {
    console.error('No base64 PNG found in SVG');
    return;
  }
  
  const base64Data = base64Match[1];
  const pngBuffer = Buffer.from(base64Data, 'base64');
  
  // Get image metadata
  const metadata = await sharp(pngBuffer).metadata();
  console.log(`Image size: ${metadata.width}x${metadata.height}`);
  
  // Get raw pixel data (RGBA)
  const { data, info } = await sharp(pngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  console.log(`Processing ${info.width * info.height} pixels...`);
  
  // Replace white/near-white pixels with transparent
  const newData = Buffer.from(data);
  let replacedCount = 0;
  
  for (let i = 0; i < newData.length; i += 4) {
    const r = newData[i];
    const g = newData[i + 1];
    const b = newData[i + 2];
    
    // Check if pixel is white or near-white
    if (r >= threshold && g >= threshold && b >= threshold) {
      // Make it transparent
      newData[i + 3] = 0; // Set alpha to 0
      replacedCount++;
    }
  }
  
  console.log(`Replaced ${replacedCount} white pixels with transparent`);
  
  // Create new PNG with transparency
  const newPngBuffer = await sharp(newData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .png()
    .toBuffer();
  
  // Convert back to base64
  const newBase64 = newPngBuffer.toString('base64');
  
  // Replace in SVG
  const newSvgContent = svgContent.replace(
    /data:image\/png;base64,[A-Za-z0-9+/=]+/,
    `data:image/png;base64,${newBase64}`
  );
  
  // Write output
  fs.writeFileSync(outputPath, newSvgContent);
  console.log(`Saved to: ${outputPath}`);
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  const files = [
    'logo-icon.svg',
    'logo-text-bottom.svg',
    'logo-text-side.svg'
  ];
  
  for (const file of files) {
    const inputPath = path.join(publicDir, file);
    if (fs.existsSync(inputPath)) {
      await makeWhiteTransparent(inputPath, inputPath);
      console.log('---');
    } else {
      console.log(`File not found: ${inputPath}`);
    }
  }
  
  console.log('Done!');
}

main().catch(console.error);
