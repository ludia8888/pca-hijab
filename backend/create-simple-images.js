const fs = require('fs');
const path = require('path');

// Create a simple colored SVG as placeholder
const createColoredSVG = (text, color) => {
  return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="400" fill="${color}"/>
    <text x="200" y="200" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
      ${text}
    </text>
  </svg>`;
};

// Create directories
const dirs = [
  'uploads/products',
  'uploads/hijabs'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Products data
const products = [
  { name: 'Moonshot Alluring', color: '#FF7F50', file: 'uploads/products/moonshot-alluring.jpg' },
  { name: 'KARADIUM Butter Coral', color: '#FFA07A', file: 'uploads/products/karadium-butter-coral.jpg' },
  { name: 'molette Apple Cheeky', color: '#FFB6C1', file: 'uploads/products/molette-apple-cheeky.jpg' },
  { name: 'Moonshot Shy', color: '#FFB6C1', file: 'uploads/products/moonshot-shy.jpg' },
  { name: 'KARADIUM Cozy Pink', color: '#FFC0CB', file: 'uploads/products/karadium-cozy-pink.jpg' },
  { name: 'molette Dewy Berry', color: '#DA70D6', file: 'uploads/products/molette-dewy-berry.jpg' },
  { name: 'Moonshot Honest', color: '#A52A2A', file: 'uploads/products/moonshot-honest.jpg' },
  { name: 'KARADIUM Pecan Sand', color: '#D2691E', file: 'uploads/products/karadium-pecan-sand.jpg' },
  { name: 'molette Coco Choco', color: '#8B4513', file: 'uploads/products/molette-coco-choco.jpg' },
  { name: 'Moonshot Oort Pink', color: '#FF1493', file: 'uploads/products/moonshot-oort-pink.jpg' },
  { name: 'KARADIUM Rosy Berry', color: '#DC143C', file: 'uploads/products/karadium-rosy-berry.jpg' },
  { name: 'molette Tingle Cherry', color: '#8B0000', file: 'uploads/products/molette-tingle-cherry.jpg' },
];

const hijabs = [
  { name: 'Soft Coral Hijab', color: '#FF7F50', file: 'uploads/hijabs/spring-coral-hijab.jpg' },
  { name: 'Peach Blossom Hijab', color: '#FFDAB9', file: 'uploads/hijabs/spring-peach-hijab.jpg' },
  { name: 'Light Camel Hijab', color: '#C19A6B', file: 'uploads/hijabs/spring-camel-hijab.jpg' },
  { name: 'Rose Quartz Hijab', color: '#F8BBD0', file: 'uploads/hijabs/summer-rose-hijab.jpg' },
  { name: 'Lavender Mist Hijab', color: '#E6E6FA', file: 'uploads/hijabs/summer-lavender-hijab.jpg' },
  { name: 'Powder Blue Hijab', color: '#B0E0E6', file: 'uploads/hijabs/summer-blue-hijab.jpg' },
  { name: 'Burnt Sienna Hijab', color: '#A0522D', file: 'uploads/hijabs/autumn-sienna-hijab.jpg' },
  { name: 'Chocolate Brown Hijab', color: '#7B3F00', file: 'uploads/hijabs/autumn-brown-hijab.jpg' },
  { name: 'Olive Khaki Hijab', color: '#808000', file: 'uploads/hijabs/autumn-olive-hijab.jpg' },
  { name: 'Fuchsia Pink Hijab', color: '#FF00FF', file: 'uploads/hijabs/winter-fuchsia-hijab.jpg' },
  { name: 'Burgundy Velvet Hijab', color: '#800020', file: 'uploads/hijabs/winter-burgundy-hijab.jpg' },
  { name: 'Midnight Navy Hijab', color: '#191970', file: 'uploads/hijabs/winter-navy-hijab.jpg' },
];

// Create SVG files
console.log('Creating product placeholder images...');
products.forEach(product => {
  const svg = createColoredSVG(product.name, product.color);
  const svgFile = product.file.replace('.jpg', '.svg');
  fs.writeFileSync(svgFile, svg);
  console.log(`Created: ${svgFile}`);
});

console.log('\nCreating hijab placeholder images...');
hijabs.forEach(hijab => {
  const svg = createColoredSVG(hijab.name, hijab.color);
  const svgFile = hijab.file.replace('.jpg', '.svg');
  fs.writeFileSync(svgFile, svg);
  console.log(`Created: ${svgFile}`);
});

console.log('\nAll placeholder images created!');