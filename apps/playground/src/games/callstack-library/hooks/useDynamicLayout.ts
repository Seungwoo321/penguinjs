/**
 * 동적 레이아웃 관리 훅
 * 콘텐츠 양에 따라 레이아웃을 자동으로 조정
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMobileFirst } from './useMobileFirst';

interface LayoutConfig {
  columns: string;
  rows: string;
  minHeight: string;
  maxHeight: string;
  gap: string;
  padding: string;
}

interface ContentMetrics {
  hasContent: boolean;
  contentHeight: number;
  contentWidth: number;
  itemCount: number;
  overflowing: boolean;
}

interface PanelMetrics {
  [key: string]: ContentMetrics;
}

interface DynamicLayoutOptions {
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
    wide?: number;
  };
  minPanelHeight?: number;
  maxPanelHeight?: number;
  contentBasedHeight?: boolean;
  responsiveGaps?: boolean;
  mobileFirst?: boolean;
}

interface DynamicLayoutResult {
  layoutConfig: LayoutConfig;
  panelRefs: Record<string, React.RefObject<HTMLElement>>;
  updatePanelMetrics: (panelId: string, metrics: ContentMetrics) => void;
  isCompactMode: boolean;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
}

/**
 * 동적 레이아웃 관리 훅
 */
export const useDynamicLayout = (options: DynamicLayoutOptions = {}): DynamicLayoutResult => {
  const {
    breakpoints = { mobile: 640, tablet: 768, desktop: 1024, wide: 1280 },
    minPanelHeight = 300,
    maxPanelHeight = 800,
    contentBasedHeight = true,
    responsiveGaps = true,
    mobileFirst = true
  } = options;
  
  // Mobile-first 반응형 시스템 사용
  const mobileFirstSystem = useMobileFirst(breakpoints);

  const [panelMetrics, setPanelMetrics] = useState<PanelMetrics>({});
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    columns: '1fr',
    rows: 'auto',
    minHeight: `${minPanelHeight}px`,
    maxHeight: `${maxPanelHeight}px`,
    gap: '16px',
    padding: '16px'
  });

  const panelRefs = useRef<Record<string, React.RefObject<HTMLElement>>>({});

  // Mobile-first 반응형 시스템에서 브레이크포인트 가져오기
  const currentBreakpoint: 'mobile' | 'tablet' | 'desktop' = mobileFirst 
    ? (mobileFirstSystem.breakpoint === 'wide' ? 'desktop' : mobileFirstSystem.breakpoint) as 'mobile' | 'tablet' | 'desktop'
    : (windowSize.width < breakpoints.mobile ? 'mobile' :
       windowSize.width < breakpoints.tablet ? 'tablet' : 'desktop');

  const isCompactMode = mobileFirst ? mobileFirstSystem.isMobile : currentBreakpoint === 'mobile';

  // 패널 ref 생성
  const getPanelRef = useCallback((panelId: string) => {
    if (!panelRefs.current[panelId]) {
      panelRefs.current[panelId] = { current: null };
    }
    return panelRefs.current[panelId];
  }, []);

  // 윈도우 크기 감지
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  // 패널 메트릭스 업데이트
  const updatePanelMetrics = useCallback((panelId: string, metrics: ContentMetrics) => {
    setPanelMetrics(prev => ({
      ...prev,
      [panelId]: metrics
    }));
  }, []);

  // 레이아웃 업데이트 (디바운싱 추가)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Mobile-first 레이아웃 계산
      const calculateLayout = (): LayoutConfig => {
    const totalPanels = Object.keys(panelMetrics).length;
    
    // Mobile-first 컬럼 구성
    let columns: string;
    
    if (mobileFirst) {
      // Mobile-first 접근법
      columns = mobileFirstSystem.getResponsiveValue({
        mobile: '1fr', // 모바일: 단일 컴럼
        tablet: totalPanels <= 2 ? 'repeat(2, 1fr)' : '1fr 1fr', // 태블릿: 2컴럼 또는 전체 영역
        desktop: totalPanels === 3 
          ? 'minmax(280px, 1fr) minmax(320px, 1.6fr) minmax(280px, 1fr)' // Layout B 전용
          : `repeat(${Math.min(totalPanels, 3)}, 1fr)`,
        wide: totalPanels === 3
          ? 'minmax(320px, 1fr) minmax(400px, 1.5fr) minmax(320px, 1fr)' // 대형 화면 최적화
          : `repeat(${Math.min(totalPanels, 4)}, 1fr)`
      });
    } else {
      // 기존 데스크톱 우선 접근법
      if (currentBreakpoint === 'mobile') {
        columns = '1fr';
      } else if (currentBreakpoint === 'tablet') {
        columns = totalPanels <= 2 ? 'repeat(2, 1fr)' : '1fr 1fr';
      } else {
        columns = totalPanels === 3 
          ? 'minmax(300px, 1fr) minmax(400px, 1.5fr) minmax(300px, 1fr)'
          : `repeat(${Math.min(totalPanels, 3)}, 1fr)`;
      }
    }

    // 콘텐츠 기반 높이 계산
    let minHeight = `${minPanelHeight}px`;
    let maxHeight = `${maxPanelHeight}px`;
    
    if (contentBasedHeight) {
      const contentHeights = Object.values(panelMetrics).map(m => m.contentHeight);
      if (contentHeights.length > 0) {
        const avgHeight = contentHeights.reduce((a, b) => a + b, 0) / contentHeights.length;
        const calculatedHeight = Math.max(minPanelHeight, Math.min(avgHeight * 1.2, maxPanelHeight));
        minHeight = `${calculatedHeight}px`;
        maxHeight = 'fit-content';
      }
    }

    // Mobile-first 반응형 간격
    let gap = '16px';
    if (responsiveGaps) {
      if (mobileFirst) {
        gap = mobileFirstSystem.getResponsiveValue({
          mobile: '8px',   // 모바일: 좋은 공간
          tablet: '12px',  // 태블릿: 중간 공간
          desktop: '16px', // 데스크톱: 넓은 공간
          wide: '20px'     // 대형: 최대 공간
        });
      } else {
        gap = currentBreakpoint === 'mobile' ? '12px' :
              currentBreakpoint === 'tablet' ? '16px' : '20px';
      }
    }

    // Mobile-first 반응형 패딩
    const padding = mobileFirst 
      ? mobileFirstSystem.getResponsiveValue({
          mobile: '12px',
          tablet: '16px', 
          desktop: '20px',
          wide: '24px'
        })
      : (currentBreakpoint === 'mobile' ? '12px' :
         currentBreakpoint === 'tablet' ? '16px' : '20px');

    return {
      columns,
      rows: 'auto',
      minHeight,
      maxHeight,
      gap,
      padding
    };
  };

      const newLayout = calculateLayout();
      setLayoutConfig(newLayout);
    }, 100); // 100ms 디바운싱

    return () => clearTimeout(timeoutId);
  }, [panelMetrics, currentBreakpoint, minPanelHeight, maxPanelHeight, contentBasedHeight, responsiveGaps, mobileFirst]);

  return {
    layoutConfig,
    panelRefs: Object.fromEntries(
      Object.keys(panelMetrics).map(id => [id, getPanelRef(id)])
    ),
    updatePanelMetrics,
    isCompactMode,
    currentBreakpoint
  };
};

