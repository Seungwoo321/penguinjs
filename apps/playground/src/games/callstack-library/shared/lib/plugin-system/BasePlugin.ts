/**
 * Base Plugin Class
 * 
 * Phase 4: 확장성 확보 - 플러그인 시스템 구현
 * 플러그인 개발을 위한 기본 클래스
 */

import { IPlugin, PluginContext, PluginCapability } from './PluginRegistry';

// 기본 플러그인 설정
export interface BasePluginConfig {
  enabled?: boolean;
  autoActivate?: boolean;
  settings?: Record<string, any>;
}

// 플러그인 이벤트 타입
export type PluginEvent = 
  | 'beforeInitialize' 
  | 'afterInitialize'
  | 'beforeActivate'
  | 'afterActivate'
  | 'beforeDeactivate'
  | 'afterDeactivate'
  | 'configChanged'
  | 'error';

// 기본 플러그인 클래스
export abstract class BasePlugin implements IPlugin {
  public abstract readonly id: string;
  public abstract readonly name: string;
  public abstract readonly version: string;
  public readonly description?: string;
  public readonly author?: string;
  public readonly dependencies?: string[];
  public readonly peerDependencies?: string[];

  protected context?: PluginContext;
  protected config: BasePluginConfig;
  protected isInitialized = false;
  protected isActive = false;
  protected eventHandlers = new Map<PluginEvent, Array<(...args: any[]) => void>>();

  constructor(config: BasePluginConfig = {}) {
    this.config = {
      enabled: true,
      autoActivate: false,
      settings: {},
      ...config
    };
  }

  // === 라이프사이클 메서드 ===

