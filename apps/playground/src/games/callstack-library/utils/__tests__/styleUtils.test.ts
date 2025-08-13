/**
 * styleUtils 단위 테스트
 * 
 * 디자인 시스템과 연동되는 스타일 헬퍼 함수들을 검증합니다.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  cn,
  createCSSVariable,
  getCSSVariable,
  createResponsiveStyles,
  kebabCase,
  colorUtils,
  shadowUtils,
  animationUtils,
  layoutUtils,
  textUtils,
  a11yUtils,
  performanceUtils,
  createStyles,
  tokens
} from '@/games/callstack-library/styleUtils';

// Mock designSystem
vi.mock('../../theme/designSystem', () => ({
  designSystem: {
    breakpoints: {
      md: '768px',
      lg: '1024px'
    },
    spacing: {
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      8: '2rem'
    },
    animation: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      easing: {
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out'
      }
    },
    colors: {
      primary: {
        500: '#0ea5e9',
        600: '#0284c7'
      },
      gray: {
        50: '#f9fafb',
        500: '#6b7280',
        900: '#111827'
      }
    },
    typography: {
      fontSize: {
        sm: { mobile: '0.875rem', tablet: '0.875rem', desktop: '0.875rem' },
        base: { mobile: '1rem', tablet: '1rem', desktop: '1rem' },
        lg: { mobile: '1.125rem', tablet: '1.25rem', desktop: '1.5rem' }
      }
    },
    boxShadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    borderRadius: {
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem'
    }
  }
}));

describe('styleUtils', () => {
  describe('cn (클래스 이름 조합)', () => {
    it('유효한 클래스명들을 조합해야 한다', () => {
      expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });

    it('falsy 값들을 필터링해야 한다', () => {
      expect(cn('class1', null, undefined, false, '', 'class2')).toBe('class1 class2');
    });

    it('빈 문자열을 반환해야 한다 (모든 값이 falsy일 때)', () => {
      expect(cn(null, undefined, false, '')).toBe('');
    });

    it('단일 클래스명을 처리해야 한다', () => {
      expect(cn('single-class')).toBe('single-class');
    });
  });

  describe('CSS 변수 헬퍼', () => {
    it('CSS 변수를 생성해야 한다', () => {
      expect(createCSSVariable('color-primary', '#0ea5e9')).toBe('--color-primary: #0ea5e9');
    });

    it('CSS 변수 참조를 생성해야 한다', () => {
      expect(getCSSVariable('color-primary')).toBe('var(--color-primary)');
    });

    it('복잡한 변수명을 처리해야 한다', () => {
      expect(createCSSVariable('button-bg-color-hover', 'rgba(0, 0, 0, 0.1)')).toBe('--button-bg-color-hover: rgba(0, 0, 0, 0.1)');
      expect(getCSSVariable('button-bg-color-hover')).toBe('var(--button-bg-color-hover)');
    });
  });

  describe('kebabCase', () => {
    it('카멜케이스를 케밥케이스로 변환해야 한다', () => {
      expect(kebabCase('backgroundColor')).toBe('background-color');
      expect(kebabCase('fontSize')).toBe('font-size');
      expect(kebabCase('WebkitTransform')).toBe('-webkit-transform');
    });

    it('이미 케밥케이스인 문자열을 그대로 반환해야 한다', () => {
      expect(kebabCase('background-color')).toBe('background-color');
    });

    it('단일 단어를 처리해야 한다', () => {
      expect(kebabCase('color')).toBe('color');
    });

    it('연속된 대문자를 처리해야 한다', () => {
      expect(kebabCase('XMLHttpRequest')).toBe('-x-m-l-http-request');
    });
  });

  describe('createResponsiveStyles', () => {
    it('모바일만 지정된 경우 기본 스타일만 반환해야 한다', () => {
      const mobile = { fontSize: '16px', color: 'black' };
      const result = createResponsiveStyles(mobile);
      
      expect(result).toContain('font-size: 16px');
      expect(result).toContain('color: black');
      expect(result).not.toContain('@media');
    });

    it('태블릿 스타일이 포함되어야 한다', () => {
      const mobile = { fontSize: '16px' };
      const tablet = { fontSize: '18px' };
      const result = createResponsiveStyles(mobile, tablet);
      
      expect(result).toContain('font-size: 16px');
      expect(result).toContain('@media (min-width: 768px)');
      expect(result).toContain('font-size: 18px');
    });

    it('데스크톱 스타일이 포함되어야 한다', () => {
      const mobile = { fontSize: '16px' };
      const tablet = { fontSize: '18px' };
      const desktop = { fontSize: '20px' };
      const result = createResponsiveStyles(mobile, tablet, desktop);
      
      expect(result).toContain('@media (min-width: 1024px)');
      expect(result).toContain('font-size: 20px');
    });
  });

  describe('colorUtils', () => {
    describe('hexToRgb', () => {
      it('6자리 HEX를 RGB로 변환해야 한다', () => {
        expect(colorUtils.hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
        expect(colorUtils.hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
        expect(colorUtils.hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
      });

      it('#이 없는 HEX를 처리해야 한다', () => {
        expect(colorUtils.hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      });

      it('유효하지 않은 HEX에 대해 null을 반환해야 한다', () => {
        expect(colorUtils.hexToRgb('invalid')).toBeNull();
        expect(colorUtils.hexToRgb('#gg0000')).toBeNull();
        expect(colorUtils.hexToRgb('#12345')).toBeNull();
      });
    });

    describe('rgbToHex', () => {
      it('RGB를 HEX로 변환해야 한다', () => {
        expect(colorUtils.rgbToHex(255, 0, 0)).toBe('#ff0000');
        expect(colorUtils.rgbToHex(0, 255, 0)).toBe('#00ff00');
        expect(colorUtils.rgbToHex(0, 0, 255)).toBe('#0000ff');
      });

      it('한 자리 16진수를 올바르게 처리해야 한다', () => {
        expect(colorUtils.rgbToHex(15, 15, 15)).toBe('#0f0f0f');
      });
    });

    describe('getLuminance', () => {
      it('흰색의 휘도가 높아야 한다', () => {
        const whiteLuminance = colorUtils.getLuminance('#ffffff');
        expect(whiteLuminance).toBeCloseTo(1, 1);
      });

      it('검은색의 휘도가 낮아야 한다', () => {
        const blackLuminance = colorUtils.getLuminance('#000000');
        expect(blackLuminance).toBeCloseTo(0, 1);
      });

      it('유효하지 않은 색상에 대해 0을 반환해야 한다', () => {
        expect(colorUtils.getLuminance('invalid')).toBe(0);
      });
    });

    describe('getContrastRatio', () => {
      it('흰색과 검은색의 대비비를 계산해야 한다', () => {
        const ratio = colorUtils.getContrastRatio('#ffffff', '#000000');
        expect(ratio).toBeGreaterThan(15); // 21에 가까운 값
      });

      it('같은 색상의 대비비는 1이어야 한다', () => {
        const ratio = colorUtils.getContrastRatio('#ff0000', '#ff0000');
        expect(ratio).toBe(1);
      });
    });

    describe('isWCAGCompliant', () => {
      it('고대비 색상 조합은 AA 기준을 만족해야 한다', () => {
        expect(colorUtils.isWCAGCompliant('#000000', '#ffffff')).toBe(true);
      });

      it('낮은 대비 색상 조합은 기준을 만족하지 않아야 한다', () => {
        expect(colorUtils.isWCAGCompliant('#cccccc', '#dddddd')).toBe(false);
      });

      it('AAA 기준을 확인할 수 있어야 한다', () => {
        expect(colorUtils.isWCAGCompliant('#000000', '#ffffff', 'AAA')).toBe(true);
      });
    });

    describe('addAlpha', () => {
      it('색상에 알파 값을 추가해야 한다', () => {
        expect(colorUtils.addAlpha('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
      });

      it('유효하지 않은 색상은 원본을 반환해야 한다', () => {
        expect(colorUtils.addAlpha('invalid', 0.5)).toBe('invalid');
      });
    });

    describe('adjustBrightness', () => {
      it('색상을 밝게 조정해야 한다', () => {
        const result = colorUtils.adjustBrightness('#808080', 50);
        expect(result).not.toBe('#808080');
      });

      it('색상을 어둡게 조정해야 한다', () => {
        const result = colorUtils.adjustBrightness('#808080', -50);
        expect(result).not.toBe('#808080');
      });

      it('유효하지 않은 색상은 원본을 반환해야 한다', () => {
        expect(colorUtils.adjustBrightness('invalid', 50)).toBe('invalid');
      });
    });
  });

  describe('shadowUtils', () => {
    describe('combine', () => {
      it('여러 그림자를 조합해야 한다', () => {
        const shadow1 = '0 1px 3px rgba(0,0,0,0.1)';
        const shadow2 = '0 4px 6px rgba(0,0,0,0.1)';
        const result = shadowUtils.combine(shadow1, shadow2);
        
        expect(result).toBe(`${shadow1}, ${shadow2}`);
      });

      it('falsy 값을 필터링해야 한다', () => {
        const shadow1 = '0 1px 3px rgba(0,0,0,0.1)';
        const result = shadowUtils.combine(shadow1, '', null as any, undefined as any);
        
        expect(result).toBe(shadow1);
      });
    });

    describe('create', () => {
      it('커스텀 그림자를 생성해야 한다', () => {
        const result = shadowUtils.create(2, 4, 6, 0, 'rgba(0,0,0,0.1)');
        expect(result).toBe('2px 4px 6px 0px rgba(0,0,0,0.1)');
      });

      it('기본값을 사용해야 한다', () => {
        const result = shadowUtils.create(2, 4, 6);
        expect(result).toBe('2px 4px 6px 0px rgba(0, 0, 0, 0.1)');
      });
    });

    describe('elevation', () => {
      it('엘리베이션 레벨에 따른 그림자를 반환해야 한다', () => {
        expect(shadowUtils.elevation(0)).toBe('none');
        expect(shadowUtils.elevation(1)).toContain('rgba');
        expect(shadowUtils.elevation(5)).toContain('rgba');
      });

      it('정의되지 않은 레벨은 기본값을 반환해야 한다', () => {
        const result = shadowUtils.elevation(10);
        expect(result).toContain('rgba');
      });
    });
  });

  describe('animationUtils', () => {
    describe('transition', () => {
      it('단일 속성 트랜지션을 생성해야 한다', () => {
        const result = animationUtils.transition('opacity');
        expect(result).toContain('opacity');
        expect(result).toContain('300ms');
      });

      it('여러 속성 트랜지션을 생성해야 한다', () => {
        const result = animationUtils.transition(['opacity', 'transform']);
        expect(result).toContain('opacity');
        expect(result).toContain('transform');
        expect(result).toContain(',');
      });

      it('커스텀 설정을 사용해야 한다', () => {
        const result = animationUtils.transition('opacity', '500ms', 'ease-in', '100ms');
        expect(result).toContain('opacity 500ms ease-in 100ms');
      });
    });

    describe('keyframes', () => {
      it('키프레임 애니메이션을 생성해야 한다', () => {
        const frames = {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        };
        const result = animationUtils.keyframes('fadeIn', frames);
        
        expect(result).toContain('@keyframes fadeIn');
        expect(result).toContain('0%');
        expect(result).toContain('100%');
        expect(result).toContain('opacity: 0');
        expect(result).toContain('opacity: 1');
      });
    });

    describe('fadeIn', () => {
      it('페이드 인 애니메이션 스타일을 반환해야 한다', () => {
        const result = animationUtils.fadeIn();
        expect(result.opacity).toBe(0);
        expect(result.animation).toContain('fadeIn');
        expect(result.animation).toContain('300ms');
      });

      it('커스텀 지속시간을 사용해야 한다', () => {
        const result = animationUtils.fadeIn('500ms');
        expect(result.animation).toContain('500ms');
      });
    });

    describe('slideIn', () => {
      it('슬라이드 인 애니메이션 스타일을 반환해야 한다', () => {
        const result = animationUtils.slideIn('up');
        expect(result.transform).toBe('translateY(100%)');
        expect(result.animation).toContain('slideInUp');
      });

      it('다양한 방향을 처리해야 한다', () => {
        expect(animationUtils.slideIn('down').transform).toBe('translateY(-100%)');
        expect(animationUtils.slideIn('left').transform).toBe('translateX(100%)');
        expect(animationUtils.slideIn('right').transform).toBe('translateX(-100%)');
      });
    });
  });

  describe('layoutUtils', () => {
    describe('flex', () => {
      it('flex center 스타일을 반환해야 한다', () => {
        const result = layoutUtils.flex.center();
        expect(result.display).toBe('flex');
        expect(result.alignItems).toBe('center');
        expect(result.justifyContent).toBe('center');
      });

      it('flex between 스타일을 반환해야 한다', () => {
        const result = layoutUtils.flex.between();
        expect(result.justifyContent).toBe('space-between');
      });

      it('flex column 스타일을 반환해야 한다', () => {
        const result = layoutUtils.flex.column();
        expect(result.flexDirection).toBe('column');
      });

      it('flex wrap 스타일을 반환해야 한다', () => {
        const result = layoutUtils.flex.wrap();
        expect(result.flexWrap).toBe('wrap');
      });
    });

    describe('grid', () => {
      it('auto grid 스타일을 반환해야 한다', () => {
        const result = layoutUtils.grid.auto();
        expect(result.display).toBe('grid');
        expect(result.gridTemplateColumns).toContain('repeat(auto-fit');
        expect(result.gap).toBe('1rem');
      });

      it('커스텀 최소 컬럼 너비를 사용해야 한다', () => {
        const result = layoutUtils.grid.auto('300px');
        expect(result.gridTemplateColumns).toContain('300px');
      });

      it('columns grid 스타일을 반환해야 한다', () => {
        const result = layoutUtils.grid.columns(3);
        expect(result.gridTemplateColumns).toBe('repeat(3, 1fr)');
      });
    });

    describe('aspectRatio', () => {
      it('종횡비 스타일을 반환해야 한다', () => {
        const result = layoutUtils.aspectRatio('16/9');
        expect(result.aspectRatio).toBe('16/9');
        expect(result['&::before']).toBeDefined();
      });
    });

    describe('responsiveGap', () => {
      it('반응형 간격 스타일을 반환해야 한다', () => {
        const result = layoutUtils.responsiveGap('0.5rem', '1rem', '2rem');
        
        // 모바일 간격
        expect(result.gap).toBe('0.5rem');
        
        // 태블릿 미디어 쿼리
        expect(result['@media (min-width: 768px)']).toBeDefined();
        expect(result['@media (min-width: 768px)'].gap).toBe('1rem');
        
        // 데스크톱 미디어 쿼리
        expect(result['@media (min-width: 1024px)']).toBeDefined();
        expect(result['@media (min-width: 1024px)'].gap).toBe('2rem');
      });

      it('단일 간격 값만 제공해도 작동해야 한다', () => {
        const result = layoutUtils.responsiveGap('1rem');
        
        // 모바일 간격만 설정
        expect(result.gap).toBe('1rem');
        
        // 미디어 쿼리는 기본값을 가져야 함
        expect(result['@media (min-width: 768px)']).toBeDefined();
        expect(result['@media (min-width: 768px)'].gap).toBe('1rem'); // mobile 값 사용
        expect(result['@media (min-width: 1024px)']).toBeDefined();
        expect(result['@media (min-width: 1024px)'].gap).toBe('1rem'); // mobile 값 사용
      });
    });
  });

  describe('textUtils', () => {
    describe('ellipsis', () => {
      it('단일 라인 ellipsis 스타일을 반환해야 한다', () => {
        const result = textUtils.ellipsis();
        expect(result.overflow).toBe('hidden');
        expect(result.textOverflow).toBe('ellipsis');
        expect(result.whiteSpace).toBe('nowrap');
      });

      it('다중 라인 ellipsis 스타일을 반환해야 한다', () => {
        const result = textUtils.ellipsis(3);
        expect(result.WebkitLineClamp).toBe(3);
        expect(result.lineClamp).toBe(3);
      });
    });

    describe('readableWidth', () => {
      it('읽기 편한 너비 스타일을 반환해야 한다', () => {
        const result = textUtils.readableWidth();
        expect(result.maxWidth).toBe('65ch');
      });
    });

    describe('responsiveSize', () => {
      it('반응형 폰트 크기 스타일을 반환해야 한다', () => {
        const result = textUtils.responsiveSize('0.875rem', '1rem', '1.5rem');
        
        // 모바일 폰트 크기
        expect(result.fontSize).toBe('0.875rem');
        
        // 태블릿 미디어 쿼리
        expect(result['@media (min-width: 768px)']).toBeDefined();
        expect(result['@media (min-width: 768px)'].fontSize).toBe('1rem');
        
        // 데스크톱 미디어 쿼리
        expect(result['@media (min-width: 1024px)']).toBeDefined();
        expect(result['@media (min-width: 1024px)'].fontSize).toBe('1.5rem');
      });

      it('단일 크기 값만 제공해도 작동해야 한다', () => {
        const result = textUtils.responsiveSize('1rem');
        
        // 모바일 폰트 크기만 설정
        expect(result.fontSize).toBe('1rem');
        
        // 미디어 쿼리는 기본값을 가져야 함
        expect(result['@media (min-width: 768px)']).toBeDefined();
        expect(result['@media (min-width: 768px)'].fontSize).toBe('1rem'); // mobile 값 사용
        expect(result['@media (min-width: 1024px)']).toBeDefined();
        expect(result['@media (min-width: 1024px)'].fontSize).toBe('1rem'); // mobile 값 사용
      });

      it('다양한 폰트 크기를 처리해야 한다', () => {
        const result = textUtils.responsiveSize('14px', '16px', '18px');
        
        expect(result.fontSize).toBe('14px');
        expect(result['@media (min-width: 768px)'].fontSize).toBe('16px');
        expect(result['@media (min-width: 1024px)'].fontSize).toBe('18px');
      });
    });
  });

  describe('a11yUtils', () => {
    describe('srOnly', () => {
      it('스크린 리더 전용 스타일을 반환해야 한다', () => {
        const result = a11yUtils.srOnly();
        expect(result.position).toBe('absolute');
        expect(result.width).toBe('1px');
        expect(result.height).toBe('1px');
        expect(result.overflow).toBe('hidden');
      });
    });

    describe('focusRing', () => {
      it('포커스 링 스타일을 반환해야 한다', () => {
        const result = a11yUtils.focusRing();
        expect(result['&:focus-visible']).toBeDefined();
        expect(result['&:focus-visible'].outline).toContain('2px solid');
      });

      it('커스텀 색상을 사용해야 한다', () => {
        const result = a11yUtils.focusRing('#ff0000');
        expect(result['&:focus-visible'].outline).toContain('#ff0000');
      });
    });

    describe('highContrast', () => {
      it('고대비 모드 스타일을 반환해야 한다', () => {
        const styles = { color: 'black' };
        const result = a11yUtils.highContrast(styles);
        expect(result['@media (prefers-contrast: high)']).toEqual(styles);
      });
    });

    describe('reducedMotion', () => {
      it('모션 감소 스타일을 반환해야 한다', () => {
        const styles = { animation: 'none' };
        const result = a11yUtils.reducedMotion(styles);
        expect(result['@media (prefers-reduced-motion: reduce)']).toEqual(styles);
      });
    });
  });

  describe('performanceUtils', () => {
    it('GPU 가속 스타일을 반환해야 한다', () => {
      const result = performanceUtils.gpuAcceleration();
      expect(result.transform).toBe('translateZ(0)');
      expect(result.willChange).toBe('transform');
    });

    it('레이어 분리 스타일을 반환해야 한다', () => {
      const result = performanceUtils.layerSeparation();
      expect(result.isolation).toBe('isolate');
    });

    it('애니메이션 최적화 스타일을 반환해야 한다', () => {
      const result = performanceUtils.optimizeAnimation();
      expect(result.willChange).toBe('transform, opacity');
      expect(result.backfaceVisibility).toBe('hidden');
      expect(result.perspective).toBe('1000px');
    });
  });

  describe('createStyles', () => {
    it('CSS 객체를 문자열로 변환해야 한다', () => {
      const styles = {
        button: { backgroundColor: 'blue', fontSize: '16px' },
        text: { color: 'black' }
      };
      
      const result = createStyles(styles);
      
      expect(result.button).toContain('background-color: blue');
      expect(result.button).toContain('font-size: 16px');
      expect(result.text).toBe('color: black');
    });
  });

  describe('tokens', () => {
    describe('color', () => {
      it('색상 토큰을 반환해야 한다', () => {
        const result = tokens.color('primary.500');
        expect(result).toBe('#0ea5e9');
      });

      it('존재하지 않는 토큰에 대해 기본값을 반환해야 한다', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const result = tokens.color('nonexistent.color');
        
        expect(result).toBe('#000000');
        expect(consoleSpy).toHaveBeenCalledWith('Color token not found: nonexistent.color');
        
        consoleSpy.mockRestore();
      });
    });

    describe('spacing', () => {
      it('간격 토큰을 반환해야 한다', () => {
        const result = tokens.spacing(4);
        expect(result).toBe('1rem');
      });
    });

    describe('fontSize', () => {
      it('폰트 크기 토큰을 반환해야 한다', () => {
        const result = tokens.fontSize('lg');
        expect(result).toBe('1.5rem');
      });

      it('다른 브레이크포인트 크기를 반환해야 한다', () => {
        const mobile = tokens.fontSize('lg', 'mobile');
        const tablet = tokens.fontSize('lg', 'tablet');
        
        expect(mobile).toBe('1.125rem');
        expect(tablet).toBe('1.25rem');
      });
    });

    describe('shadow', () => {
      it('그림자 토큰을 반환해야 한다', () => {
        const result = tokens.shadow('sm');
        expect(result).toBe('0 1px 2px 0 rgba(0, 0, 0, 0.05)');
      });
    });

    describe('radius', () => {
      it('반지름 토큰을 반환해야 한다', () => {
        const result = tokens.radius('md');
        expect(result).toBe('0.375rem');
      });
    });
  });

  describe('엣지 케이스', () => {
    it('빈 값들을 안전하게 처리해야 한다', () => {
      expect(cn()).toBe('');
      expect(shadowUtils.combine()).toBe('');
      expect(createStyles({})).toEqual({});
    });

    it('잘못된 입력을 처리해야 한다', () => {
      expect(colorUtils.hexToRgb('')).toBeNull();
      expect(colorUtils.addAlpha('', 0.5)).toBe('');
      expect(colorUtils.adjustBrightness('', 50)).toBe('');
    });

    it('경계값을 처리해야 한다', () => {
      expect(colorUtils.rgbToHex(0, 0, 0)).toBe('#000000');
      expect(colorUtils.rgbToHex(255, 255, 255)).toBe('#ffffff');
      expect(shadowUtils.elevation(-1)).toContain('rgba');
    });
  });
});