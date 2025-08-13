/**
 * Plugin Registry
 * 
 * Phase 4: 확장성 확보 - 플러그인 시스템 구현
 * 확장 가능한 플러그인 아키텍처를 위한 레지스트리
 */

import { EventEmitter } from 'events';

// 플러그인 기본 인터페이스
export interface IPlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly author?: string;
  readonly dependencies?: string[];
  readonly peerDependencies?: string[];
  
  // 라이프사이클 메서드
  initialize?(context: PluginContext): Promise<void> | void;
  activate?(context: PluginContext): Promise<void> | void;
  deactivate?(context: PluginContext): Promise<void> | void;
  destroy?(): Promise<void> | void;
  
  // 플러그인 설정
  configure?(config: Record<string, any>): Promise<void> | void;
  
  // 플러그인이 제공하는 기능
  getCapabilities?(): PluginCapability[];
  
  // 다른 플러그인과의 상호작용
  onPluginLoaded?(plugin: IPlugin): void;
  onPluginUnloaded?(pluginId: string): void;
}

// 플러그인 능력 정의
export interface PluginCapability {
  type: 'visualizer' | 'analyzer' | 'debugger' | 'exporter' | 'transformer' | 'extension';
  name: string;
  description?: string;
  version: string;
  methods: PluginMethod[];
}

// 플러그인 메서드 정의
export interface PluginMethod {
  name: string;
  description?: string;
  parameters: PluginParameter[];
  returnType: string;
  async?: boolean;
}

// 플러그인 매개변수 정의
export interface PluginParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
  required?: boolean;
  default?: any;
  description?: string;
}

// 플러그인 컨텍스트
export interface PluginContext {
  // 시스템 접근
  getEventLoopEngine(): any;
  getCQRSService(): any;
  getWorkerManager(): any;
  
  // 이벤트 시스템
  on(event: string, listener: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  off(event: string, listener: (...args: any[]) => void): void;
  
  // 플러그인 간 통신
  callPlugin(pluginId: string, method: string, ...args: any[]): Promise<any>;
  getPlugin(pluginId: string): IPlugin | null;
  getPluginCapabilities(type?: string): PluginCapability[];
  
  // 설정 관리
  getConfig(key?: string): any;
  setConfig(key: string, value: any): void;
  
  // 로깅
  log: PluginLogger;
}

// 플러그인 로거
export interface PluginLogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

// 플러그인 상태
export enum PluginState {
  UNLOADED = 'unloaded',
  LOADING = 'loading',
  LOADED = 'loaded',
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  ACTIVATING = 'activating',
  ACTIVE = 'active',
  DEACTIVATING = 'deactivating',
  ERROR = 'error'
}

// 플러그인 메타데이터
export interface PluginMetadata {
  plugin: IPlugin;
  state: PluginState;
  config: Record<string, any>;
  error?: Error;
  loadedAt?: number;
  activatedAt?: number;
}

// 플러그인 레지스트리
export class PluginRegistry extends EventEmitter {
  private plugins = new Map<string, PluginMetadata>();
  private pluginDependencies = new Map<string, Set<string>>();
  private pluginDependents = new Map<string, Set<string>>();
  private globalConfig: Record<string, any> = {};
  private logger: PluginLogger;

  constructor(logger?: PluginLogger) {
    super();
    this.logger = logger || this.createDefaultLogger();
  }

  // 기본 로거 생성
  private createDefaultLogger(): PluginLogger {
    return {
      debug: (message: string, ...args: any[]) => console.debug(`[PluginRegistry]`, message, ...args),
      info: (message: string, ...args: any[]) => console.info(`[PluginRegistry]`, message, ...args),
      warn: (message: string, ...args: any[]) => console.warn(`[PluginRegistry]`, message, ...args),
      error: (message: string, ...args: any[]) => console.error(`[PluginRegistry]`, message, ...args)
    };
  }

  // 플러그인 등록
  async registerPlugin(plugin: IPlugin, config: Record<string, any> = {}): Promise<void> {
    const { id } = plugin;

    if (this.plugins.has(id)) {
      throw new Error(`Plugin ${id} is already registered`);
    }

    this.logger.info(`Registering plugin: ${id}`);

    const metadata: PluginMetadata = {
      plugin,
      state: PluginState.LOADING,
      config
    };

    this.plugins.set(id, metadata);

    try {
      // 의존성 검증
      await this.validateDependencies(plugin);
      
      // 플러그인 로드
      metadata.state = PluginState.LOADED;
      metadata.loadedAt = Date.now();

      // 의존성 그래프 업데이트
      this.updateDependencyGraph(plugin);

      this.emit('pluginRegistered', plugin, metadata);
      this.logger.info(`Plugin ${id} registered successfully`);

    } catch (error) {
      metadata.state = PluginState.ERROR;
      metadata.error = error as Error;
      this.logger.error(`Failed to register plugin ${id}:`, error);
      throw error;
    }
  }

