import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';

// Create placeholder images for products
const createPlaceholderImage = (text: string, color: string, filename: string) => {
  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 400, 400);
  
  // Add text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Wrap text if too long
  const words = text.split(' ');
  let line = '';
  const lines = [];
  const maxWidth = 350;
  
  for (let word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      lines.push(line);
      line = word + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  
  // Draw lines
  const lineHeight = 30;
  const startY = 200 - (lines.length - 1) * lineHeight / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line.trim(), 200, startY + i * lineHeight);
  });
  
  // Save image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Created: ${filename}`);
};

// Create directories
const dirs = [
  'uploads/products',
  'uploads/hijabs'
];

dirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  }
});

// Define products
const products = [
  // Spring Warm - Coral/Peach colors
  { name: 'Moonshot Alluring', color: '#FF7F50', file: 'uploads/products/moonshot-alluring.jpg' },
  { name: 'KARADIUM Butter Coral', color: '#FFA07A', file: 'uploads/products/karadium-butter-coral.jpg' },
  { name: 'molette Apple Cheeky', color: '#FFB6C1', file: 'uploads/products/molette-apple-cheeky.jpg' },
  
  // Summer Cool - Pink/Lavender colors
  { name: 'Moonshot Shy', color: '#FFB6C1', file: 'uploads/products/moonshot-shy.jpg' },
  { name: 'KARADIUM Cozy Pink', color: '#FFC0CB', file: 'uploads/products/karadium-cozy-pink.jpg' },
  { name: 'molette Dewy Berry', color: '#DA70D6', file: 'uploads/products/molette-dewy-berry.jpg' },
  
  // Autumn Warm - Brown colors
  { name: 'Moonshot Honest', color: '#A52A2A', file: 'uploads/products/moonshot-honest.jpg' },
  { name: 'KARADIUM Pecan Sand', color: '#D2691E', file: 'uploads/products/karadium-pecan-sand.jpg' },
  { name: 'molette Coco Choco', color: '#8B4513', file: 'uploads/products/molette-coco-choco.jpg' },
  
  // Winter Cool - Deep Pink/Berry colors
  { name: 'Moonshot Oort Pink', color: '#FF1493', file: 'uploads/products/moonshot-oort-pink.jpg' },
  { name: 'KARADIUM Rosy Berry', color: '#DC143C', file: 'uploads/products/karadium-rosy-berry.jpg' },
  { name: 'molette Tingle Cherry', color: '#8B0000', file: 'uploads/products/molette-tingle-cherry.jpg' },
];

const hijabs = [
  // Spring Warm
  { name: 'Soft Coral Hijab', color: '#FF7F50', file: 'uploads/hijabs/spring-coral-hijab.jpg' },
  { name: 'Peach Blossom Hijab', color: '#FFDAB9', file: 'uploads/hijabs/spring-peach-hijab.jpg' },
  { name: 'Light Camel Hijab', color: '#C19A6B', file: 'uploads/hijabs/spring-camel-hijab.jpg' },
  
  // Summer Cool
  { name: 'Rose Quartz Hijab', color: '#F8BBD0', file: 'uploads/hijabs/summer-rose-hijab.jpg' },
  { name: 'Lavender Mist Hijab', color: '#E6E6FA', file: 'uploads/hijabs/summer-lavender-hijab.jpg' },
  { name: 'Powder Blue Hijab', color: '#B0E0E6', file: 'uploads/hijabs/summer-blue-hijab.jpg' },
  
  // Autumn Warm
  { name: 'Burnt Sienna Hijab', color: '#A0522D', file: 'uploads/hijabs/autumn-sienna-hijab.jpg' },
  { name: 'Chocolate Brown Hijab', color: '#7B3F00', file: 'uploads/hijabs/autumn-brown-hijab.jpg' },
  { name: 'Olive Khaki Hijab', color: '#808000', file: 'uploads/hijabs/autumn-olive-hijab.jpg' },
  
  // Winter Cool
  { name: 'Fuchsia Pink Hijab', color: '#FF00FF', file: 'uploads/hijabs/winter-fuchsia-hijab.jpg' },
  { name: 'Burgundy Velvet Hijab', color: '#800020', file: 'uploads/hijabs/winter-burgundy-hijab.jpg' },
  { name: 'Midnight Navy Hijab', color: '#191970', file: 'uploads/hijabs/winter-navy-hijab.jpg' },
];

// Create all placeholder images
console.log('Creating product placeholder images...');
products.forEach(product => {
  createPlaceholderImage(product.name, product.color, product.file);
});

console.log('\nCreating hijab placeholder images...');
hijabs.forEach(hijab => {
  createPlaceholderImage(hijab.name, hijab.color, hijab.file);
});

console.log('\nAll placeholder images created successfully!');