  async initialize(context: PluginContext): Promise<void> {
    if (this.isInitialized) {
      throw new Error(`Plugin ${this.id} is already initialized`);
    }

    this.context = context;

    try {
      this.emit('beforeInitialize', context);
      
      await this.onInitialize(context);
      
      this.isInitialized = true;
      this.emit('afterInitialize', context);
      
      this.log('info', 'Plugin initialized successfully');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async activate(context: PluginContext): Promise<void> {
    if (!this.isInitialized) {
      throw new Error(`Plugin ${this.id} must be initialized before activation`);
    }

    if (this.isActive) {
      this.log('warn', 'Plugin is already active');
      return;
    }

    if (!this.config.enabled) {
      this.log('info', 'Plugin is disabled, skipping activation');
      return;
    }

    try {
      this.emit('beforeActivate', context);
      
      await this.onActivate(context);
      
      this.isActive = true;
      this.emit('afterActivate', context);
      
      this.log('info', 'Plugin activated successfully');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async deactivate(context: PluginContext): Promise<void> {
    if (!this.isActive) {
      return;
    }

    try {
      this.emit('beforeDeactivate', context);
      
      await this.onDeactivate(context);
      
      this.isActive = false;
      this.emit('afterDeactivate', context);
      
      this.log('info', 'Plugin deactivated successfully');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    if (this.isActive) {
      throw new Error(`Plugin ${this.id} must be deactivated before destruction`);
    }

    try {
      await this.onDestroy();
      
      // 정리
      this.eventHandlers.clear();
      this.context = undefined;
      this.isInitialized = false;
      
      this.log('info', 'Plugin destroyed successfully');
    } catch (error) {
      this.log('error', 'Error during plugin destruction:', error);
      throw error;
    }
  }

  async configure(config: Record<string, any>): Promise<void> {
    const oldConfig = { ...this.config };
    
    try {
      this.config = { ...this.config, ...config };
      
      await this.onConfigure(config, oldConfig);
      
      this.emit('configChanged', this.config, oldConfig);
      
      this.log('info', 'Plugin configuration updated');
    } catch (error) {
      // 설정 롤백
      this.config = oldConfig;
      this.emit('error', error);
      throw error;
    }
  }

  // === 추상 메서드 (서브클래스에서 구현) ===

  protected abstract onInitialize(context: PluginContext): Promise<void> | void;
  protected abstract onActivate(context: PluginContext): Promise<void> | void;
  protected abstract onDeactivate(context: PluginContext): Promise<void> | void;
  
  protected onDestroy(): Promise<void> | void {
    // 기본 구현: 아무것도 하지 않음
  }

  protected onConfigure(newConfig: Record<string, any>, oldConfig: BasePluginConfig): Promise<void> | void {
    // 기본 구현: 아무것도 하지 않음
  }

  // === 이벤트 시스템 ===

  protected on(event: PluginEvent, handler: (...args: any[]) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  protected off(event: PluginEvent, handler: (...args: any[]) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  protected emit(event: PluginEvent, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          this.log('error', `Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // === 유틸리티 메서드 ===

  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]): void {
    if (this.context?.log) {
      this.context.log[level](message, ...args);
    } else {
      console[level](`[${this.id}] ${message}`, ...args);
    }
  }

  protected getConfig<T = any>(key?: string): T {
    if (!this.context) {
      throw new Error('Plugin context not available');
    }
    return this.context.getConfig(key);
  }

  protected setConfig(key: string, value: any): void {
    if (!this.context) {
      throw new Error('Plugin context not available');
    }
    this.context.setConfig(key, value);
  }

  protected async callPlugin(pluginId: string, method: string, ...args: any[]): Promise<any> {
    if (!this.context) {
      throw new Error('Plugin context not available');
    }
    return this.context.callPlugin(pluginId, method, ...args);
  }

  protected getPlugin(pluginId: string): IPlugin | null {
    if (!this.context) {
      throw new Error('Plugin context not available');
    }
    return this.context.getPlugin(pluginId);
  }

  protected emitSystemEvent(event: string, ...args: any[]): void {
    if (this.context) {
      this.context.emit(event, ...args);
    }
  }

  protected onSystemEvent(event: string, handler: (...args: any[]) => void): void {
    if (this.context) {
      this.context.on(event, handler);
    }
  }

  // === Getter ===

  public getState(): {
    isInitialized: boolean;
    isActive: boolean;
    config: BasePluginConfig;
  } {
    return {
      isInitialized: this.isInitialized,
      isActive: this.isActive,
      config: { ...this.config }
    };
  }

  public isEnabled(): boolean {
    return !!this.config.enabled;
  }

  public shouldAutoActivate(): boolean {
    return !!this.config.autoActivate;
  }

  // === 기본 능력 구현 ===

  getCapabilities(): PluginCapability[] {
    return [];
  }

  onPluginLoaded(plugin: IPlugin): void {
    this.log('debug', `Plugin loaded: ${plugin.id}`);
  }

  onPluginUnloaded(pluginId: string): void {
    this.log('debug', `Plugin unloaded: ${pluginId}`);
  }
}

// === 특화된 플러그인 기본 클래스들 ===

// 시각화 플러그인 기본 클래스
export abstract class VisualizerPlugin extends BasePlugin {
  protected abstract renderVisualization(data: any, container: HTMLElement): void;
  protected abstract updateVisualization(data: any): void;
  protected abstract destroyVisualization(): void;

  getCapabilities(): PluginCapability[] {
    return [{
      type: 'visualizer',
      name: this.name,
      description: this.description,
      version: this.version,
      methods: [
        {
          name: 'renderVisualization',
          description: 'Render visualization in container',
          parameters: [
            { name: 'data', type: 'object', required: true },
            { name: 'container', type: 'object', required: true }
          ],
          returnType: 'void'
        },
        {
          name: 'updateVisualization',
          description: 'Update existing visualization',
          parameters: [
            { name: 'data', type: 'object', required: true }
          ],
          returnType: 'void'
        }
      ]
    }];
  }
}

// 분석기 플러그인 기본 클래스
export abstract class AnalyzerPlugin extends BasePlugin {
  protected abstract analyzeData(data: any): Promise<any>;
  protected abstract getAnalysisResults(): any;

  getCapabilities(): PluginCapability[] {
    return [{
      type: 'analyzer',
      name: this.name,
      description: this.description,
      version: this.version,
      methods: [
        {
          name: 'analyzeData',
          description: 'Analyze provided data',
          parameters: [
            { name: 'data', type: 'object', required: true }
          ],
          returnType: 'object',
          async: true
        },
        {
          name: 'getAnalysisResults',
          description: 'Get latest analysis results',
          parameters: [],
          returnType: 'object'
        }
      ]
    }];
  }
}

// 디버거 플러그인 기본 클래스
export abstract class DebuggerPlugin extends BasePlugin {
  protected abstract setBreakpoint(condition: any): void;
  protected abstract removeBreakpoint(id: string): void;
  protected abstract stepExecution(): Promise<any>;
  protected abstract getDebugInfo(): any;

  getCapabilities(): PluginCapability[] {
    return [{
      type: 'debugger',
      name: this.name,
      description: this.description,
      version: this.version,
      methods: [
        {
          name: 'setBreakpoint',
          description: 'Set a breakpoint',
          parameters: [
            { name: 'condition', type: 'object', required: true }
          ],
          returnType: 'void'
        },
        {
          name: 'stepExecution',
          description: 'Step through execution',
          parameters: [],
          returnType: 'object',
          async: true
        }
      ]
    }];
  }
}

// 내보내기 플러그인 기본 클래스
export abstract class ExporterPlugin extends BasePlugin {
  protected abstract exportData(data: any, format: string): Promise<string | Blob>;
  protected abstract getSupportedFormats(): string[];

  getCapabilities(): PluginCapability[] {
    return [{
      type: 'exporter',
      name: this.name,
      description: this.description,
      version: this.version,
      methods: [
        {
          name: 'exportData',
          description: 'Export data in specified format',
          parameters: [
            { name: 'data', type: 'object', required: true },
            { name: 'format', type: 'string', required: true }
          ],
          returnType: 'object',
          async: true
        },
        {
          name: 'getSupportedFormats',
          description: 'Get list of supported export formats',
          parameters: [],
          returnType: 'array'
        }
      ]
    }];
  }
}