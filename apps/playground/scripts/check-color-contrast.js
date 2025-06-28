#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// RGB to relative luminance
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrastRatio(rgb1, rgb2) {
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Parse RGB string
function parseRGB(rgbStr) {
  const match = rgbStr.match(/(\d+)\s+(\d+)\s+(\d+)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  return null;
}

// Load CSS variables from globals.css
function loadCSSVariables() {
  const cssPath = path.join(__dirname, '../app/[locale]/globals.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  
  const variables = {};
  const rootRegex = /:root\s*{([^}]+)}/g;
  const darkRegex = /\.dark\s*{([^}]+)}/g;
  
  // Extract light mode variables
  let match = rootRegex.exec(css);
  if (match) {
    const varRegex = /--([\w-]+):\s*([^;]+);/g;
    let varMatch;
    while ((varMatch = varRegex.exec(match[1])) !== null) {
      const rgb = parseRGB(varMatch[2]);
      if (rgb) {
        variables[`light.${varMatch[1]}`] = rgb;
      }
    }
  }
  
  // Extract dark mode variables
  match = darkRegex.exec(css);
  if (match) {
    const varRegex = /--([\w-]+):\s*([^;]+);/g;
    let varMatch;
    while ((varMatch = varRegex.exec(match[1])) !== null) {
      const rgb = parseRGB(varMatch[2]);
      if (rgb) {
        variables[`dark.${varMatch[1]}`] = rgb;
      }
    }
  }
  
  return variables;
}

// Define color combinations to check
const combinations = [
  // Text on backgrounds
  { fg: 'text-primary', bg: 'background', name: 'Primary Text' },
  { fg: 'text-secondary', bg: 'background', name: 'Secondary Text' },
  { fg: 'text-tertiary', bg: 'background', name: 'Tertiary Text' },
  { fg: 'primary-foreground', bg: 'primary', name: 'Primary Button' },
  { fg: 'secondary-foreground', bg: 'secondary', name: 'Secondary Button' },
  { fg: 'destructive-foreground', bg: 'destructive', name: 'Destructive Button' },
  { fg: 'card-foreground', bg: 'card', name: 'Card Text' },
  { fg: 'muted-foreground', bg: 'muted', name: 'Muted Text' },
  // Game-specific
  { fg: 'game-text', bg: 'game-bg', name: 'Game Text' },
  { fg: 'editor-text', bg: 'editor-bg', name: 'Code Editor' },
];

function checkContrast() {
  const variables = loadCSSVariables();
  const results = [];
  let failures = 0;
  
  for (const combo of combinations) {
    for (const mode of ['light', 'dark']) {
      const fgKey = `${mode}.${combo.fg}`;
      const bgKey = `${mode}.${combo.bg}`;
      
      const fg = variables[fgKey];
      const bg = variables[bgKey];
      
      if (fg && bg) {
        const ratio = getContrastRatio(fg, bg);
        const passes = ratio >= 4.5;
        const level = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA Large' : 'Fail';
        
        if (!passes) failures++;
        
        results.push({
          name: combo.name,
          mode,
          foreground: `rgb(${fg.join(', ')})`,
          background: `rgb(${bg.join(', ')})`,
          ratio: ratio.toFixed(2),
          level,
          passes
        });
      }
    }
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    totalChecked: results.length,
    passed: results.filter(r => r.passes).length,
    failed: failures,
    details: results
  };
  
  // Save report
  fs.writeFileSync(
    path.join(__dirname, '../color-contrast-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  // Console output
  console.log('\n🎨 Color Contrast Check Results\n');
  console.log(`Total combinations: ${results.length}`);
  console.log(`Passed: ${report.passed} (${((report.passed / results.length) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failures} (${((failures / results.length) * 100).toFixed(1)}%)\n`);
  
  if (failures > 0) {
    console.log('❌ Failed combinations:');
    results.filter(r => !r.passes).forEach(r => {
      console.log(`  - ${r.name} (${r.mode}): ${r.ratio}:1 ratio`);
      console.log(`    ${r.foreground} on ${r.background}`);
    });
    process.exit(1);
  } else {
    console.log('✅ All color combinations pass WCAG AA standards!');
  }
}

checkContrast();