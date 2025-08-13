// 브라우저에서 실행할 스크립트
// StepButton의 실제 색상을 분석하는 JavaScript 코드

console.log('=== StepButton Color Analysis ===');

// StepButton 요소들을 찾기
const stepButtons = document.querySelectorAll('[class*="StepButton"], button[class*="font-mono"]');
console.log(`Found ${stepButtons.length} step buttons`);

stepButtons.forEach((button, index) => {
  const computedStyle = window.getComputedStyle(button);
  const bgColor = computedStyle.backgroundColor;
  const textColor = computedStyle.color;
  const borderColor = computedStyle.borderColor;
  const boxShadow = computedStyle.boxShadow;
  
  console.log(`Button ${index + 1}:`);
  console.log(`  Background: ${bgColor}`);
  console.log(`  Text: ${textColor}`);
  console.log(`  Border: ${borderColor}`);
  console.log(`  Box Shadow: ${boxShadow}`);
  console.log(`  Classes: ${button.className}`);
  console.log(`  Text Content: ${button.textContent}`);
  console.log('---');
});

// CSS 변수 확인
console.log('\n=== CSS Variables ===');
const root = document.documentElement;
const rootStyle = window.getComputedStyle(root);

const cssVars = [
  '--game-callstack-success',
  '--game-callstack-error',
  '--game-callstack-warning',
  '--game-callstack-primary-main',
  '--game-callstack-bg-elevated',
  '--game-callstack-text-secondary',
  '--game-callstack-border-default'
];

cssVars.forEach(varName => {
  const value = rootStyle.getPropertyValue(varName);
  console.log(`${varName}: ${value}`);
});

// 테마 모드 확인
console.log('\n=== Theme Mode ===');
console.log(`Dark mode: ${document.documentElement.classList.contains('dark')}`);