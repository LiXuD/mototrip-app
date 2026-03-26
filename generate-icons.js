const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_SIZE = 81;
const OUTPUT_DIR = path.join(__dirname, 'static', 'tabbar');

// SVG icon definitions
const icons = {
  home: {
    normal: `<svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40.5 18L12 40.5V72H30V51H51V72H69V40.5L40.5 18Z" stroke="#8E8E93" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`,
    active: `<svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40.5 18L12 40.5V72H30V51H51V72H69V40.5L40.5 18Z" fill="#FF6B35" stroke="#FF6B35" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  route: {
    normal: `<svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22" r="8" stroke="#8E8E93" stroke-width="3" fill="none"/>
      <circle cx="59" cy="59" r="8" stroke="#8E8E93" stroke-width="3" fill="none"/>
      <path d="M28 28L53 53" stroke="#8E8E93" stroke-width="3" stroke-linecap="round"/>
      <circle cx="40" cy="33" r="4" stroke="#8E8E93" stroke-width="2" fill="none"/>
      <circle cx="33" cy="40" r="4" stroke="#8E8E93" stroke-width="2" fill="none"/>
      <circle cx="47" cy="47" r="4" stroke="#8E8E93" stroke-width="2" fill="none"/>
    </svg>`,
    active: `<svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22" r="8" stroke="#FF6B35" stroke-width="3" fill="none"/>
      <circle cx="59" cy="59" r="8" stroke="#FF6B35" stroke-width="3" fill="none"/>
      <path d="M28 28L53 53" stroke="#FF6B35" stroke-width="3" stroke-linecap="round"/>
      <circle cx="40" cy="33" r="4" stroke="#FF6B35" stroke-width="2" fill="#FF6B35"/>
      <circle cx="33" cy="40" r="4" stroke="#FF6B35" stroke-width="2" fill="#FF6B35"/>
      <circle cx="47" cy="47" r="4" stroke="#FF6B35" stroke-width="2" fill="#FF6B35"/>
    </svg>`
  },
  diary: {
    normal: `<svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="12" width="57" height="57" rx="8" stroke="#8E8E93" stroke-width="3" fill="none"/>
      <line x1="24" y1="30" x2="57" y2="30" stroke="#8E8E93" stroke-width="3" stroke-linecap="round"/>
      <line x1="24" y1="42" x2="45" y2="42" stroke="#8E8E93" stroke-width="3" stroke-linecap="round"/>
      <line x1="24" y1="54" x2="51" y2="54" stroke="#8E8E93" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    active: `<svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="12" width="57" height="57" rx="8" fill="#FF6B35"/>
      <line x1="24" y1="30" x2="57" y2="30" stroke="white" stroke-width="3" stroke-linecap="round"/>
      <line x1="24" y1="42" x2="45" y2="42" stroke="white" stroke-width="3" stroke-linecap="round"/>
      <line x1="24" y1="54" x2="51" y2="54" stroke="white" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  profile: {
    normal: `<svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40.5" cy="27" r="12" stroke="#8E8E93" stroke-width="3" fill="none"/>
      <path d="M15 69C15 54.5 25.8 45 40.5 45C55.2 45 66 54.5 66 69" stroke="#8E8E93" stroke-width="3" stroke-linecap="round" fill="none"/>
    </svg>`,
    active: `<svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40.5" cy="27" r="12" stroke="#FF6B35" stroke-width="3" fill="#FF6B35"/>
      <path d="M15 69C15 54.5 25.8 45 40.5 45C55.2 45 66 54.5 66 69" stroke="#FF6B35" stroke-width="3" stroke-linecap="round" fill="none"/>
    </svg>`
  }
};

async function generateIcons() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const conversions = [
    { name: 'home', svg: icons.home.normal, suffix: '' },
    { name: 'home', svg: icons.home.active, suffix: '-active' },
    { name: 'route', svg: icons.route.normal, suffix: '' },
    { name: 'route', svg: icons.route.active, suffix: '-active' },
    { name: 'diary', svg: icons.diary.normal, suffix: '' },
    { name: 'diary', svg: icons.diary.active, suffix: '-active' },
    { name: 'profile', svg: icons.profile.normal, suffix: '' },
    { name: 'profile', svg: icons.profile.active, suffix: '-active' },
  ];

  for (const conv of conversions) {
    const outputPath = path.join(OUTPUT_DIR, `${conv.name}${conv.suffix}.png`);
    await sharp(Buffer.from(conv.svg))
      .resize(81, 81)
      .png()
      .toFile(outputPath);
    console.log(`Generated: ${outputPath}`);
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
