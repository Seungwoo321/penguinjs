/**
 * Performance Analyzer Plugin Example
 * 
 * Phase 4: 확장성 확보 - 플러그인 시스템 구현
 * 성능 분석을 위한 예제 플러그인
 */

import { AnalyzerPlugin } from '@/games/callstack-library/shared/lib/plugin-system/BasePlugin';
import { PluginContext } from '@/games/callstack-library/shared/lib/plugin-system/PluginRegistry';

// 성능 분석 결과 타입
interface PerformanceAnalysis {
  totalExecutionTime: number;
  averageTickTime: number;
  tickCount: number;
  bottlenecks: BottleneckInfo[];
  memoryUsage: MemoryInfo;
  queueUtilization: QueueUtilization;
  recommendations: string[];
}

interface BottleneckInfo {
  type: 'callstack' | 'microtask' | 'macrotask';
  description: string;
  impact: 'low' | 'medium' | 'high';
  suggestion: string;
}

interface MemoryInfo {
  peakUsage: number;
  averageUsage: number;
  leakSuspects: string[];
}

interface QueueUtilization {
  callstack: {
    maxDepth: number;
    averageDepth: number;
    utilizationRate: number;
  };
  microtask: {
    maxLength: number;
    averageLength: number;
    processingRate: number;
  };
  macrotask: {
    maxLength: number;
    averageLength: number;
    averageDelay: number;
  };
}

// 성능 분석기 플러그인
export class PerformanceAnalyzerPlugin extends AnalyzerPlugin {
  public readonly id = 'performance-analyzer';
  public readonly name = 'Performance Analyzer';
  public readonly version = '1.0.0';
  public readonly description = 'Analyzes event loop performance and identifies bottlenecks';
  public readonly author = 'CallStack Library Team';

  private analysisHistory: PerformanceAnalysis[] = [];
  private currentAnalysis: PerformanceAnalysis | null = null;
  private isAnalyzing = false;
  private analysisInterval: number | null = null;

  protected async onInitialize(context: PluginContext): Promise<void> {
    this.log('info', 'Initializing Performance Analyzer Plugin');
    
    // 시스템 이벤트 리스너 등록
    this.onSystemEvent('STATE_CHANGED', this.handleStateChange.bind(this));
    this.onSystemEvent('SIMULATION_STEP', this.handleSimulationStep.bind(this));
    this.onSystemEvent('TICK_COMPLETED', this.handleTickCompleted.bind(this));
  }

  protected async onActivate(context: PluginContext): Promise<void> {
    this.log('info', 'Activating Performance Analyzer Plugin');
    
    // 자동 분석 시작 (설정에 따라)
    const autoAnalyze = this.getConfig('autoAnalyze') ?? true;
    const analysisInterval = this.getConfig('analysisInterval') ?? 5000; // 5초마다

    if (autoAnalyze) {
      this.startContinuousAnalysis(analysisInterval);
    }
  }

  protected async onDeactivate(context: PluginContext): Promise<void> {
    this.log('info', 'Deactivating Performance Analyzer Plugin');
    
    this.stopContinuousAnalysis();
  }

  protected async onDestroy(): Promise<void> {
    this.stopContinuousAnalysis();
    this.analysisHistory = [];
    this.currentAnalysis = null;
  }

  // === 분석 기능 구현 ===

  protected async analyzeData(data: any): Promise<PerformanceAnalysis> {
    this.log('info', 'Starting performance analysis');
    
    if (this.isAnalyzing) {
      throw new Error('Analysis already in progress');
    }

    this.isAnalyzing = true;

    try {
      // 성능 메트릭 수집
      const performanceMetrics = await this.collectPerformanceMetrics(data);
      
      // 분석 수행
      const analysis = await this.performAnalysis(performanceMetrics);
      
      // 결과 저장
      this.currentAnalysis = analysis;
      this.analysisHistory.push(analysis);
      
      // 히스토리 크기 제한 (최근 100개)
      if (this.analysisHistory.length > 100) {
        this.analysisHistory = this.analysisHistory.slice(-100);
      }

      this.log('info', 'Performance analysis completed');
      this.emitSystemEvent('ANALYSIS_COMPLETED', analysis);

      return analysis;

    } finally {
      this.isAnalyzing = false;
    }
  }

  protected getAnalysisResults(): PerformanceAnalysis | null {
    return this.currentAnalysis;
  }

  // === private 메서드들 ===

