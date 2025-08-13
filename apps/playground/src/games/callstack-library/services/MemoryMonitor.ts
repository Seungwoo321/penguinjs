/**
 * 전역 메모리 모니터링 서비스
 * 싱글톤 패턴으로 단일 인스턴스만 유지
 */

interface MemoryStats {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
  leakDetected?: boolean;
  componentCount: number;
}

interface MemoryMonitorOptions {
  enableMonitoring?: boolean;
  leakThreshold?: number; // MB
  cleanupInterval?: number; // ms
  maxComponentAge?: number; // ms
}

class MemoryMonitor {
  private static instance: MemoryMonitor;
  private metricsRef: MemoryStats = {
    componentCount: 0,
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
    leakDetected: false
  };
  
  private cleanupFunctions = new Set<() => void>();
  private observers = new Set<(stats: MemoryStats) => void>();
  private intervalId: NodeJS.Timeout | null = null;
  private lastCleanupTime = Date.now();
  private options: Required<MemoryMonitorOptions> = {
    enableMonitoring: process.env.NODE_ENV === 'development',
    leakThreshold: 80,
    cleanupInterval: 30000,
    maxComponentAge: 300000 // 5분
  };

  private constructor() {
    // 싱글톤 패턴
  }

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  configure(options: MemoryMonitorOptions) {
    this.options = { ...this.options, ...options };
    this.restart();
  }

  start() {
    if (!this.options.enableMonitoring || this.intervalId) return;
    
    // 초기 체크
    this.checkMemory();
    
    // 주기적 체크
    this.intervalId = setInterval(() => {
      this.checkMemory();
    }, this.options.cleanupInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  restart() {
    this.stop();
    this.start();
  }

  private checkMemory() {
    const componentCount = this.cleanupFunctions.size;
    let memoryData: MemoryStats = { componentCount };

    // Chrome memory API 사용
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedJSHeapSize = memory.usedJSHeapSize;
      const usedMB = usedJSHeapSize / (1024 * 1024);
      const leakDetected = usedMB > this.options.leakThreshold;

      memoryData = {
        ...memoryData,
        usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        leakDetected
      };

      // 메트릭 업데이트
      this.metricsRef = memoryData;

      // 임계값 초과시 경고 (심각한 경우만)
      if (leakDetected && usedMB > this.options.leakThreshold * 1.5) {
        console.warn(`🚨 Critical memory usage: ${usedMB.toFixed(2)}MB used`);
        
        // 이벤트 발생
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('memory-pressure', {
            detail: { component: 'MemoryMonitor', usage: usedMB }
          }));
        }
        
        // 자동 최적화 - 5분마다 한 번만
        const now = Date.now();
        const timeSinceLastCleanup = now - this.lastCleanupTime;
        
        if (usedMB > this.options.leakThreshold * 1.5 && timeSinceLastCleanup > this.options.maxComponentAge) {
          this.performCleanup();
          this.lastCleanupTime = now;
        }
      }
    }

    // 옵저버들에게 알림
    this.observers.forEach(observer => observer(memoryData));
  }

  registerCleanup(cleanup: () => void): () => void {
    this.cleanupFunctions.add(cleanup);
    return () => {
      this.cleanupFunctions.delete(cleanup);
    };
  }

  performCleanup() {
    this.cleanupFunctions.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Cleanup function failed:', error);
      }
    });
    
    this.cleanupFunctions.clear();
    
    // 가비지 컬렉션 제안
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }

  getCurrentMetrics(): MemoryStats {
    return { ...this.metricsRef };
  }

  isMemoryPressure(): boolean {
    const current = this.metricsRef;
    return current.usedJSHeapSize 
      ? current.usedJSHeapSize / (1024 * 1024) > this.options.leakThreshold * 0.8
      : false;
  }

  // 옵저버 패턴 - 상태 변경 구독
  subscribe(observer: (stats: MemoryStats) => void): () => void {
    this.observers.add(observer);
    return () => {
      this.observers.delete(observer);
    };
  }
}

// 전역 인스턴스 export
export const memoryMonitor = MemoryMonitor.getInstance();