  // 플러그인 초기화
  async initializePlugin(pluginId: string): Promise<void> {
    const metadata = this.plugins.get(pluginId);
    if (!metadata) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (metadata.state !== PluginState.LOADED) {
      throw new Error(`Plugin ${pluginId} is not in loaded state`);
    }

    this.logger.info(`Initializing plugin: ${pluginId}`);

    try {
      metadata.state = PluginState.INITIALIZING;

      const context = this.createPluginContext(pluginId);
      
      if (metadata.plugin.configure) {
        await metadata.plugin.configure(metadata.config);
      }

      if (metadata.plugin.initialize) {
        await metadata.plugin.initialize(context);
      }

      metadata.state = PluginState.INITIALIZED;
      
      this.emit('pluginInitialized', metadata.plugin, metadata);
      this.logger.info(`Plugin ${pluginId} initialized successfully`);

    } catch (error) {
      metadata.state = PluginState.ERROR;
      metadata.error = error as Error;
      this.logger.error(`Failed to initialize plugin ${pluginId}:`, error);
      throw error;
    }
  }

  // 플러그인 활성화
  async activatePlugin(pluginId: string): Promise<void> {
    const metadata = this.plugins.get(pluginId);
    if (!metadata) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (metadata.state !== PluginState.INITIALIZED) {
      throw new Error(`Plugin ${pluginId} is not initialized`);
    }

    this.logger.info(`Activating plugin: ${pluginId}`);

    try {
      metadata.state = PluginState.ACTIVATING;

      // 의존성 활성화 확인
      await this.ensureDependenciesActive(pluginId);

      const context = this.createPluginContext(pluginId);
      
      if (metadata.plugin.activate) {
        await metadata.plugin.activate(context);
      }

      metadata.state = PluginState.ACTIVE;
      metadata.activatedAt = Date.now();
      
      this.emit('pluginActivated', metadata.plugin, metadata);
      this.logger.info(`Plugin ${pluginId} activated successfully`);

      // 종속 플러그인들에게 알림
      this.notifyPluginLoaded(metadata.plugin);

    } catch (error) {
      metadata.state = PluginState.ERROR;
      metadata.error = error as Error;
      this.logger.error(`Failed to activate plugin ${pluginId}:`, error);
      throw error;
    }
  }

  // 플러그인 비활성화
  async deactivatePlugin(pluginId: string): Promise<void> {
    const metadata = this.plugins.get(pluginId);
    if (!metadata) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (metadata.state !== PluginState.ACTIVE) {
      return; // 이미 비활성화됨
    }

    this.logger.info(`Deactivating plugin: ${pluginId}`);

    try {
      metadata.state = PluginState.DEACTIVATING;

      // 종속 플러그인들 먼저 비활성화
      await this.deactivateDependents(pluginId);

      const context = this.createPluginContext(pluginId);
      
      if (metadata.plugin.deactivate) {
        await metadata.plugin.deactivate(context);
      }

      metadata.state = PluginState.INITIALIZED;
      
      this.emit('pluginDeactivated', metadata.plugin, metadata);
      this.logger.info(`Plugin ${pluginId} deactivated successfully`);

      // 다른 플러그인들에게 알림
      this.notifyPluginUnloaded(pluginId);

    } catch (error) {
      metadata.state = PluginState.ERROR;
      metadata.error = error as Error;
      this.logger.error(`Failed to deactivate plugin ${pluginId}:`, error);
      throw error;
    }
  }

  // 플러그인 제거
  async unregisterPlugin(pluginId: string): Promise<void> {
    const metadata = this.plugins.get(pluginId);
    if (!metadata) {
      return; // 이미 제거됨
    }

    this.logger.info(`Unregistering plugin: ${pluginId}`);

    try {
      // 먼저 비활성화
      if (metadata.state === PluginState.ACTIVE) {
        await this.deactivatePlugin(pluginId);
      }

      // 정리
      if (metadata.plugin.destroy) {
        await metadata.plugin.destroy();
      }

      // 의존성 그래프에서 제거
      this.removeFromDependencyGraph(pluginId);

      // 레지스트리에서 제거
      this.plugins.delete(pluginId);
      
      this.emit('pluginUnregistered', pluginId);
      this.logger.info(`Plugin ${pluginId} unregistered successfully`);

    } catch (error) {
      this.logger.error(`Failed to unregister plugin ${pluginId}:`, error);
      throw error;
    }
  }

