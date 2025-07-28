/**
 * 텍스트 표시 관련 유틸리티 함수들
 * 텍스트 오버플로우, 말줄임, 반응형 폰트 크기 처리
 */

export interface TextOverflowConfig {
  maxLines?: number;
  maxWidth?: string;
  showTooltip?: boolean;
  breakWord?: boolean;
}

/**
 * 텍스트 길이에 따른 말줄임 스타일 생성
 */
export const createTextOverflowStyles = (config: TextOverflowConfig = {}): React.CSSProperties => {
  const {
    maxLines = 1,
    maxWidth = '100%',
    breakWord = true
  } = config;

  if (maxLines === 1) {
    return {
      maxWidth,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      wordBreak: breakWord ? 'break-word' : 'normal'
    };
  }

  return {
    maxWidth,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: 'vertical',
    wordBreak: breakWord ? 'break-word' : 'normal',
    lineHeight: '1.5em',
    maxHeight: `${maxLines * 1.5}em`
  };
};

/**
 * 반응형 폰트 크기 계산
 */
export const getResponsiveFontSize = (
  minSize: number,
  preferredSize: number,
  maxSize: number,
  unit: 'px' | 'rem' | 'em' = 'px'
): string => {
  return `clamp(${minSize}${unit}, ${preferredSize}vw, ${maxSize}${unit})`;
};

/**
 * 텍스트가 컨테이너를 오버플로우하는지 확인
 */
export const checkTextOverflow = (element: HTMLElement): boolean => {
  return element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;
};

/**
 * 긴 함수명을 단축하여 표시 (개발자 친화적)
 */
export const truncateFunctionName = (functionName: string, maxLength: number = 20): string => {
  if (functionName.length <= maxLength) {
    return functionName;
  }

  // 특별한 함수명들은 의미를 유지하면서 단축
  const specialCases: Record<string, string> = {
    'setTimeout': 'setTimeout',
    'setInterval': 'setInterval',
    'queueMicrotask': 'queueMicro',
    'requestAnimationFrame': 'requestAF',
    'addEventListener': 'addEvent',
    'removeEventListener': 'removeEvent'
  };

  if (specialCases[functionName]) {
    return specialCases[functionName];
  }

  // 일반적인 경우: 앞부분과 끝부분을 보존
  if (maxLength <= 10) {
    return functionName.slice(0, maxLength - 3) + '...';
  }

  const frontPart = Math.floor((maxLength - 3) / 2);
  const backPart = maxLength - 3 - frontPart;
  
  return functionName.slice(0, frontPart) + '...' + functionName.slice(-backPart);
};

/**
 * 다국어 지원을 위한 텍스트 길이 계산 (한글, 영문 등 고려)
 */
export const getVisualTextLength = (text: string): number => {
  let length = 0;
  
  for (const char of text) {
    // 한글, 중국어, 일본어 등은 2글자 폭으로 계산
    if (/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(char)) {
      length += 2;
    } else {
      length += 1;
    }
  }
  
  return length;
};

/**
 * 시각적 길이 기준으로 텍스트 자르기
 */
export const truncateByVisualLength = (text: string, maxVisualLength: number): string => {
  let currentLength = 0;
  let result = '';
  
  for (const char of text) {
    const charLength = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(char) ? 2 : 1;
    
    if (currentLength + charLength > maxVisualLength) {
      break;
    }
    
    result += char;
    currentLength += charLength;
  }
  
  return currentLength < getVisualTextLength(text) ? result + '...' : result;
};

/**
 * CSS 클래스명을 생성하는 헬퍼
 */
export const createTextDisplayClasses = (config: TextOverflowConfig): string => {
  const classes = ['text-display-optimized'];
  
  if (config.maxLines === 1) {
    classes.push('single-line-truncate');
  } else {
    classes.push('multi-line-truncate');
  }
  
  if (config.breakWord) {
    classes.push('break-word');
  }
  
  return classes.join(' ');
};

/**
 * 반응형 타이포그래피 스케일
 */
export const typography = {
  // 헤딩 크기
  heading: {
    h1: getResponsiveFontSize(24, 4, 32, 'px'),
    h2: getResponsiveFontSize(20, 3.5, 28, 'px'),
    h3: getResponsiveFontSize(18, 3, 24, 'px'),
    h4: getResponsiveFontSize(16, 2.5, 20, 'px'),
    h5: getResponsiveFontSize(14, 2, 18, 'px'),
    h6: getResponsiveFontSize(12, 1.8, 16, 'px'),
  },
  // 본문 텍스트
  body: {
    large: getResponsiveFontSize(16, 2.2, 18, 'px'),
    medium: getResponsiveFontSize(14, 2, 16, 'px'),
    small: getResponsiveFontSize(12, 1.8, 14, 'px'),
  },
  // 캡션 및 라벨
  caption: {
    large: getResponsiveFontSize(12, 1.6, 14, 'px'),
    medium: getResponsiveFontSize(11, 1.4, 12, 'px'),
    small: getResponsiveFontSize(10, 1.2, 11, 'px'),
  }
};