/**
 * 패널 콘텐츠 메트릭스 측정 훅
 */
export const usePanelMetrics = (
  panelId: string,
  updateMetrics: (panelId: string, metrics: ContentMetrics) => void
) => {
  const ref = useRef<HTMLElement>(null);
  const [metrics, setMetrics] = useState<ContentMetrics>({
    hasContent: false,
    contentHeight: 0,
    contentWidth: 0,
    itemCount: 0,
    overflowing: false
  });

  const measureContent = useCallback(() => {
    if (!ref.current) return;

    const element = ref.current;
    const rect = element.getBoundingClientRect();
    
    // 자식 요소들의 개수 (콘텐츠 양 측정)
    const itemCount = element.querySelectorAll('[data-item]').length ||
                     element.children.length;

    // 스크롤 높이로 실제 콘텐츠 크기 측정
    const contentHeight = element.scrollHeight;
    const contentWidth = element.scrollWidth;

    // 오버플로우 여부
    const overflowing = contentHeight > rect.height || contentWidth > rect.width;

    const newMetrics: ContentMetrics = {
      hasContent: itemCount > 0,
      contentHeight,
      contentWidth,
      itemCount,
      overflowing
    };

    setMetrics(newMetrics);
    updateMetrics(panelId, newMetrics);
  }, [panelId]); // updateMetrics 의존성 제거하여 무한 루프 방지

  useEffect(() => {
    if (!ref.current) return;

    let timeoutId: NodeJS.Timeout;
    
    // 디바운싱된 측정 함수
    const debouncedMeasure = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        measureContent();
      }, 100); // 100ms 디바운싱
    };

    const resizeObserver = new ResizeObserver(debouncedMeasure);
    const mutationObserver = new MutationObserver(debouncedMeasure);

    const element = ref.current;
    resizeObserver.observe(element);
    mutationObserver.observe(element, {
      childList: true,
      subtree: true,
      attributes: true
    });

    // 초기 측정
    measureContent();

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [measureContent]);

  return { ref, metrics };
};

/**
 * CSS 그리드 스타일 생성
 */
export const createGridStyles = (config: LayoutConfig): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: config.columns,
  gridTemplateRows: config.rows,
  gap: config.gap,
  padding: config.padding,
  minHeight: config.minHeight,
  maxHeight: config.maxHeight,
  width: '100%',
  height: 'fit-content'
});

/**
 * 패널 스타일 생성
 */
export const createPanelStyles = (
  config: LayoutConfig,
  isOverflowing: boolean = false
): React.CSSProperties => ({
  minHeight: config.minHeight,
  maxHeight: config.maxHeight,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  ...(isOverflowing && {
    borderColor: '#ef4444',
    boxShadow: '0 0 0 1px #ef4444'
  })
});