  // 플러그인 컨텍스트 생성
  private createPluginContext(pluginId: string): PluginContext {
    return {
      // 시스템 접근 (실제 구현에서는 의존성 주입)
      getEventLoopEngine: () => null, // TODO: 실제 엔진 주입
      getCQRSService: () => null,     // TODO: 실제 서비스 주입
      getWorkerManager: () => null,   // TODO: 실제 매니저 주입

      // 이벤트 시스템
      on: (event: string, listener: (...args: any[]) => void) => {
        this.on(`plugin:${pluginId}:${event}`, listener);
      },
      emit: (event: string, ...args: any[]) => {
        this.emit(`plugin:${pluginId}:${event}`, ...args);
      },
      off: (event: string, listener: (...args: any[]) => void) => {
        this.off(`plugin:${pluginId}:${event}`, listener);
      },

      // 플러그인 간 통신
      callPlugin: async (targetPluginId: string, method: string, ...args: any[]) => {
        return this.callPluginMethod(targetPluginId, method, ...args);
      },
      getPlugin: (targetPluginId: string) => {
        const metadata = this.plugins.get(targetPluginId);
        return metadata?.plugin || null;
      },
      getPluginCapabilities: (type?: string) => {
        return this.getCapabilities(type);
      },

      // 설정 관리
      getConfig: (key?: string) => {
        const metadata = this.plugins.get(pluginId);
        if (!metadata) return undefined;
        
        if (key) {
          return metadata.config[key];
        }
        return { ...metadata.config, ...this.globalConfig };
      },
      setConfig: (key: string, value: any) => {
        const metadata = this.plugins.get(pluginId);
        if (metadata) {
          metadata.config[key] = value;
        }
      },

      // 로깅
      log: {
        debug: (message: string, ...args: any[]) => this.logger.debug(`[${pluginId}] ${message}`, ...args),
        info: (message: string, ...args: any[]) => this.logger.info(`[${pluginId}] ${message}`, ...args),
        warn: (message: string, ...args: any[]) => this.logger.warn(`[${pluginId}] ${message}`, ...args),
        error: (message: string, ...args: any[]) => this.logger.error(`[${pluginId}] ${message}`, ...args)
      }
    };
  }

  // 의존성 검증
  private async validateDependencies(plugin: IPlugin): Promise<void> {
    if (!plugin.dependencies) return;

    for (const depId of plugin.dependencies) {
      const depMetadata = this.plugins.get(depId);
      if (!depMetadata) {
        throw new Error(`Dependency ${depId} not found for plugin ${plugin.id}`);
      }
      
      if (depMetadata.state === PluginState.ERROR) {
        throw new Error(`Dependency ${depId} is in error state`);
      }
    }
  }

  // 의존성 그래프 업데이트
  private updateDependencyGraph(plugin: IPlugin): void {
    const { id, dependencies = [] } = plugin;

    // 의존성 설정
    this.pluginDependencies.set(id, new Set(dependencies));

    // 종속성 설정 (역방향)
    dependencies.forEach(depId => {
      if (!this.pluginDependents.has(depId)) {
        this.pluginDependents.set(depId, new Set());
      }
      this.pluginDependents.get(depId)!.add(id);
    });
  }

  // 의존성 그래프에서 제거
  private removeFromDependencyGraph(pluginId: string): void {
    // 의존성 제거
    const deps = this.pluginDependencies.get(pluginId);
    if (deps) {
      deps.forEach(depId => {
        const dependents = this.pluginDependents.get(depId);
        if (dependents) {
          dependents.delete(pluginId);
        }
      });
    }
    this.pluginDependencies.delete(pluginId);

    // 종속성 제거
    const dependents = this.pluginDependents.get(pluginId);
    if (dependents) {
      dependents.forEach(depId => {
        const deps = this.pluginDependencies.get(depId);
        if (deps) {
          deps.delete(pluginId);
        }
      });
    }
    this.pluginDependents.delete(pluginId);
  }

  // 의존성 활성화 확인
  private async ensureDependenciesActive(pluginId: string): Promise<void> {
    const dependencies = this.pluginDependencies.get(pluginId);
    if (!dependencies) return;

    for (const depId of Array.from(dependencies)) {
      const depMetadata = this.plugins.get(depId);
      if (!depMetadata) {
        throw new Error(`Dependency ${depId} not found`);
      }

      if (depMetadata.state !== PluginState.ACTIVE) {
        // 의존성 자동 활성화
        await this.activatePlugin(depId);
      }
    }
  }