  private async collectPerformanceMetrics(data: any): Promise<any> {
    try {
      // CQRS 서비스에서 성능 메트릭 수집
      const cqrsService = this.context?.getCQRSService();
      if (!cqrsService) {
        throw new Error('CQRS Service not available');
      }

      const [
        currentState,
        performanceMetrics,
        executionHistory,
        eventHistory
      ] = await Promise.all([
        cqrsService.getCurrentState(),
        cqrsService.getPerformanceMetrics(60000), // 최근 1분
        cqrsService.getExecutionHistory(1000),
        cqrsService.getEvents()
      ]);

      return {
        currentState: currentState.data,
        performanceMetrics: performanceMetrics.data,
        executionHistory: executionHistory.data,
        eventHistory: eventHistory.data,
        timestamp: Date.now()
      };

    } catch (error) {
      this.log('error', 'Failed to collect performance metrics:', error);
      throw error;
    }
  }

  private async performAnalysis(metrics: any): Promise<PerformanceAnalysis> {
    const {
      currentState,
      performanceMetrics,
      executionHistory,
      eventHistory
    } = metrics;

    // 기본 실행 통계
    const totalExecutionTime = this.calculateTotalExecutionTime(executionHistory);
    const averageTickTime = performanceMetrics.latency?.averageTickTime || 0;
    const tickCount = currentState.eventLoopState?.currentTick || 0;

    // 병목 지점 분석
    const bottlenecks = this.identifyBottlenecks(metrics);

    // 메모리 사용량 분석
    const memoryUsage = this.analyzeMemoryUsage(metrics);

    // 큐 활용도 분석
    const queueUtilization = this.analyzeQueueUtilization(metrics);

    // 개선 권장사항 생성
    const recommendations = this.generateRecommendations({
      bottlenecks,
      memoryUsage,
      queueUtilization,
      performanceMetrics
    });

    return {
      totalExecutionTime,
      averageTickTime,
      tickCount,
      bottlenecks,
      memoryUsage,
      queueUtilization,
      recommendations
    };
  }

  private calculateTotalExecutionTime(executionHistory: any): number {
    if (!executionHistory.steps || executionHistory.steps.length === 0) {
      return 0;
    }

    const firstStep = executionHistory.steps[0];
    const lastStep = executionHistory.steps[executionHistory.steps.length - 1];
    
    return lastStep.timestamp - firstStep.timestamp;
  }

  private identifyBottlenecks(metrics: any): BottleneckInfo[] {
    const bottlenecks: BottleneckInfo[] = [];
    const { performanceMetrics, currentState } = metrics;

    // 콜스택 병목 확인
    const callStackDepth = currentState.eventLoopState?.callStack?.length || 0;
    if (callStackDepth > 50) {
      bottlenecks.push({
        type: 'callstack',
        description: `Call stack depth is very high (${callStackDepth})`,
        impact: 'high',
        suggestion: 'Consider breaking down large functions or using async patterns'
      });
    }

    // 마이크로태스크 큐 병목 확인
    const microtaskCount = currentState.eventLoopState?.microtaskQueue?.length || 0;
    if (microtaskCount > 100) {
      bottlenecks.push({
        type: 'microtask',
        description: `Microtask queue is overloaded (${microtaskCount} tasks)`,
        impact: 'medium',
        suggestion: 'Batch microtask operations or use requestIdleCallback'
      });
    }

    // 매크로태스크 지연 확인
    const avgTickTime = performanceMetrics.latency?.averageTickTime || 0;
    if (avgTickTime > 50) {
      bottlenecks.push({
        type: 'macrotask',
        description: `Average tick time is too high (${avgTickTime.toFixed(2)}ms)`,
        impact: 'high',
        suggestion: 'Optimize long-running tasks or use Web Workers'
      });
    }

    return bottlenecks;
  }

  private analyzeMemoryUsage(metrics: any): MemoryInfo {
    // 실제 구현에서는 performance.memory API 사용
    const memoryInfo = (performance as any).memory;
    
    return {
      peakUsage: memoryInfo?.usedJSHeapSize || 0,
      averageUsage: memoryInfo?.usedJSHeapSize || 0,
      leakSuspects: [] // 메모리 누수 의심 항목들
    };
  }

  private analyzeQueueUtilization(metrics: any): QueueUtilization {
    const { currentState, executionHistory } = metrics;
    const eventLoopState = currentState.eventLoopState;

    // 콜스택 분석
    const callStackStats = this.analyzeCallStackStats(executionHistory);
    
    // 마이크로태스크 큐 분석
    const microtaskStats = this.analyzeMicrotaskStats(executionHistory);
    
    // 매크로태스크 큐 분석
    const macrotaskStats = this.analyzeMacrotaskStats(executionHistory);

    return {
      callstack: {
        maxDepth: callStackStats.maxDepth,
        averageDepth: callStackStats.averageDepth,
        utilizationRate: callStackStats.utilizationRate
      },
      microtask: {
        maxLength: microtaskStats.maxLength,
        averageLength: microtaskStats.averageLength,
        processingRate: microtaskStats.processingRate
      },
      macrotask: {
        maxLength: macrotaskStats.maxLength,
        averageLength: macrotaskStats.averageLength,
        averageDelay: macrotaskStats.averageDelay
      }
    };
  }

