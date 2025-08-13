/**
 * 싱글톤 MemoryMonitor를 사용하는 간단한 훅
 * 기존 useMemoryManagement를 대체하여 중복 인스턴스 문제 해결
 */

import { useEffect, useCallback, useState } from 'react';
import { memoryMonitor } from '@/games/callstack-library/services/MemoryMonitor';

interface UseMemoryMonitorResult {
  getCurrentMetrics: () => any;
  registerCleanup: (cleanup: () => void) => () => void;
  forceCleanup: () => void;
  isMemoryPressure: () => boolean;
  memoryStats: any;
}

/**
 * 싱글톤 메모리 모니터 훅
 * 전역 MemoryMonitor 서비스를 React 컴포넌트에서 사용
 */
export const useMemoryMonitor = (): UseMemoryMonitorResult => {
  const [memoryStats, setMemoryStats] = useState(memoryMonitor.getCurrentMetrics());

  useEffect(() => {
    // 싱글톤 서비스 시작 (이미 실행 중이면 무시됨)
    memoryMonitor.start();

    // 메모리 상태 구독
    const unsubscribe = memoryMonitor.subscribe((stats) => {
      setMemoryStats(stats);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getCurrentMetrics = useCallback(() => {
    return memoryMonitor.getCurrentMetrics();
  }, []);

  const registerCleanup = useCallback((cleanup: () => void) => {
    return memoryMonitor.registerCleanup(cleanup);
  }, []);

  const forceCleanup = useCallback(() => {
    memoryMonitor.performCleanup();
  }, []);

  const isMemoryPressure = useCallback(() => {
    return memoryMonitor.isMemoryPressure();
  }, []);

  return {
    getCurrentMetrics,
    registerCleanup,
    forceCleanup,
    isMemoryPressure,
    memoryStats
  };
};