  // 종속 플러그인들 비활성화
  private async deactivateDependents(pluginId: string): Promise<void> {
    const dependents = this.pluginDependents.get(pluginId);
    if (!dependents) return;

    for (const depId of Array.from(dependents)) {
      await this.deactivatePlugin(depId);
    }
  }

  // 플러그인 메서드 호출
  private async callPluginMethod(pluginId: string, method: string, ...args: any[]): Promise<any> {
    const metadata = this.plugins.get(pluginId);
    if (!metadata) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (metadata.state !== PluginState.ACTIVE) {
      throw new Error(`Plugin ${pluginId} is not active`);
    }

    const plugin = metadata.plugin as any;
    if (typeof plugin[method] !== 'function') {
      throw new Error(`Method ${method} not found in plugin ${pluginId}`);
    }

    return plugin[method](...args);
  }

  // 플러그인 로드 알림
  private notifyPluginLoaded(plugin: IPlugin): void {
    this.plugins.forEach(metadata => {
      if (metadata.state === PluginState.ACTIVE && metadata.plugin.onPluginLoaded) {
        try {
          metadata.plugin.onPluginLoaded(plugin);
        } catch (error) {
          this.logger.warn(`Error notifying plugin ${metadata.plugin.id} of loaded plugin:`, error);
        }
      }
    });
  }

  // 플러그인 언로드 알림
  private notifyPluginUnloaded(pluginId: string): void {
    this.plugins.forEach(metadata => {
      if (metadata.state === PluginState.ACTIVE && metadata.plugin.onPluginUnloaded) {
        try {
          metadata.plugin.onPluginUnloaded(pluginId);
        } catch (error) {
          this.logger.warn(`Error notifying plugin ${metadata.plugin.id} of unloaded plugin:`, error);
        }
      }
    });
  }

  // 능력 조회
  private getCapabilities(type?: string): PluginCapability[] {
    const capabilities: PluginCapability[] = [];

    this.plugins.forEach(metadata => {
      if (metadata.state === PluginState.ACTIVE && metadata.plugin.getCapabilities) {
        try {
          const pluginCapabilities = metadata.plugin.getCapabilities();
          capabilities.push(...pluginCapabilities.filter(cap => !type || cap.type === type));
        } catch (error) {
          this.logger.warn(`Error getting capabilities from plugin ${metadata.plugin.id}:`, error);
        }
      }
    });

    return capabilities;
  }

  // === Public API ===

  // 플러그인 목록 조회
  getPlugins(): PluginMetadata[] {
    return Array.from(this.plugins.values());
  }

  // 활성 플러그인 조회
  getActivePlugins(): PluginMetadata[] {
    return this.getPlugins().filter(metadata => metadata.state === PluginState.ACTIVE);
  }

  // 플러그인 상태 조회
  getPluginState(pluginId: string): PluginState | null {
    const metadata = this.plugins.get(pluginId);
    return metadata?.state || null;
  }

  // 플러그인 정보 조회
  getPluginInfo(pluginId: string): PluginMetadata | null {
    return this.plugins.get(pluginId) || null;
  }

  // 전역 설정
  setGlobalConfig(key: string, value: any): void {
    this.globalConfig[key] = value;
  }

  getGlobalConfig(key?: string): any {
    if (key) {
      return this.globalConfig[key];
    }
    return { ...this.globalConfig };
  }

  // 일괄 플러그인 관리
  async loadPlugins(plugins: Array<{ plugin: IPlugin; config?: Record<string, any> }>): Promise<void> {
    // 의존성 순서로 정렬
    const sortedPlugins = this.topologicalSort(plugins.map(p => p.plugin));
    
    for (const plugin of sortedPlugins) {
      const config = plugins.find(p => p.plugin.id === plugin.id)?.config || {};
      await this.registerPlugin(plugin, config);
      await this.initializePlugin(plugin.id);
      await this.activatePlugin(plugin.id);
    }
  }

  // 위상 정렬
  private topologicalSort(plugins: IPlugin[]): IPlugin[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const result: IPlugin[] = [];
    const pluginMap = new Map(plugins.map(p => [p.id, p]));

    const visit = (pluginId: string) => {
      if (temp.has(pluginId)) {
        throw new Error(`Circular dependency detected involving plugin ${pluginId}`);
      }
      if (visited.has(pluginId)) {
        return;
      }

      temp.add(pluginId);
      
      const plugin = pluginMap.get(pluginId);
      if (plugin?.dependencies) {
        plugin.dependencies.forEach(depId => visit(depId));
      }

      temp.delete(pluginId);
      visited.add(pluginId);
      
      if (plugin) {
        result.push(plugin);
      }
    };

    plugins.forEach(plugin => {
      if (!visited.has(plugin.id)) {
        visit(plugin.id);
      }
    });

    return result;
  }
}