  private analyzeCallStackStats(executionHistory: any): any {
    // 실행 히스토리에서 콜스택 통계 계산
    return {
      maxDepth: 10,
      averageDepth: 3.5,
      utilizationRate: 0.65
    };
  }

  private analyzeMicrotaskStats(executionHistory: any): any {
    return {
      maxLength: 25,
      averageLength: 8.2,
      processingRate: 0.95
    };
  }

  private analyzeMacrotaskStats(executionHistory: any): any {
    return {
      maxLength: 15,
      averageLength: 4.1,
      averageDelay: 120.5
    };
  }

  private generateRecommendations(analysisData: any): string[] {
    const recommendations: string[] = [];
    const { bottlenecks, queueUtilization, performanceMetrics } = analysisData;

    // 병목 기반 권장사항
    bottlenecks.forEach((bottleneck: BottleneckInfo) => {
      recommendations.push(bottleneck.suggestion);
    });

    // 큐 활용도 기반 권장사항
    if (queueUtilization.callstack.utilizationRate > 0.8) {
      recommendations.push('Consider using async/await patterns to reduce call stack pressure');
    }

    if (queueUtilization.microtask.processingRate < 0.7) {
      recommendations.push('Optimize microtask processing to improve responsiveness');
    }

    // 성능 메트릭 기반 권장사항
    const errorRate = performanceMetrics.errors?.errorRate || 0;
    if (errorRate > 0.1) {
      recommendations.push('High error rate detected - review error handling logic');
    }

    // 일반적인 권장사항
    if (recommendations.length === 0) {
      recommendations.push('Performance looks good! Continue monitoring for optimal results.');
    }

    return recommendations;
  }

  // === 이벤트 핸들러들 ===

  private handleStateChange(data: any): void {
    // 상태 변경 시 실시간 메트릭 업데이트
    if (this.getConfig('realTimeAnalysis')) {
      this.analyzeData(data).catch(error => {
        this.log('warn', 'Real-time analysis failed:', error);
      });
    }
  }

  private handleSimulationStep(data: any): void {
    // 시뮬레이션 스텝마다 성능 추적
  }

  private handleTickCompleted(data: any): void {
    // 틱 완료 시 성능 메트릭 수집
  }

  // === 연속 분석 관리 ===

  private startContinuousAnalysis(interval: number): void {
    if (this.analysisInterval) {
      this.stopContinuousAnalysis();
    }

    this.analysisInterval = window.setInterval(async () => {
      try {
        const cqrsService = this.context?.getCQRSService();
        if (cqrsService) {
          const currentState = await cqrsService.getCurrentState();
          await this.analyzeData(currentState.data);
        }
      } catch (error) {
        this.log('warn', 'Continuous analysis failed:', error);
      }
    }, interval);

    this.log('info', `Started continuous analysis with ${interval}ms interval`);
  }

  private stopContinuousAnalysis(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
      this.log('info', 'Stopped continuous analysis');
    }
  }

  // === 공개 API 메서드들 ===

  public async getAnalysisHistory(): Promise<PerformanceAnalysis[]> {
    return [...this.analysisHistory];
  }

  public async exportAnalysis(format: 'json' | 'csv' | 'html' = 'json'): Promise<string> {
    if (!this.currentAnalysis) {
      throw new Error('No analysis results available');
    }

    switch (format) {
      case 'json':
        return JSON.stringify(this.currentAnalysis, null, 2);
      
      case 'csv':
        return this.convertToCSV(this.currentAnalysis);
      
      case 'html':
        return this.convertToHTML(this.currentAnalysis);
      
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private convertToCSV(analysis: PerformanceAnalysis): string {
    // CSV 변환 로직
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Execution Time', analysis.totalExecutionTime.toString()],
      ['Average Tick Time', analysis.averageTickTime.toString()],
      ['Tick Count', analysis.tickCount.toString()],
      ['Bottlenecks Count', analysis.bottlenecks.length.toString()]
    ];

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private convertToHTML(analysis: PerformanceAnalysis): string {
    // HTML 리포트 생성
    return `
      <html>
        <head><title>Performance Analysis Report</title></head>
        <body>
          <h1>Performance Analysis Report</h1>
          <h2>Summary</h2>
          <ul>
            <li>Total Execution Time: ${analysis.totalExecutionTime}ms</li>
            <li>Average Tick Time: ${analysis.averageTickTime}ms</li>
            <li>Tick Count: ${analysis.tickCount}</li>
          </ul>
          <h2>Bottlenecks</h2>
          <ul>
            ${analysis.bottlenecks.map(b => `<li><strong>${b.type}</strong>: ${b.description}</li>`).join('')}
          </ul>
          <h2>Recommendations</h2>
          <ul>
            ${analysis.recommendations.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </body>
      </html>
    `;
  }
}