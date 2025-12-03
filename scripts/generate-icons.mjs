import { writeFileSync } from 'fs';

// Simple PNG generation for icons
// Using base64 encoded minimal PNG data

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 SIZE SIZE">
  <rect width="SIZE" height="SIZE" rx="RX" fill="#1a73e8"/>
  <rect x="X1" y="Y1" width="W1" height="H1" rx="RX2" fill="white"/>
  <rect x="X2" y="Y2" width="W2" height="H2" rx="RX3" fill="#1a73e8"/>
  <rect x="X2" y="Y3" width="W3" height="H2" rx="RX3" fill="#1a73e8"/>
  <rect x="X2" y="Y4" width="W4" height="H2" rx="RX3" fill="#1a73e8"/>
</svg>`;

function generateSvg(size) {
  const scale = size / 128;
  return svgContent
    .replace(/SIZE/g, size)
    .replace(/RX/g, Math.round(16 * scale))
    .replace(/X1/g, Math.round(24 * scale))
    .replace(/Y1/g, Math.round(32 * scale))
    .replace(/W1/g, Math.round(80 * scale))
    .replace(/H1/g, Math.round(64 * scale))
    .replace(/RX2/g, Math.round(8 * scale))
    .replace(/X2/g, Math.round(32 * scale))
    .replace(/Y2/g, Math.round(48 * scale))
    .replace(/W2/g, Math.round(48 * scale))
    .replace(/H2/g, Math.round(6 * scale))
    .replace(/RX3/g, Math.round(3 * scale))
    .replace(/Y3/g, Math.round(60 * scale))
    .replace(/W3/g, Math.round(64 * scale))
    .replace(/Y4/g, Math.round(72 * scale))
    .replace(/W4/g, Math.round(40 * scale));
}

const sizes = [16, 48, 128];

for (const size of sizes) {
  const svg = generateSvg(size);
  writeFileSync(`icons/icon${size}.svg`, svg);
  console.log(`Generated icon${size}.svg`);
}

console.log('\nTo convert SVG to PNG, use a tool like:');
console.log('- macOS: qlmanage -t -s 128 -o . icon.svg');
console.log('- Or use an online converter');
console.log('- Or install: npm install sharp and use it for conversion');
